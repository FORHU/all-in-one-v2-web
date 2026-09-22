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
import { OrderTrackingModal } from "../components/OrderTrackingModal";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLastOrderStore } from "@/features/storefront/stores/lastOrder.store";
import { useMyOrders } from "@/features/storefront/hooks/queries/useMyOrders";
import { useNotifications } from "@/features/storefront/hooks/queries/useNotifications";
import { useMarkNotificationRead } from "@/features/storefront/hooks/mutations/useMarkNotificationRead";
import { useCancelOrder } from "@/features/storefront/hooks/mutations/useCancelOrder";
import { ApiError } from "@/shared/errors/api-error";
import type {
  Order,
  OrderStatus,
} from "@/features/storefront/contracts/order.contract";
import { fashionProducts } from "../data/products";
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

const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  PROCESSING: "bg-blue-100 text-blue-800",
  PARTIALLY_FULFILLED: "bg-amber-100 text-amber-800",
  FULFILLED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  PARTIALLY_FULFILLED: "Partially Fulfilled",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function OrderCard({
  order,
  onTrack,
  tenantSlug,
}: {
  order: Order;
  onTrack: (order: Order) => void;
  tenantSlug: string;
}) {
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const itemSummary =
    order.items.length > 1
      ? `${order.items[0]?.productTitle} + ${order.items.length - 1} more`
      : (order.items[0]?.productTitle ?? "");

  const { mutate: cancelOrder, isPending: isCancelling } =
    useCancelOrder(tenantSlug);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const handleCancel = () => {
    cancelOrder(order.id, {
      onSuccess: () => {
        toast.success(`Order #${order.orderNumber} cancelled.`);
        setConfirmingCancel(false);
      },
      onError: (err) => {
        // Most likely a 409: already placed with a supplier, or already
        // paid — the API's own wording (surfaced via the global error
        // toast) explains why, so no extra message needed here.
        if (!(err instanceof ApiError)) setConfirmingCancel(false);
      },
    });
  };

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
              {STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="mt-1 text-xs opacity-60">
            {formatDate(order.createdAt)} · {itemSummary} · {itemCount} item
            {itemCount === 1 ? "" : "s"}
          </div>
          <div className="mt-1 text-sm font-bold">
            ${order.totalAmount.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => onTrack(order)}
          className="self-start rounded-xl border px-4 py-2.5 text-xs font-semibold sm:self-center"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
          }}
        >
          Track Package
        </button>
        {/* Only while PENDING — once an admin has approved/placed it with a
            supplier, the order advances to PROCESSING (see the API's
            createSupplierOrderWithItems) and can no longer be cancelled
            here; the same rule the backend enforces (see cancelOrder's
            409s), mirrored here so the button doesn't offer an action
            that's guaranteed to fail. */}
        {order.status === "PENDING" &&
          (confirmingCancel ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-red-600">
                Cancel this order?
              </span>
              <button
                type="button"
                onClick={() => setConfirmingCancel(false)}
                disabled={isCancelling}
                className="rounded-xl border px-3 py-2 text-xs font-semibold disabled:opacity-40"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                }}
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
              >
                {isCancelling ? "Cancelling…" : "Confirm"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingCancel(true)}
              className="self-start rounded-xl border border-red-600/30 px-4 py-2.5 text-xs font-semibold text-red-600 sm:self-center"
            >
              Cancel Order
            </button>
          ))}
      </div>
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
 * Orders is real: GET /v2/orders/my-orders (see
 * hooks/queries/useMyOrders.ts), populated by pages/CheckoutPage.tsx's
 * "Place Order" calling POST /v2/orders/checkout-direct. Reward
 * points/coupons on the Dashboard, Addresses, Payment Methods,
 * Notifications, Profile, and Settings are all still static demo
 * content — none of those have a backend yet.
 */
