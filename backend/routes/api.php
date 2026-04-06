<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\RunController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MetricsController;

Route::get('/health', HealthController::class);

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/metrics', MetricsController::class);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);

    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('automations', AutomationController::class);

    Route::get('/runs', [RunController::class, 'index']);
    Route::get('/automations/{automation}/runs', [RunController::class, 'byAutomation']);
    Route::post('/automations/{automation}/run', [RunController::class, 'store'])->middleware('throttle:20,1');
    Route::post('/runs/{run}/retry', [RunController::class, 'retry'])->middleware('throttle:20,1');
});
