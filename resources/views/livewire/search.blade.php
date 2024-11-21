<div class="relative">
    <x-form.input
        type="text"
        class="!w-64"
        placeholder="Search users..."
        wire:model.live.debounce.500="query"
        wire:keydown.escape="reset"
        wire:keydown.tab="reset"
        wire:keydown.arrow-up="decrementHighlight"
        wire:keydown.arrow-down="incrementHighlight"
        wire:keydown.enter="selectPlayer"
    />

    @if(!empty($query))
        <div class="fixed top-0 bottom-0 left-0 right-0" wire:click="reset"></div>

        <div class="absolute z-10 w-72 flex flex-col gap-2">
            <x-layout.card class="flex flex-col gap-2 p-3">
                @if(count($players) > 0)
                    @foreach($players as $i => $player)
                        <a
                            wire:key="{{ $player['user_id'] }}"
                            href="/players/{{ $player['user_id'] }}"
                            class="text-black flex items-center justify-between p-2 rounded-md border dark:border-0 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:brightness-110 dark:hover:bg-gray-700 transition-colors dark:text-white"
                        >
                            <span>{{ $player['username'] }}</span>
                            <x-lucide-arrow-right class="h-4 w-4" />
                        </a>
                    @endforeach
                @else
                    <p>No results!</p>
                @endif
            </x-layout.card>
        </div>
    @endif
</div>
