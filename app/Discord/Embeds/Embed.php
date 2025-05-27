<?php

namespace App\Discord\Embeds;

use Illuminate\Support\Facades\Http;

abstract class Embed
{
    public function __construct(private $content, private $embeds) {}

    public function send(): void {
        Http::post(config('services.discord.webhook'), [
            'avatar_url' => "https://snipe.nz/icon.png",
            'username' => 'snipe.nz',
            'content' => $this->content,
            'embeds' => $this->embeds,
        ]);
    }
}
