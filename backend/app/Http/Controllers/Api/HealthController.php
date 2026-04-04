<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            DB::select('select 1');
            $database = 'ok';
        } catch (\Throwable $e) {
            $database = 'fail';
        }

        return response()->json([
            'status' => 'ok',
            'database' => $database,
            'timestamp' => now()->toISOString(),
        ]);
    }
}