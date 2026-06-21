<?php

namespace App\Livewire;

use App\Models\Activity;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Support\Enums\MaxWidth;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\Indicator;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Livewire\Attributes\Url;
use Livewire\Component;

class ActivityTable extends Component implements HasForms, HasTable
{
    use InteractsWithTable;
    use InteractsWithForms;

    /**
     * @var array<string, mixed> | null
     */
    #[Url]
    public ?array $tableFilters = null;

    /**
     * @var ?string
     */
    #[Url]
    public $tableSearch = '';

    #[Url]
    public ?string $tableSortColumn = null;

    #[Url]
    public ?string $tableSortDirection = null;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Activity::query()
                    ->join('players as snipers', 'snipers.id', '=', 'activity.new_user_id')
                    ->join('players as victims', 'victims.id', '=', 'activity.old_user_id')
                    ->join('beatmaps', 'beatmaps.id', '=', 'activity.beatmap_id')
                    ->join('beatmap_sets', 'beatmap_sets.id', '=', 'beatmaps.beatmapset_id')
                    ->leftJoin('lazer_scores', 'lazer_scores.id', '=', 'activity.new_score_id')
                    ->select([
                        'activity.*',
                        'snipers.username as sniper_name',
                        'victims.username as victim_name',
                        'beatmap_sets.artist as artist',
                        'beatmap_sets.title as set_title',
                        'beatmaps.version as version',
                        'beatmaps.difficulty_rating as stars',
                        'lazer_scores.pp as pp',
                    ])
            )
            ->defaultSort('activity.created_at', 'desc')
            ->paginationPageOptions([10, 25, 50])
            ->recordUrl(
                fn (Activity $record): string => route('beatmaps.show', ['beatmap' => $record->beatmap_id]),
            )
            ->columns([
                TextColumn::make('created_at')
                    ->label('Date')
                    ->dateTime('M j, Y')
                    ->sortable(query: fn (Builder $query, string $direction): Builder => $query->orderBy('activity.created_at', $direction)),
                TextColumn::make('sniper_name')
                    ->label('Sniper')
                    ->sortable(query: fn (Builder $query, string $direction): Builder => $query->orderBy('snipers.username', $direction))
                    ->limit(20),
                TextColumn::make('victim_name')
                    ->label('Victim')
                    ->sortable(query: fn (Builder $query, string $direction): Builder => $query->orderBy('victims.username', $direction))
                    ->limit(20),
                TextColumn::make('beatmap')
                    ->label('Beatmap')
                    ->state(fn (Activity $record): string => "{$record->artist} - {$record->set_title} [{$record->version}]")
                    ->limit(40),
                TextColumn::make('stars')
                    ->label('Stars')
                    ->alignRight()
                    ->numeric(2)
                    ->sortable(),
                TextColumn::make('pp')
                    ->label('Pp')
                    ->alignRight()
                    ->numeric(0)
                    ->sortable(),
            ])
            // Search lives in the filters toolbar (not per-column) so it stays
            // reachable when a strict filter returns zero rows — Filament hides
            // the table header (and any column-search inputs) on an empty result.
            // Deferred so typing across both fields only runs on Apply, giving a
            // single shared "debounce" instead of one search per keystroke/field.
            ->filters([
                Filter::make('players')
                    ->form([
                        TextInput::make('sniper')->label('Sniper'),
                        TextInput::make('victim')->label('Victim'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                filled($data['sniper'] ?? null),
                                fn (Builder $q): Builder => $q->where('snipers.username', 'ilike', '%' . $data['sniper'] . '%'),
                            )
                            ->when(
                                filled($data['victim'] ?? null),
                                fn (Builder $q): Builder => $q->where('victims.username', 'ilike', '%' . $data['victim'] . '%'),
                            );
                    })
                    ->indicateUsing(function (array $data): array {
                        $indicators = [];

                        if (filled($data['sniper'] ?? null)) {
                            $indicators[] = Indicator::make('Sniper: ' . $data['sniper'])->removeField('sniper');
                        }

                        if (filled($data['victim'] ?? null)) {
                            $indicators[] = Indicator::make('Victim: ' . $data['victim'])->removeField('victim');
                        }

                        return $indicators;
                    }),
            ])
            ->deferFilters()
            ->filtersFormColumns(2)
            ->filtersFormWidth(MaxWidth::Large);
    }

    public function render()
    {
        return view('livewire.activity-table');
    }
}
