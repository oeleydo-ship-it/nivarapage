import { CLIENT_STATUSES, type Client, type ClientStatus } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  FileText,
  FolderKanban,
  Globe,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { primaryHost, relativeTime } from '../components/SiteCard'
import { clientsApi, sitesApi } from '../lib/endpoints'
import { Badge, Button, Card, DataTable, EmptyState, Input, Label, PageHeader, Select, type BadgeTone } from '../ui/primitives'

const STATUS_FILTERS = [{ value: 'all', label: 'All statuses' }, ...CLIENT_STATUSES.map((value) => ({ value, label: labelStatus(value) }))] as const

function labelStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function statusTone(status: string): BadgeTone {
  if (status === 'active') return 'success'
  if (status === 'lead') return 'info'
  if (status === 'paused') return 'warning'
  return 'neutral'
}

function hashHue(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  return hash % 360
}

const emptyForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  website: '',
  status: 'lead' as ClientStatus,
  industry: '',
  source: '',
  city: '',
  country: '',
  notes: '',
}

type ClientFormState = typeof emptyForm

function formFromClient(client: Client): ClientFormState {
  return {
    name: client.name || '',
    company: client.company || '',
    email: client.email || '',
    phone: client.phone || '',
    website: client.website || '',
    status: (CLIENT_STATUSES.includes(client.status as ClientStatus) ? client.status : 'lead') as ClientStatus,
    industry: client.industry || '',
    source: client.source || '',
    city: client.city || '',
    country: client.country || '',
    notes: client.notes || '',
  }
}

export function ClientsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['value']>('all')
  const [creating, setCreating] = useState(false)
  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.list(),
  })
  const clients = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (clientsQuery.data || []).filter((client) => {
      if (status !== 'all' && client.status !== status) return false
      if (!q) return true
      const contacts = (client.contacts || []).map((contact) => `${contact.name} ${contact.email}`).join(' ')
      return [client.name, client.company, client.email, client.phone, client.industry, contacts].some((value) =>
        (value || '').toLowerCase().includes(q),
      )
    })
  }, [clientsQuery.data, search, status])

  return (
    <div>
      <PageHeader
        title="Clients"
        description={
          clientsQuery.isPending
            ? 'Loading clients…'
            : `${clients.length} client${clients.length === 1 ? '' : 's'} in this workspace`
        }
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} />
            Add client
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-zinc-500" />
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pr-3 pl-9 text-sm text-zinc-100 outline-none focus:border-blue-500"
            placeholder="Search by name, company, email, or contact…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search clients"
          />
        </div>
        <Select className="w-full sm:w-44" value={status} aria-label="Filter by status" onChange={(event) => setStatus(event.target.value as typeof status)}>
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {clientsQuery.isError ? (
        <Card>
          <p className="text-sm text-red-400">{clientsQuery.error instanceof Error ? clientsQuery.error.message : 'Could not load clients.'}</p>
        </Card>
      ) : null}

      {clientsQuery.isPending ? (
        <Card>
          <DataTable headers={['Client', 'Status', 'Email', 'Sites', 'Contacts', 'Added']}>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="py-3 pr-4" colSpan={6}>
                  <div className="h-10 animate-pulse rounded-lg bg-zinc-800/70" />
                </td>
              </tr>
            ))}
          </DataTable>
        </Card>
      ) : null}

      {!clientsQuery.isPending && !clientsQuery.isError && clients.length === 0 ? (
        <Card className="px-6 py-16">
          <EmptyState
            title={search || status !== 'all' ? 'No matching clients' : 'No clients yet'}
            description="Store people and companies you build for. You can link websites now; invoices, projects, and files can attach later."
            icon={<Briefcase className="text-blue-400/70" size={28} />}
          >
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} />
              Add client
            </Button>
          </EmptyState>
        </Card>
      ) : !clientsQuery.isPending && clients.length > 0 ? (
        <Card>
          <DataTable headers={['Client', 'Status', 'Email', 'Sites', 'Contacts', 'Added']}>
            {clients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </DataTable>
        </Card>
      ) : null}

      {creating ? <ClientCreateModal onClose={() => setCreating(false)} /> : null}
    </div>
  )
}

