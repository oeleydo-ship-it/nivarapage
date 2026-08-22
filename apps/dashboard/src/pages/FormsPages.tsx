import type { MouseEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { FormSubmission, SiteForm } from '@uidesired/types'
import { SiteSubnav } from '../components/SiteChrome'
import { formsApi, sitesApi, workspacesApi } from '../lib/endpoints'
import { getWorkspaceId } from '../lib/api'
import { Button, Card, Input, Label, PageHeader } from '../ui/primitives'

const FIELD_TYPES = ['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio'] as const
const FORM_TYPES = ['contact', 'lead', 'newsletter', 'quote'] as const
const STATUSES = ['new', 'read', 'spam', 'archived'] as const

type FieldDraft = {
  name: string
  label: string
  type: (typeof FIELD_TYPES)[number]
  required: boolean
  options: string
}

function emptyField(): FieldDraft {
  return { name: '', label: 'New field', type: 'text', required: false, options: '' }
}

function fieldsFromForm(form: SiteForm): FieldDraft[] {
  return (form.fields || []).map((field) => ({
    name: field.name,
    label: field.label,
    type: (FIELD_TYPES.includes(field.type as (typeof FIELD_TYPES)[number]) ? field.type : 'text') as FieldDraft['type'],
    required: Boolean(field.required),
    options: (field.options || []).map((option) => (typeof option === 'string' ? option : option.label)).join(', '),
  }))
}

export function FormsInboxPage() {
  const [status, setStatus] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)
  const { data } = useQuery({
    queryKey: ['submissions', status],
    queryFn: () => formsApi.submissions(status ? { status } : undefined),
  })
  const qc = useQueryClient()
  const rows = (data?.data || []) as FormSubmission[]
  const open = rows.find((row) => row.id === openId)

  return (
    <div>
      <PageHeader
        title="Submissions"
        description="Every public form on your sites writes here and emails verified workspace members."
        actions={
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={() => formsApi.downloadCsv()}>
              Export CSV
            </Button>
          </div>
        }
      />
      <div className={`grid gap-4 ${open ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
        <Card>
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Form</th>
                <th>Website</th>
                <th>Page</th>
                <th>Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer border-t border-zinc-800 ${item.id === openId ? 'bg-zinc-900' : 'hover:bg-zinc-900/60'}`}
                  onClick={() => setOpenId(item.id === openId ? null : item.id)}
                >
                  <td className="py-2">{item.name || '—'}</td>
                  <td>{item.email || '—'}</td>
                  <td>{item.form || item.form_id}</td>
                  <td>{item.website || '—'}</td>
                  <td>{item.page || '—'}</td>
                  <td>{item.submitted || item.created_at || '—'}</td>
                  <td>
                    <select
                      className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1"
                      value={item.status || 'new'}
                      onClick={(event) => event.stopPropagation()}
                      onChange={async (e) => {
                        await formsApi.updateSubmission(item.id, e.target.value)
                        qc.invalidateQueries({ queryKey: ['submissions'] })
                      }}
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? (
            <p className="pt-3 text-sm text-zinc-500">No submissions yet. Publish a page with a form block, then send a test message.</p>
          ) : null}
        </Card>
        {open ? (
          <Card className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">From</p>
              <p className="text-sm text-white">{open.name || '—'}</p>
              <p className="text-sm text-zinc-400">{open.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Form</p>
              <p className="text-sm">
                {open.form || open.form_id} · {open.website || '—'}
              </p>
              <p className="text-xs text-zinc-500">{open.page || 'No page recorded'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Message</p>
              <dl className="mt-2 space-y-2 text-sm">
                {Object.entries(open.payload || {}).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-zinc-500">{key.replaceAll('_', ' ')}</dt>
                    <dd className="whitespace-pre-wrap text-zinc-200">{typeof value === 'string' ? value : JSON.stringify(value)}</dd>
                  </div>
                ))}
                {!Object.keys(open.payload || {}).length ? <p className="text-zinc-500">No extra fields.</p> : null}
              </dl>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export function SiteFormsPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const forms = useQuery({ queryKey: ['forms', id], queryFn: () => formsApi.list(id!), enabled: Boolean(id) })
  const sites = useQuery({ queryKey: ['site', id], queryFn: () => sitesApi.get(id!), enabled: Boolean(id) })
  const members = useQuery({
    queryKey: ['members', getWorkspaceId()],
    queryFn: () => workspacesApi.members(Number(getWorkspaceId())),
    enabled: Boolean(getWorkspaceId()),
  })
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = forms.data?.find((form) => form.id === selectedId) || forms.data?.[0]
  const [name, setName] = useState('')
  const [type, setType] = useState<(typeof FORM_TYPES)[number]>('contact')
  const [success, setSuccess] = useState('Thanks — we received your message.')
  const [turnstile, setTurnstile] = useState(false)
  const [recipients, setRecipients] = useState<string[]>([])
  const [fields, setFields] = useState<FieldDraft[]>([emptyField()])

  useEffect(() => {
    if (!selected) return
    setSelectedId(selected.id)
    setName(selected.name)
    setType((FORM_TYPES.find((item) => item === selected.type) || 'contact') as (typeof FORM_TYPES)[number])
    setSuccess(String(selected.settings?.success_message || 'Thanks — we received your message.'))
    setTurnstile(Boolean(selected.settings?.turnstile_enabled))
    setRecipients(Array.isArray(selected.settings?.recipients) ? (selected.settings?.recipients as string[]) : [])
    const nextFields = fieldsFromForm(selected)
    setFields(nextFields.length ? nextFields : [emptyField()])
  }, [selected?.id])

  const save = useMutation({
    mutationFn: () =>
      formsApi.update(selected!.id, {
        name,
        type,
        settings: {
          success_message: success,
          turnstile_enabled: turnstile,
          recipients,
        },
        fields: fields.map((field, index) => ({
          name: field.name || field.label,
          label: field.label,
          type: field.type,
          required: field.required,
          options: field.options
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          sort_order: index,
        })),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forms', id] }),
  })

  const create = useMutation({
    mutationFn: () => formsApi.create(id!, { name: 'New form', type: 'contact' }),
    onSuccess: (form) => {
      qc.invalidateQueries({ queryKey: ['forms', id] })
      setSelectedId((form as SiteForm).id)
    },
  })

  const remove = useMutation({
    mutationFn: (formId: number) => formsApi.remove(formId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['forms', id] }),
  })

  const memberEmails = ((members.data || []) as Array<{ email?: string; email_verified_at?: string | null }>)
    .map((member) => member.email)
    .filter((email): email is string => Boolean(email))

  return (
    <div>
      <PageHeader
        title={`Forms · ${sites.data?.name || ''}`}
        description="Contact, lead, newsletter, and quote forms. Submissions are emailed to verified members and listed in the inbox."
        actions={
          <div className="flex gap-2">
            <Link to="/forms" className="text-sm text-blue-400">
              Inbox
            </Link>
            <Button onClick={() => create.mutate()}>
              <Plus size={14} /> Add form
            </Button>
          </div>
        }
      />
      <SiteSubnav />
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <Card className="space-y-1">
          {(forms.data || []).map((form) => (
            <button
              key={form.id}
              type="button"
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${form.id === selected?.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'}`}
              onClick={() => setSelectedId(form.id)}
            >
              <span>
                {form.name}
                <span className="ml-2 text-xs text-zinc-500">{form.type}</span>
              </span>
              <Trash2
                size={14}
                onClick={(event: MouseEvent) => {
                  event.stopPropagation()
                  remove.mutate(form.id)
                }}
              />
            </button>
          ))}
        </Card>
        {selected ? (
          <Card className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2"
                value={type}
                onChange={(e) => setType(e.target.value as (typeof FORM_TYPES)[number])}
              >
                {FORM_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Success message</Label>
              <Input value={success} onChange={(e) => setSuccess(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={turnstile} onChange={(e) => setTurnstile(e.target.checked)} />
              Cloudflare Turnstile
            </label>
            <div>
              <Label>Notify verified workspace members</Label>
              <div className="space-y-1 text-sm">
                {memberEmails.map((email) => (
                  <label key={email} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={recipients.includes(email.toLowerCase())}
                      onChange={(e) =>
                        setRecipients((current) =>
                          e.target.checked
                            ? [...current, email.toLowerCase()]
                            : current.filter((item) => item !== email.toLowerCase()),
                        )
                      }
                    />
                    {email}
                  </label>
                ))}
                {!memberEmails.length ? <p className="text-zinc-500">No members loaded.</p> : null}
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Notifications only go to verified members of this workspace. Arbitrary addresses are rejected.
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Fields</Label>
                <Button variant="ghost" onClick={() => setFields((current) => [...current, emptyField()])}>
                  Add field
                </Button>
              </div>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-800 p-3">
                    <div className="col-span-2">
                      <Label>Label</Label>
                      <Input value={field.label} onChange={(e) => setFields((current) => current.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)))} />
                    </div>
                    <div>
                      <Label>Name</Label>
                      <Input value={field.name} onChange={(e) => setFields((current) => current.map((item, i) => (i === index ? { ...item, name: e.target.value } : item)))} />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <select
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                        value={field.type}
                        onChange={(e) =>
                          setFields((current) => current.map((item, i) => (i === index ? { ...item, type: e.target.value as FieldDraft['type'] } : item)))
                        }
                      >
                        {FIELD_TYPES.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </div>
                    {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                      <div className="col-span-2">
                        <Label>Options (comma separated)</Label>
                        <Input
                          value={field.options}
                          onChange={(e) => setFields((current) => current.map((item, i) => (i === index ? { ...item, options: e.target.value } : item)))}
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => setFields((current) => current.map((item, i) => (i === index ? { ...item, required: e.target.checked } : item)))}
                      />
                      Required
                    </label>
                    <Button variant="ghost" onClick={() => setFields((current) => current.filter((_, i) => i !== index))}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={() => save.mutate()} disabled={save.isPending || !selected}>
              Save form
            </Button>
          </Card>
        ) : (
          <p className="text-zinc-500">No forms yet.</p>
        )}
      </div>
    </div>
  )
}
