<x-layout.block>
    <x-slot:title>
        Difficulties
    </x-slot:title>

    <x-slot:actions>
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
    </x-slot:actions>

    <div class="flex flex-col gap-2">
        @foreach($scores as $score)
            <x-layout.card wire:key="{{ $score['id'] }}" class="text-xs md:text-sm flex items-center justify-between overflow-hidden gap-x-4 p-3">
                <div class="flex items-center gap-2 sm:gap-4 min-w-0">
                    <x-osu.rank :rank="$score['rank']" />

                    <div class="flex flex-col min-w-0">
                        <a
                            href="/beatmaps/{{ $score['beatmap']['id'] }}"
                            class="truncate hover:underline font-bold"
                        >
                            {{ $score['beatmap']['version'] }}
                        </a>

                        <div class="flex items-center gap-1 min-w-0">
                            <a
                                href="/players/{{ $score['user_id'] }}"
                                class="truncate hover:underline font-bold"
                            >
                                {{ $score['username'] }}
                            </a>

                            <x-osu.mods :mods="$score['mods']" />

                            <p>{{ $score['max_combo'] }}/{{ $score['beatmap']['max_combo'] }}</p>
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
                        <p>{{ number_format($score['pp']) }}pp</p>
                    </div>
                </div>
            </x-layout.card>
        @endforeach
    </div>

    <div class="flex justify-center w-full my-6">
        {{ $scores->onEachSide(1)->links(data: ['scrollTo' => false]) }}
    </div>
</x-layout.block>
