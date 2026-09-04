<?php

use App\Http\Controllers\Api\V1\ActivityController;
use App\Http\Controllers\Api\V1\AdminAiController;
use App\Http\Controllers\Api\V1\AdminBrandingController;
use App\Http\Controllers\Api\V1\AdminCloudflareController;
use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AdminDiagnosticsController;
use App\Http\Controllers\Api\V1\AdminGoogleAuthController;
use App\Http\Controllers\Api\V1\AdminLibraryController;
use App\Http\Controllers\Api\V1\AdminMailSettingsController;
use App\Http\Controllers\Api\V1\AdminPaymentGatewayController;
use App\Http\Controllers\Api\V1\AdminStorageSettingsController;
use App\Http\Controllers\Api\V1\AiController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BillingController;
use App\Http\Controllers\Api\V1\BlockPresetController;
use App\Http\Controllers\Api\V1\BlogPostController;
use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\DomainController;
use App\Http\Controllers\Api\V1\FormController;
use App\Http\Controllers\Api\V1\FunnelAutomationController;
use App\Http\Controllers\Api\V1\FunnelController;
use App\Http\Controllers\Api\V1\FunnelExperimentController;
use App\Http\Controllers\Api\V1\FunnelRenderController;
use App\Http\Controllers\Api\V1\FunnelRenderStoreController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\LivechatController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\OverviewController;
use App\Http\Controllers\Api\V1\PageController;
use App\Http\Controllers\Api\V1\PreviewController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\PublicBrandingController;
use App\Http\Controllers\Api\V1\PublicTemplateController;
use App\Http\Controllers\Api\V1\PublicCheckoutController;
use App\Http\Controllers\Api\V1\PublicFunnelController;
use App\Http\Controllers\Api\V1\PublicLivechatController;
use App\Http\Controllers\Api\V1\PublicSiteController;
use App\Http\Controllers\Api\V1\SiteBackupController;
use App\Http\Controllers\Api\V1\SiteChromeController;
use App\Http\Controllers\Api\V1\SiteController;
use App\Http\Controllers\Api\V1\SiteRenderController;
use App\Http\Controllers\Api\V1\StripeWebhookController;
use App\Http\Controllers\Api\V1\TemplateController;
use App\Http\Controllers\Api\V1\WorkspaceController;
use App\Http\Controllers\Api\V1\WorkspacePaymentController;
use App\Http\Controllers\Api\V1\WorkspaceStripeWebhookController;
use App\Http\Middleware\VerifyRendererSecret;
use App\Models\Site;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', [HealthController::class, 'index']);
    Route::get('/health/ready', [HealthController::class, 'ready']);

    Route::middleware('throttle:auth')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
        Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
        Route::get('/auth/google', [AuthController::class, 'googleStatus']);
        Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);
    });

    Route::get('/auth/google/callback', [AuthController::class, 'googleCallback'])
        ->middleware('throttle:60,1');

    Route::get('/auth/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');

    Route::middleware([VerifyRendererSecret::class])->group(function () {
        Route::get('/public/resolve', [PublicSiteController::class, 'resolve']);
        Route::get('/public/page', [PublicSiteController::class, 'page']);
        Route::get('/public/theme', [PublicSiteController::class, 'theme']);
        Route::get('/public/navigation', [PublicSiteController::class, 'navigation']);
        Route::get('/public/sitemap', [PublicSiteController::class, 'sitemap']);
        Route::get('/public/blog', [PublicSiteController::class, 'blog']);
        Route::get('/public/blog-post', [PublicSiteController::class, 'blogPost']);
        Route::post('/public/preview', [PublicSiteController::class, 'preview'])
            ->middleware(['signed:relative,path', 'never.cache'])
            ->name('public.preview');
    });

    // Read before sign-in: the login screen renders the platform's branding.
    Route::get('/public/branding', [PublicBrandingController::class, 'show']);

    // Live demos of the ready-made templates, linked from the marketing site.
    // Throttled because they are the only unauthenticated route that returns
    // whole pages of content.
    Route::get('/public/templates', [PublicTemplateController::class, 'index'])
        ->middleware('throttle:60,1');
    Route::get('/public/templates/{template}', [PublicTemplateController::class, 'show'])
        ->middleware('throttle:120,1');

    Route::get('/public/forms/{publicForm}', [FormController::class, 'publicShow'])
        ->middleware('throttle:public-forms');
    Route::post('/public/forms/{publicForm}/submit', [FormController::class, 'submit'])
        ->middleware('throttle:public-forms');

    Route::middleware(['throttle:public-livechat'])->group(function () {
        Route::match(['GET', 'OPTIONS'], '/public/livechat/{publicKey}', [PublicLivechatController::class, 'show']);
        Route::match(['GET', 'OPTIONS'], '/public/livechat/{publicKey}/widget.js', [PublicLivechatController::class, 'widgetScript']);
        Route::match(['POST', 'OPTIONS'], '/public/livechat/{publicKey}/conversations', [PublicLivechatController::class, 'start']);
        Route::match(['GET', 'OPTIONS'], '/public/livechat/{publicKey}/conversations/{uuid}', [PublicLivechatController::class, 'conversation']);
        Route::match(['POST', 'OPTIONS'], '/public/livechat/{publicKey}/conversations/{uuid}/messages', [PublicLivechatController::class, 'message']);
        Route::match(['POST', 'OPTIONS'], '/public/livechat/{publicKey}/conversations/{uuid}/handoff', [PublicLivechatController::class, 'handoff']);
    });

    Route::post('/billing/webhook', [StripeWebhookController::class, 'handle'])
        ->middleware('throttle:60,1');

    // A buy button on a published page. Public, because the person clicking is
    // the workspace's customer, not a user of the platform.
    Route::post('/public/products/{product}/checkout', [PublicCheckoutController::class, 'start'])
        ->middleware('throttle:public-checkout');

    // Stripe posts here with no session; the signature is the authentication.
    // Throttled by endpoint token so one workspace cannot drown out another.
    Route::post('/public/payments/stripe/{token}/webhook', [WorkspaceStripeWebhookController::class, 'handle'])
        ->middleware('throttle:stripe-webhook');

    Route::middleware([VerifyRendererSecret::class, 'feature:funnels'])->get('/public/funnels/resolve', [PublicFunnelController::class, 'resolve']);
    Route::middleware(['feature:funnels', 'throttle:funnel-tracking'])->post('/public/funnels/{publicFunnel}/steps/{publicFunnelStep}/events', [PublicFunnelController::class, 'event']);

    Route::middleware(['auth:sanctum', 'not.blocked', 'never.cache'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/user', [AuthController::class, 'user']);
        Route::get('/features', [FunnelController::class, 'features']);
        Route::post('/auth/email/resend', [AuthController::class, 'resendVerification']);

        Route::get('/workspaces', [WorkspaceController::class, 'index']);
        Route::post('/workspaces', [WorkspaceController::class, 'store']);
        Route::patch('/workspaces/{workspace}', [WorkspaceController::class, 'update']);
        Route::post('/workspaces/{workspace}/switch', [WorkspaceController::class, 'switch']);
        Route::get('/workspaces/{workspace}/members', [WorkspaceController::class, 'members']);
        Route::get('/workspaces/{workspace}/invitations', [WorkspaceController::class, 'invitations']);
        Route::post('/workspaces/{workspace}/invitations', [WorkspaceController::class, 'invite']);
        Route::patch('/workspaces/{workspace}/members/{user}', [WorkspaceController::class, 'updateMember']);
        Route::delete('/workspaces/{workspace}/members/{user}', [WorkspaceController::class, 'removeMember']);
        Route::post('/workspaces/{workspace}/transfer', [WorkspaceController::class, 'transfer']);
        Route::post('/invitations/{token}/accept', [WorkspaceController::class, 'acceptInvitation']);

        Route::get('/billing/plans', [BillingController::class, 'plans']);

        Route::middleware('workspace')->group(function () {
            Route::get('/overview', [OverviewController::class, 'show']);

            Route::middleware('feature:funnels')->group(function () {
                Route::get('/funnels', [FunnelController::class, 'index']);
                Route::post('/funnels', [FunnelController::class, 'store']);
                Route::get('/funnels/analytics', [FunnelController::class, 'analytics']);
                Route::get('/funnels/leads', [FunnelController::class, 'leads']);
                Route::get('/funnels/{funnel}', [FunnelController::class, 'show']);
                Route::patch('/funnels/{funnel}', [FunnelController::class, 'update']);
                Route::delete('/funnels/{funnel}', [FunnelController::class, 'destroy']);
                Route::post('/funnels/{funnel}/publish', [FunnelController::class, 'publish']);
                Route::get('/funnels/{funnel}/render-payload', [FunnelRenderController::class, 'payload']);
                Route::post('/funnels/{funnel}/pause', [FunnelController::class, 'pause']);
                Route::post('/funnels/{funnel}/duplicate', [FunnelController::class, 'duplicate']);
                Route::get('/funnels/{funnel}/analytics', [FunnelController::class, 'analytics']);
                Route::post('/funnels/{funnel}/steps', [FunnelController::class, 'addStep']);
                Route::patch('/funnels/{funnel}/steps/{funnelStep}', [FunnelController::class, 'updateStep']);
                Route::put('/funnels/{funnel}/steps/{funnelStep}/content', [FunnelController::class, 'saveStepContent']);
                Route::delete('/funnels/{funnel}/steps/{funnelStep}', [FunnelController::class, 'deleteStep']);
                Route::post('/funnels/{funnel}/connections', [FunnelController::class, 'connect']);
                Route::delete('/funnels/{funnel}/connections/{funnelConnection}', [FunnelController::class, 'disconnect']);
            });

            Route::get('/sites', [SiteController::class, 'index']);
            Route::post('/sites', [SiteController::class, 'store']);
            Route::get('/sites/{site}', [SiteController::class, 'show']);
            Route::patch('/sites/{site}', [SiteController::class, 'update']);
            Route::delete('/sites/{site}', [SiteController::class, 'destroy']);
            Route::post('/sites/{site}/duplicate', [SiteController::class, 'duplicate']);

            Route::get('/sites/{site}/backups', [SiteBackupController::class, 'index']);
            Route::post('/sites/{site}/backups', [SiteBackupController::class, 'store']);
            Route::post('/sites/{site}/backups/{siteBackup}/restore', [SiteBackupController::class, 'restore']);
            Route::delete('/sites/{site}/backups/{siteBackup}', [SiteBackupController::class, 'destroy']);
            Route::post('/sites/{site}/restore', [SiteController::class, 'restore']);
            Route::get('/sites/{site}/settings', [SiteController::class, 'settings']);
            Route::put('/sites/{site}/settings', [SiteController::class, 'updateSettings']);
            // A workspace's own product catalogue and its own Stripe account.
            // Nothing here touches the platform gateway the super admin owns.
            Route::get('/orders', [OrderController::class, 'index']);
            Route::get('/coupons', [CouponController::class, 'index']);
            Route::post('/coupons', [CouponController::class, 'store']);
            Route::patch('/coupons/{coupon}', [CouponController::class, 'update']);
            Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy']);
            Route::get('/products', [ProductController::class, 'index']);
            Route::post('/products', [ProductController::class, 'store']);
            Route::get('/products/{product}', [ProductController::class, 'show']);
            Route::patch('/products/{product}', [ProductController::class, 'update']);
            Route::delete('/products/{product}', [ProductController::class, 'destroy']);
            Route::get('/payments/stripe', [WorkspacePaymentController::class, 'show']);
            Route::put('/payments/stripe', [WorkspacePaymentController::class, 'update']);
            Route::post('/payments/stripe/verify', [WorkspacePaymentController::class, 'verify']);
            Route::delete('/payments/stripe', [WorkspacePaymentController::class, 'destroy']);

            Route::get('/sites/{site}/chrome', [SiteChromeController::class, 'show']);
            Route::put('/sites/{site}/chrome', [SiteChromeController::class, 'update']);
            Route::post('/sites/{site}/chrome/adopt', [SiteChromeController::class, 'adopt']);
            Route::get('/sites/{site}/theme', [SiteController::class, 'theme']);
            Route::put('/sites/{site}/theme', [SiteController::class, 'updateTheme']);
            Route::post('/sites/{site}/publish', [SiteController::class, 'publish']);
            Route::post('/sites/{site}/renders', [SiteRenderController::class, 'store']);
            // A funnel need not have a site, so its steps upload separately.
            Route::post('/funnels/{funnel}/renders', [FunnelRenderStoreController::class, 'store']);
            // A/B testing one step. The step's own content is the control.
            Route::get('/funnels/{funnel}/steps/{step}/variants', [FunnelExperimentController::class, 'index']);
            Route::post('/funnels/{funnel}/steps/{step}/variants', [FunnelExperimentController::class, 'store']);
            Route::patch('/funnels/{funnel}/steps/{step}/variants/{variant}', [FunnelExperimentController::class, 'update']);
            Route::delete('/funnels/{funnel}/steps/{step}/variants/{variant}', [FunnelExperimentController::class, 'destroy']);
            Route::post('/funnels/{funnel}/steps/{step}/winner', [FunnelExperimentController::class, 'winner']);
            // Rules a funnel runs by itself: triggers, delays, email, webhooks.
            Route::get('/funnels/{funnel}/automations', [FunnelAutomationController::class, 'index']);
            Route::post('/funnels/{funnel}/automations', [FunnelAutomationController::class, 'store']);
            Route::patch('/funnels/{funnel}/automations/{automation}', [FunnelAutomationController::class, 'update']);
            Route::delete('/funnels/{funnel}/automations/{automation}', [FunnelAutomationController::class, 'destroy']);
            Route::get('/funnels/{funnel}/automations/{automation}/runs', [FunnelAutomationController::class, 'runs']);
            Route::get('/sites/{site}/render-payload', [SiteRenderController::class, 'payload']);
            Route::post('/sites/{site}/preview-token', [PreviewController::class, 'token']);
            Route::post('/sites/{site}/apply-template', [TemplateController::class, 'apply']);

            Route::get('/subdomains/check', [DomainController::class, 'check']);

            Route::get('/sites/{site}/pages', [PageController::class, 'index']);
            Route::post('/sites/{site}/pages', [PageController::class, 'store']);
            Route::get('/pages/{page}', [PageController::class, 'show']);
            Route::patch('/pages/{page}', [PageController::class, 'update']);
            Route::delete('/pages/{page}', [PageController::class, 'destroy']);
            Route::put('/pages/{page}/draft', [PageController::class, 'saveDraft']);
            Route::post('/pages/{page}/publish', [PageController::class, 'publish']);
            Route::get('/pages/{page}/revisions', [PageController::class, 'revisions']);
            Route::get('/pages/{page}/revisions/{revision}', [PageController::class, 'revision']);
            Route::post('/pages/{page}/revisions/{revision}/restore', [PageController::class, 'restore']);

            Route::get('/sites/{site}/domains', [DomainController::class, 'index']);
            Route::post('/sites/{site}/domains', [DomainController::class, 'store']);
            Route::post('/domains/{domain}/verify', [DomainController::class, 'verify']);
            Route::post('/domains/{domain}/primary', [DomainController::class, 'primary']);
            Route::post('/domains/{domain}/retry', [DomainController::class, 'retry']);
            Route::delete('/domains/{domain}', [DomainController::class, 'destroy']);

            Route::get('/templates', [TemplateController::class, 'index']);
            Route::get('/templates/{template}', [TemplateController::class, 'show']);
            Route::get('/block-presets', [BlockPresetController::class, 'index']);

            Route::get('/media', [MediaController::class, 'index']);
            Route::post('/media', [MediaController::class, 'store']);
            Route::get('/media/{media}', [MediaController::class, 'show']);
            Route::patch('/media/{media}', [MediaController::class, 'update']);
            Route::delete('/media/{media}', [MediaController::class, 'destroy']);

            Route::get('/sites/{site}/menus', [MenuController::class, 'show']);
            Route::put('/sites/{site}/menus', [MenuController::class, 'update']);

            Route::get('/sites/{site}/forms', [FormController::class, 'index']);
            Route::post('/sites/{site}/forms', [FormController::class, 'store']);
            Route::get('/forms/{form}', [FormController::class, 'show']);
            Route::patch('/forms/{form}', [FormController::class, 'update']);
            Route::delete('/forms/{form}', [FormController::class, 'destroy']);
            Route::get('/form-submissions', [FormController::class, 'submissions']);
            Route::get('/form-submissions/export', [FormController::class, 'export']);
            Route::patch('/form-submissions/{formSubmission}', [FormController::class, 'updateSubmission']);

            Route::get('/livechat/conversations', [LivechatController::class, 'inbox']);
            Route::get('/livechat/widgets', [LivechatController::class, 'widgets']);
            Route::get('/livechat/conversations/{livechatConversation}', [LivechatController::class, 'conversation']);
            Route::post('/livechat/conversations/{livechatConversation}/messages', [LivechatController::class, 'reply']);
            Route::post('/livechat/conversations/{livechatConversation}/typing', [LivechatController::class, 'typing']);
            Route::post('/livechat/conversations/{livechatConversation}/assign', [LivechatController::class, 'assign']);
            Route::post('/livechat/conversations/{livechatConversation}/takeover', [LivechatController::class, 'takeover']);
            Route::post('/livechat/conversations/{livechatConversation}/close', [LivechatController::class, 'close']);
            Route::post('/livechat/conversations/{livechatConversation}/reopen', [LivechatController::class, 'reopen']);
            Route::get('/sites/{site}/livechat', [LivechatController::class, 'widget']);
            Route::put('/sites/{site}/livechat', [LivechatController::class, 'updateWidget']);
            Route::get('/sites/{site}/livechat/knowledge', [LivechatController::class, 'knowledge']);
            Route::post('/sites/{site}/livechat/knowledge', [LivechatController::class, 'storeKnowledge']);
            Route::post('/sites/{site}/livechat/knowledge/sync', [LivechatController::class, 'syncKnowledge']);
            Route::delete('/livechat/knowledge/{livechatKnowledge}', [LivechatController::class, 'destroyKnowledge']);

            Route::get('/clients', [ClientController::class, 'index']);
            Route::post('/clients', [ClientController::class, 'store']);
            Route::get('/clients/{client}', [ClientController::class, 'show']);
            Route::patch('/clients/{client}', [ClientController::class, 'update']);
            Route::delete('/clients/{client}', [ClientController::class, 'destroy']);
            Route::post('/clients/{client}/contacts', [ClientController::class, 'storeContact']);
            Route::patch('/client-contacts/{clientContact}', [ClientController::class, 'updateContact']);
            Route::delete('/client-contacts/{clientContact}', [ClientController::class, 'destroyContact']);
            Route::post('/clients/{client}/sites', [ClientController::class, 'attachSite']);
            Route::delete('/clients/{client}/sites/{site}', [ClientController::class, 'detachSite']);

            Route::get('/blog-posts', [BlogPostController::class, 'index']);
            Route::post('/blog-posts', [BlogPostController::class, 'store']);
            Route::get('/blog-posts/{blogPost}', [BlogPostController::class, 'show']);
            Route::patch('/blog-posts/{blogPost}', [BlogPostController::class, 'update']);
            Route::post('/blog-posts/{blogPost}/publish', [BlogPostController::class, 'publish']);
            Route::delete('/blog-posts/{blogPost}', [BlogPostController::class, 'destroy']);
            Route::post('/sites/{site}/blog-index', [BlogPostController::class, 'ensureIndex']);

            Route::get('/activities', [ActivityController::class, 'index']);
            Route::get('/activities/actions', [ActivityController::class, 'actions']);

            Route::get('/ai/status', [AiController::class, 'status']);
            Route::middleware('throttle:ai')->group(function () {
                Route::post('/ai/generate-page', [AiController::class, 'generatePage']);
                Route::post('/ai/generate-template-copy', [AiController::class, 'generateTemplateCopy']);
                Route::post('/ai/chat', [AiController::class, 'chat']);
                Route::post('/ai/chat-stream', [AiController::class, 'chatStream']);
                Route::post('/ai/generate-block', [AiController::class, 'generateBlock']);
                Route::post('/ai/rewrite', [AiController::class, 'rewrite']);
            });
            Route::post('/ai/apply-generation', [AiController::class, 'applyGeneration']);

            Route::get('/billing/subscription', [BillingController::class, 'subscription']);
            Route::post('/billing/change-plan', [BillingController::class, 'changePlan']);
            Route::post('/billing/checkout', [BillingController::class, 'checkout']);
            Route::post('/billing/portal', [BillingController::class, 'portal']);
        });

        Route::middleware('admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/users', [AdminController::class, 'users']);
            Route::post('/users/{user}/block', [AdminController::class, 'blockUser']);
            Route::post('/users/{user}/unblock', [AdminController::class, 'unblockUser']);
            Route::post('/users/{user}/impersonate', [AdminController::class, 'impersonateUser']);
            Route::delete('/users/{user}', [AdminController::class, 'destroyUser']);
            Route::get('/workspaces', [AdminController::class, 'workspaces']);
            Route::get('/sites', [AdminController::class, 'sites']);
            Route::get('/domains', [AdminController::class, 'domains']);
            Route::get('/templates', [AdminController::class, 'templates']);
            Route::patch('/templates/{template}', [AdminController::class, 'updateTemplate']);
            Route::get('/blocks', [AdminController::class, 'blocks']);
            Route::get('/block-presets', [AdminLibraryController::class, 'presets']);
            Route::patch('/block-presets/{preset}', [AdminLibraryController::class, 'updatePreset']);
            Route::delete('/block-presets/{preset}', [AdminLibraryController::class, 'destroyPreset']);
            Route::post('/ai/generate-template', [AdminLibraryController::class, 'generateTemplate']);
            Route::post('/ai/generate-block', [AdminLibraryController::class, 'generateBlock']);
            Route::get('/plans', [AdminController::class, 'plans']);
            Route::post('/plans', [AdminController::class, 'storePlan']);
            Route::patch('/plans/{plan}', [AdminController::class, 'updatePlan']);
            Route::delete('/plans/{plan}', [AdminController::class, 'destroyPlan']);
            Route::get('/subscriptions', [AdminController::class, 'subscriptions']);
            Route::get('/storage', [AdminController::class, 'storage']);
            Route::get('/storage-settings', [AdminStorageSettingsController::class, 'show']);
            Route::put('/storage-settings', [AdminStorageSettingsController::class, 'update']);
            Route::post('/storage-settings/test', [AdminStorageSettingsController::class, 'test']);
            Route::get('/cloudflare', [AdminCloudflareController::class, 'show']);
            Route::put('/cloudflare', [AdminCloudflareController::class, 'update']);
            Route::post('/cloudflare/test', [AdminCloudflareController::class, 'test']);
            Route::get('/cloudflare/apex-addresses', [AdminCloudflareController::class, 'apexAddresses']);
            Route::get('/cloudflare/fallback-origin', [AdminCloudflareController::class, 'fallbackOrigin']);
            Route::post('/cloudflare/fallback-origin', [AdminCloudflareController::class, 'syncFallbackOrigin']);
            Route::get('/payment-gateway', [AdminPaymentGatewayController::class, 'show']);
            Route::put('/payment-gateway', [AdminPaymentGatewayController::class, 'update']);
            Route::post('/payment-gateway/test', [AdminPaymentGatewayController::class, 'test']);
            Route::get('/google-auth', [AdminGoogleAuthController::class, 'show']);
            Route::put('/google-auth', [AdminGoogleAuthController::class, 'update']);
            Route::post('/google-auth/test', [AdminGoogleAuthController::class, 'test']);
            Route::get('/forms', [AdminController::class, 'forms']);
            Route::get('/ai-settings', [AdminAiController::class, 'show']);
            Route::put('/ai-settings', [AdminAiController::class, 'update']);
            Route::post('/ai-settings/test', [AdminAiController::class, 'test']);
            Route::get('/activities', [AdminController::class, 'activities']);
            Route::get('/jobs', [AdminController::class, 'jobs']);
            Route::get('/jobs/failed', [AdminController::class, 'jobs']);
            Route::post('/failed-jobs/{id}/retry', [AdminController::class, 'retryFailedJob']);
            Route::post('/sites/{id}/suspend', function (int $id) {
                $site = Site::query()->findOrFail($id);

                return app(AdminController::class)->suspendSite($site);
            });
            Route::post('/workspaces/{id}/suspend', [AdminController::class, 'suspendWorkspace']);
            Route::get('/domains/lookup', [AdminController::class, 'lookupDomain']);
            // The way out when a hostname is stuck on a site nobody can reach.
            Route::delete('/domains/{domain}', [AdminController::class, 'destroyDomain']);
            Route::get('/health', [AdminController::class, 'health']);
            Route::get('/diagnostics', [AdminDiagnosticsController::class, 'show']);
            Route::get('/diagnostics/host', [AdminDiagnosticsController::class, 'host']);
            Route::get('/settings', [AdminController::class, 'settings']);
            Route::put('/settings', [AdminController::class, 'updateSettings']);

            Route::get('/mail-settings', [AdminMailSettingsController::class, 'show']);
            Route::put('/mail-settings', [AdminMailSettingsController::class, 'update']);
            Route::post('/mail-settings/test', [AdminMailSettingsController::class, 'test']);

            Route::get('/branding', [AdminBrandingController::class, 'show']);
            Route::post('/branding/logo', [AdminBrandingController::class, 'store']);
            Route::delete('/branding/logo', [AdminBrandingController::class, 'destroy']);
        });
    });
});
