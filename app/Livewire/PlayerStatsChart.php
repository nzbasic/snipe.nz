<?php

namespace App\Livewire;

use Carbon\Carbon;
use Filament\Widgets\ChartWidget;

class PlayerStatsChart extends ChartWidget
{
    public int $playerId;
    protected static ?string $maxHeight = '200px';
    protected static ?string $pollingInterval = null;
    protected static ?string $heading = 'History';
    public ?string $filter = 'pp';
    protected array $data = [];

    protected function getData(): array
    {
        // A #1 score contributes its pp/map to every day in [ended_at, sniped_at).
        // Rather than joining the full date series against every score (which is
        // O(days * scores) and seconds-slow for active players), build per-day
        // deltas and take a running total. pp is additive per score; a beatmap
        // counts once per day regardless of how many of the player's scores are
        // active on it, so its intervals are merged before being summed.
        $data = \DB::select("
            WITH days AS (
                SELECT generate_series(DATE '2024-11-16', CURRENT_DATE, INTERVAL '1 day')::date AS date
            ),
            pp_deltas AS (
                SELECT GREATEST(DATE(ended_at), DATE '2024-11-16') AS day, SUM(pp) AS d_pp
                FROM lazer_scores
                WHERE user_id = :user_id AND ended_at IS NOT NULL
                GROUP BY 1
                UNION ALL
                SELECT GREATEST(DATE(sniped_at), DATE '2024-11-16') AS day, -SUM(pp) AS d_pp
                FROM lazer_scores
                WHERE user_id = :user_id AND sniped_at IS NOT NULL
                GROUP BY 1
            ),
            score_intervals AS (
                SELECT beatmap_id,
                       GREATEST(DATE(ended_at), DATE '2024-11-16') AS s,
                       CASE WHEN sniped_at IS NULL THEN CURRENT_DATE + 1
                            ELSE GREATEST(DATE(sniped_at), DATE '2024-11-16') END AS e
                FROM lazer_scores
                WHERE user_id = :user_id AND ended_at IS NOT NULL
            ),
            flagged AS (
                SELECT beatmap_id, s, e,
                       CASE WHEN s > COALESCE(MAX(e) OVER (PARTITION BY beatmap_id ORDER BY s, e
                                                          ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), s - 1)
                            THEN 1 ELSE 0 END AS new_island
                FROM score_intervals
            ),
            islands AS (
                SELECT beatmap_id, s, e,
                       SUM(new_island) OVER (PARTITION BY beatmap_id ORDER BY s, e) AS grp
                FROM flagged
            ),
            merged AS (
                SELECT MIN(s) AS s, MAX(e) AS e
                FROM islands GROUP BY beatmap_id, grp
            ),
            map_deltas AS (
                SELECT s AS day, 1 AS d_map FROM merged
                UNION ALL
                SELECT e AS day, -1 AS d_map FROM merged WHERE e <= CURRENT_DATE
            ),
            daily AS (
                SELECT day, SUM(d_pp) AS d_pp, 0 AS d_map FROM pp_deltas GROUP BY day
                UNION ALL
                SELECT day, 0 AS d_pp, SUM(d_map) AS d_map FROM map_deltas GROUP BY day
            ),
            daily_agg AS (
                SELECT day, SUM(d_pp) AS d_pp, SUM(d_map) AS d_map FROM daily GROUP BY day
            )
            SELECT d.date,
                   SUM(COALESCE(dl.d_pp, 0)) OVER (ORDER BY d.date) AS total_pp,
                   SUM(COALESCE(dl.d_map, 0)) OVER (ORDER BY d.date) AS unique_maps
            FROM days d
            LEFT JOIN daily_agg dl ON dl.day = d.date
            ORDER BY d.date;
        ", ['user_id' => $this->playerId]);

        $pluck = match($this->filter) {
            'pp' => 'total_pp',
            'count' => 'unique_maps',
        };

        $label = match($this->filter) {
            'pp' => 'Total PP',
            'count' => 'Total #1',
        };

        return [
            'datasets' => [
                [
                    'label' => $label,
                    'data' => collect($data)->pluck($pluck)->toArray(),
                    'pointRadius' => 0,
                    'fill' => false,
                ],
            ],
            'labels' => collect($data)->pluck('date')->map(function ($date) {
                return Carbon::parse($date)->format('Y-m-d');
            })->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getFilters(): ?array
    {
        return [
            'pp' => 'Total PP',
            'count' => 'Total #1s',
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
                'tooltip' => [
                    'intersect' => false,  // Show tooltip when mouse is anywhere near the line
                    'mode' => 'index',     // Show tooltip for all datasets at current x position
                    'radius' => 10,        // Increased interaction radius
                ],
            ],
            'scales' => [
                'x' => [
                    'type' => 'time',
                    'time' => [
                        'unit' => 'day',
                        'displayFormats' => [
                            'day' => 'D',
                        ],
                    ],
                    'ticks' => [
                        'maxTicksLimit' => 10,
                    ],
                ],
                'y' => [
                    'grid' => [
                        'color' => 'black'
                    ],
                    'ticks' => [
                        'maxTicksLimit' => 5,
                    ]
                ]
            ],
            'elements' => [
                'line' => [
                    'tension' => 0,
                ],
                'point' => [
                    'radius' => 0,
                    'hoverRadius' => 4,
                ],
            ],
        ];
    }
}
