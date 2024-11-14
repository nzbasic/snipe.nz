<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('beatmap_sets', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('artist');
            $table->string('artist_unicode');
            $table->string('cover');
            $table->string('cover_card');
            $table->string('cover_list');
            $table->string('cover_slimcover');
            $table->string('creator');
            $table->integer('favourite_count');
            $table->integer('play_count');
            $table->string('preview_url');
            $table->string('status');
            $table->string('title');
            $table->string('title_unicode');
            $table->integer('user_id');
            $table->decimal('bpm');
            $table->dateTime('ranked_date');
            $table->dateTime('last_updated');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('beatmap_sets');
    }
};
