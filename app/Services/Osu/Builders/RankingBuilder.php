<?php

namespace App\Services\Osu\Builders;

use App\Services\Osu\Osu;
use Illuminate\Support\Str;

class RankingBuilder
{
    private Osu $client;
    private array $result;
    private string $mode;

    public function __construct(Osu $client, string $mode)
    {
        $this->client = $client;
        $this->mode = $mode;
    }

    public function type(string $type = 'performance', array $options = [])
    {
        if (! $this->mode) {
            return $this;
        }

        $this->result['ranking'] = $this->fetchRanking($type, $options);

        return $this;
    }

    public function get()
    {
        return $this->result;
    }

    private function fetchRanking(string $type = 'performance', array $options = [])
    {
        $url = Str::of('rankings/')
            ->append($this->mode)
            ->append('/')
            ->append($type);

        $res = $this->client->get($url, $options);

        return $res['ranking'];
    }
}
