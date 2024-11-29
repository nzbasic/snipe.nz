<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    protected $appends = ['status', 'leader', 'activity', 'leaderboard'];

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

    public function getLeaderboardAttribute()
    {
        $leaderboard = $this->activity->groupBy('new_user_id')
            ->map(function ($activity) {
                $user = Player::find($activity->first()->new_user_id);

                return [
                    'user' => $user,
                    'count' => $activity->count()
                ];
            });

        return collect($leaderboard)->sortByDesc('count');
    }

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
            ->orderByDesc('created_at')
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
        if ($this->type === 'beatmap') {
            $activity = $this->activity
                ->sortByDesc('created_at')
                ->first();

            return $activity?->newUser;
        }

        if ($this->type === 'player') {
            $activity = $this->leaderboard->first();

            if (! $activity) {
                return null;
            }

            return $activity['user'];
        }
    }
}
