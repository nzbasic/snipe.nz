<?php

namespace App\Console\Commands;

use App\Jobs\RecentScoreJob;
use Discord\Discord;
use Discord\WebSockets\Event;
use Discord\Parts\Channel\Message;
use Discord\WebSockets\Intents;
use Illuminate\Console\Command;
use React\EventLoop\Loop;

class DiscordListen extends Command
{
    private Discord $discord;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'discord:listen';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Start listening for discord messages';

    public function handle()
    {
        // Create an event loop
        $loop = Loop::get();

        // Initialize Discord connection
        $this->discord = new Discord([
            'token' => config('services.discord.token'),
            'loop' => $loop,
            'intents' => Intents::getDefaultIntents() | Intents::MESSAGE_CONTENT,
        ]);

        // When Discord is ready
        $this->discord->on('ready', function (Discord $discord) {
            $this->info("Bot is ready!");

            // Log which servers (guilds) the bot is in
            $guilds = $discord->guilds;
            $this->info("Connected to " . $guilds->count() . " servers");
        });

        // Listen for messages
        $this->discord->on(Event::MESSAGE_CREATE, function (Message $message, Discord $discord) {
            // Ignore messages from bots (including self)
            if ($message->author->bot) {
                return;
            }

            $this->processMessage($message);
        });

        // Handle Discord errors
        $this->discord->on('error', function ($error) {
            $this->error("Discord Error: " . $error->getMessage());
        });

        // Start the bot
        $this->discord->run();
    }

    private function processMessage(Message $message): void
    {
        // Example of accessing Laravel models and DB within the bot
        try {
            // Log message to console
            $this->info("Message from {$message->author->username}: {$message->content}");

            // Example: Process commands

            // if starts with ! or > or <
            if (in_array(substr($message->content, 0, 1), ['!', '>', '<'])) {
                $this->handleCommand($message);
            }

        } catch (\Exception $e) {
            $this->error("Error processing message: " . $e->getMessage());
        }
    }

    private function handleCommand(Message $message): void
    {
        $user = $message->author->id;

        // Example command processing
        $command = explode(' ', substr($message->content, 1))[0];

        // everything after the command
        $args = trim(substr($message->content, strlen($command) + 1));

        $this->info("Command: {$command}");
        $this->info("Args: " . $args);

        switch ($command) {
            case 'r':
            case 'rs':
            case 'recentscore':
                dispatch(new RecentScoreJob($user, $args))->onQueue('osu');
                break;
        }
    }
}
