<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Leaderboard extends Model
{
    protected $table = 'leaderboard';

    /**
     * Materialized views are read-only
     */
    public $timestamps = false;
    protected $readonly = true;
    protected $primaryKey = 'user_id';

    /**
     * Refresh the materialized view
     */
    public static function refreshView()
    {
        return \DB::statement('REFRESH MATERIALIZED VIEW ' . (new static)->table);
    }

    /**
     * Refresh the materialized view concurrently (if supported by your view)
     */
    public static function refreshViewConcurrently()
    {
        return \DB::statement('REFRESH MATERIALIZED VIEW CONCURRENTLY ' . (new static)->table);
    }
}
