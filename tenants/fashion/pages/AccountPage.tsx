"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Package,
  MapPin,
  CreditCard,
  X,
  LayoutGrid,
  Bell,
  User as UserIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { ProductCard } from "@/shared/components/ProductCard";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLastOrderStore } from "@/features/storefront/stores/lastOrder.store";
import { fashionProducts } from "../data/products";
import {
  demoOrderHistory,
  type DemoOrder,
  type OrderStatus,
} from "../data/orderHistory";
import { quickAddToCart } from "../utils/quickAddToCart";
import { useBuyNow } from "../hooks/useBuyNow";

type SectionKey =
  | "dashboard"
  | "orders"
  | "addresses"
  | "payment"
  | "notifications"
  | "profile"
  | "settings";

const SIDEBAR_NAV: {
  key: SectionKey;
  label: string;
  icon: typeof Package;
}[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "orders", label: "Orders", icon: Package },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "payment", label: "Payment Methods", icon: CreditCard },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

// Placeholder loyalty numbers — no rewards/coupons backend exists.
const REWARD_POINTS = 2480;
const REWARD_POINTS_TO_NEXT_TIER = 520;
const ACTIVE_COUPONS_COUNT = 3;

const STATUS_CLASSES: Record<OrderStatus, string> = {
  Delivered: "bg-green-100 text-green-800",
  "In Transit": "bg-blue-100 text-blue-800",
  Processing: "bg-slate-100 text-slate-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function OrderCard({ order }: { order: DemoOrder }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-current/10 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--brand-primary) 6%, transparent)",
          }}
        >
          <Package className="h-5 w-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">#{order.orderNumber}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_CLASSES[order.status]}`}
            >
              {order.status}
            </span>
          </div>
          <div className="mt-1 text-xs opacity-60">
            {formatDate(order.placedAt)} · {order.itemSummary} ·{" "}
            {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
          </div>
          <div className="mt-1 text-sm font-bold">
            ${order.total.toFixed(2)}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() =>
          toast(
            "Tracking isn't connected to a real carrier yet — this is a UI-only demo.",
          )
        }
        className="self-start rounded-xl border px-4 py-2.5 text-xs font-semibold sm:self-center"
        style={{
          borderColor:
            "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
        }}
      >
        Track Package
      </button>
    </div>
  );
}

/**
 * Fashion — account dashboard.
 * Gated on real auth state (useAuthStore's token, set by a real POST
 * /v2/auth/login or /v2/auth/register via pages/LoginPage.tsx's AuthForm).
 * Signed-out visitors are redirected to /login rather than shown an inline
 * sign-in form here — that UI now lives solely at /login (see that page's
 * doc comment), same pattern as pages/ProductDetailPage.tsx's auth gate.
 *
 * Orders mixes the one real order (useLastOrderStore, if the user just
 * checked out) with data/orderHistory.ts's fabricated past orders — there
 * is no GET /v2/orders list endpoint wired up. Reward points/coupons on
 * the Dashboard, Addresses, Payment Methods, Notifications, Profile, and
 * Settings are all static demo content — none of that has a backend.
 * Wishlist is the one fully real section — useWishlistStore is genuine
 * persisted client state (see that store's doc comment).
 */
