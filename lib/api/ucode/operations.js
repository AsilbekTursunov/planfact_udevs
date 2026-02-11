import axiosInstance from '../../axios'

/**
 * Operations API
 * Handles all operations related requests
 */
export const operationsAPI = {
  /**
   * Get list of operations items using v2/items/operations endpoint
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of items to return (default: 20)
   * @param {number} params.offset - Number of items to skip (default: 0)
   * @param {string} params.opisanie - Description filter
   * @param {Object} params.filters - Additional filters to include in data parameter
   * @returns {Promise} API response
   */
  getList: async (params = {}) => {
    const {
      limit = 20,
      offset = 0,
      opisanie,
      filters = {},
      ...otherParams
    } = params

    // Build data object for query parameter
    const dataParams = {
      limit,
      offset,
      ...(opisanie && { opisanie }),
      ...filters,
      ...otherParams
    }

    // Convert to JSON string for query parameter
    const dataParam = JSON.stringify(dataParams)

    const response = await axiosInstance.get('/operations/v2-items', {
      params: {
        data: dataParam
      }
    })

    return response.data
  },
  getNewList: async (params = {}) => {
    const response = await axiosInstance.get('/operations/v2-items', {
      params: {
        data: JSON.stringify(params),
      },
    })

    return response.data
  }
}
