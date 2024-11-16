<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BeatmapResource\Pages;
use App\Filament\Resources\BeatmapResource\RelationManagers;
use App\Models\Beatmap;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use PHPUnit\Util\Filter;

class BeatmapResource extends Resource
{
    protected static ?string $model = Beatmap::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                //
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('beatmapset.title')
                    ->label('Song')
                    ->searchable(),
                Tables\Columns\TextColumn::make('version')
                    ->label('Difficulty')
                    ->searchable(),
                Tables\Columns\TextColumn::make('difficulty_rating')
                    ->label('Stars')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('top.player.username')
                    ->label('Player'),
                Tables\Columns\TextColumn::make('top.pp')
                    ->label('PP')
            ])
            ->actions([
                Tables\Actions\Action::make('refresh')
                    ->label('Refresh')
                    ->action(function () {
                        dd('wa');
                    })
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBeatmaps::route('/'),
        ];
    }
}
