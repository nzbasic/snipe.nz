<?php

namespace App\Console\Commands;

use App\Discord\Embeds\TargetEmbed;
use App\Jobs\RecentScoreJob;
use Discord\Discord;
use Discord\Parts\WebSockets\MessageReaction;
use Discord\WebSockets\Event;
use Discord\Parts\Channel\Message;
use Discord\WebSockets\Intents;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
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
            'intents' => Intents::getDefaultIntents() | Intents::MESSAGE_CONTENT | Intents::GUILD_MESSAGE_REACTIONS,
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

        $this->discord->on(Event::MESSAGE_REACTION_ADD, function (MessageReaction $reaction) {
            // Ignore reactions from bots
            if ($reaction->member->user->bot) {
                return;
            }
            $this->handleReactionAdd($reaction);
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
        $command = strtolower($command);

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
            case 'target':
                (new TargetEmbed())->reply($message);
                break;
            case 'lfg':
                $this->handleLfgCommand($message, $args);
                break;
        }
    }

    private function handleLfgCommand(Message $message, string $args): void
    {
        $author = $message->author;
        $id = $author->id;

        if ($id !== '158826475473207297') return;

        $userLfgCacheKey = 'lfg_user_' . $author->id;

        // Repost command
        if (empty($args)) {
            if (Cache::has($userLfgCacheKey)) {
                $lfgMessageId = Cache::get($userLfgCacheKey);
                $lfgDataCacheKey = 'lfg_' . $lfgMessageId;

                if (!Cache::has($lfgDataCacheKey)) {
                    Cache::forget($userLfgCacheKey); // Clean up inconsistent cache
                    $message->reply('Your active LFG seems to have expired or been removed. Please create a new one.');
                    return;
                }

                $lfgData = Cache::get($lfgDataCacheKey);
                $guildId = $message->channel->guild_id;
                $messageLink = "https://discord.com/channels/{$guildId}/{$lfgData['channel_id']}/{$lfgMessageId}";

                $playersNeeded = $lfgData['players_needed'];
                $playersHaveJoined = $lfgData['players_needed'] - count($message->reactions->get('✅')->getUsers());

                $message->channel->sendMessage("{$author->username} is still looking for players for **{$lfgData['game']}**! Join here: {$messageLink}");
            } else {
                $message->reply('You do not have an active LFG. Use `!lfg <players_needed> <game_name>` to start one.');
            }
            return;
        }

        // Prevent creating a new LFG if one already exists
        if (Cache::has($userLfgCacheKey)) {
            $lfgMessageId = Cache::get($userLfgCacheKey);
            $lfgDataCacheKey = 'lfg_' . $lfgMessageId;
            $lfgData = Cache::get($lfgDataCacheKey);
            $guildId = $message->channel->guild_id;
            $messageLink = "https://discord.com/channels/{$guildId}/{$lfgData['channel_id']}/{$lfgMessageId}";

            $message->reply("You already have an active LFG. Join here: {$messageLink}");
            return;
        }

        $parts = explode(' ', $args);
        if (count($parts) < 2 || !is_numeric($parts[0]) || (int)$parts[0] < 1) {
            $message->reply('Invalid format. Use: `!lfg <players_needed> <game_name>` (min 2 players).');
            return;
        }

        $playersNeeded = (int)$parts[0];
        $game = implode(' ', array_slice($parts, 1));

        $message->channel->sendMessage("{$author->username} has started a Looking-for-Group for **{$game}**.\nWe need **{$playersNeeded}** players in total. React with ✅ to join!")
            ->done(function (Message $lfgMessage) use ($author, $game, $playersNeeded, $userLfgCacheKey) {
                $lfgMessage->react('✅');
                $ttl = now()->addHours(1);

                Cache::put(
                    'lfg_' . $lfgMessage->id,
                    [
                        'author_id' => $author->id,
                        'game' => $game,
                        'players_needed' => $playersNeeded,
                        'channel_id' => $lfgMessage->channel_id,
                    ],
                    $ttl
                );

                Cache::put($userLfgCacheKey, $lfgMessage->id, $ttl);
            });
    }

    private function handleReactionAdd(MessageReaction $reaction): void
    {
        $cacheKey = 'lfg_' . $reaction->message_id;
        if (!Cache::has($cacheKey) || $reaction->emoji->name !== '✅') {
            return;
        }

        $lfgData = Cache::get($cacheKey);
        $playersNeeded = $lfgData['players_needed'];

        // Fetch the message to get the full list of users who reacted.
        $reaction->channel->messages->fetch($reaction->message_id)->done(function (Message $message) use ($lfgData, $playersNeeded, $cacheKey) {
            $reactions = $message->reactions;

            $targetReaction = $reactions->find(function ($reaction) {
                return $reaction->emoji->name === '✅';
            });

            if (is_null($targetReaction)) {
                return;
            }

            $targetReaction->getUsers()->done(function ($users) use ($message, $lfgData, $playersNeeded, $cacheKey) {
                $playerMentions = [];
                foreach ($users as $user) {
                    if (!$user->bot) {
                        $playerMentions[] = $user->id ? "<@{$user->id}>" : $user->username;
                    }
                }

                if (count($playerMentions) >= $playersNeeded) {
                    $game = $lfgData['game'];
                    $message->channel->sendMessage("The LFG for **{$game}** is now full! " . implode(' ', $playerMentions));

                    // Clean up
                    Cache::forget($cacheKey);
                    Cache::forget('lfg_user_' . $lfgData['author_id']);
                }
            });
        });
    }
}
