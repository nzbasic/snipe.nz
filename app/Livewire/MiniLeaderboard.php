<?php

namespace App\Livewire;

use App\Models\Leaderboard;
use Livewire\Component;

class MiniLeaderboard extends Component
{
    public $top = [];
    public $sort; // pp, count

    public function mount($top = [])
    {
        $this->top = $top;
        $this->sort = 'pp';
    }

    public function updatedSort()
    {
        if ($this->sort === 'pp') {
            $this->top = Leaderboard::query()->limit(10)->get();
        } elseif ($this->sort === 'count') {
            $this->top = Leaderboard::query()->orderBy('total_firsts', 'desc')->limit(10)->get();
        }
    }

    public function render()
    {
        return view('livewire.mini-leaderboard');
    }
}