function ClientRow({ client }: { client: Client }) {
  const navigate = useNavigate()
  const hue = hashHue(`${client.id}:${client.name}`)
  const initial = (client.name.trim()[0] || 'C').toUpperCase()
  const created = relativeTime(client.created_at)
  const siteCount = client.sites_count ?? client.sites?.length ?? 0
  const contactCount = client.contacts_count ?? client.contacts?.length ?? 0
  const href = `/clients/${client.id}`
  const company = client.company && client.company !== client.name ? client.company : null

  return (
    <tr
      className="cursor-pointer hover:bg-zinc-800/40"
      onClick={() => navigate(href)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          navigate(href)
        }
      }}
      tabIndex={0}
    >
      <td className="py-3 pr-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: `hsl(${hue} 45% 32%)` }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <Link to={href} className="block truncate font-medium text-white hover:text-blue-300" onClick={(event) => event.stopPropagation()}>
              {client.name}
            </Link>
            <p className="truncate text-xs text-zinc-500">{company || '—'}</p>
          </div>
        </div>
      </td>
      <td className="py-3 pr-4">
        <Badge tone={statusTone(client.status)}>{labelStatus(client.status)}</Badge>
      </td>
      <td className="py-3 pr-4">
        <span className="block max-w-[16rem] truncate text-zinc-300">{client.email || '—'}</span>
      </td>
      <td className="py-3 pr-4 tabular-nums text-zinc-300">{siteCount}</td>
      <td className="py-3 pr-4 tabular-nums text-zinc-300">{contactCount}</td>
      <td className="py-3 pr-4 whitespace-nowrap text-zinc-500">{created || '—'}</td>
    </tr>
  )
}

function ClientCreateModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState<ClientFormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const create = useMutation({
    mutationFn: () => clientsApi.create(form),
    onSuccess: (client) => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['overview'] })
      onClose()
      navigate(`/clients/${client.id}`)
    },
    onError: (err: Error) => setError(err.message),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-client-title"
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="create-client-title" className="text-lg font-medium text-white">
              New client
            </h2>
            <p className="mt-1 text-sm text-zinc-500">A company or person you can attach websites and later billing to.</p>
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Button>
        </div>
        <ClientFields form={form} onChange={setForm} onSubmit={() => create.mutate()} />
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!form.name.trim() || create.isPending} onClick={() => create.mutate()}>
            {create.isPending ? 'Saving…' : 'Create client'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ClientFields({
  form,
  onChange,
  onSubmit,
}: {
  form: ClientFormState
  onChange: (form: ClientFormState) => void
  onSubmit?: () => void
}) {
  function set<K extends keyof ClientFormState>(key: K, value: ClientFormState[K]) {
    onChange({ ...form, [key]: value })
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(event) => set('name', event.target.value)}
          placeholder="Northwind Retail"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && onSubmit) {
              event.preventDefault()
              onSubmit()
            }
          }}
        />
      </div>
      <div>
        <Label>Company</Label>
        <Input value={form.company} onChange={(event) => set('company', event.target.value)} placeholder="Optional" />
      </div>
      <div>
        <Label>Status</Label>
        <Select className="w-full" value={form.status} onChange={(event) => set('status', event.target.value as ClientStatus)}>
          {CLIENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {labelStatus(status)}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={(event) => set('email', event.target.value)} placeholder="hello@client.com" />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={form.phone} onChange={(event) => set('phone', event.target.value)} placeholder="+1 415 555 0100" />
      </div>
      <div>
        <Label>Website</Label>
        <Input value={form.website} onChange={(event) => set('website', event.target.value)} placeholder="https://" />
      </div>
      <div>
        <Label>Industry</Label>
        <Input value={form.industry} onChange={(event) => set('industry', event.target.value)} placeholder="SaaS, retail…" />
      </div>
      <div>
        <Label>Source</Label>
        <Input value={form.source} onChange={(event) => set('source', event.target.value)} placeholder="Referral, inbound…" />
      </div>
      <div>
        <Label>City</Label>
        <Input value={form.city} onChange={(event) => set('city', event.target.value)} />
      </div>
      <div>
        <Label>Country</Label>
        <Input value={form.country} onChange={(event) => set('country', event.target.value)} />
      </div>
    </div>
  )
}

