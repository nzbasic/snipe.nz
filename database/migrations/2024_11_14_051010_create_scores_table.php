<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('scores', function (Blueprint $table) {
            $table->bigInteger('id')->primary();
            $table->decimal('accuracy');
            $table->integer('max_combo');
            $table->string('mode');
            $table->boolean('passed');
            $table->boolean('perfect');
            $table->decimal('pp');
            $table->string('rank');
            $table->bigInteger('score');
            $table->integer('count_50');
            $table->integer('count_100');
            $table->integer('count_300');
            $table->integer('count_miss');
            $table->bigInteger('user_id');
            $table->json('mods')->nullable();
            $table->bigInteger('beatmap_id');
            $table->bigInteger('beatmapset_id');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('scores');
    }
};
