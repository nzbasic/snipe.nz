<?php

namespace App\Livewire;

use LivewireUI\Modal\ModalComponent;

class SearchModal extends ModalComponent
{
    public $q = '';

    /**
     * Supported: 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'
     */
    public static function modalMaxWidth(): string
    {
        return 'lg';
    }

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
