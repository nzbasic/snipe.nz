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
        'top_pp',
        'top_score_id',
    ];

    protected $casts = [
        'top_pp' => 'float',
    ];

    public function scores(): HasMany
    {
        return $this->hasMany(LazerScore::class, 'user_id', 'id');
    }
}
