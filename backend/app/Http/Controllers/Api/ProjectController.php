<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = Project::create([
            'user_id' => $request->user()->id,
            'name' => (string) $request->string('name'),
            'description' => $request->input('description'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'message' => 'Projeto criado com sucesso.',
            'data' => $project,
        ], 201);
    }

    public function show(Project $project): JsonResponse
    {
        abort_unless($project->user_id === auth()->id(), 403);

        return response()->json([
            'data' => $project,
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        abort_unless($project->user_id === auth()->id(), 403);

        $project->update([
            'name' => $request->input('name', $project->name),
            'description' => $request->input('description', $project->description),
            'is_active' => $request->has('is_active')
                ? $request->boolean('is_active')
                : $project->is_active,
        ]);

        return response()->json([
            'message' => 'Projeto atualizado com sucesso.',
            'data' => $project->fresh(),
        ]);
    }

    public function destroy(Project $project): JsonResponse
    {
        abort_unless($project->user_id === auth()->id(), 403);

        $project->delete();

        return response()->json([
            'message' => 'Projeto removido com sucesso.',
        ]);
    }
}