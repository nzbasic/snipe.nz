@extends('layouts.app')

@section('content')
    <x-layout.width.full class="md:text-base">
        <x-layout.block>
            <x-slot:title>Leaderboard</x-slot:title>

            <x-slot:actions>
                <x-form.button as="a" href="/" class="flex items-center gap-1 text-sm">
                    <x-lucide-arrow-left class="h-4 w-4"/>
                    <span class="whitespace-nowrap">Go back</span>
                </x-form.button>
            </x-slot:actions>

            @livewire('leaderboard')
        </x-layout.block>
    </x-layout.width.full>
@endsection
