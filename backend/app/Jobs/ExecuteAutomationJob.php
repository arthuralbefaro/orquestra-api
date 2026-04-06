<?php

namespace App\Jobs;

use App\Models\Run;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ExecuteAutomationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Run $run;

    public function __construct(Run $run)
    {
        $this->run = $run;
    }

    public function handle(): void
    {
        $run = $this->run->fresh(['automation.project']) ?? $this->run;
        $startedAt = now();

        $run->update([
            'status' => 'running',
            'started_at' => $startedAt,
            'attempts_count' => ((int) $run->attempts_count) + 1,
            'last_error' => null,
        ]);

        try {
            // Simulação do processamento.
            // Aqui depois você pode trocar pela execução real da automação.
            $finishedAt = now();
            $durationMs = $startedAt->diffInMilliseconds($finishedAt);

            $run->update([
                'status' => 'success',
                'finished_at' => $finishedAt,
                'duration_ms' => $durationMs,
                'message' => 'Execução concluída com sucesso.',
                'payload' => [
                    'result' => 'ok',
                    'automation' => [
                        'id' => $run->automation?->id,
                        'name' => $run->automation?->name,
                    ],
                    'project' => [
                        'id' => $run->automation?->project?->id,
                        'name' => $run->automation?->project?->name,
                    ],
                    'finished_at' => $finishedAt->toISOString(),
                    'duration_ms' => $durationMs,
                ],
            ]);
        } catch (\Throwable $e) {
            $finishedAt = now();
            $durationMs = $startedAt->diffInMilliseconds($finishedAt);

            $run->update([
                'status' => 'failed',
                'finished_at' => $finishedAt,
                'duration_ms' => $durationMs,
                'message' => 'Falha ao executar automação.',
                'last_error' => $e->getMessage(),
                'payload' => [
                    'result' => 'error',
                    'error' => $e->getMessage(),
                    'finished_at' => $finishedAt->toISOString(),
                    'duration_ms' => $durationMs,
                ],
            ]);

            throw $e;
        }
    }
}