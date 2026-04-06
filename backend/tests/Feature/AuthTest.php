<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

it('registers a new user', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Arthur',
        'email' => 'arthur@test.com',
        'password' => '12345678',
        'password_confirmation' => '12345678',
    ]);

    $response
        ->assertCreated()
        ->assertJsonStructure([
            'message',
            'data' => [
                'user' => ['id', 'name', 'email'],
                'token',
            ],
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'arthur@test.com',
    ]);
});

it('logs in an existing user', function () {
    $user = User::factory()->create([
        'email' => 'arthur@test.com',
        'password' => Hash::make('12345678'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'arthur@test.com',
        'password' => '12345678',
        'device_name' => 'pest-tests',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.user.id', $user->id)
        ->assertJsonStructure([
            'message',
            'data' => ['user', 'token'],
        ]);
});

it('returns authenticated user on /me', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/me');

    $response
        ->assertOk()
        ->assertJsonPath('data.id', $user->id);
});

it('logs out the current token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this
        ->withHeader('Authorization', 'Bearer ' . $token)
        ->postJson('/api/logout');

    $response->assertOk();
    expect($user->fresh()->tokens()->count())->toBe(0);
});