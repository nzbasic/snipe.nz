<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', \App\Http\Controllers\HomeController::class)->name('home');

Route::resource('players', \App\Http\Controllers\PlayersController::class)->only(['index', 'show']);

Route::group(['prefix' => 'auth'], function() {
    Route::group(['prefix' => 'osu'], function() {
        Route::get('/login', \App\Http\Controllers\Auth\Osu\LoginController::class)->name('auth.osu.login');
        Route::get('/callback', \App\Http\Controllers\Auth\Osu\CallbackController::class)->name('auth.osu.callback');
    });
});
