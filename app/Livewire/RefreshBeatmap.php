<?php

namespace App\Livewire;

use App\Jobs\UpdateLazerBeatmapJob;
use App\Models\Beatmap;
use Illuminate\Support\Facades\Cache;
use Livewire\Component;

class RefreshBeatmap extends Component
{
    public $beatmap;

    public $shouldReload = false;

    public function mount($id)
    {
        $beatmap = Beatmap::findOrFail($id);

        $this->beatmap = $beatmap;
    }

    public function refresh()
    {
        if (Cache::has('refresh_' . $this->beatmap->id)) {
            return;
        }

        dispatch_sync(new UpdateLazerBeatmapJob($this->beatmap->id));

        Cache::put('refresh_' . $this->beatmap->id, true, 60);

        $this->shouldReload = true;
    }

    public function render()
    {
        return view('livewire.refresh-beatmap');
    }
}
