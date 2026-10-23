"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Headphones,
  Heart,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { ElectronicsStorefrontLayout } from "../layouts/StorefrontLayout";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useCurrentUser } from "@/features/auth/hooks/queries/useCurrentUser";
import { useLogout } from "@/features/auth/hooks/mutations/useLogout";
import { useMyOrders } from "@/features/storefront/hooks/queries/useMyOrders";
import { useLatestAddress } from "@/features/storefront/hooks/queries/useLatestAddress";
import { useCancelOrder } from "@/features/storefront/hooks/mutations/useCancelOrder";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { ApiError } from "@/shared/errors/api-error";
import type {
  Order,
  OrderStatus,
} from "@/features/storefront/contracts/order.contract";
import { DIGITFRIEND_COLORS as COLORS } from "../theme";

/** Orders fetched for the history list and the stats computed from it. */
const ORDER_LIMIT = 50;

const STATUS_STYLES: Record<OrderStatus, { bg: string; fg: string }> = {
  PENDING: { bg: "#f1f1ec", fg: "#5a5f69" },
  PROCESSING: { bg: "#e3e9ff", fg: "#2f4c7a" },
  PARTIALLY_FULFILLED: { bg: "#fcebd3", fg: "#8a5a1e" },
  FULFILLED: { bg: "#dff0e6", fg: "#2f6b46" },
  CANCELLED: { bg: "#fde2e1", fg: "#b3473d" },
  REFUNDED: { bg: "#f1f1ec", fg: "#8a8578" },
  REJECTED: { bg: "#fde2e1", fg: "#b3473d" },
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Awaiting payment",
  PROCESSING: "Processing",
  PARTIALLY_FULFILLED: "Partially shipped",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  REJECTED: "Rejected",
};

/** Orders still on their way (unpaid, paid, or partly shipped). */
const ACTIVE_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "PARTIALLY_FULFILLED",
];
/** Orders that were actually paid for — what "Total spent" adds up. */
const PAID_STATUSES: OrderStatus[] = [
  "PROCESSING",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
];
const CLOSED_STATUSES: OrderStatus[] = ["CANCELLED", "REFUNDED", "REJECTED"];

type OrderFilter = "all" | "active" | "completed" | "closed";
const ORDER_FILTERS: {
  id: OrderFilter;
  label: string;
  test: (s: OrderStatus) => boolean;
}[] = [
  { id: "all", label: "All", test: () => true },
  {
    id: "active",
    label: "In progress",
    test: (s) => ACTIVE_STATUSES.includes(s),
  },
  { id: "completed", label: "Completed", test: (s) => s === "FULFILLED" },
  {
    id: "closed",
    label: "Cancelled",
    test: (s) => CLOSED_STATUSES.includes(s),
  },
];

const cardStyle: React.CSSProperties = {
  backgroundColor: COLORS.cardBg,
  border: `1px solid ${COLORS.border}`,
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatDate(date: Date | string, withYear = true) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear && { year: "numeric" }),
  });
}

function initialsOf(text: string) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? parts[0][0] + parts[parts.length - 1][0]
      : text.slice(0, 2);
  return letters.toUpperCase();
}

function StatTile({
  Icon,
  label,
  value,
  hint,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      className="flex items-center gap-3.5 rounded-[18px] p-4"
      style={cardStyle}
    >
      <span
        className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
        style={{ backgroundColor: COLORS.accent }}
      >
        <Icon size={18} color={COLORS.accentInk} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className="text-[11px] font-medium uppercase tracking-wide"
          style={{ color: COLORS.muted, fontFamily: "var(--font-mono)" }}
        >
          {label}
        </span>
        <span
          className="truncate text-xl font-bold"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {value}
        </span>
        {hint && (
          <span className="text-[11px]" style={{ color: COLORS.muted }}>
            {hint}
          </span>
        )}
      </span>
    </div>
  );
}

function SidebarCard({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] p-5" style={cardStyle}>
      <h2 className="m-0 mb-3.5 flex items-center gap-2 text-sm font-bold">
        <Icon size={16} />
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
      <dt style={{ color: COLORS.muted }}>{label}</dt>
      <dd className="m-0 min-w-0 truncate text-right font-medium">{value}</dd>
    </div>
  );
}

