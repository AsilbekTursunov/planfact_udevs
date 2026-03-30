import { appStore } from "../store/app.store";

export const GlobalCurrency = {
  get name() {
    return appStore.currency?.name;
  },
  get guid() {
    return appStore.currency?.guid;
  },
  // To allow string coercion if needed
  toString() {
    return appStore.currency?.name || "";
  }
};