<?php

namespace App\Http\Controllers\Auth\Osu;

use Illuminate\Support\Str;

class LoginController
{
    public function __invoke() {

        $url = osu()->getOAuthLoginUrl();

        return redirect($url);
    }
}
