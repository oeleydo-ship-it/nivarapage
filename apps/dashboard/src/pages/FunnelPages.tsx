import type { Funnel, FunnelAnalytics, FunnelStep } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Activity, ArrowRight, BarChart3, CheckCircle2, Copy, ExternalLink, GitBranch,
  DollarSign, Globe2, LayoutTemplate, Monitor, Pause, Plus, Radio, Rocket, Search,
  ShoppingCart, Sparkles, Target, Trash2, TrendingDown, Users, Workflow,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { funnelsApi } from '../lib/endpoints'
import { Badge, Button, Card, DataTable, EmptyState, Input, Label, PageHeader, Select } from '../ui/primitives'
import { cn } from '@uidesired/utilities'
import { standaloneFunnelUrl } from '../lib/siteUrls'
import { publishFunnelWithRenders } from '@/lib/publishSite'

const funnelTypes = [
  ['lead_generation', 'Lead Generation'], ['sales', 'Sales Funnel'], ['booking', 'Booking Funnel'],
  ['webinar', 'Webinar Funnel'], ['newsletter', 'Newsletter Funnel'], ['custom', 'Custom Funnel'],
]
const goals = [
  ['collect_leads', 'Collect Leads'], ['book_appointments', 'Book Appointments'], ['sell_product', 'Sell Product'],
  ['register_users', 'Register Users'], ['download_file', 'Download File'], ['custom_conversion', 'Custom Conversion'],
]
const stepTypes = [
  ['landing_page', 'Landing Page'], ['lead_form', 'Lead Form'], ['offer_page', 'Offer Page'],
  ['checkout', 'Checkout'], ['upsell', 'Upsell'], ['downsell', 'Downsell'], ['booking', 'Booking'],
  ['survey', 'Survey'], ['thank_you', 'Thank You'], ['redirect', 'Redirect'], ['custom_page', 'Custom Page'],
]

function FunnelNav() {
  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-zinc-800 pb-3">
      {[
        ['/funnels', 'Overview'], ['/funnels/new', 'Create Funnel'], ['/funnels/leads', 'Leads'],
        ['/funnels/analytics', 'Analytics'], ['/funnels/templates', 'Templates'], ['/funnels/settings', 'Settings'],
      ].map(([to, label]) => (
        <NavLink key={to} to={to} end={to === '/funnels'} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm', isActive ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white')}>{label}</NavLink>
      ))}
    </div>
  )
}

function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Activity }) {
  return <Card className="relative overflow-hidden"><Icon className="absolute right-4 top-4 text-zinc-700" size={30} /><div className="text-xs text-zinc-500">{label}</div><div className="mt-2 text-2xl font-semibold text-white">{value}</div></Card>
}

export function FunnelsPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const funnels = useQuery({ queryKey: ['funnels', q, status], queryFn: () => funnelsApi.list({ q: q || undefined, status: status || undefined }) })
  const analytics = useQuery({ queryKey: ['funnel-analytics', 30], queryFn: () => funnelsApi.analytics(undefined, 30) })
  const data = analytics.data
  const rows = funnels.data?.data || []
  return <div><FunnelNav /><PageHeader title="Funnels" description="Build connected customer journeys, publish them on your sites, and see what converts." actions={<Link to="/funnels/new"><Button><Plus size={16} />Create funnel</Button></Link>} />
    <div className="grid gap-3 md:grid-cols-4"><Metric label="Total funnels" value={rows.length} icon={Workflow} /><Metric label="Unique visitors" value={data?.unique_visitors ?? 0} icon={Users} /><Metric label="Leads" value={data?.leads ?? 0} icon={Target} /><Metric label="Conversion rate" value={`${data?.conversion_rate ?? 0}%`} icon={BarChart3} /></div>
    <div className="my-5 flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-zinc-600" size={16}/><Input className="pl-9" placeholder="Search funnels" value={q} onChange={(e)=>setQ(e.target.value)} /></div><Select value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="paused">Paused</option></Select></div>
    {funnels.isLoading ? <Card>Loading funnels…</Card> : rows.length === 0 ? <Card><EmptyState icon={<Workflow size={36}/>} title="You haven't created a funnel yet" description="Start with a polished landing page, lead form, and thank-you page—all editable in your existing builder."><Link to="/funnels/new"><Button>Create your first funnel</Button></Link></EmptyState></Card> : <div className="grid gap-4 md:grid-cols-2">{rows.map((funnel)=><FunnelCard key={funnel.id} funnel={funnel}/>)}</div>}
  </div>
}

