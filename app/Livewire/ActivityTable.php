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
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Livewire\Attributes\Url;
use Livewire\Component;

class ActivityTable extends Component implements HasForms, HasTable
{
    use InteractsWithTable;
    use InteractsWithForms;

    /**
     * @var array<string, mixed>
     */
    #[Url]
    public array $tableColumnSearches = [];

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
                        'lazer_scores.sniped_at as new_score_sniped_at',
                    ])
                    // When sorting by a numeric column, drop rows with no value
                    // (null/0) so they don't pile up at the top on a DESC sort
                    // (Postgres orders NULLs first). `> 0` excludes NULL too.
                    ->when($this->tableSortColumn === 'pp', fn ($q) => $q->where('lazer_scores.pp', '>', 0))
                    ->when($this->tableSortColumn === 'stars', fn ($q) => $q->where('beatmaps.difficulty_rating', '>', 0))
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
                    ->searchable(isIndividual: true, isGlobal: false, query: function (Builder $query, string $search): Builder {
                        return $query->where('snipers.username', 'ilike', "%{$search}%");
                    })
                    ->sortable(query: fn (Builder $query, string $direction): Builder => $query->orderBy('snipers.username', $direction))
                    ->limit(20),
                TextColumn::make('victim_name')
                    ->label('Victim')
                    ->searchable(isIndividual: true, isGlobal: false, query: function (Builder $query, string $search): Builder {
                        return $query->where('victims.username', 'ilike', "%{$search}%");
                    })
                    ->sortable(query: fn (Builder $query, string $direction): Builder => $query->orderBy('victims.username', $direction))
                    ->limit(20),
                TextColumn::make('beatmap')
                    ->label('Beatmap')
                    ->state(fn (Activity $record): string => "{$record->artist} - {$record->set_title} [{$record->version}]")
                    ->searchable(isIndividual: true, isGlobal: false, query: function (Builder $query, string $search): Builder {
                        return $query->where(function (Builder $q) use ($search): void {
                            $q->where('beatmap_sets.artist', 'ilike', "%{$search}%")
                                ->orWhere('beatmap_sets.title', 'ilike', "%{$search}%")
                                ->orWhere('beatmaps.version', 'ilike', "%{$search}%");
                        });
                    })
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
                TextColumn::make('current_first')
                    ->label('Current #1')
                    ->state(fn (Activity $record): string => $record->new_score_sniped_at === null ? 'Yes' : 'No'),
            ])
            ->filters([
                // "Current #1" — the activity's new score still holds #1 when its
                // lazer_scores row hasn't been sniped (sniped_at IS NULL).
                TernaryFilter::make('current_first')
                    ->label('Current #1')
                    ->placeholder('All')
                    ->trueLabel('Yes')
                    ->falseLabel('No')
                    ->queries(
                        true: fn (Builder $query): Builder => $query->whereNull('lazer_scores.sniped_at'),
                        false: fn (Builder $query): Builder => $query->whereNotNull('lazer_scores.sniped_at'),
                        blank: fn (Builder $query): Builder => $query,
                    ),
                // Numeric range filters. Filament's QueryBuilder can't target
                // manually-joined columns (it qualifies with the base table, or
                // with relationship() forces broken aggregate subqueries), so use
                // a plain form that queries the joined columns directly.
                Filter::make('numeric')
                    ->form([
                        TextInput::make('min_pp')->label('Min PP')->numeric(),
                        TextInput::make('max_pp')->label('Max PP')->numeric(),
                        TextInput::make('min_stars')->label('Min stars')->numeric()->step(0.01),
                        TextInput::make('max_stars')->label('Max stars')->numeric()->step(0.01),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(filled($data['min_pp'] ?? null), fn (Builder $q): Builder => $q->where('lazer_scores.pp', '>=', $data['min_pp']))
                            ->when(filled($data['max_pp'] ?? null), fn (Builder $q): Builder => $q->where('lazer_scores.pp', '<=', $data['max_pp']))
                            ->when(filled($data['min_stars'] ?? null), fn (Builder $q): Builder => $q->where('beatmaps.difficulty_rating', '>=', $data['min_stars']))
                            ->when(filled($data['max_stars'] ?? null), fn (Builder $q): Builder => $q->where('beatmaps.difficulty_rating', '<=', $data['max_stars']));
                    })
                    ->indicateUsing(function (array $data): array {
                        $indicators = [];
                        if (filled($data['min_pp'] ?? null)) $indicators[] = 'PP ≥ ' . $data['min_pp'];
                        if (filled($data['max_pp'] ?? null)) $indicators[] = 'PP ≤ ' . $data['max_pp'];
                        if (filled($data['min_stars'] ?? null)) $indicators[] = 'Stars ≥ ' . $data['min_stars'];
                        if (filled($data['max_stars'] ?? null)) $indicators[] = 'Stars ≤ ' . $data['max_stars'];

                        return $indicators;
                    }),
            ])
            ->filtersFormColumns(2)
            ->filtersFormWidth(MaxWidth::Large);
    }

    public function render()
    {
        return view('livewire.activity-table');
    }
}
