@extends('layouts.app')

@section('content')
    <x-layout.width.default>
        <x-layout.block>
            <x-slot:title>
                <a
                    href="https://osu.ppy.sh/beatmaps/{{ $beatmap['id'] }}"
                    class="block hover:underline min-w-0"
                    target="_blank"
                    rel="noreferrer"
                >
                    <p class="flex items-center gap-1 min-w-0 w-full">
                        <span class="truncate">{{ $set['title'] }}</span>
                        <span class="whitespace-nowrap">[{{ $beatmap['version'] }}]</span>
                    </p>
                </a>
            </x-slot:title>

            <img alt="profile" class="rounded-md border dark:border-gray-700 shadow-sm" src="{{ $set->cover }}" />

            <div class="flex justify-between gap-x-4 pt-2">
                <div class="flex justify-start gap-1">
                    <x-form.button as="a" href="/sets/{{ $set['id'] }}">
                        View set
                        <x-lucide-arrow-right class="size-4" />
                    </x-form.button>

                    <x-form.button as="a" target="_blank" rel="noreferrer" href="https://osu.ppy.sh/beatmapsets/{{ $set['id'] }}">
                        osu!
                        <x-lucide-arrow-right class="size-4 -rotate-45" />
                    </x-form.button>
                </div>

                <div>
                    <livewire:refresh-beatmap :id="$beatmap['id']" />
                </div>
            </div>
        </x-layout.block>

        <livewire:beatmap-scores :id="$beatmap['id']" />
    </x-layout.width.default>
@endsection