function FunnelCard({ funnel }: { funnel: Funnel }) {
  const qc=useQueryClient()
  const remove=useMutation({mutationFn:()=>funnelsApi.remove(funnel.id),onSuccess:()=>{qc.invalidateQueries({queryKey:['funnels']});qc.invalidateQueries({queryKey:['funnel-analytics']})}})
  const confirmDelete=()=>{if(window.confirm(`Delete “${funnel.name}”? Its public funnel URL will stop working. Analytics data is retained for reporting.`))remove.mutate()}
  return <Card className="group"><div className="flex items-start justify-between"><div><Badge tone={funnel.status === 'published' ? 'success' : funnel.status === 'paused' ? 'warning' : 'neutral'}>{funnel.status}</Badge><h3 className="mt-3 text-lg font-semibold text-white">{funnel.name}</h3><p className="mt-1 text-sm text-zinc-500">{funnel.description || 'A focused conversion journey.'}</p></div><Workflow className="text-zinc-700 group-hover:text-blue-500" /></div><div className="mt-5 grid grid-cols-3 gap-2 rounded-lg bg-zinc-950/70 p-3 text-center"><div><b className="block text-white">{funnel.steps_count ?? 0}</b><span className="text-xs text-zinc-500">Steps</span></div><div><b className="block text-white">{funnel.leads_count ?? 0}</b><span className="text-xs text-zinc-500">Leads</span></div><div><b className="block text-white">{funnel.events_count ?? 0}</b><span className="text-xs text-zinc-500">Events</span></div></div><div className="mt-4 flex flex-wrap gap-2"><Link to={`/funnels/${funnel.id}`}><Button>Edit flow <ArrowRight size={15}/></Button></Link><Link to={`/funnels/${funnel.id}/analytics`}><Button variant="outline">Analytics</Button></Link><Button variant="danger" disabled={remove.isPending} onClick={confirmDelete}><Trash2 size={15}/>{remove.isPending?'Deleting…':'Delete'}</Button></div>{remove.isError?<p className="mt-3 text-sm text-red-400">{remove.error instanceof Error?remove.error.message:'Could not delete funnel.'}</p>:null}</Card>
}

export function CreateFunnelPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const presetTemplate = params.get('template')?.trim() || ''
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: presetTemplate === 'consultation' ? 'booking' : presetTemplate === 'product_launch' ? 'sales' : 'lead_generation',
    goal: presetTemplate === 'consultation' ? 'book_appointments' : presetTemplate === 'product_launch' ? 'sell_product' : 'collect_leads',
    template: presetTemplate || 'lead_magnet',
  })
  const create = useMutation({ mutationFn: () => funnelsApi.create(form), onSuccess: (funnel) => navigate(`/funnels/${funnel.id}`) })
  return <div><FunnelNav /><PageHeader title="Create a funnel" description="Choose a goal and we'll create a connected, editable starter journey." />
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]"><Card className="space-y-4"><div><Label>Funnel name</Label><Input autoFocus placeholder="Website Design Consultation" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></div><div><Label>Description</Label><textarea className="min-h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-blue-500" placeholder="What this funnel helps visitors accomplish" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/></div><div><Label>Starter structure</Label><Select className="w-full" value={form.template} onChange={(e)=>{const template=e.target.value;setForm({...form,template,type:template==='consultation'?'booking':template==='product_launch'?'sales':'lead_generation',goal:template==='consultation'?'book_appointments':template==='product_launch'?'sell_product':'collect_leads'})}}><option value="lead_magnet">Lead magnet — Landing → Form → Thank you</option><option value="consultation">Consultation — Offer → Survey → Booking → Confirmation</option><option value="product_launch">Product launch — Landing → Offer → Checkout → Upsell → Thanks</option></Select></div><div><Label>Funnel type</Label><Select className="w-full" value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}>{funnelTypes.map(([value,label])=><option key={value} value={value}>{label}</option>)}</Select></div><div><Label>Primary goal</Label><Select className="w-full" value={form.goal} onChange={(e)=>setForm({...form,goal:e.target.value})}>{goals.map(([value,label])=><option key={value} value={value}>{label}</option>)}</Select></div>{create.isError?<p className="text-sm text-red-400">{create.error instanceof Error?create.error.message:'Could not create funnel.'}</p>:null}<Button disabled={!form.name || create.isPending} onClick={()=>create.mutate()}><Sparkles size={16}/>{create.isPending?'Building journey…':'Create standalone funnel'}</Button></Card>
      <Card><h3 className="font-medium text-white">Independent landing-page builder</h3><p className="mt-1 text-sm text-zinc-500">No website is required. Your funnel gets its own block canvas and public URL.</p><div className="mt-5 space-y-3">{['Start with a polished multi-step journey','Edit each step in the full block library','Publish and track leads without a site'].map((item,index)=><div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3" key={item}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-950 text-xs text-blue-300">{index+1}</span><span className="text-sm text-zinc-200">{item}</span></div>)}</div></Card></div>
  </div>
}

