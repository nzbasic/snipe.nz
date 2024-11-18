<?php

namespace App\Services\Osu\Builders;

use App\Services\Osu\Osu;
use Illuminate\Support\Str;

class UserBuilder
{
    private Osu $client;
    private array $result;
    private int $id;

    public function __construct(Osu $client, int $id)
    {
        $this->client = $client;
        $this->id = $id;
    }

    public function scores(string $type = 'recent')
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

    private function fetchScores(string $type = 'recent')
    {
        $url = Str::of('users/')
            ->append($this->id)
            ->append('/scores/')
            ->append($type);

        return $this->client->get($url, [
            'mode' => 'osu',
        ]);
    }
}
