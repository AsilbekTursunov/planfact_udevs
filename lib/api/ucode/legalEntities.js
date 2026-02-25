import { ucodeRequest, createCRUDMethods } from './base'

/**
 * Legal Entities API
 * Использует универсальную обертку для работы с юридическими лицами
 */

// Создаем базовые CRUD методы для юридических лиц
const legalEntityCRUD = createCRUDMethods('legal_entity')

/**
 * Получить список юридических лиц
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов
 * @returns {Promise<Object>} Список юридических лиц
 */
export const getLegalEntitiesInvokeFunction = async (params = {}) => {
  const { page = 1, limit = 50, ...rest } = params
  
  return ucodeRequest({
    method: 'get_legal_entities',
    data: { page, limit, ...rest }
  })
}

// Экспортируем все методы как единый API объект
export const legalEntitiesAPI = {
  getLegalEntitiesInvokeFunction,
  getList: legalEntityCRUD.getList,
  getByGuid: legalEntityCRUD.getByGuid,
  create: legalEntityCRUD.create,
  update: legalEntityCRUD.update,
  delete: legalEntityCRUD.delete
}

export default legalEntitiesAPI

