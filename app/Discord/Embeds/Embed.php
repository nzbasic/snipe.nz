<?php

namespace App\Discord\Embeds;

use Discord\Builders\MessageBuilder;
use Illuminate\Support\Facades\Http;
use Discord\Parts\Channel\Message;

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
