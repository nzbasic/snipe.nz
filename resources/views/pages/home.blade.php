@extends('layouts.app')

@section('content')
    <x-layout.width.default>
        <x-layout.block title="Challenges">
            <x-slot:actions>
                <x-form.button as="a" href="/challenges" class="flex items-center gap-1 text-sm">
                    View all
                    <x-lucide-arrow-right class="h-4 w-4"/>
                </x-form.button>
            </x-slot:actions>

            <div class="flex flex-col gap-2 text-sm">
                <x-osu.challenges>
                    @if ($daily)
                        <x-osu.challenge :challenge="$daily" type="beatmap" />
                    @endif

                    @if ($weekly)
                        <x-osu.challenge :challenge="$weekly" type="player" />
                    @endif

                    @if (! $daily && ! $weekly)
                        <x-layout.card class="p-3 col-span-full text-gray-500">
                            No challenges found. Yell at basic
                        </x-layout.card>
                    @endif
                </x-osu.challenges>
            </div>
        </x-layout.block>

        <livewire:mini-leaderboard :top="$top" />

        <x-osu.activity :recent="$recent" />
    </x-layout.width.default>
@endsection

