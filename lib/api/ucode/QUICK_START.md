# Quick Start Guide - U-code API

## 🚀 Быстрый старт за 3 шага

### 1️⃣ Создайте API модуль

```javascript
// lib/api/ucode/products.js
import { createCRUDMethods } from './base'

const productCRUD = createCRUDMethods('product')

export const productsAPI = {
  ...productCRUD
}
```

**Готово!** Теперь у вас есть все CRUD методы:
- `productsAPI.getList({ page, limit })`
- `productsAPI.getByGuid(guid)`
- `productsAPI.create(data)`
- `productsAPI.update(data)`
- `productsAPI.delete(guids)`

### 2️⃣ Создайте хуки

```javascript
// hooks/useDashboard.js
import { productsAPI } from '@/lib/api/ucode/products'

export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsAPI.getList(params)
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: productsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    }
  })
}
```

### 3️⃣ Используйте в компонентах

```javascript
// components/ProductsPage.jsx
import { useProducts, useCreateProduct } from '@/hooks/useDashboard'

function ProductsPage() {
  const { data, isLoading } = useProducts({ page: 1, limit: 20 })
  const createMutation = useCreateProduct()
  
  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name: 'Новый продукт',
      price: 1000
    })
  }
  
  return (
    <div>
      {isLoading ? 'Загрузка...' : data.map(product => ...)}
      <button onClick={handleCreate}>Создать</button>
    </div>
  )
}
```

## 📝 Кастомные методы

Если нужны специфичные методы:

```javascript
// lib/api/ucode/products.js
import { ucodeRequest, createCRUDMethods } from './base'

const productCRUD = createCRUDMethods('product')

// Добавляем кастомный метод
export const getProductsByCategory = async (categoryId) => {
  return ucodeRequest({
    method: 'get_products_by_category',
    data: { category_id: categoryId }
  })
}

export const productsAPI = {
  ...productCRUD,
  getByCategory: getProductsByCategory
}
```

## 🔥 Примеры использования

### Получить список

```javascript
const { data } = useProducts({
  page: 1,
  limit: 20,
  filters: { category: 'electronics' }
})
```

### Создать запись

```javascript
const createMutation = useCreateProduct()

await createMutation.mutateAsync({
  name: 'iPhone 15',
  price: 99999,
  category: 'electronics'
})
```

### Обновить запись

```javascript
const updateMutation = useUpdateProduct()

await updateMutation.mutateAsync({
  guid: 'product-guid-here',
  price: 89999
})
```

### Удалить записи

```javascript
const deleteMutation = useDeleteProducts()

await deleteMutation.mutateAsync(['guid1', 'guid2'])
```

## 💡 Полезные советы

### Автоматические timestamps

Не нужно добавлять `data_sozdaniya` и `data_obnovleniya` - они добавляются автоматически!

```javascript
// ❌ Не нужно
await productsAPI.create({
  name: 'Product',
  data_sozdaniya: new Date().toISOString()
})

// ✅ Правильно
await productsAPI.create({
  name: 'Product'
})
```

### Валидация

CRUD методы автоматически валидируют обязательные поля:

```javascript
// ❌ Ошибка: GUID обязателен для обновления
await productsAPI.update({ name: 'New name' })

// ✅ Правильно
await productsAPI.update({ 
  guid: 'product-guid',
  name: 'New name' 
})
```

### Обработка ошибок

```javascript
try {
  await productsAPI.create(data)
} catch (error) {
  console.error('Status:', error.status)
  console.error('Message:', error.message)
  console.error('Details:', error.details)
}
```

## 🎯 Шаблон для нового ресурса

```javascript
// lib/api/ucode/[resource].js
import { ucodeRequest, createCRUDMethods } from './base'

const resourceCRUD = createCRUDMethods('[resource]')

// Кастомные методы (опционально)
export const customMethod = async (params) => {
  return ucodeRequest({
    method: 'custom_method_name',
    data: params
  })
}

export const [resource]API = {
  ...resourceCRUD,
  customMethod
}

export default [resource]API
```

## 📚 Дополнительно

- Полная документация: [README.md](./README.md)
- Примеры: [operations.js](./operations.js), [counterparties.js](./counterparties.js)
- Базовый клиент: [base.js](./base.js)
