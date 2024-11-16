<?php

namespace App\Livewire;

use App\Models\Leaderboard;
use App\Models\Player;
use Illuminate\Support\Collection;
use Livewire\Component;

class Search extends Component
{
    public $query;
    public Collection $players;
    public function mount()
    {
        $this->reset();
    }

    public function reset(...$properties)
    {
        $this->query = '';
        $this->players = collect([]);
    }

    public function selectPlayer()
    {
//        $player = $this->players[$this->highlightIndex] ?? null;
//        if ($player) {
//            $this->redirect("/");
//        }
    }

    public function updatedQuery()
    {
        $this->players = Leaderboard::where('username', 'ilike', '%' . $this->query . '%')
            ->limit(5)
            ->get();
    }

    public function render()
    {
        return view('livewire.search');
    }
}
