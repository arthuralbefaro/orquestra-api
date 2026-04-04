<?php

namespace App\Http\Requests\Automation;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAutomationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['sometimes', 'integer', 'exists:projects,id'],
            'name' => ['sometimes', 'string', 'max:120'],
            'trigger_type' => ['sometimes', Rule::in(['webhook', 'schedule', 'manual'])],
            'status' => ['sometimes', Rule::in(['draft', 'active', 'paused'])],
            'config' => ['sometimes', 'array'],
        ];
    }
}
