<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $databaseOk = false;
        $databaseConnection = config('database.default');

        try {
            DB::connection()->getPdo();
            DB::select('SELECT 1');
            $databaseOk = true;
        } catch (\Throwable $e) {
            $databaseOk = false;
        }

        $payload = [
            'status' => $databaseOk ? 'ok' : 'degraded',
            'service' => config('app.name', 'orquestra-api'),
            'database' => [
                'status' => $databaseOk ? 'ok' : 'error',
                'connection' => $databaseConnection,
            ],
            'timestamp' => now()->toISOString(),
        ];

        return response()->json(
            $payload,
            $databaseOk ? 200 : 503
        );
    }
}