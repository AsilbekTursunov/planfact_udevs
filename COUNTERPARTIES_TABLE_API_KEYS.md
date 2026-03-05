# Counterparties Table - API Keys Usage

## API Method: `get_counterparties`

### Response Structure
```json
{
  "status": "CREATED",
  "data": {
    "data": {
      "data": [
        {
          // Counterparty object
        }
      ],
      "total": 16
    }
  }
}
```

---

## Keys Used in Frontend Table

### Required Keys (Currently Used)

| API Key | Type | Usage in Table | Column Name | Notes |
|---------|------|----------------|-------------|-------|
| `guid` | string | Row identifier, navigation | - | Used for routing to detail page |
| `nazvanie` | string | Display name | "Контрагент" | Main counterparty name |
| `group_name` | string | Group display | "Группа" | Shows counterparty group |
| `inn` | number/string | Tax ID | "ИНН" | Only shown when `calculationMethod !== 'Cashflow'` |
| `operations_count` | number | Operations count | "Операций" | Currently shows "–" (not implemented) |
| `receivables` | number | Receivables amount | "Дебиторка ₽" | Monetary receivables |
| `payables` | number | Payables amount | "Кредиторка ₽" | Monetary payables |
| `debitorka` | number | Income/Receipts | "Поступления ₽" / "Доходы ₽" | Depends on calculation method |
| `kreditorka` | number | Expense/Payments | "Выплаты ₽" / "Расходы ₽" | Depends on calculation method |
| `profit` | number | Profit | "Прибыль ₽" | Only for Cash/Calculation methods |

### Additional Keys (Stored but not displayed in table)

| API Key | Type | Usage | Notes |
|---------|------|-------|-------|
| `polnoe_imya` | string | Full name | Used in detail page |
| `kpp` | number/string | Tax registration code | Used in detail page |
| `nomer_scheta` | number/string | Account number | Used in detail page |
| `counterparties_group_id` | string | Group ID | Used for filtering |
| `komentariy` | string | Comment | Used in detail page |
| `data_sozdaniya` | string (ISO date) | Creation date | Formatted to Russian locale |
| `chart_of_accounts_id` | string | Receipt article ID | Used for filtering |
| `chart_of_accounts_id_2` | string | Payment article ID | Used for filtering |
| `primenyatь_statьi_po_umolchaniyu` | boolean | Use default articles | Internal flag |

---

## Calculated Values in Frontend

### Difference (Разница)
```javascript
// For Cashflow method:
difference = debitorka - kreditorka

// For Cash/Calculation methods:
difference = profit
```

### Row Click Navigation
```javascript
onClick={() => router.push(`/pages/directories/counterparties/${guid}`)}
```

---

## Footer Totals Calculation

The footer sums these values across all counterparties:

```javascript
{
  totalReceivables: sum(receivables),
  totalPayables: sum(payables),
  totalIncome: sum(debitorka),
  totalExpenses: sum(kreditorka),
  totalDifference: totalIncome - totalExpenses
}
```

---

## Calculation Method Impact

### When `calculationMethod === 'Cashflow'`:
- Shows columns: Поступления, Выплаты, Разница
- Uses: `debitorka`, `kreditorka`
- Hides: ИНН column

### When `calculationMethod === 'Cash'` or `'Calculation'`:
- Shows columns: Доходы, Расходы, Прибыль
- Uses: `debitorka`, `kreditorka`, `profit`
- Shows: ИНН column

---

## Data Type Expectations

### Numbers
All numeric fields should be actual numbers, not strings:
```json
{
  "receivables": 120,        // ✅ Correct
  "payables": 100,           // ✅ Correct
  "debitorka": 35,           // ✅ Correct
  "inn": 0                   // ✅ Correct (0 means no INN)
}
```

### Strings
```json
{
  "guid": "7e12df62-c821-481f-8d16-21a425e053c5",  // ✅ UUID format
  "nazvanie": "AUTO_1772693899",                   // ✅ Any string
  "group_name": "test",                            // ✅ Any string or empty
  "data_sozdaniya": "2026-03-05T07:16:31Z"        // ✅ ISO 8601 format
}
```

### Null/Empty Values
When a field has no value, use:
- Numbers: `0`
- Strings: `""` (empty string) or omit the field
- The frontend will display "–" for empty values

---

## Current API Response Example

From your provided data:
```json
{
  "guid": "7e12df62-c821-481f-8d16-21a425e053c5",
  "nazvanie": "AUTO_1772693899",
  "polnoe_imya": "AUTO_1772693899",
  "group_name": "",
  "inn": 0,
  "kpp": 0,
  "nomer_scheta": 0,
  "counterparties_group_id": "",
  "komentariy": "compare test",
  "data_sozdaniya": "2026-03-05T07:16:31Z",
  "operations_count": 2,
  "receivables": 120,
  "payables": 100,
  "debitorka": 120,
  "kreditorka": 100,
  "income": 100,
  "expense": 40,
  "profit": 60,
  "difference": 60,
  "chart_of_accounts_id": "",
  "chart_of_accounts_id_2": "",
  "primenyatь_statьi_po_umolchaniyu": false
}
```

---

## Notes for Backend

1. **Total Count**: The `total` field in the response is used to display "X контрагентов" in the footer
2. **Pagination**: Frontend uses `page` and `limit` parameters (currently 50 items per page)
3. **Zero Values**: When a counterparty has no operations, all numeric fields should be `0`
4. **Empty Strings**: Empty strings for `group_name`, `inn`, etc. are acceptable and will display as "–"
5. **Operations Count**: Currently not displayed in table but should be included for future use

---

**Document Version**: 1.0  
**Date**: March 5, 2026  
**Last Updated**: Based on actual API response
