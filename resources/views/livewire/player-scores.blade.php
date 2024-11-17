<x-layout.block>
    <x-slot:title>
        Country #1s
    </x-slot:title>

    <x-slot:actions>
        <div class="flex items-center gap-1">
            <x-form.root wire:submit.prevent="save" class="flex items-center gap-1">
                <x-pines.popover>
                    <x-slot:title>Settings</x-slot:title>

                    <x-slot:icon>
                        <x-lucide-settings class="h-4 w-4" />
                    </x-slot:icon>

                    <div class="flex flex-col gap-2">
                        <x-form.input id="pageSize" label="Page Size" wire:model.live.debounce.100ms="pageSize" name="pageSize" type="number" label="Page size" />

                        <x-form.select id="scoring" wire:model.change="scoring" label="Scoring">
                            <option value="classic">Classic Lazer</option>
                            <option value="lazer">Lazer</option>
                            <option value="legacy">Legacy</option>
                        </x-form.select>
                    </div>
                </x-pines.popover>

                <x-pines.popover>
                    <x-slot:title>Filters</x-slot:title>

                    <x-slot:icon>
                        <x-lucide-sliders-horizontal class="h-4 w-4" />
                    </x-slot:icon>

                    <div>WIP</div>
                </x-pines.popover>

                <x-pines.popover>
                    <x-slot:title>Sorting</x-slot:title>

                    <x-slot:icon>
                        <x-lucide-arrow-down-up class="h-4 w-4" />
                    </x-slot:icon>

                    <div class="flex flex-col gap-2">
                        <x-form.select id="sort" wire:model.change="sort" label="Sort by">
                            <option value="pp">PP</option>
                            <option value="score">Score</option>
                            <option value="max_combo">Combo</option>
                            <option value="date">Date</option>
                            <option value="beatmap_playcount">Playcount</option>
                            <option value="beatmap_stars">Stars</option>
                            <option value="beatmap_length">Song Length</option>
                            <option value="beatmap_bpm">BPM</option>
                            <option value="beatmap_max_combo">Max Combo</option>
                        </x-form.select>
                        <x-form.select id="direction" wire:model.change="direction" label="Direction">
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </x-form.select>
                    </div>
                </x-pines.popover>
            </x-form.root>
        </div>
    </x-slot:actions>

    <div class="flex flex-col gap-2">
        @foreach($scores as $score)
            <x-layout.card wire:key="{{ $score['id'] }}" class="text-xs md:text-sm flex items-center justify-between overflow-hidden gap-x-4 p-3">
                <div class="flex items-center gap-2 sm:gap-4 min-w-0">
                    <x-osu.rank :rank="$score['rank']" />

                    <div class="flex flex-col min-w-0">
                        <div class="flex items-center gap-1 min-w-0">
                            <a
                                href="https://osu.ppy.sh/beatmaps/{{ $score['beatmap_id'] }}"
                                class="truncate hover:underline"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {{ $score['title'] }}
                            </a>

                            <x-osu.mods :mods="$score['mods']" />
                        </div>

                        <div class="flex items-center gap-1">
                            <p class="truncate">[{{ $score['version'] }}]</p>
                            <p>{{ $score['max_combo'] }}/{{ $score['beatmap_max_combo'] }}</p>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col items-end shrink-0">
                    <div class="flex items-center gap-1 ">
                        <p>
                            @switch($scoring)
                                @case('classic')
                                    {{ number_format($score['classic_total_score']) }}
                                    @break
                                @case('lazer')
                                    {{ number_format($score['total_score']) }}
                                    @break
                                @case('legacy')
                                    @if ($score['legacy_total_score'] === null || $score['legacy_total_score'] === 0)
                                        N/A
                                    @else
                                        {{ number_format($score['legacy_total_score']) }}
                                    @endif
                                    @break
                            @endswitch
                        </p>
                    </div>

                    <div class="flex items-center gap-1">
                        @if ($sort !== 'pp' && $sort !== 'score')
                            <p class="bg-gray-800 text-xs p-1 rounded text-white">
                                @switch($sort)
                                    @case('date')
                                        {{ \Carbon\Carbon::parse($score['ended_at'])->format('Y-m-d') }}
                                        @break
                                    @case('pp')
                                        {{ number_format($score['pp']) }}pp
                                        @break
                                    @case('beatmap_length')
                                        {{ gmdate('i:s', $score['beatmap_length']) }}
                                        @break
                                    @default
                                        {{ $score[$sort] }}
                                        @break
                                @endswitch
                            </p>
                        @else
                            <p>{{ number_format($score['pp']) }}pp</p>
                        @endif
                    </div>
                </div>
            </x-layout.card>
        @endforeach
    </div>

    <div class="flex justify-center w-full my-6">
        {{ $scores->onEachSide(1)->links(data: ['scrollTo' => false]) }}
    </div>
</x-layout.block>
