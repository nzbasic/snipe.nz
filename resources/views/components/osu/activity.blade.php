<x-layout.block title="Activity">
    <x-slot:actions>
{{--        <x-form.button as="a" href="/players" class="flex items-center gap-1 text-sm">--}}
{{--            <span class="whitespace-nowrap">View all</span>--}}
{{--            <x-lucide-arrow-right class="h-4 w-4"/>--}}
{{--        </x-form.button>--}}
    </x-slot:actions>

    <div class="flex flex-col gap-2">
        @foreach ($recent as $snipe)
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
                        <a href="/beatmaps/{{ $snipe['beatmap']['id'] }}" class="font-bold hover:underline truncate whitespace-nowrap">{{ $snipe['beatmap']['beatmapset']['artist'] }} - {{ $snipe['beatmap']['beatmapset']['title'] }}</a>
                        <a href="/beatmaps/{{ $snipe['beatmap']['id'] }}" class="font-bold hover:underline whitespace-nowrap">[{{ $snipe['beatmap']['version'] }}]</a>
                    </div>
                </div>
            </x-layout.card>
        @endforeach

        @if (count($recent) === 0)
            <x-layout.card class="p-3 text-sm">
                <p class="text-center">No recent activity</p>
            </x-layout.card>
        @endif
    </div>
</x-layout.block>
