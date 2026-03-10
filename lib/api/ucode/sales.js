import { ucodeRequest } from './base'

/**
 * Get sales list with pagination and filters
 * @param {Object} params
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.from_date - Start date (YYYY-MM-DD)
 * @param {string} params.to_date - End date (YYYY-MM-DD)
 * @param {string} params.search - Search query
 */
export const getSalesList = async (params) => {
  return ucodeRequest({
    method: 'get_sales_list',
    data: params
  })
}
в
/**
 * Get simple sales list (without date filters)
 * @param {Object} params
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 */
export const getSalesListSimple = async (params) => {
  return ucodeRequest({
    method: 'get_sales_list_simple',
    data: params
  })
}

/**
 * Get sales transaction by GUID
 * @param {string} guid - Sales transaction GUID
 */
export const getSalesTransactionByGuid = async (guid) => {
  return ucodeRequest({
    method: 'get_sales_transaction_by_guid',
    data: { guid }
  })
}

/**
 * Update sales transaction
 * @param {Object} params
 * @param {string} params.guid - Sales transaction GUID
 * @param {string} params.name - Deal name
 * @param {string} params.comment - Deal comment
 */
export const updateSalesTransaction = async (params) => {
  return ucodeRequest({
    method: 'update_sales_transaction',
    data: params
  })
}

/**
 * Add operation to sales transaction
 * @param {Object} params
 * @param {string} params.sales_transaction_id - Sales transaction GUID
 * @param {string} params.financial_transaction_id - Operation GUID
 */
export const addOperationToSales = async (params) => {
  return ucodeRequest({
    method: 'add_operation_to_sales',
    data: params
  })
}
