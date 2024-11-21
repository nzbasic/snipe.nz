<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChallengeActivity extends Model
{
    protected $table = 'challenge_activity';

    protected $fillable = [
        'challenge_id',
        'activity_id',
    ];

    public function challenge()
    {
        return $this->belongsTo(Challenge::class);
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }
}
