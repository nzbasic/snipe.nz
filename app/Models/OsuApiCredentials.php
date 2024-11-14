<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OsuApiCredentials extends Model
{
    protected $fillable = [
        'access_token',
        'refresh_token',
        'expires_at',
    ];

    protected function casts()
    {
        return [
            'expires_at' => 'timestamp',
        ];
    }
}
