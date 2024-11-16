<?php

namespace App\Filament\Resources\BeatmapResource\Pages;

use App\Filament\Resources\BeatmapResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBeatmaps extends ListRecords
{
    protected static string $resource = BeatmapResource::class;

    protected function getHeaderActions(): array
    {
        return [

        ];
    }
}
