<x-layout.block title="Activity">
    <x-slot:actions>
{{--        <x-form.button as="a" href="/players" class="flex items-center gap-1 text-sm">--}}
{{--            <span class="whitespace-nowrap">View all</span>--}}
{{--            <x-lucide-arrow-right class="h-4 w-4"/>--}}
{{--        </x-form.button>--}}
    </x-slot:actions>

    <div class="flex flex-col gap-2">
        @foreach ($recent as $snipe)
            <x-layout.card class="p-3 text-sm">
                <p class="min-w-0 truncate">
                    <span>{{ \Carbon\Carbon::parse($snipe['created_at'])->format('d/m/y') }}</span>
                    <a href="/players/{{ $snipe['newUser']['id'] }}" class="font-bold hover:underline">{{ $snipe['newUser']['username'] }}</a>
                    <span class="font-thin">sniped</span>
                    <a href="/players/{{ $snipe['oldUser']['id'] }}" class="font-bold hover:underline">{{ $snipe['oldUser']['username'] }}</a>
                    <span class="font-thin">on</span>
                    <a href="/beatmaps/{{ $snipe['beatmap']['id'] }}" class="font-bold hover:underline">{{ $snipe['beatmap']['beatmapset']['title'] }} [{{ $snipe['beatmap']['version'] }}]</a>
                </p>
            </x-layout.card>
        @endforeach

        @if (count($recent) === 0)
            <x-layout.card class="p-3 text-sm">
                <p class="text-center">No recent activity</p>
            </x-layout.card>
        @endif
    </div>
</x-layout.block>
