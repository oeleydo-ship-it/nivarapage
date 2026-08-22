<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\FormSubmission */
class FormSubmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $form = $this->whenLoaded('form');
        $site = $form && $form->relationLoaded('site') ? $form->site : null;
        $page = $this->whenLoaded('page');

        return [
            'id' => $this->id,
            'form_id' => $this->form_id,
            'page_id' => $this->page_id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
            'payload' => $this->payload,
            'form' => $form ? $form->name : null,
            'website' => $site?->name,
            'page' => $page ? $page->name : null,
            'submitted' => $this->created_at?->toIso8601String(),
            'created_at' => $this->created_at,
        ];
    }
}
