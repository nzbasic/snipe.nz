<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('beatmaps', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->integer('beatmapset_id');
            $table->decimal('difficulty_rating');
            $table->string('mode');
            $table->integer('total_length');
            $table->integer('user_id');
            $table->string('version');
            $table->decimal('accuracy');
            $table->decimal('ar');
            $table->decimal('bpm');
            $table->integer('count_circles');
            $table->integer('count_sliders');
            $table->integer('count_spinners');
            $table->decimal('cs');
            $table->decimal('drain');
            $table->integer('hit_length');
            $table->integer('passcount');
            $table->integer('playcount');
            $table->string('url');
            $table->string('checksum');
            $table->integer('max_combo');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('beatmaps');
    }
};
