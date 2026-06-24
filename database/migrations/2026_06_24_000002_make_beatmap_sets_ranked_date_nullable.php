<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Unranked sets (pending/wip/graveyard), which we now store for unranked
     * score tracking, have a null `ranked_date`. The column was created NOT NULL
     * for ranked-only data, so relax it.
     */
    public function up(): void
    {
        Schema::table('beatmap_sets', function (Blueprint $table) {
            $table->dateTime('ranked_date')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('beatmap_sets', function (Blueprint $table) {
            $table->dateTime('ranked_date')->nullable(false)->change();
        });
    }
};
