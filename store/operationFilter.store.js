import { makeAutoObservable } from "mobx";
import { makePersistable } from "mobx-persist-store";

class OperationFilterStore {
  limit = 50;
  searchQuery = "";
  debouncedSearchQuery = "";
  selectedDatePaymentRange = null;
  selectedDateStartRange = null;
  selectedCounterAgents = [];
  selectedLegalEntities = [];
  selectedFilters = []; // types like 'Поступление', etc.
  amountRange = { min: "", max: "" };
  selectedChartOfAccounts = [];
  paymentType = null;
  dateFilters = {
    podtverzhdena: true,
    nePodtverzhdena: true,
  };
  dateStartFilters = {
    podtverzhdena: true,
    nePodtverzhdena: true,
  };
  paymentDateStart = '';
  paymentDateEnd = '';
  accrualDateStart = '';
  accrualDateEnd = '';

  constructor() {
    makeAutoObservable(this);
     if (typeof window !== 'undefined') {
          makePersistable(this, {
            name: "operationFilter",
            properties: [
              "limit",
              "searchQuery",
              "debouncedSearchQuery",
              "selectedDatePaymentRange",
              "selectedDateStartRange",
              "selectedCounterAgents",
              "selectedLegalEntities",
              "selectedFilters",
              "amountRange",
              "selectedChartOfAccounts",
              "paymentType",
              "dateFilters",
              "dateStartFilters",
              "paymentDateStart",
              "paymentDateEnd",
              "accrualDateStart",
              "accrualDateEnd",
            ],
            storage: window.localStorage,
            debugMode: true,
          })
        }
  }

  // Actions
  setLimit(num) {
    this.limit = num;
  }

  setSearchQuery(query) {
    this.searchQuery = query;
  }

  setDebouncedSearchQuery(query) {
    this.debouncedSearchQuery = query;
  }

  setSelectedDatePaymentRange(range) {
    this.selectedDatePaymentRange = range;
  }

  setSelectedDateStartRange(range) {
    this.selectedDateStartRange = range;
  }

  setSelectedCounterAgents(agents) {
    this.selectedCounterAgents = agents;
  }

  setSelectedLegalEntities(entities) {
    this.selectedLegalEntities = entities;
  }

  setSelectedFilters(filters) {
    this.selectedFilters = filters;
  }

  toggleFilter(key, forceValue) {
    const arr = [...this.selectedFilters];
    const shouldAdd = forceValue !== undefined ? forceValue : !arr.includes(key);

    if (shouldAdd) {
      if (!arr.includes(key)) {
        this.selectedFilters = [...arr, key];
      }
    } else {
      this.selectedFilters = arr.filter(v => v !== key);
    }
  }

  toggleComplexFilter(type) {
    const isCurrentlySelected = this.selectedFilters.includes(type);
    const shouldAdd = !isCurrentlySelected;

    this.toggleFilter(type);

    if (type === 'Перемещение') {
      this.toggleFilter('Списание', shouldAdd);
      this.toggleFilter('Зачисление', shouldAdd);
    } else if (type === 'Начисление') {
      this.toggleFilter('Дебет', shouldAdd);
      this.toggleFilter('Кредит', shouldAdd);
    }
  }

  setAmountRange(updater) {
    if (typeof updater === 'function') {
      this.amountRange = updater(this.amountRange);
    } else {
      this.amountRange = updater;
    }
  }

  setSelectedChartOfAccounts(accounts) {
    this.selectedChartOfAccounts = accounts;
  }

  setPaymentType(type) {
    this.paymentType = type;
  }

  setDateFilters(key, value) {
    this.dateFilters = { ...this.dateFilters, [key]: value };
  }

  setDateStartFilters(key, value) {
    this.dateStartFilters = { ...this.dateStartFilters, [key]: value };
  }

  resetFilters() {
    this.searchQuery = "";
    this.debouncedSearchQuery = "";
    this.selectedDatePaymentRange = null;
    this.selectedDateStartRange = null;
    this.selectedCounterAgents = [];
    this.selectedLegalEntities = [];
    this.selectedFilters = [];
    this.amountRange = { min: "", max: "" };
    this.selectedChartOfAccounts = [];
    this.paymentType = null;
    this.dateFilters = {
      podtverzhdena: true,
      nePodtverzhdena: true,
    };
    this.dateStartFilters = {
      podtverzhdena: true,
      nePodtverzhdena: true,
    };
  }
}

export const operationFilterStore = new OperationFilterStore();
