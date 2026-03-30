import { appStore } from "../store/app.store";

export const GlobalCurrency = {
  get name() {
    return appStore.currency?.name || "";
  },
  get guid() {
    return appStore.currency?.guid || "";
  },
  valueOf() {
    return appStore.currency?.name || "";
  },
  toString() {
    return appStore.currency?.name || "";
  }
};