<?php

namespace App\Livewire;

use App\Models\Activity;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
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
            ]);
    }

    public function render()
    {
        return view('livewire.activity-table');
    }
}
