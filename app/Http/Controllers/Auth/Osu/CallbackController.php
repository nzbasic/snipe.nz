<?php

namespace App\Http\Controllers\Auth\Osu;

use App\Models\OsuApiCredentials;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class CallbackController
{
    public function __invoke() {
        $code = request('code');

        try {
            $token = osu()->getOAuthToken($code);

            dd($token);
        } catch (\Exception $e) {
            dump($e->getMessage());
        }
    }
}