export function FashionAccountPage({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logoutToken = useAuthStore((s) => s.setToken);
  const [activeSection, setActiveSection] = useState<SectionKey>("dashboard");
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
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

  // Same `enabled` gating as useLatestAddress in CheckoutPage.tsx — without
  // it, a stale/expired token still fires this query and feeds the
  // "Session expired" toast-spam loop.
  const { data: ordersData, isLoading: isLoadingOrders } = useMyOrders(
    tenantSlug,
    { page: 1, limit: 20 },
    hasMounted && !!token,
  );

  const { data: notificationsData, isLoading: isLoadingNotifications } =
    useNotifications(tenantSlug, hasMounted && !!token);
  const { mutate: markNotificationRead, isPending: isMarkingNotificationRead } =
    useMarkNotificationRead(tenantSlug);

  if (!hasMounted || !token) {
    return (
      <FashionStorefrontLayout hideSearch hideFooter>
        <div className="min-h-[calc(100vh-150px)]" />
      </FashionStorefrontLayout>
    );
  }

  const orders: Order[] = ordersData?.items ?? [];
  const notifications = notificationsData ?? [];

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
                  {isLoadingOrders ? (
                    <p className="text-sm opacity-60">Loading orders...</p>
                  ) : orders.length === 0 ? (
                    <p className="text-sm opacity-60">
                      No orders yet — your recent orders will show up here.
                    </p>
                  ) : (
                    orders
                      .slice(0, 2)
                      .map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onTrack={setTrackingOrder}
                          tenantSlug={tenantSlug}
                        />
                      ))
                  )}
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
                {isLoadingOrders ? (
                  <p className="text-sm opacity-60">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-current/10 py-16 text-center">
                    <Package className="h-6 w-6 opacity-40" />
                    <p className="text-sm opacity-60">
                      You haven&rsquo;t placed any orders yet.
                    </p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onTrack={setTrackingOrder}
                      tenantSlug={tenantSlug}
                    />
                  ))
                )}
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

              <div className="mb-8 flex flex-col gap-3">
                {isLoadingNotifications ? (
                  <p className="text-sm opacity-60">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-current/10 py-16 text-center">
                    <Bell className="h-6 w-6 opacity-40" />
                    <p className="text-sm opacity-60">
                      You&rsquo;re all caught up — no notifications yet.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start justify-between gap-4 rounded-2xl border p-5"
                      style={{
                        borderColor: n.isRead
                          ? "color-mix(in srgb, var(--brand-primary) 10%, transparent)"
                          : "var(--brand-primary)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {!n.isRead && (
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-2 w-2 flex-none rounded-full"
                            style={{ backgroundColor: "var(--brand-primary)" }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-bold">{n.title}</div>
                          <div className="mt-0.5 text-sm opacity-70">
                            {n.message}
                          </div>
                          <div className="mt-1 text-xs opacity-50">
                            {formatDate(n.createdAt)}
                          </div>
                        </div>
                      </div>
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(n.id)}
                          disabled={isMarkingNotificationRead}
                          className="flex-none text-xs font-semibold underline disabled:opacity-40"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <h2 className="mb-4 text-lg font-bold tracking-tight">
                Preferences
              </h2>
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
              <div className="max-w-lg rounded-2xl border border-current/10 p-6">
                {isEditingProfile ? (
                  <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                      Name
                      <input
                        defaultValue={user?.name ?? ""}
                        className="h-11 rounded-lg border border-current/15 bg-transparent px-3 text-sm font-normal outline-none focus:border-current/40"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                      Username
                      <input
                        defaultValue={user?.username ?? ""}
                        className="h-11 rounded-lg border border-current/15 bg-transparent px-3 text-sm font-normal outline-none focus:border-current/40"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-xs font-semibold opacity-70">
                      Email
                      <input
                        defaultValue={user?.email ?? ""}
                        className="h-11 rounded-lg border border-current/15 bg-transparent px-3 text-sm font-normal outline-none focus:border-current/40"
                      />
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          toast(
                            "Profile editing isn't wired up yet — this is a UI-only demo.",
                          );
                          setIsEditingProfile(false);
                        }}
                        className="rounded-xl px-6 py-2.5 text-sm font-semibold"
                        style={{
                          backgroundColor: "var(--brand-primary)",
                          color: "var(--brand-secondary)",
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="text-sm font-semibold underline opacity-70"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-60">
                        Name
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {user?.name || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-60">
                        Username
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {user?.username || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide opacity-60">
                        Email
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {user?.email || "—"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="mt-2 self-start rounded-xl px-6 py-2.5 text-sm font-semibold"
                      style={{
                        backgroundColor: "var(--brand-primary)",
                        color: "var(--brand-secondary)",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
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

      <OrderTrackingModal
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />
    </FashionStorefrontLayout>
  );
}
