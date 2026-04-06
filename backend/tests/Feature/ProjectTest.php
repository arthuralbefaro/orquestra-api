<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('lists only projects from authenticated user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Project::create([
        'user_id' => $user->id,
        'name' => 'Projeto do Arthur',
        'description' => 'Visível',
        'is_active' => true,
    ]);

    Project::create([
        'user_id' => $otherUser->id,
        'name' => 'Projeto de outro usuário',
        'description' => 'Não deve aparecer',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->getJson('/api/projects');

    $response->assertOk();
    $response->assertSee('Projeto do Arthur');
    $response->assertDontSee('Projeto de outro usuário');
});

it('creates a project', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/projects', [
        'name' => 'Novo Projeto',
        'description' => 'Projeto de teste',
        'is_active' => true,
    ]);

    $response->assertCreated();

    $this->assertDatabaseHas('projects', [
        'user_id' => $user->id,
        'name' => 'Novo Projeto',
    ]);
});