export function FashionAccountPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logoutToken = useAuthStore((s) => s.setToken);
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const buyNow = useBuyNow();

  const lastOrder = useLastOrderStore((s) => s.order);

  // useAuthStore's token comes from localStorage (see shared/lib/token.ts),
  // which is unavailable during SSR — the server always renders with
  // token === null. Branching on `token` before mount would render the
  // signed-out view server-side and the signed-in view client-side for any
  // already-authenticated visitor, a hydration mismatch. Gating behind a
  // mount flag keeps the first paint identical on both sides.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && !token) router.push("/login");
  }, [hasMounted, token, router]);

  if (!hasMounted || !token) {
    return (
      <FashionStorefrontLayout hideSearch hideFooter>
        <div className="min-h-[calc(100vh-150px)]" />
      </FashionStorefrontLayout>
    );
  }

  const lastOrderDisplay: DemoOrder | null = lastOrder
    ? {
        orderNumber: lastOrder.orderNumber,
        placedAt: lastOrder.placedAt,
        status: "Processing",
        itemSummary:
          lastOrder.items.length > 1
            ? `${lastOrder.items[0]?.name} + ${lastOrder.items.length - 1} more`
            : (lastOrder.items[0]?.name ?? ""),
        itemCount: lastOrder.items.reduce((n, i) => n + i.quantity, 0),
        total: lastOrder.total,
      }
    : null;

  const orders: DemoOrder[] = [
    ...(lastOrderDisplay ? [lastOrderDisplay] : []),
    ...demoOrderHistory,
  ];
  const openOrdersCount = orders.filter((o) => o.status !== "Delivered").length;

  const displayName = user?.name || user?.username || "there";

  return (
    <FashionStorefrontLayout hideSearch hideFooter>
      <div
        className="mx-auto flex max-w-7xl gap-10 px-6 py-10"
        style={{ color: "var(--brand-primary)" }}
      >
        <aside className="hidden w-64 flex-none flex-col gap-6 lg:flex">
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 flex-none overflow-hidden rounded-full border"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
              }}
            >
              <ImagePlaceholder
                label="Profile photo"
                aspect="1/1"
                className="h-full w-full rounded-full"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{displayName}</div>
              {user?.email && (
                <div className="truncate text-xs opacity-60">{user.email}</div>
              )}
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {SIDEBAR_NAV.map(({ key, label, icon: Icon }) => {
              const active = activeSection === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSection(key)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                  style={{
                    backgroundColor: active
                      ? "var(--brand-primary)"
                      : "transparent",
                    color: active
                      ? "var(--brand-secondary)"
                      : "var(--brand-primary)",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </nav>

          <div
            className="border-t pt-4"
            style={{
              borderColor:
                "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
            }}
          >
            <button
              type="button"
              onClick={() => logoutToken(null)}
              className="text-sm font-semibold text-red-600"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
            <select
              value={activeSection}
              onChange={(event) =>
                setActiveSection(event.target.value as SectionKey)
              }
              className="h-11 flex-1 rounded-xl border bg-transparent px-3 text-sm font-semibold outline-none"
              style={{
                borderColor:
                  "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
              }}
            >
              {SIDEBAR_NAV.map(({ key, label }) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => logoutToken(null)}
              className="flex-none text-sm font-semibold text-red-600"
            >
              Sign Out
            </button>
          </div>

          {activeSection === "dashboard" && (
            <div className="flex flex-col gap-10">
              <div>
                <h1
                  className="text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Welcome back, {displayName}
                </h1>
                <p className="mt-1 text-sm opacity-60">
                  Here&rsquo;s what&rsquo;s happening with your account.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "var(--brand-secondary)",
                  }}
                >
                  <div className="text-xs font-bold uppercase tracking-wide opacity-60">
                    Reward Points
                  </div>
                  <div className="mt-3 text-3xl font-bold">
                    {REWARD_POINTS.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs opacity-60">
                    {REWARD_POINTS_TO_NEXT_TIER} pts to next tier
                  </div>
                </div>
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
                  }}
                >
                  <div className="text-xs font-bold uppercase tracking-wide opacity-60">
                    Active Coupons
                  </div>
                  <div className="mt-3 text-3xl font-bold">
                    {ACTIVE_COUPONS_COUNT}
                  </div>
                  <div className="mt-1 text-xs opacity-60">
                    Up to 25% off available
                  </div>
                </div>
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
                  }}
                >
                  <div className="text-xs font-bold uppercase tracking-wide opacity-60">
                    Open Orders
                  </div>
                  <div className="mt-3 text-3xl font-bold">
                    {openOrdersCount}
                  </div>
                  <div className="mt-1 text-xs opacity-60">
                    {openOrdersCount > 0
                      ? "In transit — arriving soon"
                      : "Nothing in progress"}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">
                    Recent Orders
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveSection("orders")}
                    className="text-sm font-semibold underline"
                  >
                    View all
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {orders.slice(0, 2).map((order) => (
                    <OrderCard key={order.orderNumber} order={order} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-lg font-bold tracking-tight">
                  Recommended for You
                </h2>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {fashionProducts.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickAdd={quickAddToCart}
                      onBuyNow={buyNow}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "orders" && (
            <div>
              <h1
                className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Orders
              </h1>
              <div className="flex flex-col gap-4">
                {orders.map((order) => (
                  <OrderCard key={order.orderNumber} order={order} />
                ))}
              </div>
            </div>
          )}

          {activeSection === "addresses" && (
            <div>
              <h1
                className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Saved Addresses
              </h1>
              <div className="flex flex-col gap-4">
                {lastOrder ? (
                  <div className="flex items-start justify-between gap-4 rounded-2xl border border-current/10 p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-11 w-11 flex-none items-center justify-center rounded-full"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--brand-primary) 6%, transparent)",
                        }}
                      >
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="text-sm leading-relaxed">
                        <div
                          className="mb-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                          style={{
                            backgroundColor:
                              "color-mix(in srgb, var(--brand-primary) 8%, transparent)",
                          }}
                        >
                          Default
                        </div>
                        <div className="font-semibold">
                          {lastOrder.shippingAddress.firstName}{" "}
                          {lastOrder.shippingAddress.lastName}
                        </div>
                        <div>{lastOrder.shippingAddress.address1}</div>
                        {lastOrder.shippingAddress.address2 && (
                          <div>{lastOrder.shippingAddress.address2}</div>
                        )}
                        <div>
                          {lastOrder.shippingAddress.city},{" "}
                          {lastOrder.shippingAddress.state}{" "}
                          {lastOrder.shippingAddress.zip}
                        </div>
                        <div>{lastOrder.shippingAddress.country}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-current/10 py-16 text-center">
                    <MapPin className="h-6 w-6 opacity-40" />
                    <p className="text-sm opacity-60">
                      No saved addresses yet.
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() =>
                    toast(
                      "Address management isn't wired up yet — this is a UI-only demo.",
                    )
                  }
                  className="self-start rounded-xl border px-5 py-2.5 text-sm font-semibold"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                  }}
                >
                  Add Address
                </button>
              </div>
            </div>
          )}

          {activeSection === "payment" && (
            <div>
              <h1
                className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Payment Methods
              </h1>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-current/10 p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-11 w-11 flex-none items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--brand-primary) 6%, transparent)",
                      }}
                    >
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="text-sm">
                      <div className="font-semibold">
                        Visa •••• •••• •••• 4242
                      </div>
                      <div className="text-xs opacity-60">Expires 12/28</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toast(
                        "Payment methods aren't wired up yet — this is a UI-only demo.",
                      )
                    }
                    aria-label="Remove card"
                  >
                    <X className="h-4 w-4 opacity-50" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toast(
                      "Payment methods aren't wired up yet — this is a UI-only demo.",
                    )
                  }
                  className="self-start rounded-xl border px-5 py-2.5 text-sm font-semibold"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                  }}
                >
                  Add Payment Method
                </button>
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div>
              <h1
                className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Notifications
              </h1>
              <div className="flex flex-col gap-3">
                {[
                  {
                    label: "Order updates",
                    desc: "Shipping and delivery status changes",
                  },
                  {
                    label: "Promotions",
                    desc: "Sales, new arrivals, and restocks",
                  },
                ].map(({ label, desc }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-current/10 p-5"
                  >
                    <div>
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-xs opacity-60">{desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toast(
                          "Notification preferences aren't wired up yet — this is a UI-only demo.",
                        )
                      }
                      aria-label={`Toggle ${label}`}
                      className="flex h-6 w-11 flex-none items-center rounded-full p-0.5"
                      style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                      <span
                        className="ml-auto block h-5 w-5 rounded-full"
                        style={{ backgroundColor: "var(--brand-secondary)" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "profile" && (
            <div>
              <h1
                className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Profile
              </h1>
              <div className="flex max-w-lg flex-col gap-4 rounded-2xl border border-current/10 p-6">
                <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  Name
                  <input
                    defaultValue={user?.name ?? ""}
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  Username
                  <input
                    defaultValue={user?.username ?? ""}
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                  Email
                  <input
                    defaultValue={user?.email ?? ""}
                    className="h-11 rounded-lg border border-current/15 px-3 text-sm font-normal outline-none focus:border-current/40"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    toast(
                      "Profile editing isn't wired up yet — this is a UI-only demo.",
                    )
                  }
                  className="self-start rounded-xl px-6 py-2.5 text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "var(--brand-secondary)",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeSection === "settings" && (
            <div>
              <h1
                className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Settings
              </h1>
              <div className="flex max-w-lg flex-col divide-y divide-current/10 rounded-2xl border border-current/10">
                {[
                  "Change password",
                  "Language & region",
                  "Privacy",
                  "Delete account",
                ].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      toast(
                        `${label} isn't wired up yet — this is a UI-only demo.`,
                      )
                    }
                    className="px-5 py-4 text-left text-sm font-semibold"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </FashionStorefrontLayout>
  );
}
