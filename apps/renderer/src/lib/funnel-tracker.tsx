"use client";

import { useEffect, useState } from "react";

type FunnelContext = {
  funnel_id: number;
  step_id: number;
  funnel_slug: string;
  step_slug: string;
  next_step?: string | null;
};

function identity(key: string) {
  const current = window.localStorage.getItem(key);
  if (current) return current;
  const created = crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export function FunnelTracker({ context }: { context: FunnelContext }) {
  const [consent, setConsent] = useState<"loading" | "pending" | "essential" | "analytics">("loading");

  useEffect(() => {
    const stored = window.localStorage.getItem("uidesired_funnel_consent");
    setConsent(stored === "analytics" || stored === "essential" ? stored : "pending");
  }, []);

  useEffect(() => {
    if (consent !== "analytics") return;
    const visitorId = identity("uidesired_funnel_visitor");
    const sessionKey = `uidesired_funnel_session_${context.funnel_id}`;
    const sessionId = identity(sessionKey);
    const params = new URLSearchParams(window.location.search);
    const endpoint = `/api/funnels/${context.funnel_id}/steps/${context.step_id}/events`;
    const send = (event_type: string, metadata: Record<string, unknown> = {}) => {
      void fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        keepalive: true,
        body: JSON.stringify({
          event_type,
          idempotency_key: crypto.randomUUID(),
          visitor_id: visitorId,
          session_id: sessionId,
          consent,
          metadata,
          url: window.location.href,
          referrer: document.referrer || null,
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
          utm_term: params.get("utm_term"),
          utm_content: params.get("utm_content"),
        }),
      });
    };
    send("step_view");
    const click = (event: MouseEvent) => {
      const element = (event.target as HTMLElement | null)?.closest("a,button");
      if (element) send("button_click", { label: element.textContent?.trim().slice(0, 120), href: element instanceof HTMLAnchorElement ? element.href : null });
    };
    const formSuccess = (event: Event) => {
      send("form_submission", (event as CustomEvent<Record<string, unknown>>).detail || {});
      if (context.next_step) window.setTimeout(() => window.location.assign(`/f/${context.funnel_slug}/${context.next_step}`), 450);
    };
    document.addEventListener("click", click);
    window.addEventListener("uidesired:form-submitted", formSuccess);
    return () => { document.removeEventListener("click", click); window.removeEventListener("uidesired:form-submitted", formSuccess); };
  }, [consent, context.funnel_id, context.funnel_slug, context.next_step, context.step_id]);

  if (consent !== "pending") return null;
  const choose = (value: "essential" | "analytics") => {
    window.localStorage.setItem("uidesired_funnel_consent", value);
    setConsent(value);
  };
  return (
    <div role="dialog" aria-label="Cookie preferences" style={{ position: "fixed", zIndex: 9998, left: 20, right: 20, bottom: 20, margin: "auto", maxWidth: 720, borderRadius: 16, border: "1px solid #d4d4d8", background: "#fff", color: "#18181b", padding: 18, boxShadow: "0 20px 50px rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 340px" }}><strong style={{ display: "block", marginBottom: 4 }}>Your privacy choices</strong><span style={{ fontSize: 14, color: "#52525b" }}>Allow anonymous analytics to help improve this funnel, or continue with essential storage only.</span></div>
      <div style={{ display: "flex", gap: 8 }}><button onClick={() => choose("essential")} style={{ border: "1px solid #d4d4d8", background: "white", borderRadius: 9, padding: "9px 13px", cursor: "pointer" }}>Essential only</button><button onClick={() => choose("analytics")} style={{ border: 0, background: "#2563eb", color: "white", borderRadius: 9, padding: "9px 13px", cursor: "pointer" }}>Allow analytics</button></div>
    </div>
  );
}
