"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Toaster } from "sonner";
import { useFashionColorMode } from "../stores/colorMode.store";
import { getFashionColors } from "../theme";

/**
 * Fashion — brand-matched <Toaster>, rendered from layouts/StorefrontLayout.tsx
 * in place of the generic one src/app/layout.tsx renders for every other
 * tenant. Sonner's default `richColors` is a plain green/red palette that
 * clashes with the tenant's ink/bone/brass aesthetic; Sonner also portals
 * toasts to document.body, outside StorefrontLayout's own
 * --brand-primary/--brand-secondary override, so plain `var(--brand-primary)`
 * CSS wouldn't track the light/dark toggle from here anyway. Overriding
 * Sonner's own --normal-, --success-, and --error- prefixed variables (its
 * documented customization hook — see sonner/dist/styles.css) sidesteps
 * both problems: the colors are computed from getFashionColors(mode) in JS
 * and handed straight to the values Sonner already reads.
 */
export function FashionToaster() {
  const colorMode = useFashionColorMode((s) => s.mode);

  // Same hydration-safety gating as StorefrontLayout.tsx — mode persists to
  // localStorage, unavailable during SSR.
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const mode = hasMounted ? colorMode : "dark";
  const colors = getFashionColors(mode);

  const toastVars = {
    "--normal-bg": colors.ink2,
    "--normal-border": colors.hairline,
    "--normal-text": colors.bone,
    "--success-bg": colors.ink2,
    "--success-border": colors.brass,
    "--success-text": colors.bone,
    "--error-bg": colors.ink2,
    "--error-border": colors.brick,
    "--error-text": colors.bone,
  } as CSSProperties;

  return <Toaster position="bottom-right" richColors style={toastVars} />;
}
