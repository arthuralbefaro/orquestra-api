<?php

namespace Database\Seeders;

use App\Models\Automation;
use App\Models\Project;
use App\Models\Run;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'arthur@orquestra.dev'],
            [
                'name' => 'Arthur Albefaro',
                'password' => Hash::make('12345678'),
            ]
        );

        $projetoFinanceiro = Project::updateOrCreate(
            [
                'user_id' => $user->id,
                'name' => 'Orquestra Financeiro',
            ],
            [
                'description' => 'Automações voltadas para conciliação financeira e relatórios.',
                'is_active' => true,
            ]
        );

        $projetoOperacional = Project::updateOrCreate(
            [
                'user_id' => $user->id,
                'name' => 'Orquestra Operações',
            ],
            [
                'description' => 'Fluxos operacionais, disparos manuais e monitoramento.',
                'is_active' => true,
            ]
        );

        $automacao1 = Automation::updateOrCreate(
            [
                'project_id' => $projetoFinanceiro->id,
                'name' => 'Conciliação Bancária Diária',
            ],
            [
                'trigger_type' => 'manual',
                'status' => 'active',
                'config' => [
                    'source' => 'bank_statement',
                    'destination' => 'erp',
                    'schedule' => null,
                ],
            ]
        );

        $automacao2 = Automation::updateOrCreate(
            [
                'project_id' => $projetoOperacional->id,
                'name' => 'Atualização de KPI Operacional',
            ],
            [
                'trigger_type' => 'manual',
                'status' => 'active',
                'config' => [
                    'source' => 'spreadsheet',
                    'destination' => 'dashboard',
                    'schedule' => null,
                ],
            ]
        );

        Run::updateOrCreate(
            [
                'automation_id' => $automacao1->id,
                'message' => 'Execução concluída com sucesso.',
            ],
            [
                'status' => 'success',
                'started_at' => now()->subMinutes(15),
                'finished_at' => now()->subMinutes(14),
                'duration_ms' => 820,
                'attempts_count' => 1,
                'last_error' => null,
                'payload' => [
                    'records_processed' => 128,
                    'result' => 'ok',
                ],
            ]
        );

        Run::updateOrCreate(
            [
                'automation_id' => $automacao2->id,
                'message' => 'Falha ao executar automação.',
            ],
            [
                'status' => 'failed',
                'started_at' => now()->subMinutes(8),
                'finished_at' => now()->subMinutes(7),
                'duration_ms' => 430,
                'attempts_count' => 2,
                'last_error' => 'Timeout ao consultar serviço externo.',
                'payload' => [
                    'result' => 'error',
                    'service' => 'kpi-provider',
                ],
            ]
        );
    }
}