<?php

namespace App\Services\Osu\Builders;

use App\Services\Osu\Osu;
use Illuminate\Support\Str;

class BeatmapSetBuilder
{
    private Osu $client;
    private array $result;
    private int|null $id;

    public function __construct(Osu $client, int|null $id)
    {
        $this->client = $client;
        $this->id = $id;

        if ($this->id) {
            $this->result['beatmapset'] = $this->fetchBeatmapSet();
        }
    }

    public function search(array $params)
    {
        $this->result = $this->fetchSearch($params);

        return $this;
    }

    public function get()
    {
        return $this->result;
    }

    private function fetchBeatmapSet()
    {
        $url = Str::of('beatmapsets/')
            ->append($this->id);

        return $this->client->get($url);
    }

    private function fetchSearch(array $params)
    {
        $url = Str::of('beatmapsets/search');

        return $this->client->get($url, $params);
    }
}
