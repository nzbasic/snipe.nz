<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Schedule::command('update:online')->everyFifteenMinutes();

Schedule::command('challenge:daily')->twiceDaily();
