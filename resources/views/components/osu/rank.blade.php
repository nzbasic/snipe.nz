@php
    $rank = $attributes->get('rank');

    $color = match($rank) {
        'XH' => 'text-gray-400',
        'X' => 'text-yellow-600',
        'SH' => 'text-gray-400',
        'S' => 'text-yellow-600',
        'A' => 'text-green-600',
        'B' => 'text-blue-600',
        'C' => 'text-orange-600',
        'D' => 'text-red-600',
        default => 'text-black',
    };

    $text = match($rank) {
        'XH' => 'SS',
        'X' => 'SS',
        'SH' => 'S',
        default => $rank,
    };
@endphp

<span class="{{ $color }} text-xl md:text-2xl w-7 text-center font-bold">{{ $text }}</span>
