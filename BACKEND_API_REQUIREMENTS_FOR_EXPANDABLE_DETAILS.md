# Backend API Requirements for Expandable Details Feature

## Overview
This document describes the required API changes to support the expandable details functionality that has been implemented in the frontend. Currently, the frontend uses mock data for the detail rows. Once you implement these API changes, we will replace the mock data with real API calls.

---

## 1. Counterparty Detail Page - `get_counterparty_by_id` Method

### Current Implementation
The `get_counterparty_by_id` method currently returns:

```json
{
  "data": {
    "data": {
      "data": {
        "counterparty": {
          "guid": "95edc1dc-4b16-4f97-bf63-63269890638f",
          "nazvanie": "Контрагент 1",
          "inn": "1234567890",
          // ... other counterparty fields
        },
        "operations": [
          {
            "guid": "operation-guid-1",
            "data_operatsii": "2026-03-05T00:00:00Z",
            "summa": 19500000,
            "tip": ["Поступление"],
            "my_accounts_name": "Основной счет",
            "counterparties_name": "test",
            "chart_of_accounts_name": "Оказание услуг",
            "currenies_kod": "RUB",
            "oplata_podtverzhdena": true,
            "payment_confirmed": true,
            "payment_accrual": false
            // ... other operation fields
          }
          // ... more operations
        ]
      }
    }
  }
}
```

### Required Changes
Add a `details` array to each operation object. This array should contain child operations or sub-transactions that make up the parent operation.

```json
{
  "data": {
    "data": {
      "data": {
        "counterparty": { /* ... same as before ... */ },
        "operations": [
          {
            "guid": "operation-guid-1",
            "data_operatsii": "2026-03-05T00:00:00Z",
            "summa": 19500000,
            "tip": ["Поступление"],
            "my_accounts_name": "Основной счет",
            "counterparties_name": "test",
            "chart_of_accounts_name": "Оказание услуг",
            "currenies_kod": "RUB",
            "oplata_podtverzhdena": true,
            "payment_confirmed": true,
            "payment_accrual": false,
            
            // NEW FIELD: Array of detail operations
            "details": [
              {
                "guid": "detail-guid-1",
                "data_operatsii": "2026-03-05T00:00:00Z",
                "summa": 15000000,
                "tip": ["Поступление"],
                "my_accounts_name": "Основной счет",
                "counterparties_name": "test",
                "chart_of_accounts_name": "Оказание услуг",
                "currenies_kod": "RUB"
              },
              {
                "guid": "detail-guid-2",
                "data_operatsii": "2026-03-31T00:00:00Z",
                "summa": 4500000,
                "tip": ["Поступление"],
                "my_accounts_name": "Основной счет",
                "counterparties_name": "test",
                "chart_of_accounts_name": "Оказание услуг",
                "currenies_kod": "RUB"
              }
            ]
          }
          // ... more operations
        ]
      }
    }
  }
}
```

### Frontend Implementation Location
- **File**: `app/pages/directories/counterparties/[id]/page.jsx`
- **Mock Function**: `getDetailData()` (line ~440)
- **Usage**: When user clicks the plus icon next to a date, the frontend calls `getDetailData(rowId)` to get detail rows

### What to Replace
Once the API is ready, replace this mock function:
```javascript
const getDetailData = (rowId) => {
  return [
    { id: 1, date: '05 мар \'26', account: 'Основной счет', type: 'in', typeLabel: 'Поступление', counterparty: 'test', category: 'Оказание услуг', amount: '+15 000 000', amountRaw: 15000000 },
    { id: 2, date: '31 мар \'26', account: 'Основной счет', type: 'in', typeLabel: 'Поступление', counterparty: 'test', category: 'Оказание услуг', amount: '+4 500 000', amountRaw: 4500000 },
  ]
}
```

With real data from the API:
```javascript
const getDetailData = (operation) => {
  // Return the details array from the operation object
  return operation.rawData?.details || []
}
```

---

## 2. Cashflow Report Modal - `get_cashflow_report` Method

### Current Implementation
The cashflow report data structure has nested rows with `subRows`:

```json
{
  "name": "Поступления",
  "total": 28500000,
  "months": {
    "2026-01": 10000000,
    "2026-02": 8500000,
    "2026-03": 10000000
  },
  "subRows": [
    {
      "name": "Оказание услуг",
      "total": 28500000,
      "months": {
        "2026-01": 10000000,
        "2026-02": 8500000,
        "2026-03": 10000000
      }
    }
  ]
}
```

### Required Changes - Option 1 (Recommended)
Add a `details` array to each row that contains the individual operations that make up that row's total:

```json
{
  "name": "Поступления",
  "total": 28500000,
  "months": {
    "2026-01": 10000000,
    "2026-02": 8500000,
    "2026-03": 10000000
  },
  "subRows": [
    {
      "name": "Оказание услуг",
      "total": 28500000,
      "months": {
        "2026-01": 10000000,
        "2026-02": 8500000,
        "2026-03": 10000000
      },
      
      // NEW FIELD: Array of operations that make up this row
      "details": [
        {
          "guid": "operation-guid-1",
          "data_operatsii": "2026-03-05T00:00:00Z",
          "summa": 15000000,
          "counterparties_name": "test",
          "chart_of_accounts_name": "Оказание услуг"
        },
        {
          "guid": "operation-guid-2",
          "data_operatsii": "2026-03-31T00:00:00Z",
          "summa": 4500000,
          "counterparties_name": "test",
          "chart_of_accounts_name": "Оказание услуг"
        },
        {
          "guid": "operation-guid-3",
          "data_operatsii": "2026-04-30T00:00:00Z",
          "summa": 9000000,
          "counterparties_name": "test",
          "chart_of_accounts_name": "Оказание услуг"
        }
      ]
    }
  ]
}
```

