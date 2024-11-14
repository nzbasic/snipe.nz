<?php

namespace App\Contracts;

/**
 * A generic API client interface.
 */
interface ApiClient
{
    public function call(string $method, string $endpoint, array $data = []): mixed;

    public function get(string $endpoint, array $data = []): mixed;

    public function post(string $endpoint, array $data = []): mixed;

    public function put(string $endpoint, array $data = []): mixed;

    public function del(string $endpoint): mixed;
}
