<?php

namespace App\Livewire;

use App\Models\Activity;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Support\Enums\MaxWidth;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Filters\QueryBuilder;
use Filament\Tables\Filters\QueryBuilder\Constraints\NumberConstraint;
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
            // Advanced filters (like the Beatmaps page). Column names are
            // unambiguous across the joins, so they resolve without aliasing.
            ->filters([
                QueryBuilder::make()
                    ->constraints([
                        NumberConstraint::make('difficulty_rating')->label('Stars'),
                        NumberConstraint::make('pp')->label('PP'),
                        NumberConstraint::make('total_length')->label('Length (s)'),
                        NumberConstraint::make('playcount')->label('Beatmap playcount'),
                    ]),
            ])
            ->filtersFormColumns(2)
            ->filtersFormWidth(MaxWidth::TwoExtraLarge);
    }

    public function render()
    {
        return view('livewire.activity-table');
    }
}
