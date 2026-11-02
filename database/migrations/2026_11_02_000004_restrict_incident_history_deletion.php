<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('incident_logs', function (Blueprint $table) {
            $table->dropForeign(['incident_id']);
            $table->foreign('incident_id')->references('id')->on('incidents')->restrictOnDelete();
        });

        Schema::table('incident_comments', function (Blueprint $table) {
            $table->dropForeign(['incident_id']);
            $table->foreign('incident_id')->references('id')->on('incidents')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('incident_comments', function (Blueprint $table) {
            $table->dropForeign(['incident_id']);
            $table->foreign('incident_id')->references('id')->on('incidents')->cascadeOnDelete();
        });

        Schema::table('incident_logs', function (Blueprint $table) {
            $table->dropForeign(['incident_id']);
            $table->foreign('incident_id')->references('id')->on('incidents')->cascadeOnDelete();
        });
    }
};
