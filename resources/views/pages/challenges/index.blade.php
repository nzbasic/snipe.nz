@extends('layouts.app')

@section('content')
    <x-layout.width.default class="md:text-base">
        <x-layout.block>
            <x-slot:title>Active</x-slot:title>

            <x-osu.challenges>
                @foreach($active as $challenge)
                    <x-osu.challenge
                        wire:key="{{ $challenge['id'] }}"
                        :challenge="$challenge"
                        type="{{ $challenge->type }}"
                    />
                @endforeach
            </x-osu.challenges>
        </x-layout.block>

        <x-layout.block>
            <x-slot:title>History</x-slot:title>

            <x-osu.challenges>
                @foreach($history as $challenge)
                    <x-osu.challenge
                        wire:key="{{ $challenge['id'] }}"
                        :challenge="$challenge"
                        type="{{ $challenge->type }}"
                    />
                @endforeach
            </x-osu.challenges>
        </x-layout.block>
    </x-layout.width.default>
@endsection
