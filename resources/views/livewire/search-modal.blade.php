<div x-data="{ open: false }">
    <x-form.button @click="open = true">
        <x-lucide-search class="size-5"/>
    </x-form.button>

    <div
        x-show="open"
        style="display: none"
        x-on:keydown.escape.prevent.stop="open = false"
        role="dialog"
        aria-modal="true"
        x-id="['modal-title']"
        :aria-labelledby="$id('modal-title')"
        class="fixed inset-0 z-10 overflow-y-auto"
    >
        <!-- Overlay -->
        <div x-show="open" x-transition.opacity class="fixed inset-0 bg-black bg-opacity-50"></div>

        <!-- Panel -->
        <div
            x-show="open" x-transition
            x-on:click="open = false"
            class="relative flex min-h-screen items-center justify-center p-4"
        >
            <div
                x-on:click.stop
                x-trap.noscroll.inert="open"
                class="relative w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-lg"
            >
                <div class="flex flex-col text-sm pb-1 w-full">
                    <input
                        type="text"
                        wire:model.live.250ms="q"
                        placeholder="Search..."
                        class="rounded-t-lg focus:!ring-0 focus:!outline-none py-3 px-5 !ring-0 !outline-none border-0 border-b !border-gray-200"
                    />

                    <div class="flex flex-col">
                        <div class="flex items-center justify-between px-5 py-1 border-b">
                            <div class="flex items-center gap-2">
                                <strong>
                                    Players
                                </strong>

                                <span wire:loading>
                            <x-lucide-loader-circle class="size-4 animate-spin" />
                        </span>
                            </div>

                            <x-form.button as="a" href="/players">
                                <span class="text-sm">View all</span>
                                <x-lucide-arrow-right class="w-4 h-4" />
                            </x-form.button>
                        </div>

                        <div class="flex flex-col px-3 py-2">
                            @foreach($users as $user)
                                <a
                                    wire:key="{{ $user['user_id'] }}"
                                    href="/players/{{ $user['user_id'] }}"
                                    class="hover:bg-gray-50 p-1 px-2 rounded border border-transparent hover:border-gray-100"
                                >
                                    {{ $user['username'] }}
                                </a>
                            @endforeach

                            @if($users->isEmpty())
                                <p class="px-2 py-1 text-sm text-gray-500">No users found</p>
                            @endif
                        </div>
                    </div>

                    <div class="flex flex-col">
                        <div class="flex items-center justify-between px-5 py-1 border-y">
                            <div class="flex items-center gap-2">
                                <strong>
                                    Beatmaps
                                </strong>

                                <span wire:loading>
                            <x-lucide-loader-circle class="size-4 animate-spin" />
                        </span>
                            </div>

                            <x-form.button as="a" href="/beatmaps">
                                <span class="text-sm">View all</span>
                                <x-lucide-arrow-right class="w-4 h-4" />
                            </x-form.button>
                        </div>

                        <div class="flex flex-col px-3 py-2">
                            @foreach($beatmaps as $beatmap)
                                <a
                                    wire:key="{{ $beatmap['id'] }}"
                                    href="/sets/{{ $beatmap['id'] }}"
                                    class="truncate hover:bg-gray-50 p-1 px-2 rounded border border-transparent hover:border-gray-100"
                                >
                                    {{ $beatmap['creator'] }} - {{ $beatmap['artist'] }} - {{ $beatmap['title'] }}
                                </a>
                            @endforeach

                            @if($beatmaps->isEmpty())
                                <p class="px-2 py-1 text-sm text-gray-500">No beatmaps found</p>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
