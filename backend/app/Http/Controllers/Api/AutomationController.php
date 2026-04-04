<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Automation\StoreAutomationRequest;
use App\Http\Requests\Automation\UpdateAutomationRequest;
use App\Models\Automation;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutomationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $automations = Automation::query()
            ->whereHas('project', fn ($q) => $q->where('user_id', $request->user()->id))
            ->with(['project'])
            ->withCount('runs')
            ->when($request->filled('q'), function ($query) use ($request) {
                $term = trim((string) $request->string('q'));

                $query->where(function ($inner) use ($term) {
                    $inner->where('name', 'ilike', "%{$term}%")
                        ->orWhere('trigger_type', 'ilike', "%{$term}%")
                        ->orWhere('status', 'ilike', "%{$term}%")
                        ->orWhereHas('project', fn ($projectQuery) => $projectQuery->where('name', 'ilike', "%{$term}%"));
                });
            })
            ->when($request->filled('status') && $request->input('status') !== 'all', fn ($query) => $query->where('status', $request->input('status')))
            ->when($request->filled('project_id'), fn ($query) => $query->where('project_id', $request->integer('project_id')))
            ->latest()
            ->paginate((int) min(max((int) $request->integer('per_page', 10), 1), 50));

        return response()->json($automations);
    }

    public function store(StoreAutomationRequest $request): JsonResponse
    {
        $project = Project::findOrFail($request->integer('project_id'));
        abort_unless($project->user_id === $request->user()->id, 403);

        $automation = Automation::create([
            'project_id' => $project->id,
            'name' => (string) $request->string('name'),
            'trigger_type' => (string) $request->string('trigger_type'),
            'status' => $request->input('status', 'draft'),
            'config' => $request->input('config'),
        ]);

        return response()->json([
            'message' => 'Automação criada com sucesso.',
            'data' => $automation->load('project'),
        ], 201);
    }

    public function show(Automation $automation): JsonResponse
    {
        abort_unless($automation->project->user_id === auth()->id(), 403);

        $automation->load([
            'project',
            'runs' => fn ($query) => $query->latest()->limit(10),
            'runs.automation.project',
        ])->loadCount('runs');

        return response()->json([
            'data' => $automation,
        ]);
    }

    public function update(UpdateAutomationRequest $request, Automation $automation): JsonResponse
    {
        abort_unless($automation->project->user_id === auth()->id(), 403);

        if ($request->has('project_id')) {
            $project = Project::findOrFail($request->integer('project_id'));
            abort_unless($project->user_id === auth()->id(), 403);
            $automation->project_id = $project->id;
        }

        if ($request->has('name')) {
            $automation->name = $request->input('name');
        }

        if ($request->has('trigger_type')) {
            $automation->trigger_type = $request->input('trigger_type');
        }

        if ($request->has('status')) {
            $automation->status = $request->input('status');
        }

        if ($request->has('config')) {
            $automation->config = $request->input('config');
        }

        $automation->save();

        return response()->json([
            'message' => 'Automação atualizada com sucesso.',
            'data' => $automation->fresh()->load('project'),
        ]);
    }

    public function destroy(Automation $automation): JsonResponse
    {
        abort_unless($automation->project->user_id === auth()->id(), 403);

        $automation->delete();

        return response()->json([
            'message' => 'Automação removida com sucesso.',
        ]);
    }
}