function OrderCard({
  order,
  tenantSlug,
}: {
  order: Order;
  tenantSlug: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const { mutate: cancelOrder, isPending: isCancelling } =
    useCancelOrder(tenantSlug);

  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const status = STATUS_STYLES[order.status];
  const previewItems = order.items.slice(0, 3);

  const handleCancel = () => {
    cancelOrder(order.id, {
      onSuccess: () => {
        toast.success(`Order #${order.orderNumber} cancelled.`);
        setConfirmingCancel(false);
      },
      onError: (err) => {
        if (!(err instanceof ApiError)) setConfirmingCancel(false);
      },
    });
  };

  return (
    <article className="rounded-[20px] p-5" style={cardStyle}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {/* Product photo stack */}
          <div className="flex flex-none -space-x-3">
            {previewItems.map((item) => (
              <ImagePlaceholder
                key={item.id}
                imageUrl={item.imageUrl}
                label={item.productTitle}
                aspect="1/1"
                className="h-12 w-12 overflow-hidden rounded-xl border-2 border-white text-[8px]"
              />
            ))}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">#{order.orderNumber}</span>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{ backgroundColor: status.bg, color: status.fg }}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <div className="mt-1 text-xs" style={{ color: COLORS.muted }}>
              {formatDate(order.createdAt)} · {itemCount} item
              {itemCount === 1 ? "" : "s"}
            </div>
            <div
              className="mt-0.5 text-base font-bold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {money(order.totalAmount)}
            </div>
          </div>
        </div>
        <div className="flex flex-none items-start gap-2 sm:items-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="flex items-center gap-1 self-start rounded-xl border px-4 py-2.5 text-xs font-semibold sm:self-center"
            style={{ borderColor: COLORS.borderStrong }}
          >
            {expanded ? "Hide details" : "View details"}
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform"
              style={{ transform: expanded ? "rotate(180deg)" : undefined }}
            />
          </button>
          {order.status === "PENDING" &&
            (confirmingCancel ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingCancel(false)}
                  disabled={isCancelling}
                  className="rounded-xl border px-3 py-2 text-xs font-semibold disabled:opacity-40"
                  style={{ borderColor: COLORS.borderStrong }}
                >
                  Keep it
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                  style={{ backgroundColor: "#b3473d" }}
                >
                  {isCancelling ? "Cancelling…" : "Confirm"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingCancel(true)}
                className="self-start rounded-xl border px-4 py-2.5 text-xs font-semibold sm:self-center"
                style={{ borderColor: "#e2b6ae", color: "#b3473d" }}
              >
                Cancel order
              </button>
            ))}
        </div>
      </div>

      {expanded && (
        <div
          className="mt-4 grid gap-5 border-t pt-4 sm:grid-cols-[minmax(0,1fr)_220px]"
          style={{ borderColor: COLORS.border }}
        >
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <ImagePlaceholder
                  imageUrl={item.imageUrl}
                  label={item.productTitle}
                  aspect="1/1"
                  className="h-14 w-14 flex-none overflow-hidden rounded-xl text-[9px]"
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold leading-snug">
                    {item.productTitle}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.muted }}>
                    {money(item.unitPrice)} × {item.quantity}
                    {item.sku ? ` · SKU ${item.sku}` : ""}
                  </div>
                </div>
                <span className="text-sm font-bold">
                  {money(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl
            className="m-0 rounded-xl p-3.5 text-sm"
            style={{ backgroundColor: COLORS.bg }}
          >
            <DetailRow label="Subtotal" value={money(order.subtotal)} />
            {order.discountAmount > 0 && (
              <DetailRow
                label="Discount"
                value={`-${money(order.discountAmount)}`}
              />
            )}
            <DetailRow
              label="Shipping"
              value={
                order.shippingAmount === 0
                  ? "Free"
                  : money(order.shippingAmount)
              }
            />
            <DetailRow label="Tax" value={money(order.taxAmount)} />
            <div
              className="mt-1.5 flex justify-between border-t pt-2 font-bold"
              style={{ borderColor: COLORS.borderStrong }}
            >
              <span>Total</span>
              <span>{money(order.totalAmount)}</span>
            </div>
          </dl>
        </div>
      )}
    </article>
  );
}

/**
 * DigitFriend — account page. Everything shown is real data:
 *  - profile banner + account details from GET /v2/users/me
 *    (useCurrentUser: name, username, email, verified flag, member since,
 *    last sign-in), with a working Sign out (useLogout);
 *  - stats computed from the shopper's own orders (GET /v2/orders/my-orders,
 *    latest ORDER_LIMIT) — "Total spent" counts paid orders only — plus the
 *    wishlist count from useWishlistStore;
 *  - order history with status filters, product photos and a per-order
 *    breakdown; PENDING (unpaid) orders can still be cancelled;
 *  - the saved delivery address (GET /v2/addresses/latest), which is
 *    added/changed at checkout.
 * Gated on real auth state; signed-out visitors are redirected to /login.
 */
