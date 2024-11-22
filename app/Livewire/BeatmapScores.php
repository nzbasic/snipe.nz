<?php

namespace App\Livewire;

use App\Models\Beatmap;
use App\Models\LazerScore;
use Livewire\Attributes\Url;
use Livewire\Attributes\Validate;
use Livewire\Component;
use Livewire\WithPagination;

class BeatmapScores extends Component
{
    use WithPagination;

    public $beatmap;

    #[Url]
    #[Validate('in:classic,lazer,legacy')]
    public $scoring = 'classic';

    #[Url('size')]
    #[Validate('numeric|min:1|max:50')]
    public $pageSize = 10;

    public function mount($id)
    {
        $beatmap = Beatmap::findOrFail($id);

        $this->beatmap = $beatmap;
    }

    public function save()
    {
        $this->validate();
    }

    public function render()
    {
        $q = LazerScore::query()
            ->select('lazer_scores.*', 'players.username')
            ->where('beatmap_id', $this->beatmap->id)
            ->join('players', 'lazer_scores.user_id', '=', 'players.id')
            ->orderByDesc('created_at')
            ->paginate($this->pageSize);

        return view('livewire.beatmap-scores', [
            'scores' => $q,
        ]);
    }
}
