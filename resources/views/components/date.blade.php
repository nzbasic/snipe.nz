<span
    x-data="{
        formatDate(dateString) {
            return new Date(dateString).toLocaleString('default', {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
        }
    }"
    x-text="formatDate('{{ $date }}')"
>
</span>
