@if ($challenge ?? false)
    <a
        href="{{ $href ?? ("/challenges/" . $challenge->id) }}"
        class="grid grid-cols-subgrid col-span-full"
    >
        <x-layout.card class="grid col-span-full grid-cols-subgrid text-sm" link>
            <div class="p-3 rounded-r-none border-r-0 shadow-none">
            <span>
                @if ($type === 'beatmap')
                    Map
                @else
                    Player
                @endif
            </span>
            </div>

            <div class="flex gap-1 p-3 border-x dark:border-gray-700 min-w-0">
                <strong class="truncate min-w-0">
                    @if ($type === 'beatmap')
                        <span class="truncate whitespace-nowrap">
                        {{ $challenge->beatmap->beatmapset->title }} [{{ $challenge->beatmap->version }}]
                    </span>
                    @else
                        <span class="truncate">
                        {{ $challenge->player->username }}
                    </span>
                    @endif
                </strong>
            </div>

            <div class="p-3 border-r dark:border-gray-700">
                @if ($challenge->status === 'completed')
                    <div class="flex items-center gap-1">
                        Ended on
                        <p>{{ $challenge->ends_at->format('d/m/Y') }}</p>
                    </div>
                @else
                    Ends in {{ $challenge->ends_at->diffForHumans(now(), \Carbon\CarbonInterface::DIFF_ABSOLUTE) }}
                @endif
            </div>

            <div class="p-3">
                @if ($challenge->leader)
                    <div class="flex items-center gap-1">
                        <x-lucide-crown class="size-3 mb-0.5" />
                        {{ $challenge->leader->username }}
                    </div>
                @else
                    <p class="text-gray-500">No snipes</p>
                @endif
            </div>
        </x-layout.card>
    </a>
@else
    <x-layout.card class="p-3 col-span-full text-gray-500">
        No challenge found
    </x-layout.card>
@endif

