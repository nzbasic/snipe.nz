<?php

namespace App\Services\Osu\Builders;

use App\Services\Osu\Osu;
use Illuminate\Support\Str;

class BeatmapBuilder
{
    private Osu $client;
    private array $result;
    private int|null $id;

    public function __construct(Osu $client, int|null $id = null)
    {
        $this->client = $client;
        $this->id = $id;

        if ($this->id) {
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
            ->append('/scores')
            ->append('?')
            ->append(http_build_query([
                'type' => $type,
            ]));

        $res = $this->client->get($url);
        return $res['scores'];
    }
}
