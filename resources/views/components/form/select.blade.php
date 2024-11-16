<x-form.base {{ $attributes }}>
    <select {{ $attributes->class([
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300',
        'dark:bg-gray-800 dark:border-gray-700 dark:placeholder:text-white dark:text-white dark:border-gray-700',
        'w-full py-2 px-2 border border-gray-300 text-black rounded-lg transition-all'
    ]) }}>
        {{ $slot }}
    </select>
</x-form.base>
