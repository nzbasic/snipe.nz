<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    public $incrementing = false;

    protected $fillable = [
        'id',
        'username',
        'avatar_url',
    ];

    public function scores(): HasMany
    {
        return $this->hasMany(LazerScore::class, 'user_id', 'id');
    }
}
