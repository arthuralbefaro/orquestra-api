<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ExecuteAutomationJob;
use App\Models\Automation;
use App\Models\Run;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RunController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $runs = Run::query()
            ->whereHas('automation.project', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['automation.project'])
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = trim((string) $request->string('q'));

                $query->where(function ($inner) use ($term) {
                    $inner->where('message', 'ilike', "%{$term}%")
                        ->orWhere('status', 'ilike', "%{$term}%")
                        ->orWhere('id', $term)
                        ->orWhereHas('automation', function ($automationQuery) use ($term) {
                            $automationQuery->where('name', 'ilike', "%{$term}%")
                                ->orWhere('id', $term)
                                ->orWhereHas('project', fn ($projectQuery) => $projectQuery->where('name', 'ilike', "%{$term}%"));
                        });
                });
            })
            ->when($request->filled('status') && $request->input('status') !== 'all', fn ($query) => $query->where('status', $request->input('status')))
            ->when($request->filled('automation_id'), fn ($query) => $query->where('automation_id', $request->integer('automation_id')))
            ->when($request->filled('project_id'), fn ($query) => $query->whereHas('automation', fn ($automationQuery) => $automationQuery->where('project_id', $request->integer('project_id'))))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('created_at', '>=', $request->input('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('created_at', '<=', $request->input('date_to')))
            ->latest()
            ->paginate((int) min(max((int) $request->integer('per_page', 10), 1), 50));

        return response()->json($runs);
    }

    public function byAutomation(Request $request, Automation $automation): JsonResponse
    {
        abort_unless($automation->project->user_id === $request->user()->id, 403);

        $runs = $automation->runs()
            ->with(['automation.project'])
            ->when($request->filled('status') && $request->input('status') !== 'all', fn ($query) => $query->where('status', $request->input('status')))
            ->latest()
            ->paginate((int) min(max((int) $request->integer('per_page', 10), 1), 50));

        return response()->json($runs);
    }

    public function store(Automation $automation): JsonResponse
    {
        abort_unless($automation->project->user_id === auth()->id(), 403);

        $run = DB::transaction(function () use ($automation) {
            return Run::create([
                'automation_id' => $automation->id,
                'status' => 'queued',
                'payload' => $automation->config,
                'message' => 'Execução enfileirada manualmente.',
            ]);
        });

        ExecuteAutomationJob::dispatch($run);

        return response()->json([
            'message' => 'Execução criada com sucesso.',
            'data' => $run->load('automation.project'),
        ], 201);
    }

    public function retry(Run $run): JsonResponse
    {
        abort_unless($run->automation->project->user_id === auth()->id(), 403);

        $retriedRun = DB::transaction(function () use ($run) {
            return Run::create([
                'automation_id' => $run->automation_id,
                'status' => 'queued',
                'payload' => $run->payload,
                'message' => sprintf('Reprocessamento solicitado a partir da execução #%d.', $run->id),
            ]);
        });

        ExecuteAutomationJob::dispatch($retriedRun);

        return response()->json([
            'message' => 'Nova execução criada com sucesso.',
            'data' => $retriedRun->load('automation.project'),
        ], 201);
    }
}