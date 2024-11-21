@extends('layouts.app')

@section('content')
    <x-layout.width.default>
        <livewire:mini-leaderboard :top="$top" />

        <x-osu.activity :recent="$recent" />
    </x-layout.width.default>
@endsection

{{--        <div class="grid md:grid-cols-2 gap-y-12 gap-6">--}}
{{--            <x-layout.card title="Daily Beatmap">--}}
{{--                <x-slot:actions>--}}
{{--                    <x-form.button as="a" href="/challenges/1">--}}
{{--                        View--}}
{{--                        <x-lucide-arrow-right class="size-4" />--}}
{{--                    </x-form.button>--}}
{{--                </x-slot:actions>--}}

{{--                <div class="flex justify-between p-3">--}}
{{--                    <strong>--}}
{{--                        Snow Drive [Test]--}}
{{--                    </strong>--}}
{{--                </div>--}}

{{--                <div class="p-3 border-y dark:border-gray-700">--}}
{{--                    Ends in 3h 23m--}}
{{--                </div>--}}

{{--                <div class="p-3">--}}
{{--                    Leader: Emilbus--}}
{{--                </div>--}}
{{--            </x-layout.card>--}}

{{--            <x-layout.card title="Weekly Target">--}}
{{--                <x-slot:actions>--}}
{{--                    <x-form.button as="a" href="/challenges/1">--}}
{{--                        View--}}
{{--                        <x-lucide-arrow-right class="size-4" />--}}
{{--                    </x-form.button>--}}
{{--                </x-slot:actions>--}}

{{--                <div class="flex justify-between p-3">--}}
{{--                    <strong>--}}
{{--                        Rail--}}
{{--                    </strong>--}}
{{--                </div>--}}

{{--                <div class="p-3 border-y dark:border-gray-700">--}}
{{--                    Ends in 2d 3h 23m--}}
{{--                </div>--}}

{{--                <div class="p-3">--}}
{{--                    Leader: Emilbus (23 snipes)--}}
{{--                </div>--}}
{{--            </x-layout.card>--}}
{{--        </div>--}}
