<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LazerScoreResource\Pages;
use App\Filament\Resources\LazerScoreResource\RelationManagers;
use App\Models\LazerScore;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class LazerScoreResource extends Resource
{
    protected static ?string $model = LazerScore::class;

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
                Tables\Columns\TextColumn::make('player.username')
                    ->label('Player')
                    ->searchable(),
                Tables\Columns\TextColumn::make('beatmapset.title')
                    ->label('Song')
                    ->searchable(),
                Tables\Columns\TextColumn::make('beatmap.version')
                    ->label('Difficulty')
                    ->searchable(),
                Tables\Columns\TextColumn::make('pp')
                    ->label('PP')
                    ->searchable()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
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
            'index' => Pages\ListLazerScores::route('/'),
        ];
    }
}
