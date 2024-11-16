@extends('layouts.app')

@section('content')
    <x-layout.width.default>
        <livewire:mini-leaderboard :top="$top" />
    </x-layout.width.default>
@endsection
