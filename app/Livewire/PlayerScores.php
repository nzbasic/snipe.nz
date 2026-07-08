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
    public $pageSize = 50;

    #[Url]
    #[Validate('in:any,NM,HD,HR,DT,FL,EZ,HT')]
    public $mod = 'any';

    #[Url]
    #[Validate('nullable|numeric|min:0')]
    public $minStars = null;

    #[Url]
    #[Validate('nullable|numeric|min:0')]
    public $minPp = null;

    public function mount($id)
    {
        $this->id = $id;
    }

    public function updated($property)
    {
        // Reset to the first page when a filter/sort/setting changes (but NOT
        // on pagination itself), otherwise the user can land on an empty page.
        if (in_array($property, ['mod', 'minStars', 'minPp', 'sort', 'direction', 'scoring', 'pageSize'], true)) {
            $this->resetPage();
        }
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
            ->join('beatmaps', 'beatmaps.id', '=', 'lazer_scores.beatmap_id')
            ->join('beatmap_sets', 'beatmap_sets.id', '=', 'beatmaps.beatmapset_id')
            // NB: lazer_scores.mods is stored as a double-encoded JSON string
            // (a jsonb scalar, not an array), so `#>> '{}'` unwraps it to the
            // inner JSON text before matching. "No Mod" means only Classic (CL)
            // or nothing applied.
            ->when($this->mod === 'NM', fn ($query) => $query->whereRaw(
                "lazer_scores.mods #>> '{}' IN ('[]', '[{\"acronym\":\"CL\"}]')"))
            ->when(in_array($this->mod, ['HD', 'HR', 'DT', 'FL', 'EZ', 'HT'], true),
                fn ($query) => $query->whereRaw("lazer_scores.mods #>> '{}' LIKE ?", ['%"' . $this->mod . '"%']))
            ->when(is_numeric($this->minStars),
                fn ($query) => $query->where('beatmaps.difficulty_rating', '>=', (float) $this->minStars))
            ->when(is_numeric($this->minPp),
                fn ($query) => $query->where('lazer_scores.pp', '>=', (float) $this->minPp));

        // Loved maps award no pp (stored NULL). Treat it as 0 so those #1s sort
        // to the bottom by pp instead of being dropped or sorted as greatest
        // (Postgres orders NULLs first on DESC).
        if ($sort === 'pp') {
            $q->orderByRaw('COALESCE(lazer_scores.pp, 0) ' . ($this->direction === 'asc' ? 'asc' : 'desc'));
        } else {
            $q->orderBy($sort, $this->direction);
        }

        return view('livewire.player-scores', [
            'scores' => $q->paginate($this->pageSize),
        ]);
    }
}
