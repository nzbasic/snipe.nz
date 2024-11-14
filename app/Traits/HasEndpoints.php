<?php

namespace App\Traits;

/**
 * Generic trait for API wrapper consistency
 */
trait HasEndpoints
{
    /**
     * Handles any call to the API
     *
     * @param  string  $method (GET, POST, PUT, DELETE)
     * @param  string  $endpoint (The endpoint to call, e.g. "/users")
     * @param  array  $data (The data to send to the endpoint)
     * @return mixed (json response)
     */
    public function call(string $method, string $endpoint, array $data = [], array $headers = []): mixed
    {
        // Always prefix endpoints with a slash
        $url = $this->apiUrl.'/'.trim($endpoint, '/');

        // Convert the supplied method to a method that exists on the HTTP client
        $method = match ($method) {
            'GET' => 'get',
            'POST' => 'post',
            'PUT' => 'put',
            'DELETE' => 'delete',
        };

        // If we have a bearer token, add it to the request
        if (isset($this->accessToken)) {
            $this->client->withToken($this->accessToken);
        }

        // Make the request
        $res = $this->client->$method($url, $data);

        // Get the response body
        $body = $res->json() ?? [];

        // Return a JSON response, along with the status code and OK status
        return [...$body, 'status' => $res->status(), 'ok' => $res->successful()];
    }

    /**
     * GET requests wrapper
     *
     * @param  string  $endpoint (ModelName or custom endpoint)
     * @param  array  $data (Query strings as an array)
     * @return mixed (json response)
     */
    public function get(string $endpoint, array $data = [], array $headers = []): mixed
    {
        return $this->call('GET', $endpoint, $data);
    }

    /**
     * POST requests wrapper
     *
     * @param  string  $endpoint (ModelName or custom endpoint)
     * @param  array  $data (An array of key/value pairs matching the model's db columns)
     * @return mixed (json response)
     */
    public function post(string $endpoint, array $data = []): mixed
    {
        return $this->call('POST', $endpoint, $data);
    }

    /**
     * PUT requests wrapper
     *
     * @param  string  $endpoint (ModelName or custom endpoint)
     * @param  string  $data (An array of key/value pairs matching the model's db columns)
     * @return mixed (json response)
     */
    public function put(string $endpoint, array $data = []): mixed
    {
        return $this->call('PUT', $endpoint, $data);
    }

    /**
     * DELETE requests wrapper
     *
     * @param  string  $endpoint (ModelName or custom endpoint)
     * @return mixed (json response)
     */
    public function del(string $endpoint): mixed
    {
        return $this->call('DELETE', $endpoint);
    }
}
