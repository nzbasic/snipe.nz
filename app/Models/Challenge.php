<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    protected $appends = ['status', 'leader', 'activity'];

    protected $fillable = [
        'starts_at',
        'ends_at',
        'type',
        'type_id',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function getActivityAttribute()
    {
        return Activity::query()
            ->when($this->type === 'beatmap', function ($query) {
                $query->where('beatmap_id', $this->type_id);
            })
            ->when($this->type === 'player', function ($query) {
                $query->where('old_user_id', $this->type_id);
            })
            ->whereBetween('created_at', [$this->starts_at, $this->ends_at])
            ->get();
    }

    public function beatmap()
    {
        return $this->belongsTo(Beatmap::class, 'type_id');
    }

    public function player()
    {
        return $this->belongsTo(Player::class, 'type_id');
    }

    public function scopeStatus($query, $status)
    {
        $now = now();

        return match($status) {
            'active' => $query
                ->where('starts_at', '<=', $now)
                ->where('ends_at', '>=', $now),
            'pending' => $query
                ->where('starts_at', '>', $now),
            'completed' => $query
                ->where('ends_at', '<', $now),
            default => $query,
        };
    }

    public function getStatusAttribute()
    {
        $now = now();

        return match(true) {
            $this->starts_at > $now => 'pending',
            $this->ends_at < $now => 'completed',
            default => 'active',
        };
    }

    public function getLeaderAttribute()
    {
        // find the challenge leader
        $activity = $this->activity
            ->sortByDesc('created_at')
            ->first();

        return $activity?->newUser;
    }
}
