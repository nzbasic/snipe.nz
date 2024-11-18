<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'osu' => [
        'user_id' => env('OSU_USER_ID', 9008211),
        'api_url' => env('OSU_API_URL', 'https://osu.ppy.sh/api/v2'),
        'oauth_url' => env('OSU_OAUTH_URL', 'https://osu.ppy.sh/oauth'),
        'client_id' => env('OSU_CLIENT_ID'),
        'client_secret' => env('OSU_CLIENT_SECRET'),
    ],

    'discord' => [
        'token' => env('DISCORD_TOKEN'),
    ],

    'mongodb' => [
        'url' => env('MONGODB_URL'),
    ]

];
