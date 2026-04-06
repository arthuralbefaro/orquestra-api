<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Run extends Model
{
    use HasFactory;

    protected $fillable = [
        'automation_id',
        'status',
        'started_at',
        'finished_at',
        'message',
        'payload',
        'duration_ms',
        'attempts_count',
        'last_error',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'payload' => 'array',
        'duration_ms' => 'integer',
        'attempts_count' => 'integer',
    ];

    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class);
    }
}