@extends('layouts.app')

@section('content')
    <x-layout.width.default>
        <x-layout.block class="">
            <x-slot:title class="min-w-0">
                <a
                    href="https://osu.ppy.sh/beatmaps/{{ $beatmap['id'] }}"
                    class="hover:underline flex flex-col max-w-2xl"
                    target="_blank"
                    rel="noreferrer"
                >
                    <span class="truncate">{{ $set['title'] }}</span>
                    <span class="truncate">[{{ $beatmap['version'] }}]</span>
                </a>
            </x-slot:title>

            <x-layout.card class="!p-3 shrink-0">
                <img alt="profile" class="rounded-md" src="{{ $set->cover }}" />
            </x-layout.card>
        </x-layout.block>

        <livewire:beatmap-scores :beatmap="$beatmap" />
    </x-layout.width.default>
@endsection
