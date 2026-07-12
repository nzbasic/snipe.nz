<?php

namespace App\Discord\Embeds;

use Discord\Builders\MessageBuilder;
use Illuminate\Support\Facades\Http;
use Discord\Parts\Channel\Message;

abstract class Embed
{
    public function __construct(private $content, private $embeds) {}

    /**
     * The webhook this embed posts to. Subclasses can override to target a
     * different channel (e.g. TopPlayEmbed -> the top-plays channel).
     */
    protected function webhook(): ?string
    {
        return config('services.discord.webhook');
    }

    /**
     * The display name the webhook posts under. Subclasses can override
     * (e.g. TopPlayEmbed -> "NZ Top Plays").
     */
    protected function username(): string
    {
        return 'snipe.nz';
    }

    public function send(): void {
        Http::post($this->webhook(), [
            'avatar_url' => "https://snipe.nz/icon.png",
            'username' => $this->username(),
            'content' => $this->content,
            'embeds' => $this->embeds,
        ]);
    }

    public function reply(Message $message)
    {
        $replyMessage = MessageBuilder::new();

        if ($this->content) {
            $replyMessage->setContent($this->content);
        }

        if ($this->embeds) {
            $replyMessage->setEmbeds($this->embeds);
        }

        $message->reply($replyMessage);
    }
}