export function FunnelBuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const funnel = useQuery({ queryKey: ['funnel', id], queryFn: () => funnelsApi.get(id!) })
  const analytics = useQuery({ queryKey: ['funnel-analytics', id, 30], queryFn: () => funnelsApi.analytics(id, 30), enabled: Boolean(id) })
  const [zoom, setZoom] = useState(1)
  const [newStep, setNewStep] = useState({ name: '', type: 'offer_page' })
  const [connectFrom, setConnectFrom] = useState<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const refresh = () => qc.invalidateQueries({ queryKey: ['funnel', id] })
  const publish = useMutation({ mutationFn: () => publishFunnelWithRenders(id!), onSuccess: refresh })
  const pause = useMutation({ mutationFn: () => funnelsApi.pause(id!), onSuccess: refresh })
  const duplicate = useMutation({ mutationFn: () => funnelsApi.duplicate(id!), onSuccess: (copy) => window.location.assign(`/funnels/${copy.id}`) })
  const remove = useMutation({ mutationFn: () => funnelsApi.remove(id!), onSuccess: () => { qc.invalidateQueries({queryKey:['funnels']}); navigate('/funnels') } })
  const addStep = useMutation({ mutationFn: () => funnelsApi.addStep(id!, newStep), onSuccess: () => { setNewStep({name:'',type:'offer_page'}); refresh() } })
  const connect = useMutation({ mutationFn: (target:number) => funnelsApi.connect(id!, connectFrom!, target), onSuccess: () => {setConnectFrom(null);refresh()} })
  const disconnect = useMutation({ mutationFn: (connectionId:number) => funnelsApi.disconnect(id!, connectionId), onSuccess: refresh })
  const deleteStep = useMutation({ mutationFn: (stepId:number) => funnelsApi.deleteStep(id!, stepId), onSuccess: refresh })
  const move = useMutation({ mutationFn: ({step,x,y}:{step:FunnelStep;x:number;y:number})=>funnelsApi.updateStep(id!,step.id,{canvas_x:x,canvas_y:y}), onSuccess:refresh })
  const data=funnel.data
  const stats=new Map((analytics.data?.steps||[]).map(step=>[step.step_id,step]))
  if(funnel.isLoading) return <Card>Loading funnel builder…</Card>
  if(!data) return <Card>Funnel not found.</Card>
  const preview = standaloneFunnelUrl(data.public_id, data.steps?.[0]?.slug || 'start')
  return <div><FunnelNav /><PageHeader title={data.name} description={`Standalone funnel · ${data.steps?.length || 0} landing pages`} actions={<div className="flex flex-wrap gap-2">{data.status==='published'&&preview?<a href={preview} target="_blank" rel="noreferrer"><Button variant="outline"><ExternalLink size={15}/>Preview</Button></a>:null}<Button variant="outline" onClick={()=>duplicate.mutate()}><Copy size={15}/>Duplicate</Button>{data.status==='published'?<Button variant="outline" onClick={()=>pause.mutate()}><Pause size={15}/>Pause</Button>:<Button onClick={()=>publish.mutate()}><Rocket size={15}/>Publish</Button>}<Button variant="danger" disabled={remove.isPending} onClick={()=>{if(window.confirm(`Delete “${data.name}”? Its public funnel URL will stop working. Analytics data is retained for reporting.`))remove.mutate()}}><Trash2 size={15}/>{remove.isPending?'Deleting…':'Delete'}</Button></div>} />
    {remove.isError?<div className="mb-4 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-300">{remove.error instanceof Error?remove.error.message:'Could not delete this funnel.'}</div>:null}
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><Badge tone={data.status==='published'?'success':'neutral'}>{data.status}</Badge><Link to={`/funnels/${id}/analytics`} className="text-sm text-blue-400 hover:text-blue-300">View analytics</Link></div><div className="flex items-center gap-2"><Button variant="outline" onClick={()=>setZoom(Math.max(.6,zoom-.1))}>−</Button><span className="w-14 text-center text-xs text-zinc-500">{Math.round(zoom*100)}%</span><Button variant="outline" onClick={()=>setZoom(Math.min(1.4,zoom+.1))}>+</Button></div></div>
    <Card padded={false} className="overflow-hidden"><div ref={canvasRef} className="relative h-[520px] overflow-auto bg-zinc-950" style={{backgroundImage:'radial-gradient(#27272a 1px, transparent 1px)',backgroundSize:'20px 20px'}}><div className="relative h-[800px] w-[1300px] origin-top-left" style={{transform:`scale(${zoom})`}}><svg className="absolute inset-0 h-full w-full">{data.connections?.map(c=>{const a=data.steps?.find(s=>s.id===c.source_step_id),b=data.steps?.find(s=>s.id===c.target_step_id);if(!a||!b)return null;const midX=(a.canvas_x+240+b.canvas_x)/2, midY=(a.canvas_y+65+b.canvas_y+65)/2;return <g key={c.id}><path d={`M ${a.canvas_x+240} ${a.canvas_y+65} C ${a.canvas_x+270} ${a.canvas_y+65}, ${b.canvas_x-30} ${b.canvas_y+65}, ${b.canvas_x} ${b.canvas_y+65}`} stroke="#2563eb" strokeWidth="2" fill="none"/><circle cx={midX} cy={midY} r="10" className="cursor-pointer fill-zinc-900 stroke-zinc-600 hover:stroke-red-400" onClick={()=>{if(window.confirm('Remove this connection?'))disconnect.mutate(c.id)}}/><title>Remove connection</title></g>})}</svg>{data.steps?.map(step=><FunnelNode key={step.id} step={step} funnel={data} stats={stats.get(step.id)} connectFrom={connectFrom} onConnect={()=>connectFrom&&connectFrom!==step.id?connect.mutate(step.id):setConnectFrom(step.id)} onDelete={()=>{if((data.steps?.length||0)<=1){window.alert('Keep at least one step.');return} if(window.confirm(`Delete step “${step.name}”?`))deleteStep.mutate(step.id)}} onMove={(x,y)=>move.mutate({step,x,y})}/>)}</div></div></Card>
    <Card className="mt-4"><h3 className="font-medium text-white">Add a step</h3><div className="mt-3 flex flex-wrap gap-2"><Input className="max-w-xs" placeholder="Step name" value={newStep.name} onChange={(e)=>setNewStep({...newStep,name:e.target.value})}/><Select value={newStep.type} onChange={(e)=>setNewStep({...newStep,type:e.target.value})}>{stepTypes.map(([v,l])=><option value={v} key={v}>{l}</option>)}</Select><Button disabled={!newStep.name||addStep.isPending} onClick={()=>addStep.mutate()}><Plus size={15}/>Add editable page</Button></div><p className="mt-2 text-xs text-zinc-500">Select “Connect” on a source step, then select the destination. Click a connection midpoint to remove it. Drag cards to arrange the canvas.</p></Card>
  </div>
}

