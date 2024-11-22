@extends('layouts.app')

@section('content')
    <x-layout.width.default>
        <x-layout.block class="">
            <x-slot:title class="min-w-0">
                <a
                    href="https://osu.ppy.sh/beatmapsets/{{ $set['id'] }}"
                    class="hover:underline flex flex-col max-w-2xl"
                    target="_blank"
                    rel="noreferrer"
                >
                    <span class="truncate">{{ $set['title'] }}</span>
                </a>
            </x-slot:title>

            <img alt="profile" class="rounded-md border dark:border-gray-700 shadow-sm" src="{{ $set->cover }}" />

            <div class="flex justify-start mt-2">
                <x-form.button as="a" target="_blank" rel="noreferrer" href="https://osu.ppy.sh/beatmapsets/{{ $set['id'] }}">
                    osu!
                    <x-lucide-arrow-right class="size-4 -rotate-45" />
                </x-form.button>
            </div>
        </x-layout.block>

        <x-osu.activity :recent="$recent" />

        <livewire:beatmap-set-scores :set="$set" />
    </x-layout.width.default>
@endsection
