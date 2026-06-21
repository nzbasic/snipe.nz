<?php

namespace App\Livewire;

use App\Models\Activity;
use Livewire\Attributes\Url;
use Livewire\Attributes\Validate;
use Livewire\Component;
use Livewire\WithPagination;

class PlayerActivity extends Component
{
    use WithPagination;

    public $id;

    /**
     * all    = snipes where this player is either party
     * sniper = snipes this player made   (new_user_id)
     * victim = snipes against this player (old_user_id)
     */
    #[Url(except: 'all')]
    #[Validate('in:all,sniper,victim')]
    public $role = 'all';

    /** Filter by the opposing player's username. */
    #[Url(except: '')]
    public $player = '';

    #[Url('size')]
    #[Validate('numeric|min:1|max:50')]
    public $pageSize = 10;

    public function mount($id)
    {
        $this->id = $id;
    }

    public function updated($property)
    {
        if (in_array($property, ['role', 'player', 'pageSize'], true)) {
            $this->resetPage();
        }
    }

    public function render()
    {
        $name = trim($this->player);

        // When this player is the sniper, the opponent is the old (victim) user;
        // when the victim, the opponent is the new (sniper) user. The name filter
        // always matches against that opponent.
        $sniper = function ($query) use ($name) {
            $query->where('new_user_id', $this->id);
            if ($name !== '') {
                $query->whereHas('oldUser', fn ($u) => $u->where('username', 'ilike', "%{$name}%"));
            }
        };

        $victim = function ($query) use ($name) {
            $query->where('old_user_id', $this->id);
            if ($name !== '') {
                $query->whereHas('newUser', fn ($u) => $u->where('username', 'ilike', "%{$name}%"));
            }
        };

        $activity = Activity::query()
            ->with(['oldUser', 'newUser', 'beatmap', 'beatmap.beatmapset'])
            ->where(function ($query) use ($sniper, $victim) {
                match ($this->role) {
                    'sniper' => $query->where($sniper),
                    'victim' => $query->where($victim),
                    default => $query->where($sniper)->orWhere($victim),
                };
            })
            ->orderByDesc('created_at')
            ->paginate($this->pageSize);

        return view('livewire.player-activity', [
            'activity' => $activity,
        ]);
    }
}
