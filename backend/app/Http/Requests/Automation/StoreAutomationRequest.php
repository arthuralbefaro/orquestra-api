<?php

namespace App\Http\Requests\Automation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAutomationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'name' => ['required', 'string', 'max:120'],
            'trigger_type' => ['required', Rule::in(['webhook', 'schedule', 'manual'])],
            'status' => ['nullable', Rule::in(['draft', 'active', 'paused'])],
            'config' => ['required', 'array'],
        ];
    }
}