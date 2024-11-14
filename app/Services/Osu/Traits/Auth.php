<?php

namespace App\Services\Osu\Traits;

use App\Models\OsuApiCredentials;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

trait Auth
{
    public function getOAuthLoginUrl(): string
    {
        return Str::of(config('services.osu.oauth_url'))
            ->append('/authorize')
            ->append('?')
            ->append(http_build_query([
                'client_id' => config('services.osu.client_id'),
                'scope' => 'public',
                'response_type' => 'code',
                'redirect_uri' => url('/auth/osu/callback'),
            ]));
    }

    public function getOAuthToken(string $code): array
    {
        $url = Str::of(config('services.osu.oauth_url'))
            ->append('/token');

        // post to the token endpoint
        $response = Http::post($url, [
            'client_id' => config('services.osu.client_id'),
            'client_secret' => config('services.osu.client_secret'),
            'code' => $code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => url('/auth/osu/callback'),
        ]);

        $json = $response->json();
        if ($response->failed()) {
            throw new Exception('Failed to get access token');
        }

        $found = OsuApiCredentials::first();
        if ($found) {
            $found->update([
                'access_token' => $json['access_token'],
                'refresh_token' => $json['refresh_token'],
                'expires_at' => now()->addSeconds($json['expires_in']),
            ]);
        } else {
            OsuApiCredentials::create([
                'id' => config('services.osu.user_id'),
                'access_token' => $json['access_token'],
                'refresh_token' => $json['refresh_token'],
                'expires_at' => now()->addSeconds($json['expires_in']),
            ]);
        }

        return $json;
    }

    public function getAccessToken() {
        $found = OsuApiCredentials::findOrFail(9008211);

        $expiresAt = $found->expires_at;
        $date = Carbon::createFromTimestamp($expiresAt);

        if ($date->isPast()) {
            $response = Http::post(Str::of(config('services.osu.oauth_url'))->append('/token'), [
                'client_id' => config('services.osu.client_id'),
                'client_secret' => config('services.osu.client_secret'),
                'refresh_token' => $found->refresh_token,
                'grant_type' => 'refresh_token',
            ]);

            $json = $response->json();
            if ($response->failed()) {
                throw new Exception('Failed to refresh access token');
            }

            $found->update([
                'access_token' => $json['access_token'],
                'refresh_token' => $json['refresh_token'],
                'expires_at' => now()->addSeconds($json['expires_in']),
            ]);

            return $json['access_token'];
        }

        return $found->access_token;
    }
}
