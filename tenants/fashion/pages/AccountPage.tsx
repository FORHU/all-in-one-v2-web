"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Package, MapPin, CreditCard, Heart, X } from "lucide-react";
import { FashionStorefrontLayout } from "../layouts/StorefrontLayout";
import { AuthModal } from "../components/AuthModal";
import { ImagePlaceholder } from "@/shared/components/ImagePlaceholder";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLastOrderStore } from "@/features/storefront/stores/lastOrder.store";
import { useWishlistStore } from "@/features/storefront/stores/wishlist.store";
import { useLocalCartStore } from "@/features/storefront/stores/localCart.store";
import { demoOrderHistory, type OrderStatus } from "../data/orderHistory";

type TabKey = "orders" | "addresses" | "payment" | "wishlist";

const TABS: { key: TabKey; label: string }[] = [
  { key: "orders", label: "Order History" },
  { key: "addresses", label: "Saved Addresses" },
  { key: "payment", label: "Payment Methods" },
  { key: "wishlist", label: "Wishlist" },
];

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

/**
 * Fashion — account dashboard.
 * Gated on real auth state (useAuthStore's token, set by a real POST
 * /v2/auth/login or /v2/auth/register via AuthModal) — signing in here
 * requires a reachable backend and an existing/created user.
 *
 * Order History mixes the one real order (useLastOrderStore, if the user
 * just checked out) with data/orderHistory.ts's fabricated past orders —
 * there is no GET /v2/orders list endpoint wired up. Saved Addresses and
 * Payment Methods have no backend at all; both tabs show static demo
 * content. Wishlist is the one fully real tab — useWishlistStore is
 * genuine persisted client state (see that store's doc comment).
 */
export function FashionAccountPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logoutToken = useAuthStore((s) => s.setToken);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("orders");

  const lastOrder = useLastOrderStore((s) => s.order);
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeWishlistItem = useWishlistStore((s) => s.remove);
  const addCartItem = useLocalCartStore((s) => s.addItem);

  if (!token) {
    return (
      <FashionStorefrontLayout>
        <section
          className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center"
          style={{ color: "var(--brand-primary)" }}
        >
          <h1
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Your Account
          </h1>
          <p className="text-sm opacity-60">
            Sign in to view your orders, saved addresses, and account details.
          </p>
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="mt-2 rounded-2xl px-8 py-3.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            Sign In
          </button>
        </section>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </FashionStorefrontLayout>
    );
  }

  const lastOrderDisplay = lastOrder
    ? {
        orderNumber: lastOrder.orderNumber,
        placedAt: lastOrder.placedAt,
        status: "Processing" as OrderStatus,
        itemSummary:
          lastOrder.items.length > 1
            ? `${lastOrder.items[0]?.name} + ${lastOrder.items.length - 1} more`
            : (lastOrder.items[0]?.name ?? ""),
        itemCount: lastOrder.items.reduce((n, i) => n + i.quantity, 0),
        total: lastOrder.total,
      }
    : null;

  const orders = [
    ...(lastOrderDisplay ? [lastOrderDisplay] : []),
    ...demoOrderHistory,
  ];

  const moveToBag = (item: (typeof wishlistItems)[number]) => {
    addCartItem({
      productId: item.productId,
      name: item.name,
      brand: item.brand,
      price: item.price,
      imageLabel: item.imageLabel,
      size: item.sizes?.[0],
      color: item.colors?.[0],
      quantity: 1,
    });
    removeWishlistItem(item.productId);
    toast.success(`Moved ${item.name} to your bag`);
  };

  return (
    <FashionStorefrontLayout>
      <div
        className="mx-auto max-w-5xl px-6 py-12"
        style={{ color: "var(--brand-primary)" }}
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {user?.name || user?.username
                ? `Welcome back, ${user.name || user.username}`
                : "Your Account"}
            </h1>
            {user?.email && (
              <p className="mt-1 text-sm opacity-60">{user.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => logoutToken(null)}
            className="text-sm font-semibold underline opacity-70"
          >
            Sign Out
          </button>
        </div>

        <div
          className="mb-8 flex gap-1 overflow-x-auto rounded-xl border p-1"
          style={{
            borderColor:
              "color-mix(in srgb, var(--brand-primary) 15%, transparent)",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold"
              style={{
                backgroundColor:
                  activeTab === tab.key
                    ? "var(--brand-primary)"
                    : "transparent",
                color:
                  activeTab === tab.key
                    ? "var(--brand-secondary)"
                    : "var(--brand-primary)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "orders" && (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.orderNumber}
                className="flex flex-col gap-4 rounded-2xl border border-current/10 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
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
                      <span className="text-sm font-bold">
                        #{order.orderNumber}
                      </span>
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
            ))}
          </div>
        )}

        {activeTab === "addresses" && (
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
                <p className="text-sm opacity-60">No saved addresses yet.</p>
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
        )}

        {activeTab === "payment" && (
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
                  <div className="font-semibold">Visa •••• •••• •••• 4242</div>
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
        )}

        {activeTab === "wishlist" && (
          <div>
            {wishlistItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-current/10 py-16 text-center">
                <Heart className="h-6 w-6 opacity-40" />
                <p className="text-sm opacity-60">Your wishlist is empty.</p>
                <Link
                  href="/products"
                  className="mt-1 rounded-2xl px-6 py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {wishlistItems.map((item) => (
                  <div key={item.productId} className="flex flex-col gap-2.5">
                    <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
                      <ImagePlaceholder
                        label={item.imageLabel}
                        aspect="3/4"
                        className="h-full w-full"
                      />
                      <button
                        type="button"
                        onClick={() => removeWishlistItem(item.productId)}
                        aria-label={`Remove ${item.name} from wishlist`}
                        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90"
                      >
                        <X
                          className="h-4 w-4"
                          style={{ color: "var(--brand-primary)" }}
                        />
                      </button>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wide opacity-60">
                        {item.brand}
                      </div>
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="text-sm font-bold">${item.price}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => moveToBag(item)}
                      className="rounded-xl py-2.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: "var(--brand-primary)" }}
                    >
                      Move to Bag
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </FashionStorefrontLayout>
  );
}
