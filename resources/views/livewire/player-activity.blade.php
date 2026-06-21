<x-layout.block>
    <x-slot:title>
        Activity
    </x-slot:title>

    <x-slot:actions>
        <div class="flex flex-wrap items-center justify-end gap-2">
            <div class="flex items-center gap-1">
                <x-form.button
                    wire:click="$set('role', 'all')"
                    @class(['!bg-blue-600 !border-blue-600 !text-white' => $role === 'all'])
                >
                    All
                </x-form.button>
                <x-form.button
                    wire:click="$set('role', 'sniper')"
                    @class(['!bg-blue-600 !border-blue-600 !text-white' => $role === 'sniper'])
                >
                    Sniper
                </x-form.button>
                <x-form.button
                    wire:click="$set('role', 'victim')"
                    @class(['!bg-blue-600 !border-blue-600 !text-white' => $role === 'victim'])
                >
                    Victim
                </x-form.button>
            </div>

            <x-form.input
                wire:model.live.debounce.300ms="player"
                name="player"
                type="text"
                placeholder="Filter by player"
                class="!py-1 !w-44"
            />
        </div>
    </x-slot:actions>

    <div class="flex flex-col gap-2">
        @foreach ($activity as $snipe)
            <x-layout.card wire:key="{{ $snipe['id'] }}" class="p-3 text-xs md:text-sm">
                <div class="min-w-0">
                    <div class="flex justify-between gap-2">
                        <p class="truncate whitespace-nowrap">
                            <a href="/players/{{ $snipe['newUser']['id'] }}" class="font-bold hover:underline">{{ $snipe['newUser']['username'] }}</a>
                            <span class="font-thin">sniped</span>
                            <a href="/players/{{ $snipe['oldUser']['id'] }}" class="font-bold hover:underline">{{ $snipe['oldUser']['username'] }}</a>
                        </p>

                        <x-date :date="$snipe['created_at']" />
                    </div>

                    <div class="flex justify-between gap-2">
                        <div class="flex items-center gap-1 min-w-0">
                            <a href="/beatmaps/{{ $snipe['beatmap']['id'] }}" class="font-bold hover:underline truncate whitespace-nowrap">{{ $snipe['beatmap']['beatmapset']['artist'] }} - {{ $snipe['beatmap']['beatmapset']['title'] }}</a>
                            <a
                                href="https://osu.ppy.sh/beatmaps/{{ $snipe['beatmap']['id'] }}"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View on osu!"
                                class="shrink-0 text-gray-500 hover:text-blue-500"
                            >
                                <x-lucide-external-link class="h-3.5 w-3.5" />
                            </a>
                        </div>
                        <a href="/beatmaps/{{ $snipe['beatmap']['id'] }}" class="font-bold hover:underline whitespace-nowrap">[{{ $snipe['beatmap']['version'] }}]</a>
                    </div>
                </div>
            </x-layout.card>
        @endforeach

        @if (count($activity) === 0)
            <x-layout.card class="p-3 text-sm">
                <p class="text-center">No activity</p>
            </x-layout.card>
        @endif
    </div>

    <div class="flex justify-center w-full my-6">
        {{ $activity->onEachSide(1)->links(data: ['scrollTo' => false]) }}
    </div>
</x-layout.block>
