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
        $data = \DB::select("
            WITH RECURSIVE dates AS (
                SELECT DATE('2024-11-16') as date

                UNION ALL

                SELECT DATE(date + INTERVAL '1 day')
                FROM dates
                WHERE date < CURRENT_DATE
            ),
            daily_scores AS (
                SELECT
                    d.date,
                    s.id,
                    s.pp,
                    s.ended_at,
                    s.sniped_at,
                    s.beatmap_id
                FROM dates d
                LEFT JOIN lazer_scores s ON
                    s.user_id = :user_id
                    AND DATE(s.ended_at) <= d.date
                    AND (
                        (s.sniped_at IS NULL)
                        OR (
                            DATE(s.ended_at) <= d.date
                            AND (s.sniped_at IS NULL OR DATE(s.sniped_at) > d.date)
                        )
                    )
            )
            SELECT
                date,
                SUM(pp) as total_pp,
                COUNT(DISTINCT beatmap_id) as unique_maps
            FROM daily_scores
            GROUP BY date
            ORDER BY date;
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
