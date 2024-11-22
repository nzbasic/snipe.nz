@extends('layouts.base')

@section('body')
    <style>
        @media(prefers-color-scheme: dark) {
            .bg-dots {
                background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(200,200,255,0.15)'/%3E%3C/svg%3E");
            }
        }

        @media(prefers-color-scheme: light) {
            .bg-dots {
                background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(0,0,50,0.10)'/%3E%3C/svg%3E");
            }
        }
    </style>

    <div class="flex flex-col relative min-h-screen bg-gray-100 bg-center sm:flex sm:justify-center sm:items-center bg-dots dark:bg-gray-900 dark:text-white selection:bg-[#283349] selection:text-white">
        <div class="flex flex-col gap-16 md:gap-16 mx-auto w-full pt-12 md:pt-24 px-6 flex-grow">
            <header class="flex items-end gap-4 justify-between max-w-2xl mx-auto w-full">
                <div class="flex justify-center">
                    <a href="/" class="flex items-center gap-4">
                        <img alt="logo" class="size-12" src="{{ asset(url('/icon.png')) }}" />

                        <div class="hidden md:flex flex-col gap-0">
                            <h1 class="text-xl font-bold">snipe.nz</h1>
                            <p class="text-xs whitespace-nowrap font-medium">Country #1 Tracker</p>
                        </div>
                    </a>
                </div>

                <div class="flex flex-col items-end gap-1">
                    <div class="flex items-center gap-1">
                        <div class="flex items-center gap-1 font-bold">
                            <x-form.button as="a" href="/challenges">
                                Challenges
                            </x-form.button>

                            <x-form.button as="a" href="/players">
                                Players
                            </x-form.button>

                            <x-form.button as="a" href="/beatmaps">
                                Beatmaps
                            </x-form.button>
                        </div>

                        <livewire:search-modal />
                    </div>
                </div>
            </header>

            <div class="flex flex-col gap-16 flex-grow">
                <div class="flex flex-col flex-grow gap-8 md:gap-12">
                    @yield('content')

                    @isset($slot)
                        {{ $slot }}
                    @endisset
                </div>

                <div class="mx-auto text-sm flex items-center gap-4 divide-x divide-gray-400 pb-16">
                    <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://nzbasic.com"
                        class="text-center hover:underline"
                    >
                        by nzbasic
                    </a>

                    <div class="flex items-center gap-2 pl-4">
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://github.com/nzbasic/snipe.nz"
                            class="flex items-center gap-2 group"
                        >
                            <x-lucide-github class="h-8 w-8 bg-white group-hover:border-gray-500 dark:hover:brightness-110 dark:text-white border dark:border-transparent border-gray-300 dark:bg-gray-700 rounded-full p-1.5"/>
                            GitHub
                        </a>

                        {{-- <button x-show="darkMode === 'dark'" x-on:click="darkMode = 'light'">--}}
                        {{--    <x-lucide-moon class="h-8 w-8 border border-black dark:hover:brightness-110 text-white bg-gray-700 rounded-full p-1.5"/>--}}
                        {{-- </button>--}}

                        {{-- <button x-show="darkMode === 'light'" x-on:click="darkMode = 'dark'">--}}
                        {{--    <x-lucide-sun class="h-8 w-8 hover:border-gray-500  text-gray-700 bg-white border border-gray-300 rounded-full p-1.5"/>--}}
                        {{-- </button>--}}
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
