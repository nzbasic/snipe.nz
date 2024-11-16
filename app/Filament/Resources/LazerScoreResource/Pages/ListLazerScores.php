<?php

namespace App\Filament\Resources\LazerScoreResource\Pages;

use App\Filament\Resources\LazerScoreResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListLazerScores extends ListRecords
{
    protected static string $resource = LazerScoreResource::class;

    protected function getHeaderActions(): array
    {
        return [

        ];
    }
}
