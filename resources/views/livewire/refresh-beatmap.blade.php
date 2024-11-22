<x-form.button wire:click="refresh">
    Refresh
    <x-lucide-rotate-cw class="h-4 w-4" wire:loading.class="animate-spin" />
</x-form.button>

@if ($shouldReload)
    @script
        <script>
            window.location.reload();
        </script>
    @endscript
@endif
