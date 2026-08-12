import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedAddress {
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

type SavedAddressState = {
  address: SavedAddress | null;
  setAddress: (address: SavedAddress) => void;
};

/**
 * The shopper's one saved delivery address, persisted to localStorage.
 * Backs the "Review Order" checkout page's address card — there's no
 * multi-address book (no add/select-among-several UI), just a single
 * saved address that "Change" edits in place. No real customer-address
 * backend exists yet (see docs on CommerceShippingAddress), so this is a
 * client-only stand-in, same precedent as localCart.store.ts.
 */
export const useSavedAddressStore = create<SavedAddressState>()(
  persist(
    (set) => ({
      address: null,
      setAddress: (address) => set({ address }),
    }),
    { name: "fashion-saved-address" },
  ),
);
