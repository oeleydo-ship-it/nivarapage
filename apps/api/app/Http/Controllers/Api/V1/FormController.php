<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\FormResource;
use App\Http\Resources\FormSubmissionResource;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Site;
use App\Services\FormService;
use App\Support\CurrentWorkspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FormController extends Controller
{
    public function index(Site $site)
    {
        $this->authorize('view', $site);

        return FormResource::collection($site->forms()->with('fields')->get());
    }

    public function store(Request $request, Site $site, FormService $forms)
    {
        $this->authorize('update', $site);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'string'],
            'settings' => ['nullable', 'array'],
            'settings.recipients' => ['nullable', 'array'],
            'settings.recipients.*' => ['email'],
            'settings.turnstile_enabled' => ['nullable', 'boolean'],
            'settings.success_message' => ['nullable', 'string', 'max:240'],
            'fields' => ['nullable', 'array'],
            'fields.*.name' => ['nullable', 'string'],
            'fields.*.label' => ['required_with:fields', 'string'],
            'fields.*.type' => ['nullable', 'string'],
            'fields.*.required' => ['nullable', 'boolean'],
            'fields.*.options' => ['nullable', 'array'],
        ]);

        return (new FormResource($forms->create($site, $data)))->response()->setStatusCode(201);
    }

    public function show(Form $form)
    {
        $this->authorize('view', $form);

        return new FormResource($form->load('fields'));
    }

    public function update(Request $request, Form $form, FormService $forms)
    {
        $this->authorize('update', $form);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'string'],
            'settings' => ['nullable', 'array'],
            'settings.recipients' => ['nullable', 'array'],
            'settings.recipients.*' => ['email'],
            'settings.turnstile_enabled' => ['nullable', 'boolean'],
            'settings.success_message' => ['nullable', 'string', 'max:240'],
            'fields' => ['nullable', 'array'],
            'fields.*.name' => ['nullable', 'string'],
            'fields.*.label' => ['required_with:fields', 'string'],
            'fields.*.type' => ['nullable', 'string'],
            'fields.*.required' => ['nullable', 'boolean'],
            'fields.*.options' => ['nullable', 'array'],
        ]);

        return new FormResource($forms->update($form, $data));
    }

    public function destroy(Form $form): JsonResponse
    {
        $this->authorize('delete', $form);
        $form->delete();

        return response()->json(['data' => ['ok' => true]]);
    }

    public function submissions(Request $request, CurrentWorkspace $current)
    {
        $items = FormSubmission::query()
            ->where('workspace_id', $current->id())
            ->with(['form.site', 'page'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('form_id'), fn ($q, $formId) => $q->where('form_id', $formId))
            ->latest()
            ->paginate(50);

        return FormSubmissionResource::collection($items);
    }

    public function updateSubmission(Request $request, FormSubmission $formSubmission): FormSubmissionResource
    {
        abort_unless($formSubmission->workspace_id === app(CurrentWorkspace::class)->id(), 404);
        $data = $request->validate([
            'status' => ['required', 'in:'.implode(',', FormService::STATUSES)],
        ]);
        $formSubmission->update($data);

        return new FormSubmissionResource($formSubmission->load(['form.site', 'page']));
    }

    public function export(CurrentWorkspace $current): StreamedResponse
    {
        $rows = FormSubmission::query()
            ->where('workspace_id', $current->id())
            ->with(['form.site', 'page'])
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Name', 'Email', 'Form', 'Website', 'Page', 'Submitted', 'Status']);
            foreach ($rows as $row) {
                fputcsv($out, [
                    $row->name,
                    $row->email,
                    $row->form?->name,
                    $row->form?->site?->name,
                    $row->page?->name,
                    optional($row->created_at)?->toIso8601String(),
                    $row->status,
                ]);
            }
            fclose($out);
        }, 'form-submissions.csv', ['Content-Type' => 'text/csv']);
    }

    public function publicShow(Form $publicForm, FormService $forms): JsonResponse
    {
        return response()->json(['data' => $forms->publicSchema($publicForm)]);
    }

    public function submit(Request $request, Form $publicForm, FormService $forms)
    {
        return response()->json(['data' => $forms->submit($publicForm, $request)], 201);
    }
}
