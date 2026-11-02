<?php

use App\Http\Controllers\IncidentCommentController;
use App\Http\Controllers\IncidentController;
use Illuminate\Support\Facades\Route;

Route::get('/', [IncidentController::class, 'index']);
Route::get('/incidents', [IncidentController::class, 'index'])->name('incidents.index');
Route::post('/incidents', [IncidentController::class, 'store'])->name('incidents.store');
Route::get('/incidents/{incident}', [IncidentController::class, 'show'])->name('incidents.show');
Route::patch('/incidents/{incident}/status', [IncidentController::class, 'updateStatus'])->name('incidents.status.update');
Route::post('/incident-comments', [IncidentCommentController::class, 'store'])->name('incident-comments.store');