export function ElectronicsAccountPage({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const [filter, setFilter] = useState<OrderFilter>("all");

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  useEffect(() => {
    if (hasMounted && !token) router.push("/login");
  }, [hasMounted, token, router]);

  const signedIn = hasMounted && !!token;
  const { data: me } = useCurrentUser(signedIn);
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    isError: ordersError,
  } = useMyOrders(tenantSlug, { page: 1, limit: ORDER_LIMIT }, signedIn);
  const { data: address, isLoading: isLoadingAddress } = useLatestAddress(
    tenantSlug,
    signedIn,
  );
  const { mutate: logout, isPending: isSigningOut } = useLogout();

  const orders = useMemo(() => ordersData?.items ?? [], [ordersData]);
  const stats = useMemo(
    () => ({
      active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
      spent: orders
        .filter((o) => PAID_STATUSES.includes(o.status))
        .reduce((sum, o) => sum + o.totalAmount, 0),
    }),
    [orders],
  );
  const activeFilter = ORDER_FILTERS.find((f) => f.id === filter)!;
  const shownOrders = orders.filter((o) => activeFilter.test(o.status));
  const totalOrders = ordersData?.total ?? 0;
  const partialStats = totalOrders > orders.length;

  const handleSignOut = () =>
    logout(undefined, {
      onSettled: () => {
        toast.success("Signed out.");
        router.push("/");
      },
    });

  if (!signedIn) {
    return (
      <ElectronicsStorefrontLayout>
        <div className="min-h-screen" style={{ backgroundColor: COLORS.bg }} />
      </ElectronicsStorefrontLayout>
    );
  }

  const displayName = me?.name || me?.username || "";

  return (
    <ElectronicsStorefrontLayout>
      <div
        className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:px-10"
        style={{ color: COLORS.ink }}
      >
        {/* Profile banner */}
        <section
          className="flex flex-col gap-5 rounded-[24px] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7"
          style={{ backgroundColor: COLORS.ink, colorScheme: "dark" }}
        >
          <div className="flex min-w-0 items-center gap-4">
            <span
              className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl text-xl font-bold"
              style={{
                backgroundColor: COLORS.accent,
                color: COLORS.accentInk,
                fontFamily: "var(--font-heading)",
              }}
              aria-hidden="true"
            >
              {displayName ? initialsOf(displayName) : "·"}
            </span>
            <div className="min-w-0 text-white">
              <h1
                className="m-0 truncate text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {displayName ? `Hi, ${displayName}` : "Your account"}
              </h1>
              <div
                className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
                style={{ color: COLORS.headerMuted }}
              >
                {me?.username && <span>@{me.username}</span>}
                {me?.email && (
                  <span className="flex items-center gap-1">
                    {me.email}
                    {me.isEmailVerified && (
                      <BadgeCheck
                        size={15}
                        color={COLORS.accent}
                        aria-label="Verified email"
                      />
                    )}
                  </span>
                )}
                {me?.createdAt && (
                  <span>Member since {formatDate(me.createdAt)}</span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex h-11 flex-none items-center justify-center gap-2 self-start rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50 sm:self-center"
            style={{ border: `1px solid ${COLORS.headerPanelBorder}` }}
          >
            <LogOut size={16} />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </button>
        </section>

        {/* Stats */}
        <section
          aria-label="Account summary"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          <StatTile
            Icon={ShoppingBag}
            label="Orders"
            value={isLoadingOrders ? "…" : String(totalOrders)}
          />
          <StatTile
            Icon={Truck}
            label="In progress"
            value={isLoadingOrders ? "…" : String(stats.active)}
          />
          <StatTile
            Icon={Wallet}
            label="Total spent"
            value={isLoadingOrders ? "…" : money(stats.spent)}
            hint={partialStats ? `Last ${ORDER_LIMIT} orders` : "Paid orders"}
          />
          <StatTile
            Icon={Heart}
            label="Saved items"
            value={String(wishlistCount)}
          />
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Order history */}
          <section aria-label="Order history" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                className="m-0 text-xl font-bold tracking-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Order history
              </h2>
              {orders.length > 0 && (
                <div className="flex flex-wrap gap-1.5" role="group">
                  {ORDER_FILTERS.map((f) => {
                    const on = f.id === filter;
                    const count = orders.filter((o) => f.test(o.status)).length;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setFilter(f.id)}
                        className="h-9 rounded-full px-3.5 text-xs font-semibold"
                        style={{
                          border: `1px solid ${on ? COLORS.ink : COLORS.borderStrong}`,
                          backgroundColor: on ? COLORS.ink : COLORS.cardBg,
                          color: on ? "#ffffff" : COLORS.ink,
                        }}
                      >
                        {f.label} · {count}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {isLoadingOrders ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[92px] animate-pulse rounded-[20px]"
                  style={{ backgroundColor: COLORS.border }}
                />
              ))
            ) : ordersError ? (
              <div
                className="rounded-[20px] px-6 py-12 text-center"
                style={{
                  backgroundColor: COLORS.cardBg,
                  border: `1px dashed ${COLORS.borderStrong}`,
                }}
              >
                <p className="m-0 text-base font-bold">
                  Couldn&apos;t load your orders
                </p>
                <p className="m-0 mt-1 text-sm" style={{ color: COLORS.muted }}>
                  Please refresh the page in a moment.
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div
                className="flex flex-col items-center gap-3 rounded-[20px] px-6 py-14 text-center"
                style={{
                  backgroundColor: COLORS.cardBg,
                  border: `1px dashed ${COLORS.borderStrong}`,
                }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: COLORS.bg }}
                >
                  <Package size={22} />
                </span>
                <p
                  className="m-0 text-lg font-bold"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  No orders yet
                </p>
                <p className="m-0 text-sm" style={{ color: COLORS.muted }}>
                  Orders you place will show up here.
                </p>
                <Link
                  href="/shop"
                  className="mt-1 flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white"
                  style={{ backgroundColor: COLORS.ink }}
                >
                  Start shopping
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : shownOrders.length === 0 ? (
              <p
                className="m-0 rounded-[20px] px-6 py-10 text-center text-sm"
                style={{ ...cardStyle, color: COLORS.muted }}
              >
                No {activeFilter.label.toLowerCase()} orders.
              </p>
            ) : (
              shownOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  tenantSlug={tenantSlug}
                />
              ))
            )}
          </section>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            <SidebarCard title="Account details" Icon={BadgeCheck}>
              <dl className="m-0">
                <DetailRow label="Name" value={me?.name || "—"} />
                <DetailRow
                  label="Username"
                  value={me?.username ? `@${me.username}` : "—"}
                />
                <DetailRow label="Email" value={me?.email ?? "—"} />
                <DetailRow
                  label="Email status"
                  value={
                    me?.isEmailVerified == null
                      ? "—"
                      : me.isEmailVerified
                        ? "Verified"
                        : "Not verified"
                  }
                />
                <DetailRow
                  label="Member since"
                  value={me?.createdAt ? formatDate(me.createdAt) : "—"}
                />
                <DetailRow
                  label="Last sign-in"
                  value={me?.lastLoginAt ? formatDate(me.lastLoginAt) : "—"}
                />
              </dl>
            </SidebarCard>

            <SidebarCard title="Delivery address" Icon={MapPin}>
              {isLoadingAddress ? (
                <p className="m-0 text-sm" style={{ color: COLORS.muted }}>
                  Loading…
                </p>
              ) : address ? (
                <div className="text-sm leading-relaxed">
                  <div className="font-semibold">{address.fullName}</div>
                  {address.phone && (
                    <div style={{ color: COLORS.muted }}>{address.phone}</div>
                  )}
                  <div className="mt-1" style={{ color: COLORS.muted }}>
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                    <br />
                    {address.city}
                    {address.state ? `, ${address.state}` : ""}{" "}
                    {address.postalCode}, {address.country}
                  </div>
                  <p
                    className="m-0 mt-3 text-xs"
                    style={{ color: COLORS.muted }}
                  >
                    Used for your next order — change it at checkout.
                  </p>
                </div>
              ) : (
                <p className="m-0 text-sm" style={{ color: COLORS.muted }}>
                  No saved address yet. You&apos;ll add one at checkout.
                </p>
              )}
            </SidebarCard>

            <SidebarCard title="Need help?" Icon={Headphones}>
              <div className="flex flex-col gap-1">
                {[
                  { href: "/support#shipping", label: "Shipping & delivery" },
                  { href: "/support#returns", label: "Returns & refunds" },
                  { href: "/support#contact", label: "Contact support" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium hover:bg-[#f3f3ef]"
                  >
                    {link.label}
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            </SidebarCard>
          </aside>
        </div>
      </div>
    </ElectronicsStorefrontLayout>
  );
}