function FunnelNode({step,funnel,stats,connectFrom,onConnect,onDelete,onMove}:{step:FunnelStep;funnel:Funnel;stats?:FunnelAnalytics['steps'][number];connectFrom:number|null;onConnect:()=>void;onDelete:()=>void;onMove:(x:number,y:number)=>void}) {
  const start=useRef<{x:number;y:number;left:number;top:number}|null>(null)
  return <div className={cn('absolute w-60 rounded-xl border bg-zinc-900 shadow-xl',connectFrom===step.id?'border-blue-500 ring-2 ring-blue-500/20':'border-zinc-700')} style={{left:step.canvas_x,top:step.canvas_y}} onPointerDown={(e)=>{if((e.target as HTMLElement).closest('a,button'))return;start.current={x:e.clientX,y:e.clientY,left:step.canvas_x,top:step.canvas_y};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerUp={(e)=>{if(!start.current)return;onMove(Math.max(10,Math.round(start.current.left+(e.clientX-start.current.x))),Math.max(10,Math.round(start.current.top+(e.clientY-start.current.y))));start.current=null}}><div className="cursor-grab border-b border-zinc-800 p-4"><div className="flex items-center justify-between"><Badge tone={step.status==='published'?'success':'neutral'}>{step.type.replaceAll('_',' ')}</Badge><button type="button" title="Delete step" className="text-zinc-600 hover:text-red-400" onClick={onDelete}><Trash2 size={14}/></button></div><h3 className="mt-3 font-semibold text-white">{step.name}</h3></div><div className="grid grid-cols-2 gap-2 p-3 text-center text-xs"><div className="rounded bg-zinc-950 p-2"><b className="block text-sm text-white">{stats?.views||0}</b><span className="text-zinc-500">Views</span></div><div className="rounded bg-zinc-950 p-2"><b className="block text-sm text-white">{stats?.conversion_rate||0}%</b><span className="text-zinc-500">Convert</span></div></div><div className="flex gap-1 p-3 pt-0"><Link className="flex-1" to={`/funnels/${funnel.id}/steps/${step.id}/editor`}><Button className="w-full px-2" variant="outline">Edit landing page</Button></Link><Button title="Connect step" variant={connectFrom===step.id?'primary':'ghost'} onClick={onConnect}><GitBranch size={15}/></Button></div></div>
}

export function FunnelAnalyticsPage() {
  const { id }=useParams()
  const [days,setDays]=useState(30)
  const [filters,setFilters]=useState<{funnel_id?:number;source?:string;campaign?:string;device?:string;country?:string}>({})
  const funnels=useQuery({queryKey:['funnels','analytics-filter'],queryFn:()=>funnelsApi.list()})
  const analytics=useQuery({queryKey:['funnel-analytics',id||'all',days,filters],queryFn:()=>funnelsApi.analytics(id,days,filters),refetchInterval:30000})
  const data=analytics.data
  const money=(value:number)=>new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value||0)
  return <div><FunnelNav/><PageHeader title="Funnel analytics" description="Attribution, conversion, revenue and drop-off reporting from consented first-party events." actions={<div className="flex items-center gap-2"><span className="inline-flex items-center gap-1 text-xs text-emerald-400"><Radio size={12}/>Live</span><Select value={days} onChange={e=>setDays(Number(e.target.value))}><option value={1}>Today</option><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></Select></div>}/>
    {!id?<Card className="mb-4"><div className="grid gap-3 md:grid-cols-5"><Select value={filters.funnel_id||''} onChange={e=>setFilters({...filters,funnel_id:e.target.value?Number(e.target.value):undefined})}><option value="">All funnels</option>{funnels.data?.data.map(f=><option value={f.id} key={f.id}>{f.name}</option>)}</Select><Input placeholder="Traffic source" value={filters.source||''} onChange={e=>setFilters({...filters,source:e.target.value||undefined})}/><Input placeholder="UTM campaign" value={filters.campaign||''} onChange={e=>setFilters({...filters,campaign:e.target.value||undefined})}/><Select value={filters.device||''} onChange={e=>setFilters({...filters,device:e.target.value||undefined})}><option value="">All devices</option><option value="desktop">Desktop</option><option value="mobile">Mobile</option><option value="tablet">Tablet</option></Select><Input placeholder="Country code" maxLength={2} value={filters.country||''} onChange={e=>setFilters({...filters,country:e.target.value.toUpperCase()||undefined})}/></div></Card>:null}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Visitors" value={data?.unique_visitors||0} icon={Users}/><Metric label="Leads" value={data?.leads||0} icon={Target}/><Metric label="Conversion" value={`${data?.conversion_rate||0}%`} icon={BarChart3}/><Metric label="Revenue" value={money(data?.revenue||0)} icon={DollarSign}/><Metric label="Orders" value={data?.orders||0} icon={ShoppingCart}/><Metric label="Average order" value={money(data?.average_order_value||0)} icon={Activity}/><Metric label="Revenue / visitor" value={money(data?.revenue_per_visitor||0)} icon={TrendingDown}/><Metric label="Abandoned checkout" value={data?.abandoned_checkouts||0} icon={ShoppingCart}/></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[2fr_1fr]"><Card><div className="mb-4 flex items-center justify-between"><div><h3 className="font-medium text-white">Performance trend</h3><p className="text-xs text-zinc-500">Unique visitors and conversions over time</p></div></div><AnalyticsChart rows={data?.daily||[]}/></Card><Card><h3 className="font-medium text-white">Right now</h3><div className="mt-5 grid grid-cols-2 gap-3"><RealtimeValue label="Visitors online" value={data?.realtime.visitors_online||0}/><RealtimeValue label="Active sessions" value={data?.realtime.active_sessions||0}/><RealtimeValue label="Conversions today" value={data?.realtime.conversions_today||0}/><RealtimeValue label="Revenue today" value={money(data?.realtime.revenue_today||0)}/></div></Card></div>
    {data?.biggest_drop_off&&data.biggest_drop_off.drop_off_rate>0?<div className="mt-4 rounded-xl border border-amber-900 bg-amber-950/30 p-4 text-sm text-amber-200"><b>Biggest drop-off:</b> {data.biggest_drop_off.name} loses {data.biggest_drop_off.drop_off_rate}% before the next step.</div>:null}
    {data?.steps?.length?<Card className="mt-5"><h3 className="mb-4 font-medium text-white">Step drop-off</h3><div className="space-y-3">{data.steps.map((step,index)=><div key={step.step_id} className="grid items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 md:grid-cols-[1fr_110px_110px_110px_120px]"><div><div className="text-sm font-medium text-zinc-200">{index+1}. {step.name}</div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-blue-600" style={{width:`${Math.min(100,step.conversion_rate)}%`}}/></div></div><SmallStat label="Unique" value={step.unique_views}/><SmallStat label="Converted" value={step.conversions}/><SmallStat label="Rate" value={`${step.conversion_rate}%`}/><SmallStat label="Drop-off" value={`${step.drop_off_rate}%`} warning={step.drop_off_rate>50}/></div>)}</div></Card>:null}
    <div className="mt-5 grid gap-4 lg:grid-cols-2"><Breakdown title="Traffic sources" icon={Globe2} rows={data?.sources||[]}/><Breakdown title="Devices" icon={Monitor} rows={data?.devices||[]}/><Breakdown title="UTM campaigns" icon={Target} rows={data?.campaigns||[]}/><Breakdown title="Countries" icon={Globe2} rows={data?.countries||[]}/></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2"><AttributionCard data={data?.attribution}/><Card><h3 className="font-medium text-white">Recent conversions</h3><p className="mt-1 text-xs text-zinc-500">Latest purchases and captured leads from consented sessions.</p><div className="mt-4 space-y-2">{data?.realtime.recent_purchases.slice(0,3).map(purchase=><div key={`purchase-${purchase.id}`} className="flex items-center justify-between rounded-lg bg-zinc-950 p-3 text-sm"><span className="text-zinc-300">Purchase · {purchase.source||'direct'}</span><span className="font-medium text-emerald-400">{new Intl.NumberFormat(undefined,{style:'currency',currency:purchase.currency||'USD'}).format(purchase.revenue)}</span></div>)}{data?.realtime.recent_leads.slice(0,3).map(lead=><div key={`lead-${lead.id}`} className="flex items-center justify-between rounded-lg bg-zinc-950 p-3 text-sm"><span className="text-zinc-300">{lead.first_name||lead.email||'New lead'}</span><span className="text-xs text-zinc-500">{lead.funnel?.name||'Funnel'}</span></div>)}{!data?.realtime.recent_purchases.length&&!data?.realtime.recent_leads.length?<div className="py-7 text-center text-sm text-zinc-600">No recent conversions</div>:null}</div></Card></div>
    {!data?.daily?.length?<Card className="mt-5"><EmptyState title="Analytics will appear after consented visitors arrive" description="Publish and share your funnel. Bot traffic and essential-only visitors are excluded from analytics by default."/></Card>:null}
  </div>
}

function RealtimeValue({label,value}:{label:string;value:string|number}) { return <div className="rounded-lg bg-zinc-950 p-3"><div className="text-xl font-semibold text-white">{value}</div><div className="mt-1 text-xs text-zinc-500">{label}</div></div> }
function SmallStat({label,value,warning}:{label:string;value:string|number;warning?:boolean}) { return <div><div className={cn('text-sm font-medium',warning?'text-amber-300':'text-zinc-200')}>{value}</div><div className="text-[11px] text-zinc-600">{label}</div></div> }

function AnalyticsChart({rows}:{rows:FunnelAnalytics['daily']}) {
  if(!rows.length)return <div className="flex h-52 items-center justify-center text-sm text-zinc-600">No activity in this range</div>
  const max=Math.max(1,...rows.flatMap(row=>[row.visitors,row.conversions])); const points=(key:'visitors'|'conversions')=>rows.map((row,index)=>`${rows.length===1?50:(index/(rows.length-1))*100},${100-(row[key]/max)*85}`).join(' ')
  return <div><svg viewBox="0 0 100 105" preserveAspectRatio="none" className="h-52 w-full overflow-visible"><line x1="0" y1="100" x2="100" y2="100" stroke="#3f3f46" strokeWidth=".5"/><polyline points={points('visitors')} fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke"/><polyline points={points('conversions')} fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg><div className="mt-3 flex items-center justify-between text-xs text-zinc-600"><span>{new Date(rows[0].date).toLocaleDateString()}</span><span className="flex gap-4"><i className="not-italic text-blue-400">● Visitors</i><i className="not-italic text-emerald-400">● Conversions</i></span><span>{new Date(rows.at(-1)!.date).toLocaleDateString()}</span></div></div>
}

function Breakdown({title,icon:Icon,rows}:{title:string;icon:typeof Activity;rows:FunnelAnalytics['sources']}) {
  const max=Math.max(1,...rows.map(row=>row.visitors)); return <Card><div className="mb-4 flex items-center gap-2"><Icon size={16} className="text-blue-400"/><h3 className="font-medium text-white">{title}</h3></div>{rows.length?<div className="space-y-3">{rows.slice(0,8).map(row=><div key={row.label}><div className="mb-1 flex justify-between text-xs"><span className="capitalize text-zinc-300">{row.label||'Unknown'}</span><span className="text-zinc-500">{row.visitors} visitors · {row.conversions} conversions</span></div><div className="h-1.5 overflow-hidden rounded bg-zinc-800"><div className="h-full bg-blue-600" style={{width:`${row.visitors/max*100}%`}}/></div></div>)}</div>:<div className="py-8 text-center text-sm text-zinc-600">No data yet</div>}</Card>
}

function AttributionCard({data}:{data?:FunnelAnalytics['attribution']}) {
  const rows=[['First touch',data?.first_touch||[]],['Last touch',data?.last_touch||[]]] as const
  return <Card><h3 className="font-medium text-white">Revenue attribution</h3><p className="mt-1 text-xs text-zinc-500">Compare the channel that introduced a visitor with the channel that closed the purchase.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">{rows.map(([title,items])=><div key={title}><div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-600">{title}</div><div className="space-y-2">{items.slice(0,5).map((item,index)=><div key={`${title}-${item.label}-${index}`} className="flex justify-between text-sm"><span className="capitalize text-zinc-300">{item.label||'direct'}</span><span className="text-zinc-500">{new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0}).format(item.revenue)}</span></div>)}{!items.length?<span className="text-sm text-zinc-600">No attributed revenue</span>:null}</div></div>)}</div></Card>
}

