<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreIncidentCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'incident_id' => ['required', 'integer', 'exists:incidents,id'],
            'body' => ['required', 'string'],
        ];
    }
}
