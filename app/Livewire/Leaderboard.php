<?php

namespace App\Livewire;

use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Support\Enums\MaxWidth;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Filters\QueryBuilder;
use Filament\Tables\Filters\QueryBuilder\Constraints\NumberConstraint;
use Filament\Tables\Table;
use Livewire\Attributes\Url;
use Livewire\Component;
use App\Models\Leaderboard as LeaderboardView;

class Leaderboard extends Component implements HasForms, HasTable
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
            ->query(LeaderboardView::query())
            ->defaultSort('total_firsts', 'desc')
            ->paginationPageOptions([10, 25, 50])
            ->defaultPaginationPageOption(50)
            ->recordUrl(
                fn (LeaderboardView $record): string => route('players.show', ['player' => $record->user_id]),
            )
            ->columns([
                TextColumn::make('username'),
                TextColumn::make('total_firsts')
                    ->label('Count')
                    ->alignRight()
                    ->size(TextColumn\TextColumnSize::Small)
                    ->sortable(),
                TextColumn::make('raw_total_pp')
                    ->label('Total PP')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('weighted_total_pp')
                    ->label('Weighted PP')
                    ->alignRight()
                    ->visibleFrom('sm')
                    ->sortable(),
                TextColumn::make('avg_pp')
                    ->label('Average PP')
                    ->alignRight()
                    ->sortable(),
                TextColumn::make('avg_playcount')
                    ->label('Average Playcount')
                    ->alignRight()
                    ->visibleFrom('lg')
                    ->sortable(),
            ])
            ->filters([
                QueryBuilder::make()
                    ->constraints([
                        NumberConstraint::make('total_firsts')->label('Count'),
                        NumberConstraint::make('raw_total_pp')->label('Total PP'),
                        NumberConstraint::make('weighted_total_pp')->label('Weighted PP'),
                        NumberConstraint::make('avg_pp')->label('Average PP'),
                        NumberConstraint::make('avg_playcount')->label('Average Playcount'),
                    ]),
            ])
            ->filtersFormColumns(2)
            ->filtersFormWidth(MaxWidth::TwoExtraLarge);
    }

    public function render()
    {
        return view('livewire.leaderboard');
    }
}
