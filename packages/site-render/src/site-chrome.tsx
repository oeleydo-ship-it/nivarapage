import type { ReactNode } from "react";
import type { Menu, MenuItem } from "./types";

function hrefFor(item: MenuItem) {
  if (item.href) return item.href;
  if (item.url) return item.url;
  const slug = item.label.toLowerCase().replace(/\s+/g, "-");
  return slug === "home" ? "/" : `/${slug}`;
}

function NavList({ items }: { items: MenuItem[] }) {
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
      {items.map((item) => (
        <span key={item.id ?? item.label}>
          <a
            href={hrefFor(item)}
            target={item.target === "_blank" ? "_blank" : undefined}
            rel={item.target === "_blank" ? "noreferrer" : undefined}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {item.label}
          </a>
          {item.children?.length ? (
            <span style={{ display: "block", fontSize: 12, opacity: 0.7 }}>
              {item.children.map((child) => child.label).join(" · ")}
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

export function SiteChrome({
  menus,
  siteName,
  showBranding = true,
  children,
}: {
  menus?: Menu[] | null;
  siteName?: string;
  showBranding?: boolean;
  children: ReactNode;
}) {
  const header = menus?.find((menu) => menu.location === "header") || menus?.[0];
  const footer = menus?.find((menu) => menu.location === "footer");
  const items = header?.items ?? [];

  return (
    <>
      {items.length ? (
        <header
          style={{
            borderBottom: "1px solid color-mix(in srgb, var(--color-muted) 35%, transparent)",
          }}
        >
          <nav
            style={{
              width: "min(100% - 2rem, var(--container-width, 72rem))",
              marginInline: "auto",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBlock: "1rem",
            }}
          >
            <a href="/" style={{ color: "inherit", textDecoration: "none", fontWeight: 700 }}>
              {siteName}
            </a>
            <NavList items={items} />
          </nav>
        </header>
      ) : null}
      {children}
      {footer?.items?.length ? (
        <footer style={{ padding: "2rem", color: "var(--color-muted)" }}>
          <NavList items={footer.items} />
        </footer>
      ) : null}
      {showBranding ? <PlatformBadge /> : null}
    </>
  );
}

function PlatformBadge() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "0.75rem 1rem 1.25rem",
        fontSize: 12,
        color: "var(--color-muted)",
      }}
    >
      Made with{" "}
      <a href="https://uidesired.com" style={{ color: "inherit" }}>
        UiDesired
      </a>
    </div>
  );
}

export function menusToNavItems(menus?: Menu[] | null) {
  const header = menus?.find((menu) => menu.location === "header") || menus?.[0];
  return (header?.items ?? []).map((item) => ({
    label: item.label,
    href: hrefFor(item),
    target: item.target || undefined,
    children: item.children?.map((child) => ({
      label: child.label,
      href: hrefFor(child),
      target: child.target || undefined,
    })),
  }));
}
