<?php

namespace App\Livewire;

use App\Models\LazerScore;
use Livewire\Attributes\Url;
use Livewire\Attributes\Validate;
use Livewire\Component;
use Livewire\WithPagination;

class BeatmapSetScores extends Component
{
    use WithPagination;

    public $set;

    #[Url]
    #[Validate('in:classic,lazer,legacy')]
    public $scoring = 'classic';

    #[Url('size')]
    #[Validate('numeric|min:1|max:50')]
    public $pageSize = 10;

    public function mount($set)
    {
        $this->set = $set;
    }

    public function save()
    {
        $this->validate();
    }

    public function render()
    {
        $q = LazerScore::query()
            ->select('lazer_scores.*', 'beatmaps.difficulty_rating', 'players.username')
            ->whereIn('beatmap_id', $this->set->beatmaps->pluck('id'))
            ->whereNull('sniped_at')
            ->join('players', 'lazer_scores.user_id', '=', 'players.id')
            ->join('beatmaps', 'lazer_scores.beatmap_id', '=', 'beatmaps.id')
            ->orderBy('beatmaps.difficulty_rating')
            ->paginate($this->pageSize);

        return view('livewire.beatmap-set-scores', [
            'scores' => $q,
        ]);
    }
}
