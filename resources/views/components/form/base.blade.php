@if($attributes->get('label'))
    <label
        for="{{ $attributes->get('id') }}"
        class="flex items-center gap-x-4 w-full justify-between text-sm font-medium text-gray-700 dark:text-white"
    >
        <span class="w-20 shrink-0">{{ $attributes->get('label') }}</span>
@endif

{{ $slot }}

@if($attributes->get('label'))
    </label>
@endif

@error($attributes->get('id'))
    <div class="my-1">
        <span class="text-red-500 text-sm text-center">{{ $message }}</span>
    </div>
@enderror
