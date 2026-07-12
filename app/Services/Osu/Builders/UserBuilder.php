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

    public function details(string $mode = 'osu')
    {
        if (! $this->id) {
            return $this;
        }

        $this->result['user'] = $this->client->get("users/{$this->id}/{$mode}", []);

        return $this;
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

        // Default osu! `limit` for this endpoint is tiny (~5), so big play
        // sessions overflow the window between checks and scores get missed.
        // Request the max in a single call — same request count, full session.
        //
        // x-api-version opts into the lazer `solo_score` format. Without it this
        // endpoint returns the legacy shape, where passes on UNRANKED maps come
        // back with id=0 and no total_score (unusable for tracking). With it,
        // every score has a real unique id + total_score. Ranked handling here
        // only reads id + beatmap, so the switch is safe.
        return $this->client->get($url, [
            'mode' => 'osu',
            'limit' => 100,
            'include_fails' => 0,
        ], [
            'x-api-version' => '20240529',
        ]);
    }
}
