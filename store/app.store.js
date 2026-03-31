import { makeAutoObservable } from 'mobx';
import { makePersistable } from "mobx-persist-store";


class AppStore {
  isPayment = false
  currency = {
    name: '',
    guid: '',
    code: ''
  }
  currencies = []

  constructor() {
    makeAutoObservable(this);
    if (typeof window !== 'undefined') {
      makePersistable(this, {
        name: "plan_fact_app",
        properties: ["isPayment", "currency", "currencies"],
        storage: window.localStorage,
        debugMode: true,
      });

    }
  }

  setIsPayment(value) {
    this.isPayment = value;
  }

  setCurrency(value) {
    this.currency = value;
  }

  setCurrencies(value) {
    this.currencies = value;
  }


  // Restore state from localStorage/cookies on init

}

export const appStore = new AppStore();
