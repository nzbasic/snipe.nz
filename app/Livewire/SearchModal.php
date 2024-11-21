<?php

namespace App\Livewire;

use Livewire\Component;

class SearchModal extends Component
{
    public $q = '';

    public function render()
    {
        $users = \App\Models\Leaderboard::query()
            ->when($this->q, function ($query) {
                $query->where('username', 'ilike', '%' . $this->q . '%');
            })
            ->limit(5)
            ->orderByDesc('raw_total_pp')
            ->get();

        $beatmaps = \App\Models\BeatmapSet::query()
            ->when($this->q, function ($query) {
                $query->where('title', 'ilike', '%' . $this->q . '%')
                    ->orWhere('artist', 'ilike', '%' . $this->q . '%');
            })
            ->limit(5)
            ->orderByDesc('play_count')
            ->get();

        return view('livewire.search-modal', [
            'users' => $users,
            'beatmaps' => $beatmaps,
        ]);
    }
}
