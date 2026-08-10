import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

const badges = [
  { label: "Free Shipping", detail: "On orders over $50", Icon: Truck },
  { label: "Secure Checkout", detail: "Encrypted payments", Icon: ShieldCheck },
  { label: "Easy Returns", detail: "30-day return window", Icon: RotateCcw },
];

export function TrustBadges() {
  return (
    <section
      className="border-t"
      style={{
        borderColor:
          "color-mix(in srgb, var(--brand-primary) 12%, transparent)",
      }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-3">
        {badges.map(({ label, detail, Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4"
            style={{ color: "var(--brand-primary)" }}
          >
            <Icon className="h-6 w-6 shrink-0" />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {label}
              </p>
              <p
                className="text-sm opacity-60"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
