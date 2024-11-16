@php
    $as = $as ?? 'button';
@endphp

<{{ $as }}
    {{ $attributes->class([
        'flex items-center gap-1 hover:bg-gray-700 rounded text-sm border border-transparent',
        'rounded-md hover:bg-gray-800 hover:text-white transition-colors',
        'bg-gray-800 border-gray-700 text-white' => $active ?? false,
        'px-1.5 py-0.5' => ($size ?? false) === 'sm',
        'px-2 py-1' => ($size ?? false) === false,
        'bg-gray-700 border-transparent text-white hover:bg-gray-700 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-white' => ($theme ?? false) === 'dark',
    ]) }}
>
    {{ $slot }}
</{{ $as }}>
