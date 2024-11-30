<?php

namespace App\Livewire;

use App\Models\LazerScore;
use Livewire\Attributes\Url;
use Livewire\Attributes\Validate;
use Livewire\Component;
use Livewire\WithPagination;

class PlayerScores extends Component
{
    use WithPagination;

    public $id;

    #[Url]
    #[Validate('in:pp,score,max_combo,beatmap_playcount,beatmap_stars,beatmap_length,beatmap_bpm,beatmap_max_combo,date')]
    public $sort = 'pp';

    #[Url]
    #[Validate('in:classic,lazer,legacy')]
    public $scoring = 'classic';

    #[Url('dir')]
    #[Validate('in:asc,desc')]
    public $direction = 'desc';

    #[Url('size')]
    #[Validate('numeric|min:1|max:50')]
    public $pageSize = 10;

    public function mount($id)
    {
        $this->id = $id;
    }

    public function save()
    {
        $this->validate();
    }

    public function render()
    {
        $sort = $this->sort;
        if ($this->sort === 'score') {
            $sort = match($this->scoring) {
                'classic' => 'classic_total_score',
                'lazer' => 'total_score',
                'legacy' => 'legacy_total_score',
            };
        }

        if ($sort === 'max_combo') {
            $sort = 'lazer_scores.max_combo';
        }

        if ($sort === 'accuracy') {
            $sort = 'lazer_scores.accuracy';
        }

        if ($sort === 'date') {
            $sort = 'lazer_scores.ended_at';
        }

        $q = LazerScore::query()
            ->select([
                'lazer_scores.*', 'beatmaps.*', 'beatmap_sets.*',
                'lazer_scores.accuracy as accuracy',
                'lazer_scores.max_combo as max_combo',
                'beatmaps.playcount as beatmap_playcount',
                'beatmaps.difficulty_rating as beatmap_stars',
                'beatmaps.total_length as beatmap_length',
                'beatmaps.bpm as beatmap_bpm',
                'beatmaps.max_combo as beatmap_max_combo',
            ])
            ->whereNull('sniped_at')
            ->where('lazer_scores.user_id', $this->id)
            ->whereNotNull('pp')
            ->join('beatmaps', 'beatmaps.id', '=', 'lazer_scores.beatmap_id')
            ->join('beatmap_sets', 'beatmap_sets.id', '=', 'beatmaps.beatmapset_id')
            ->orderBy($sort, $this->direction)
            ->paginate($this->pageSize);

        return view('livewire.player-scores', [
            'scores' => $q,
        ]);
    }
}
