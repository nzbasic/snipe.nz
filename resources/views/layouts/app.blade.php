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
        <div class="flex flex-col gap-16 mx-auto w-full py-24 px-6 flex-grow">
            <div class="flex justify-center pb-8">
                <a href="/" class="flex items-center gap-4">
                    <img alt="logo" width="100" height="100" src="https://cdn.discordapp.com/attachments/810444323896033341/1306876456588021800/1.png?ex=6738430b&is=6736f18b&hm=566673a33e0b7865413b0b0651892b3e77c438eb277072d011ad6a56576dcde0&" />

                    <div class="flex flex-col gap-1">
                        <h1 class="text-4xl font-bold">snipe.nz</h1>
                        <p class="text-sm font-bold text-center">Country #1 Tracker</p>
                    </div>
                </a>
            </div>

            <div class="flex flex-col gap-8 flex-grow">
                <div class="flex flex-col flex-grow gap-12">
                    @yield('content')

                    @isset($slot)
                        {{ $slot }}
                    @endisset
                </div>

                <div class="mx-auto text-sm flex items-center gap-4 divide-x divide-gray-400">
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
