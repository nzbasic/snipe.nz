<?php

if (! function_exists('osu')) {
    /**
     * Global helper to create an instance of the Osu api client.
     */
    function osu()
    {
        return new App\Services\Osu\Osu();
    }
}
