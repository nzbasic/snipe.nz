@extends('layouts.app')

@php
    if ($challenge->type === 'player') {
        $href = "https://osu.ppy.sh/users/{$challenge->type_id}";
    } else {
        $href = "https://osu.ppy.sh/beatmaps/{$challenge->type_id}";
    }
@endphp

@section('content')
    <x-layout.width.default class="md:text-base">
        <x-layout.block>
            <x-slot:title>Challenge</x-slot:title>

            <x-slot:actions>
                <div class="flex items-center gap-1">
                    <x-form.button
                        as="a"
                        target="_blank"
                        rel="noreferrer"
                        href="{{ $href }}"
                    >
                        osu!
                        <x-lucide-arrow-right class="size-4 -rotate-45" />
                    </x-form.button>
                    <x-form.button as="a" href="/challenges" class="flex items-center gap-1 text-sm">
                        View all
                        <x-lucide-arrow-right class="h-4 w-4"/>
                    </x-form.button>
                </div>
            </x-slot:actions>

            <x-osu.challenges>
                <x-osu.challenge href="/{{ $challenge->type  }}s/{{ $challenge->type_id }}" :challenge="$challenge" type="{{ $challenge->type }}" />
            </x-osu.challenges>
        </x-layout.block>

        @if ($challenge->type === 'player' && count($challenge->leaderboard) > 0)
            <x-layout.block title="Leaderboard">
                <div class="flex flex-col gap-2">
                    @foreach ($challenge->leaderboard as $player)
                        <x-layout.card class="p-3 flex justify-between">
                            <a class="font-bold hover:underline" href="/players/{{ $player['user']['id'] }}">
                                {{ $player['user']['username'] }}
                            </a>

                            <p>{{ $player['count'] }}</p>
                        </x-layout.card>
                    @endforeach
                </div>
            </x-layout.block>
        @endif

        <x-layout.block>
            <x-osu.activity :recent="$challenge->activity" />
        </x-layout.block>

        @if ($challenge->type === 'player')
            <livewire:player-scores :id="$challenge->type_id" />
        @else
            <livewire:beatmap-scores :id="$challenge->type_id" />
        @endif
    </x-layout.width.default>
@endsection
