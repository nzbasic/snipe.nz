<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    protected $fillable = [
        'starts_at',
        'ends_at',
        'type',
        'type_id',
    ];

    public function activity()
    {
        return $this->belongsToMany(Activity::class, 'challenge_activity');
    }
}
