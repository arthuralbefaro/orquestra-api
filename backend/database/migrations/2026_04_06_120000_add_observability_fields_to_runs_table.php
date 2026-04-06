<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('runs', function (Blueprint $table) {
            $table->unsignedInteger('attempts_count')->default(0)->after('payload');
            $table->unsignedBigInteger('duration_ms')->nullable()->after('attempts_count');
            $table->text('last_error')->nullable()->after('duration_ms');
        });
    }

    public function down(): void
    {
        Schema::table('runs', function (Blueprint $table) {
            $table->dropColumn([
                'attempts_count',
                'duration_ms',
                'last_error',
            ]);
        });
    }
};