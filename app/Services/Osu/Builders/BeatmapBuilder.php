<?php

namespace App\Services\Osu\Builders;

use App\Services\Osu\Osu;
use Illuminate\Support\Str;

class BeatmapBuilder
{
    private Osu $client;
    private array $result;
    private int $id;

    public function __construct(Osu $client, int $id, bool $fetchBeatmap = true)
    {
        $this->client = $client;
        $this->id = $id;

        if ($fetchBeatmap) {
            $this->result['beatmap'] = $this->fetchBeatmap();
        }
    }

    public function scores(string $type = 'country')
    {
        if (! $this->id) {
            return $this;
        }

        $this->result['scores'] = $this->fetchScores($type);

        return $this;
    }

    public function get()
    {
        return $this->result;
    }

    private function fetchBeatmap()
    {
        $url = Str::of('beatmaps/')
            ->append($this->id);

        return $this->client->get($url);
    }

    private function fetchScores(string $type = 'country')
    {
        $url = Str::of('beatmaps/')
            ->append($this->id)
            ->append('/solo-scores');

        $res = $this->client->get($url, ['type' => $type]);
        return $res['scores'];
    }
}
