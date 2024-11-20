<div class="flex flex-col gap-4">
    <div class="flex items-end justify-between">
        <div class="flex items-end gap-2">
            @livewire('search')
        </div>

        <div class="flex items-end gap-1">
            <x-form.button as="a" href="/players" class="flex items-center gap-1 text-sm">
                <span class="whitespace-nowrap">View all</span>
                <x-lucide-arrow-right class="h-4 w-4 md:hidden"/>
            </x-form.button>

            <div class="hidden md:flex justify-end w-full gap-1 text-sm">
                <x-form.button :active="$sort === 'count'" wire:click="set('sort', 'count')">Total Count</x-form.button>
                <x-form.button :active="$sort === 'pp'" wire:click="set('sort', 'pp')">Total PP</x-form.button>
            </div>
        </div>
    </div>

    <div class="flex flex-col gap-2">
        @foreach($top as $index => $player)
            <a
                wire:key="{{ $player['user_id'] }}"
                href="/players/{{ $player['user_id'] }}"
            >
                <x-layout.card class="flex items-center justify-between p-3" link>
                    <div class="flex items-center gap-2">
                        @if ($index <= 2)
                            <img
                                alt="logo"
                                width="25"
                                height="25"
                                @switch($index)
                                    @case(0)
                                        src="{{ url(asset('gold.png')) }}"
                                        @break
                                    @case(1)
                                        src="{{ url(asset('silver.png')) }}"
                                        @break
                                    @case(2)
                                        src="{{ url(asset('bronze.png')) }}"
                                        @break
                                @endswitch
                            />
                        @else
                            <div class="w-[25px]">
                                <p class="dark:text-white text-center">{{ $index + 1 }}.</p>
                            </div>
                        @endif

                        <p>{{ $player['username'] }}</p>
                    </div>

                    <p>
                        @if ($sort === 'count')
                            {{ number_format($player['total_firsts']) }}
                        @else
                            {{ number_format($player['raw_total_pp']) }}
                        @endif
                    </p>
                </x-layout.card>
            </a>
        @endforeach
    </div>
</div>
