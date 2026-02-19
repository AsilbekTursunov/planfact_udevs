# U-code API Architecture

Универсальная архитектура для работы с U-code API.

## Структура

```
lib/api/ucode/
├── base.js              # Базовый API клиент с универсальными методами
├── operations.js        # API для операций
├── counterparties.js    # API для контрагентов
├── legalEntities.js     # API для юридических лиц
├── bankAccounts.js      # API для банковских счетов
├── chartOfAccounts.js   # API для плана счетов
└── README.md           # Эта документация
```

## Базовый клиент (base.js)

### Основные функции

#### `ucodeRequest({ method, data, authToken })`

Универсальная функция для запросов к invoke_function API.

```javascript
import { ucodeRequest } from '@/lib/api/ucode/base'

// Пример использования
const response = await ucodeRequest({
  method: 'get_operations',
  data: {
    page: 1,
    limit: 20
  }
})
```

#### `createCRUDMethods(resourceName)`

Создает стандартные CRUD методы для любого ресурса.

```javascript
import { createCRUDMethods } from '@/lib/api/ucode/base'

// Создаем CRUD методы для нового ресурса
const productCRUD = createCRUDMethods('product')

// Теперь доступны методы:
// - productCRUD.getList({ page, limit, ...filters })
// - productCRUD.getByGuid(guid)
// - productCRUD.create(data)
// - productCRUD.update(data)
// - productCRUD.delete(guids)
```

## Использование в API модулях

### Пример: operations.js

```javascript
import { ucodeRequest, createCRUDMethods } from './base'

// Создаем базовые CRUD методы
const baseCRUD = createCRUDMethods('operation')

// Кастомный метод для списка с фильтрами
export const getOperationsList = async (params = {}) => {
  const { dateRange, page, limit, filters } = params
  
  return ucodeRequest({
    method: 'find_operations',
    data: {
      date_range: {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      },
      page,
      limit,
      ...filters
    }
  })
}

// Экспортируем API объект
export const operationsAPI = {
  getList: getOperationsList,
  getByGuid: baseCRUD.getByGuid,
  create: baseCRUD.create,
  update: baseCRUD.update,
  delete: baseCRUD.delete
}
```

## Создание нового API модуля

### Шаг 1: Создайте файл

```javascript
// lib/api/ucode/products.js
import { ucodeRequest, createCRUDMethods } from './base'

// Создаем базовые CRUD методы
const productCRUD = createCRUDMethods('product')

// Добавляем кастомные методы если нужно
export const getProductsByCategory = async (categoryId) => {
  return ucodeRequest({
    method: 'get_products_by_category',
    data: { category_id: categoryId }
  })
}

// Экспортируем API
export const productsAPI = {
  ...productCRUD,
  getByCategory: getProductsByCategory
}

export default productsAPI
```

### Шаг 2: Создайте хуки в useDashboard.js

```javascript
import { productsAPI } from '@/lib/api/ucode/products'

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsAPI.getList(params)
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data) => productsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      showSuccessNotification('Продукт создан!')
    }
  })
}
```

### Шаг 3: Используйте в компонентах

```javascript
import { useProducts, useCreateProduct } from '@/hooks/useDashboard'

function ProductsPage() {
  const { data, isLoading } = useProducts({ page: 1, limit: 20 })
  const createMutation = useCreateProduct()
  
  const handleCreate = async (productData) => {
    await createMutation.mutateAsync(productData)
  }
  
  // ...
}
```

## Преимущества новой архитектуры

### 1. Нет дублирования кода
- Один базовый клиент для всех запросов
- Автоматическая генерация CRUD методов
- Единообразная обработка ошибок

### 2. Легко расширяется
- Добавление нового ресурса = 10 строк кода
- Кастомные методы легко добавляются
- Переиспользование логики

### 3. Типобезопасность
- Централизованная валидация
- Автоматическое добавление timestamps
- Консистентная структура данных

### 4. Удобство отладки
- Централизованное логирование
- Единая точка для перехвата ошибок
- Легко добавить middleware

## Миграция существующего кода

### Было (старый подход):

```javascript
const response = await axiosInstance.post(
  'https://api.admin.u-code.io/v2/invoke_function/planfact-plan-fact',
  {
    auth: { type: 'apikey', data: {} },
    data: {
      app_id: apiConfig.ucode.appId,
      environment_id: apiConfig.ucode.environmentId,
      project_id: apiConfig.ucode.projectId,
      method: 'get_operations',
      user_id: '',
      object_data: { page: 1, limit: 20 }
    }
  }
)
```

### Стало (новый подход):

```javascript
const response = await ucodeRequest({
  method: 'get_operations',
  data: { page: 1, limit: 20 }
})
```

## Обработка ошибок

Все ошибки автоматически обрабатываются и имеют единую структуру:

```javascript
try {
  const data = await operationsAPI.create(operationData)
} catch (error) {
  console.error('Status:', error.status)
  console.error('Message:', error.message)
  console.error('Details:', error.details)
}
```

## Авторизация

Токен авторизации автоматически берется из:
1. Параметра `authToken` (если передан)
2. `localStorage.getItem('authToken')` (client-side)
3. Конфига (fallback)

```javascript
// Использование с кастомным токеном
const response = await ucodeRequest({
  method: 'get_operations',
  data: { page: 1 },
  authToken: 'custom-token-here'
})
```

## Best Practices

1. **Всегда используйте API объекты** вместо прямых вызовов
2. **Создавайте хуки** для каждого API метода
3. **Используйте константы** для типов и статусов
4. **Добавляйте JSDoc** комментарии к методам
5. **Валидируйте данные** перед отправкой
6. **Обрабатывайте ошибки** в хуках с уведомлениями

## Примеры использования

### Получение списка с фильтрами

```javascript
const { data } = useOperationsListNew({
  dateRange: {
    startDate: '2026-01-01',
    endDate: '2026-12-31'
  },
  page: 1,
  limit: 20,
  filters: {
    tip: ['Поступление', 'Выплата'],
    oplata_podtverzhdena: true
  }
})
```

### Создание записи

```javascript
const createMutation = useCreateOperationNew()

await createMutation.mutateAsync({
  tip: ['Поступление'],
  summa: 1000,
  my_accounts_id: 'account-guid',
  chart_of_accounts_id: 'chart-guid',
  data_operatsii: new Date().toISOString()
})
```

### Обновление записи

```javascript
const updateMutation = useUpdateOperationNew()

await updateMutation.mutateAsync({
  guid: 'operation-guid',
  summa: 1500,
  opisanie: 'Обновленное описание'
})
```

### Удаление записей

```javascript
const deleteMutation = useDeleteOperationsNew()

await deleteMutation.mutateAsync(['guid1', 'guid2', 'guid3'])
```
