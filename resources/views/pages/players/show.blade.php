@extends('layouts.app')

@section('content')
    <x-layout.width.default>
        <x-layout.block>
            <x-slot:title>
                <a
                    href="https://osu.ppy.sh/users/{{ $player['id'] }}"
                    class="hover:underline"
                    target="_blank"
                    rel="noreferrer"
                >
                    {{ $player['username'] }}
                </a>
            </x-slot:title>

            <x-slot:actions>
                <x-form.button as="a" href="/">
                    <x-lucide-arrow-left class="h-4 w-4"/>
                    <span>Go back</span>
                </x-form.button>
            </x-slot:actions>

            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <x-layout.card class="!p-3 hidden sm:block h-44 shrink-0">
                        <img alt="profile" class="rounded-md h-full aspect-square" src="{{ $player['avatar_url'] }}" />
                    </x-layout.card>

                    <x-layout.card class="!p-3.5 w-full sm:h-44">
                        <div class="text-sm sm:text-base grid grid-cols-[auto_1fr] gap-x-4 gap-y-0">
                            <span>Rank</span>
                            <span>#{{ $stats['rank'] }}</span>

                            <span>Total count</span>
                            <span>{{ number_format($stats['total_firsts']) }}</span>

                            <span>Total pp</span>
                            <span>{{ number_format($stats['raw_total_pp']) }}</span>

                            <span>Weighted pp</span>
                            <span>{{ number_format($stats['weighted_total_pp']) }}</span>

                            <span>Average pp</span>
                            <span>{{ number_format($stats['avg_pp']) }}</span>

                            <span>Average playcount</span>
                            <span>{{ number_format($stats['avg_playcount']) }} (beatmap)</span>
                        </div>
                    </x-layout.card>
                </div>

                @livewire(\App\Livewire\PlayerStatsChart::class, ['playerId' => $player->id])
            </div>
        </x-layout.block>

        <div class="grid md:grid-cols-2 gap-6">
            <x-layout.card title="Targets" class="p-3">
                <div class="grid grid-cols-[1fr_auto]">
                    @foreach($targets as $target)
                        <a class="font-bold hover:underline truncate" href="/players/{{ $target['user_id'] }}">{{ $target['username'] }}</a>
                        <span>{{ $target['beat_count'] }}</span>
                    @endforeach

                    @if($targets->isEmpty())
                        <p class="text-gray-400">Has not sniped anyone</p>
                    @endif
                </div>
            </x-layout.card>

            <x-layout.card title="Sniped By" class="p-3">
                <div class="grid grid-cols-[1fr_auto]">
                    @foreach($targeted_by as $target)
                        <a class="font-bold hover:underline truncate" href="/players/{{ $target['user_id'] }}">{{ $target['username'] }}</a>
                        <span>{{ $target['beat_count'] }}</span>
                    @endforeach

                    @if($targeted_by->isEmpty())
                        <p class="text-gray-400">Has not been sniped</p>
                    @endif
                </div>
            </x-layout.card>
        </div>

        <x-osu.activity :recent="$recent" />

        <livewire:player-scores :id="$player['id']" />
    </x-layout.width.default>
@endsection
