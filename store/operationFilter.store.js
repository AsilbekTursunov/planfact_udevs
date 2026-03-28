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
  deals = [];

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
          "deals",
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

    let nextFilters = shouldAdd
      ? (arr.includes(key) ? arr : [...arr, key])
      : arr.filter(v => v !== key);

    // Child to Parent logic - only run if not a complex (forced) toggle to avoid jitter
    if (forceValue === undefined) {
      const relationships = [
        { parent: 'Перемещение', children: ['Списание', 'Зачисление'] },
        { parent: 'Начисление', children: ['Дебет', 'Кредит'] }
      ];

      relationships.forEach(({ parent, children }) => {
        if (children.includes(key)) {
          const currentChildrenState = children.map(child =>
            child === key ? shouldAdd : nextFilters.includes(child)
          );

          const anyChildrenChecked = currentChildrenState.some(Boolean);
          const allChildrenUnchecked = currentChildrenState.every(v => v === false);

          if (anyChildrenChecked) {
            if (!nextFilters.includes(parent)) nextFilters = [...nextFilters, parent];
          } else if (allChildrenUnchecked) {
            if (nextFilters.includes(parent)) nextFilters = nextFilters.filter(v => v !== parent);
          }
        }
      });
    }

    this.selectedFilters = nextFilters;
  }

  toggleComplexFilter(type) {
    const isCurrentlySelected = this.selectedFilters.includes(type);
    const shouldAdd = !isCurrentlySelected;

    // First toggle all children to the same state
    const relationships = {
      'Перемещение': ['Списание', 'Зачисление'],
      'Начисление': ['Дебет', 'Кредит']
    };

    const children = relationships[type] || [];
    children.forEach(child => {
      this.toggleFilter(child, shouldAdd);
    });

    // Then toggle parent itself
    this.toggleFilter(type, shouldAdd);
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

  setSelectedDeals(deals) {
    this.deals = deals;
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
    this.deals = [];
  }
}

export const operationFilterStore = new OperationFilterStore();
