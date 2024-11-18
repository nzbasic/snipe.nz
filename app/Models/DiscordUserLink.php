<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class DiscordUserLink extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'users';
}
