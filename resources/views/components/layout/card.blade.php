@php
    $merged = $attributes->class([
        'bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg shadow-sm',
        'hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:brightness-110 transition-colors' => $attributes->get('link'),
    ]);
@endphp

@if ($title ?? false)
    <x-layout.block>
        <x-slot:title>{{ $title }}</x-slot:title>

        @if ($actions ?? false)
            <x-slot:actions>
                {{ $actions }}
            </x-slot:actions>
        @endif

        <div {{ $merged }}>
            {{ $slot }}
        </div>
    </x-layout.block>
@else
    <div {{ $merged }}>
        {{ $slot }}
    </div>
@endif