export function ClientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const clientQuery = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.get(id!),
    enabled: Boolean(id),
  })
  const sitesQuery = useQuery({ queryKey: ['sites'], queryFn: sitesApi.list })
  const client = clientQuery.data
  const [form, setForm] = useState<ClientFormState | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const display = form || (client ? formFromClient(client) : emptyForm)

  function refresh() {
    qc.invalidateQueries({ queryKey: ['client', id] })
    qc.invalidateQueries({ queryKey: ['clients'] })
    qc.invalidateQueries({ queryKey: ['sites'] })
    qc.invalidateQueries({ queryKey: ['overview'] })
  }

  const save = useMutation({
    mutationFn: () => clientsApi.update(id!, display),
    onSuccess: () => {
      setNotice('Client saved')
      setError(null)
      refresh()
    },
    onError: (err: Error) => setError(err.message),
  })

  const remove = useMutation({
    mutationFn: () => clientsApi.remove(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      navigate('/clients')
    },
    onError: (err: Error) => setError(err.message),
  })

  if (clientQuery.isError) {
    return (
      <div>
        <PageHeader title="Client" description="This record is missing or belongs to another workspace." />
        <Link to="/clients" className="text-sm text-blue-400">
          Back to clients
        </Link>
      </div>
    )
  }

  if (!client) {
    return (
      <div>
        <PageHeader title="Client" description="Loading…" />
      </div>
    )
  }

  const linkedIds = new Set((client.sites || []).map((site) => site.id))
  const availableSites = (sitesQuery.data || []).filter((site) => !linkedIds.has(site.id) && !site.deleted_at)

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={client.company && client.company !== client.name ? client.company : 'Client record'}
        actions={
          <div className="flex gap-2">
            <Link to="/clients">
              <Button variant="ghost">
                <ArrowLeft size={15} />
                All clients
              </Button>
            </Link>
            <Button variant="danger" onClick={() => {
              if (window.confirm(`Archive and remove ${client.name}? Linked websites stay; they just unlink.`)) remove.mutate()
            }}>
              <Trash2 size={15} />
              Delete
            </Button>
          </div>
        }
      />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-white">Details</h2>
            <Badge tone={statusTone(display.status)}>{labelStatus(display.status)}</Badge>
          </div>
          <ClientFields form={display} onChange={setForm} />
          <div>
            <Label>Notes</Label>
            <textarea
              className="min-h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500"
              value={display.notes}
              onChange={(event) => setForm({ ...display, notes: event.target.value })}
              placeholder="Agreements, preferences, or anything the next teammate should know."
            />
          </div>
          <div className="flex justify-end">
            <Button disabled={!display.name.trim() || save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3 text-sm text-zinc-400">
            {client.email ? (
              <p className="flex items-center gap-2">
                <Mail size={14} /> {client.email}
              </p>
            ) : null}
            {client.phone ? (
              <p className="flex items-center gap-2">
                <Phone size={14} /> {client.phone}
              </p>
            ) : null}
            {client.website ? (
              <p className="flex items-center gap-2">
                <Globe size={14} /> {client.website}
              </p>
            ) : null}
            {client.industry ? (
              <p className="flex items-center gap-2">
                <Building2 size={14} /> {client.industry}
              </p>
            ) : null}
            {!client.email && !client.phone && !client.website ? <p>Add contact details in the form.</p> : null}
          </Card>
          <Card>
            <h2 className="mb-2 font-medium text-white">Coming next</h2>
            <p className="mb-3 text-xs text-zinc-500">This record is the hook for later CRM modules. They will store against the same client id.</p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <FileText size={14} /> Invoices &amp; retainers
              </li>
              <li className="flex items-center gap-2">
                <FolderKanban size={14} /> Projects &amp; tasks
              </li>
              <li className="flex items-center gap-2">
                <Briefcase size={14} /> Files &amp; contracts
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <ContactsCard client={client} onChanged={refresh} onError={setError} />
      <SitesCard client={client} availableSites={availableSites} onChanged={refresh} onError={setError} />
    </div>
  )
}

