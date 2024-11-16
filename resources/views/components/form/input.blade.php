<x-form.base {{ $attributes }}>
    <input {{ $attributes->class([
        'dark:bg-gray-800 dark:border-gray-700 dark:placeholder:text-white dark:text-white dark:border-gray-700',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300',
        'py-2 px-2 border border-gray-300 text-black rounded-lg transition-all w-full'
    ]) }} />
</x-form.base>
