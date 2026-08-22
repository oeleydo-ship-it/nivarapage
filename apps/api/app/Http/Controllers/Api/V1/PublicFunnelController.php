<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Services\Funnels\FunnelTrackingService;
use App\Services\PublicSiteResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicFunnelController extends Controller
{
    public function resolve(Request $request, PublicSiteResolver $resolver, FunnelTrackingService $tracking): JsonResponse
    {
        $key=(string)$request->query('funnel');
        $funnel=Funnel::query()->where('public_id',$key)->where('status','published')->first();
        if(!$funnel){$site=$resolver->resolve((string)$request->query('host',''));$funnel=$site?Funnel::query()->where('site_id',$site->id)->where('slug',$key)->where('status','published')->first():null;}
        if(!$funnel) return response()->json(['message'=>'Not found.'],404);
        $step=$funnel->steps()->where('slug',$request->query('step','start'))->where('status','published')->first(); if(!$step||!is_array($step->published_content)) return response()->json(['message'=>'Not found.'],404);
        $next=$tracking->nextStep($funnel,$step);
        $page=['id'=>$step->id,'name'=>$step->name,'slug'=>$step->slug,'seo_title'=>$step->seo_title?:$step->name,'seo_description'=>$step->seo_description,'robots_index'=>false,'robots'=>['index'=>false,'follow'=>true],'content'=>$step->published_content];
        return response()->json(['data'=>['page'=>$page,'standalone'=>['name'=>$funnel->name,'theme'=>data_get($funnel->settings,'theme',[]),'branding_removed'=>false],'context'=>['funnel_id'=>$funnel->id,'funnel_slug'=>$funnel->public_id,'step_slug'=>$step->slug,'step_id'=>$step->id,'next_step'=>$next?->slug,'tracking_enabled'=>true]]]);
    }

    public function event(Request $request, string $publicFunnel, string $publicFunnelStep, FunnelTrackingService $tracking): JsonResponse
    {
        $funnel=Funnel::query()->whereKey($publicFunnel)->where('status','published')->firstOrFail();
        $funnelStep=FunnelStep::query()->whereKey($publicFunnelStep)->where('funnel_id',$funnel->id)->where('status','published')->firstOrFail();
        $data=$request->validate(['event_type'=>['required','in:page_view,step_view,button_click,form_view,form_submission,lead_created,checkout_started,purchase,booking,download,conversion,custom'],'idempotency_key'=>['nullable','uuid'],'visitor_id'=>['nullable','uuid'],'session_id'=>['nullable','uuid'],'consent'=>['nullable','in:essential,analytics,all'],'metadata'=>['nullable','array'],'metadata.amount'=>['nullable','numeric','min:0','max:999999999999'],'metadata.currency'=>['nullable','string','size:3'],'metadata.contact'=>['nullable','array'],'metadata.contact.email'=>['nullable','email','max:255'],'metadata.contact.name'=>['nullable','string','max:120'],'metadata.contact.first_name'=>['nullable','string','max:120'],'metadata.contact.last_name'=>['nullable','string','max:120'],'metadata.contact.phone'=>['nullable','string','max:60'],'metadata.contact.company'=>['nullable','string','max:120'],'url'=>['nullable','string','max:2048'],'referrer'=>['nullable','string','max:2048'],'utm_source'=>['nullable','string','max:255'],'utm_medium'=>['nullable','string','max:255'],'utm_campaign'=>['nullable','string','max:255'],'utm_term'=>['nullable','string','max:255'],'utm_content'=>['nullable','string','max:255'],'country'=>['nullable','string','size:2'],'region'=>['nullable','string','max:80'],'city'=>['nullable','string','max:80']]);
        // Keep the full metadata bag — nested rules alone would drop contact/custom keys.
        if ($request->exists('metadata')) {
            $data['metadata'] = is_array($request->input('metadata')) ? $request->input('metadata') : [];
        }
        return response()->json(['data'=>$tracking->track($funnel,$funnelStep,$request,$data)],202);
    }
}
