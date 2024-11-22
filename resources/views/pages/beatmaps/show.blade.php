@extends('layouts.app')

@section('content')
    <x-layout.width.default>
        <x-layout.block class="">
            <x-slot:title class="min-w-0">
                <a
                    href="https://osu.ppy.sh/beatmaps/{{ $beatmap['id'] }}"
                    class="block hover:underline w-[42rem] overflow-hidden"
                    target="_blank"
                    rel="noreferrer"
                >
                    <div class="flex items-center gap-1">
                        <p class="truncate">{{ $set['title'] }}</p>
                        <p class="whitespace-nowrap">[{{ $beatmap['version'] }}]</p>
                    </div>
                </a>
            </x-slot:title>

            <img alt="profile" class="rounded-md border dark:border-gray-700 shadow-sm" src="{{ $set->cover }}" />

            <div class="flex justify-start pt-2 gap-1">
                <x-form.button as="a" href="/sets/{{ $set['id'] }}">
                    View set
                    <x-lucide-arrow-right class="size-4 -rotate-45" />
                </x-form.button>

                <x-form.button as="a" target="_blank" rel="noreferrer" href="https://osu.ppy.sh/beatmapsets/{{ $set['id'] }}">
                    osu!
                    <x-lucide-arrow-right class="size-4 -rotate-45" />
                </x-form.button>
            </div>
        </x-layout.block>

        <livewire:beatmap-scores :id="$beatmap['id']" />
    </x-layout.width.default>
@endsection
