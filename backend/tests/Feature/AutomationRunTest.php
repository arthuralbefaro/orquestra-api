<?php

use App\Jobs\ExecuteAutomationJob;
use App\Models\Automation;
use App\Models\Project;
use App\Models\Run;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

it('creates an automation for a user project', function () {
    $user = User::factory()->create();

    $project = Project::create([
        'user_id' => $user->id,
        'name' => 'Projeto Base',
        'description' => 'Projeto para automação',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->postJson('/api/automations', [
        'project_id' => $project->id,
        'name' => 'Importar Planilha',
        'trigger_type' => 'manual',
        'status' => 'active',
        'config' => [
            'source' => 'spreadsheet',
        ],
    ]);

    $response->assertCreated();

    $this->assertDatabaseHas('automations', [
        'project_id' => $project->id,
        'name' => 'Importar Planilha',
    ]);
});

it('dispatches a run job when automation is executed', function () {
    Queue::fake();

    $user = User::factory()->create();

    $project = Project::create([
        'user_id' => $user->id,
        'name' => 'Projeto Execução',
        'description' => 'Projeto para executar',
        'is_active' => true,
    ]);

    $automation = Automation::create([
        'project_id' => $project->id,
        'name' => 'Rodar Robô',
        'trigger_type' => 'manual',
        'status' => 'active',
        'config' => ['mode' => 'demo'],
    ]);

    $response = $this->actingAs($user)->postJson("/api/automations/{$automation->id}/run");

    $response
        ->assertCreated()
        ->assertJsonStructure([
            'message',
            'data',
        ]);

    $this->assertDatabaseHas('runs', [
        'automation_id' => $automation->id,
        'status' => 'queued',
    ]);

    Queue::assertPushed(ExecuteAutomationJob::class);
});

it('retries a failed run', function () {
    Queue::fake();

    $user = User::factory()->create();

    $project = Project::create([
        'user_id' => $user->id,
        'name' => 'Projeto Retry',
        'description' => 'Projeto retry',
        'is_active' => true,
    ]);

    $automation = Automation::create([
        'project_id' => $project->id,
        'name' => 'Automação Retry',
        'trigger_type' => 'manual',
        'status' => 'active',
        'config' => ['mode' => 'demo'],
    ]);

    $run = Run::create([
        'automation_id' => $automation->id,
        'status' => 'failed',
        'message' => 'Falha anterior',
        'payload' => ['result' => 'error'],
    ]);

    $response = $this->actingAs($user)->postJson("/api/runs/{$run->id}/retry");

    $response
        ->assertCreated()
        ->assertJsonStructure([
            'message',
            'data',
        ]);

    Queue::assertPushed(ExecuteAutomationJob::class);
});