@if ($title ?? false)
    <div class="flex flex-col gap-2">
        <div class="flex justify-between items-end">
            <x-layout.title>{{ $title }}</x-layout.title>

            {{ $actions ?? false }}
        </div>

        <div {{ $attributes }}>
            {{ $slot }}
        </div>
    </div>
@else
    <div {{ $attributes }}>
        {{ $slot }}
    </div>
@endif