function ContactsCard({
  client,
  onChanged,
  onError,
}: {
  client: Client
  onChanged: () => void
  onError: (message: string | null) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const add = useMutation({
    mutationFn: () => clientsApi.addContact(client.id, { name, email: email || undefined, title: title || undefined, is_primary: (client.contacts || []).length === 0 }),
    onSuccess: () => {
      setName('')
      setEmail('')
      setTitle('')
      onError(null)
      onChanged()
    },
    onError: (err: Error) => onError(err.message),
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    if (name.trim()) add.mutate()
  }

  return (
    <Card>
      <h2 className="mb-4 font-medium text-white">Contacts</h2>
      <form className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_8rem_auto]" onSubmit={submit}>
        <Input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <Input placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Button type="submit" disabled={!name.trim() || add.isPending}>
          Add
        </Button>
      </form>
      {(client.contacts || []).length === 0 ? (
        <p className="text-sm text-zinc-500">No people on this account yet.</p>
      ) : (
        <DataTable headers={['Name', 'Title', 'Email', 'Phone', '']}>
          {(client.contacts || []).map((contact) => (
            <tr key={contact.id}>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <UserRound size={14} className="shrink-0 text-zinc-500" />
                  <span className="font-medium text-zinc-100">{contact.name}</span>
                  {contact.is_primary ? <Badge>Primary</Badge> : null}
                </div>
              </td>
              <td className="py-3 pr-4 text-zinc-400">{contact.title || '—'}</td>
              <td className="py-3 pr-4 text-zinc-400">{contact.email || '—'}</td>
              <td className="py-3 pr-4 text-zinc-400">{contact.phone || '—'}</td>
              <td className="py-3 pr-4 text-right">
                <Button
                  variant="ghost"
                  aria-label={`Remove ${contact.name}`}
                  onClick={() =>
                    clientsApi
                      .removeContact(contact.id)
                      .then(() => onChanged())
                      .catch((err: Error) => onError(err.message))
                  }
                >
                  <Trash2 size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </Card>
  )
}

function SitesCard({
  client,
  availableSites,
  onChanged,
  onError,
}: {
  client: Client
  availableSites: { id: number; name: string; deleted_at?: string | null }[]
  onChanged: () => void
  onError: (message: string | null) => void
}) {
  const [siteId, setSiteId] = useState('')
  const attach = useMutation({
    mutationFn: () => clientsApi.attachSite(client.id, Number(siteId)),
    onSuccess: () => {
      setSiteId('')
      onError(null)
      onChanged()
    },
    onError: (err: Error) => onError(err.message),
  })

  const sites = client.sites || []

  return (
    <Card>
      <h2 className="mb-1 font-medium text-white">Websites</h2>
      <p className="mb-4 text-sm text-zinc-500">Link builder sites this client owns. Future invoices can bill against the same record.</p>
      {availableSites.length > 0 ? (
        <div className="mb-4 flex gap-2">
          <Select className="min-w-0 flex-1" value={siteId} onChange={(event) => setSiteId(event.target.value)}>
            <option value="">Attach a website…</option>
            {availableSites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </Select>
          <Button disabled={!siteId || attach.isPending} onClick={() => attach.mutate()}>
            Attach
          </Button>
        </div>
      ) : null}
      {sites.length === 0 ? (
        <p className="text-sm text-zinc-500">No websites linked yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {sites.map((site) => (
            <li key={site.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <Link to={`/sites/${site.id}/builder`} className="font-medium text-zinc-100 hover:text-white">
                  {site.name}
                </Link>
                <p className="text-xs text-zinc-500">{primaryHost(site)}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() =>
                  clientsApi
                    .detachSite(client.id, site.id)
                    .then(() => onChanged())
                    .catch((err: Error) => onError(err.message))
                }
              >
                Unlink
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
