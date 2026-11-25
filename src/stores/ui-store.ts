import { createStore } from "zustand/vanilla";

export type FeedCategory = "Para você" | "Prevenção" | "Bem-estar";
export type UiState = { category: FeedCategory };
export type UiActions = { setCategory: (category: FeedCategory) => void };
export type UiStore = UiState & UiActions;

export function createUiStore(initialState: UiState = { category: "Para você" }) {
  return createStore<UiStore>()((set) => ({
    ...initialState,
    setCategory: (category) => set({ category }),
  }));
}
