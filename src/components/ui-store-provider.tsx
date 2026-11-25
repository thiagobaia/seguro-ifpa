"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import { createUiStore, type UiStore } from "@/stores/ui-store";

const UiStoreContext = createContext<StoreApi<UiStore> | null>(null);

export function UiStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createUiStore());
  return <UiStoreContext.Provider value={store}>{children}</UiStoreContext.Provider>;
}

export function useUiStore<T>(selector: (state: UiStore) => T): T {
  const store = useContext(UiStoreContext);
  if (!store) throw new Error("useUiStore precisa estar dentro de UiStoreProvider");
  return useStore(store, selector);
}