### Required Changes - Option 2 (Alternative)
Create a separate API method `get_cashflow_row_details` that returns details for a specific row when requested:

**Request:**
```json
{
  "method": "get_cashflow_row_details",
  "data": {
    "row_id": "row-guid-or-identifier",
    "period_start": "2026-01-01",
    "period_end": "2026-12-31",
    "month": "2026-03"  // Optional: if user clicked on a specific month
  }
}
```

**Response:**
```json
{
  "data": {
    "data": {
      "data": {
        "row_name": "Оказание услуг",
        "operations": [
          {
            "guid": "operation-guid-1",
            "data_operatsii": "2026-03-05T00:00:00Z",
            "summa": 15000000,
            "counterparties_name": "test",
            "chart_of_accounts_name": "Оказание услуг"
          },
          {
            "guid": "operation-guid-2",
            "data_operatsii": "2026-03-31T00:00:00Z",
            "summa": 4500000,
            "counterparties_name": "test",
            "chart_of_accounts_name": "Оказание услуг"
          }
        ]
      }
    }
  }
}
```

### Frontend Implementation Location
- **File**: `components/directories/OperationCashFlowModal/index.jsx`
- **Mock Function**: `getDetailData()` (line ~52)
- **Usage**: When user clicks the plus icon in the cashflow modal, the frontend calls `getDetailData(rowId)` to get detail operations

### What to Replace
Once the API is ready, replace this mock function:
```javascript
const getDetailData = (rowId) => {
  return [
    { id: 1, date: '05 мар \'26', counterparty: 'test', article: 'Оказание услуг', amount: 15000000 },
    { id: 2, date: '31 мар \'26', counterparty: 'test', article: 'Оказание услуг', amount: 4500000 },
    { id: 3, date: '30 апр \'26', counterparty: 'test', article: 'Оказание услуг', amount: 9000000 },
  ]
}
```

With real data from the API (Option 1):
```javascript
const getDetailData = (row) => {
  // Return the details array from the row object
  return row.details || []
}
```

Or with API call (Option 2):
```javascript
const getDetailData = async (row) => {
  const response = await ucodeRequestMutation.mutateAsync({
    method: 'get_cashflow_row_details',
    data: {
      row_id: row.id,
      period_start: dateRange?.start,
      period_end: dateRange?.end,
      month: selectedMonth?.key
    }
  })
  return response.data?.data?.data?.operations || []
}
```

---

## 3. Implementation Notes

### For Counterparty Detail Page:
1. The `details` array should be included in every operation object returned by `get_counterparty_by_id`
2. If an operation has no details, return an empty array: `"details": []`
3. The detail operations should have the same structure as regular operations
4. The sum of all detail amounts should equal the parent operation amount

### For Cashflow Report:
1. **Option 1** is simpler and requires fewer API calls (recommended for better performance)
2. **Option 2** provides more flexibility and reduces initial payload size
3. Choose the option that best fits your backend architecture
4. The details should only include operations that contribute to that specific row's total

### Data Consistency:
- All date fields should be in ISO 8601 format: `"2026-03-05T00:00:00Z"`
- All amount fields should be numbers (not strings): `15000000` not `"15000000"`
- Currency codes should follow ISO 4217: `"RUB"`, `"USD"`, `"EUR"`

### Performance Considerations:
- Consider pagination for detail rows if there are many operations
- Add caching on the backend to improve response times
- Consider lazy loading details only when the user expands a row (Option 2 for cashflow)

---

## 4. Testing

### Test Cases for Counterparty Detail Page:
1. Operation with no details (empty array)
2. Operation with 1 detail
3. Operation with multiple details (2-10)
4. Operation with many details (>10)
5. Details with different dates
6. Details with different amounts (positive and negative)

### Test Cases for Cashflow Report:
1. Row with no operations (empty details)
2. Row with operations from a single month
3. Row with operations spanning multiple months
4. Row with operations from different counterparties
5. Row with operations from different categories

---

## 5. Next Steps

1. **Backend Developer**: Implement the API changes described above
2. **Backend Developer**: Test the API endpoints with the test cases
3. **Backend Developer**: Notify frontend team when API is ready
4. **Frontend Developer**: Replace mock `getDetailData()` functions with real API calls
5. **Frontend Developer**: Test with real data
6. **Both Teams**: Conduct integration testing

---

## 6. Questions?

If you have any questions about these requirements, please contact the frontend team. We can provide:
- Example API requests/responses
- Screenshots of the UI functionality
- Additional clarification on data structures
- Help with testing the integration

---

**Document Version**: 1.0  
**Date**: March 5, 2026  
**Author**: Frontend Team  
**Status**: Ready for Backend Implementation
