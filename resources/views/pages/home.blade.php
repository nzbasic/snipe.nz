@extends('layouts.app')

@section('content')
    <x-layout.width.default>
        <livewire:mini-leaderboard :top="$top" />

        <x-osu.activity :recent="$recent" />
    </x-layout.width.default>
@endsection
