<?php

test('health endpoint return success structure', function () {
    $response = $this->getJson('/api/health');

    $response
        ->assertOk()
        ->assertJsonStructure([
            'status',
            'service',
            'database' => [
                'status',
                'connection',
            ],
            'timestamp',
        ])
        ->assertJson([
            'status' => 'ok',
        ]);
});