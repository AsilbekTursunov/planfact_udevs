import { ucodeRequest, createCRUDMethods } from './base'

/**
 * Bank Accounts API (My Accounts)
 * Использует универсальную обертку для работы с банковскими счетами
 */

// Создаем базовые CRUD методы для счетов
const myAccountCRUD = createCRUDMethods('my_account')

/**
 * Получить список банковских счетов
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов
 * @returns {Promise<Object>} Список счетов
 */
export const getBankAccountsInvokeFunction = async (params = {}) => {
  const { page = 1, limit = 50, ...rest } = params

  return ucodeRequest({
    method: 'get_my_accounts',
    data: { page, limit, ...rest }
  })
}
export const getMyAccountsBoard = async (params = {}) => {
  const { page = 1, limit = 50, ...rest } = params
  return ucodeRequest({
    method: 'get_my_accounts_board',
    data: { page, limit, ...rest }
  })
}

// Экспортируем все методы как единый API объект
export const bankAccountsAPI = {
  // Основной метод получения списка
  getBankAccountsInvokeFunction,
  getMyAccountsBoard,

  // Базовые CRUD методы
  getList: myAccountCRUD.getList,
  getByGuid: myAccountCRUD.getByGuid,
  create: myAccountCRUD.create,
  update: myAccountCRUD.update,
  delete: myAccountCRUD.delete,

  // Алиас для удаления (для обратной совместимости)
  deleteMyAccount: (guid) => myAccountCRUD.delete(guid)
}




export default bankAccountsAPI

