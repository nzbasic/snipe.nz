<?php

namespace App\Livewire;

use App\Models\Beatmap;
use Doctrine\DBAL\Query\QueryBuilder;
use Faker\Provider\Text;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Support\Enums\MaxWidth;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Filters\QueryBuilder\Constraints\DateConstraint;
use Filament\Tables\Filters\QueryBuilder\Constraints\NumberConstraint;
use Filament\Tables\Table;
use Livewire\Attributes\Url;
use Livewire\Component;
use App\Models\Leaderboard as LeaderboardView;

class Beatmaps extends Component implements HasForms, HasTable
{
    use InteractsWithTable;
    use InteractsWithForms;

    #[Url]
    public bool $isTableReordering = false;

    /**
     * @var array<string, mixed> | null
     */
    #[Url]
    public ?array $tableFilters = null;

    #[Url]
    public ?string $tableGrouping = null;

    #[Url]
    public ?string $tableGroupingDirection = null;

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
                Beatmap::query()
                    ->join('lazer_scores', 'beatmaps.id', '=', 'lazer_scores.beatmap_id')
                    ->join('beatmap_sets', 'beatmaps.beatmapset_id', '=', 'beatmap_sets.id')
                    ->join('players', 'lazer_scores.user_id', '=', 'players.id')
                    ->whereNull('lazer_scores.sniped_at')
                    ->when($this->tableSortColumn === 'pp', function ($query) {
                        $query->whereNotNull('lazer_scores.pp');
                    })
            )
            ->defaultSort('pp', 'desc')
            ->paginationPageOptions([10, 25, 50])
            ->recordUrl(
                fn (Beatmap $record): string => route('beatmaps.show', ['beatmap' => $record->beatmap_id]),
            )
            ->columns([
                TextColumn::make('artist')
                    ->toggleable()
                    ->searchable(isIndividual: true, isGlobal: false)
                    ->limit(20),
                TextColumn::make('title')
                    ->toggleable()
                    ->searchable(isIndividual: true, isGlobal: false)
                    ->limit(20),
                TextColumn::make('version')
                    ->toggleable()
                    ->searchable(isIndividual: true, isGlobal: false)
                    ->limit(20),
                TextColumn::make('difficulty_rating')
                    ->toggleable()
                    ->label('Stars')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('username')
                    ->toggleable()
                    ->label('Player')
                    ->searchable(isIndividual: true, isGlobal: false)
                    ->limit(20),
                TextColumn::make('pp')
                    ->toggleable()
                    ->label('PP')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('total_length')
                    ->toggleable(true, true)
                    ->label('Length')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('max_combo')
                    ->toggleable(true, true)
                    ->label('Max Combo')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('bpm')
                    ->toggleable(true, true)
                    ->label('BPM')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('ar')
                    ->toggleable(true, true)
                    ->label('AR')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('od')
                    ->toggleable(true, true)
                    ->label('OD')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('cs')
                    ->toggleable(true, true)
                    ->label('CS')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('drain')
                    ->toggleable(true, true)
                    ->label('HP')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('passcount')
                    ->toggleable(true, true)
                    ->label('Pass Count')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('playcount')
                    ->toggleable(true, true)
                    ->label('Play Count')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('favourite_count')
                    ->toggleable(true, true)
                    ->label('Favourites')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('ranked_date')
                    ->toggleable(true, true)
                    ->label('Ranked Date')
                    ->alignRight()
                    ->sortable(),
            ])
            ->filters([
                \Filament\Tables\Filters\QueryBuilder::make()
                    ->constraints([
                        NumberConstraint::make('bpm'),
                        NumberConstraint::make('ar'),
                        NumberConstraint::make('od'),
                        NumberConstraint::make('cs'),
                        NumberConstraint::make('drain'),
                        NumberConstraint::make('difficulty_rating'),
                        NumberConstraint::make('total_length'),
                        NumberConstraint::make('passcount'),
                        NumberConstraint::make('playcount'),
                    ])

            ])
            ->columnToggleFormColumns(3)
            ->filtersFormWidth(MaxWidth::TwoExtraLarge);
    }

    public function render()
    {
        return view('livewire.beatmaps');
    }
}