export function FunnelLeadsPage() {
  const leads=useQuery({queryKey:['funnel-leads'],queryFn:funnelsApi.leads})
  return <div><FunnelNav/><PageHeader title="Funnel leads" description="Contacts captured across every funnel in this workspace."/><Card>{leads.data?.data.length?<DataTable headers={['Contact','Funnel','Step','Source','Captured']}>{leads.data.data.map(lead=><tr key={lead.id}><td className="py-3"><div className="text-zinc-200">{[lead.first_name,lead.last_name].filter(Boolean).join(' ')||'Anonymous lead'}</div><div className="text-xs text-zinc-500">{lead.email||lead.phone||'No contact details'}</div></td><td>{lead.funnel?.name||'—'}</td><td>{lead.step?.name||'—'}</td><td>{lead.source||'Direct'}</td><td>{lead.created_at?new Date(lead.created_at).toLocaleDateString():'—'}</td></tr>)}</DataTable>:<EmptyState title="No funnel leads yet" description="Form submissions from published funnel steps will appear here without creating duplicates for the same email."/>}</Card></div>
}

export function FunnelTemplatesPage() {
  const templates = [
    { key: 'lead_magnet', name: 'Lead magnet', flow: 'Landing → Lead form → Thank you', description: 'Capture emails with a short, focused journey.' },
    { key: 'consultation', name: 'Consultation', flow: 'Offer → Qualification → Booking → Confirmation', description: 'Qualify prospects and book a call without a website.' },
    { key: 'product_launch', name: 'Product launch', flow: 'Landing → Offer → Checkout → Upsell → Thank you', description: 'Sell an offer with an optional upsell step.' },
  ]
  return (
    <div>
      <FunnelNav />
      <PageHeader title="Funnel templates" description="Start from a connected multi-step structure, then edit every page in the block editor." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {templates.map((template) => (
          <Card key={template.key}>
            <LayoutTemplate className="text-blue-400" />
            <h3 className="mt-4 font-medium text-white">{template.name}</h3>
            <p className="mt-2 text-sm text-zinc-500">{template.flow}</p>
            <p className="mt-2 text-xs text-zinc-600">{template.description}</p>
            <Link className="mt-4 inline-block" to={`/funnels/new?template=${template.key}`}>
              <Button variant="outline">Use structure</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function FunnelSettingsPage() {
  const capabilities = [
    ['Consent-aware tracking', 'Visitors choose essential-only or analytics cookies before analytics events are recorded.'],
    ['Bot filtering', 'Known crawlers, headless agents and preview tools are excluded from reporting.'],
    ['Daily aggregation', 'Traffic, attribution, conversion and revenue dimensions are processed outside requests.'],
    ['Data retention', 'Raw-event and session retention are controlled by Super Admin platform settings.'],
  ]
  const phases = [
    ['Phase 1 — Core', 'done', 'CRUD, steps, connections, page editor, publish, public URL, leads, basic tracking'],
    ['Phase 2 — Analytics', 'done', 'Sessions, UTMs, devices, geo, drop-off, revenue attribution, live aggregates'],
    ['Phase 3 — Conversion tools', 'partial', 'Checkout/upsell step types & analytics hooks exist; live payments/orders/coupons not wired'],
    ['Phase 4 — Experiments', 'later', 'A/B testing, variants, winner selection'],
    ['Phase 5 — Automation', 'later', 'Triggers, delays, email, webhooks'],
    ['Phase 6 — Advanced tools', 'partial', 'Starter templates shipped; quizzes, import/export, version history later'],
  ] as const
  const tone = (status: typeof phases[number][1]) => status === 'done' ? 'success' as const : status === 'partial' ? 'warning' as const : 'neutral' as const
  return <div><FunnelNav/><PageHeader title="Funnel settings" description="Privacy defaults and build roadmap for this workspace."/><Card className="max-w-2xl space-y-4">{capabilities.map(([title,description],index)=><div key={title} className={cn('flex items-center justify-between gap-5',index?'border-t border-zinc-800 pt-4':'')}><div><h3 className="text-sm font-medium text-white">{title}</h3><p className="mt-1 text-xs text-zinc-500">{description}</p></div><Badge tone="success"><CheckCircle2 size={12} className="mr-1"/>Active</Badge></div>)}<div className="rounded-lg border border-blue-900 bg-blue-950/30 p-4 text-sm text-blue-200">The global module switch is controlled by Super Admin under Admin → Settings. Disabling it hides navigation and returns 404 from dashboard, public, and tracking APIs without deleting data.</div></Card>
    <Card className="mt-4 max-w-2xl space-y-4"><h3 className="font-medium text-white">Build phases</h3><p className="text-xs text-zinc-500">Mapped to the funnel module roadmap. Core create → edit → publish → track is ready to use.</p>{phases.map(([title,status,description])=><div key={title} className="flex items-start justify-between gap-4 border-t border-zinc-800 pt-4 first:border-0 first:pt-0"><div><h4 className="text-sm font-medium text-white">{title}</h4><p className="mt-1 text-xs text-zinc-500">{description}</p></div><Badge tone={tone(status)}>{status}</Badge></div>)}</Card></div>
}
