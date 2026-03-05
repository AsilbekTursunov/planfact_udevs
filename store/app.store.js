import { makeAutoObservable } from 'mobx';
import { makePersistable } from "mobx-persist-store";


class AppStore {
  isPayment = false

  constructor() {
    makeAutoObservable(this); 
    if (typeof window !== 'undefined') {
      makePersistable(this, {
        name: "plan_fact_app",
        properties: ["isPayment"],
        storage: window.localStorage,
        debugMode: true,
      });
    }
  }

  setIsPayment(value) {
    this.isPayment = value;
  }



  // Restore state from localStorage/cookies on init

}

export const appStore = new AppStore();
