<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Automation;
use App\Models\Project;
use App\Models\Run;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function metrics(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $projects = Project::query()->where('user_id', $userId)->count();
        $automations = Automation::query()->whereHas('project', fn ($q) => $q->where('user_id', $userId))->count();
        $runsQuery = Run::query()->whereHas('automation.project', fn ($q) => $q->where('user_id', $userId));
        $runs = (clone $runsQuery)->count();
        $queued = (clone $runsQuery)->where('status', 'queued')->count();
        $running = (clone $runsQuery)->where('status', 'running')->count();
        $success = (clone $runsQuery)->where('status', 'success')->count();
        $failed = (clone $runsQuery)->where('status', 'failed')->count();

        $topAutomations = Automation::query()
            ->whereHas('project', fn ($q) => $q->where('user_id', $userId))
            ->with('project')
            ->withCount('runs')
            ->orderByDesc('runs_count')
            ->limit(5)
            ->get()
            ->map(fn ($automation) => [
                'id' => $automation->id,
                'name' => $automation->name,
                'status' => $automation->status,
                'trigger_type' => $automation->trigger_type,
                'runs_count' => $automation->runs_count,
                'project' => $automation->project ? [
                    'id' => $automation->project->id,
                    'name' => $automation->project->name,
                ] : null,
            ]);

        $latestRuns = (clone $runsQuery)
            ->with(['automation.project'])
            ->latest()
            ->limit(6)
            ->get();

        $successRate = $runs > 0 ? round(($success / $runs) * 100, 1) : 0;
        $failureRate = $runs > 0 ? round(($failed / $runs) * 100, 1) : 0;

        return response()->json([
            'data' => [
                'totals' => [
                    'projects' => $projects,
                    'automations' => $automations,
                    'runs' => $runs,
                ],
                'run_stats' => [
                    'queued' => $queued,
                    'running' => $running,
                    'success' => $success,
                    'failed' => $failed,
                    'success_rate' => $successRate,
                    'failure_rate' => $failureRate,
                ],
                'top_automations' => $topAutomations,
                'latest_runs' => $latestRuns,
            ],
        ]);
    }
}
