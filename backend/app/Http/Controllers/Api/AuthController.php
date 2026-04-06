<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => (string) $request->string('name'),
            'email' => (string) $request->string('email'),
            'password' => Hash::make((string) $request->string('password')),
        ]);

        $token = $user->createToken(
            $request->input('device_name', 'react-web'),
            $this->abilities()
        )->plainTextToken;

        return response()->json([
            'message' => 'Usuário criado com sucesso.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', (string) $request->string('email'))->first();

        if (!$user || !Hash::check((string) $request->string('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais inválidas.'],
            ]);
        }

        $token = $user->createToken(
            $request->input('device_name', 'react-web'),
            $this->abilities()
        )->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso.',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json([
            'data' => auth()->user(),
        ]);
    }

    public function logout(): JsonResponse
    {
        auth()->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso.',
        ]);
    }

    private function abilities(): array
    {
        return [
            'dashboard:read',
            'projects:read',
            'projects:write',
            'automations:read',
            'automations:write',
            'runs:read',
            'runs:write',
        ];
    }
}