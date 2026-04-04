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

    public $run;

    public function __construct(Run $run)
    {
        $this->run = $run;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->run->update([
            'status' => 'running',
            'started_at' => now()
        ]);

        try {
            sleep(2);

            $this->run->update([
                'status' => 'success',
                'finished_at' => now(),
                'output' => json_encode([
                    'message' => 'Execução concluída com sucesso'
                ])
            ]);

        } catch (\Throwable $e) {
            $this->run->update([
                'status' => 'failed',
                'finished_at' => now(),
                'output' => json_encode([
                    'error' => $e->getMessage()
                ])
            ]);
        }
    }
}
