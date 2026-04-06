<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Run;
use Illuminate\Http\JsonResponse;

class MetricsController extends Controller
{
    public function index(): JsonResponse
    {
        $totalRuns = Run::count();

        $successRuns = Run::where('status', 'success')->count();
        $failedRuns = Run::where('status', 'failed')->count();
        $queuedRuns = Run::where('status', 'queued')->count();
        $runningRuns = Run::where('status', 'running')->count();

        $successRate = $totalRuns > 0
        ? round(($successRuns / $totalRuns) * 100, 2)
        : 0;

        $avgDuration = Run::whereDate('created_at', now()->toDateString())->count();

        return response()->json([
            'status' => 'ok',
            'data' => [
                'total_runs' => $totalRuns,
                'success_runs' => $successRuns,
                'failed_runs' => $failedRuns,
                'queued_runs' => $queuedRuns,
                'running-runs' => $runningRuns,
                'success_rate' => $successRate,
                'average_duration_ms' => (int) $avgDuration,
                'runs_today' => $runsToday,
            ],
        ]);
    }
}