@php
    $mods = $attributes->get('mods');
    $array = json_decode(html_entity_decode($mods));
    if (empty($array)) {
        return;
    }

    $text = '';
    foreach ($array as $mod) {
        $text .= $mod->acronym;
    }
@endphp

@if ($text)
    <span>+{{ $text }}</span>
@endif
