<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Activity extends Model
{
    protected $table = 'activity';

    protected $fillable = [
        'old_user_id',
        'new_user_id',
        'old_score_id',
        'new_score_id',
        'beatmap_id',
    ];

    public function oldUser(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'old_user_id');
    }

    public function newUser(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'new_user_id');
    }

    public function oldScore(): HasOne
    {
        return $this->hasOne(LazerScore::class, 'id', 'old_score_id');
    }

    public function newScore(): HasOne
    {
        return $this->hasOne(LazerScore::class, 'id', 'new_score_id');
    }

    public function beatmap(): HasOne
    {
        return $this->hasOne(Beatmap::class, 'id', 'beatmap_id');
    }
}
