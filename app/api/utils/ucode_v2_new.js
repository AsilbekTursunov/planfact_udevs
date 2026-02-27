import { NextResponse } from 'next/server'
import { apiConfig } from '@/lib/config/api'
import { getCorsHeaders } from '@/lib/api/ucode/base'

/**
 * Make a request to u-code invoke_function API (planfact-plan-fact)
 *
 * All requests go to: POST {baseURL}/v2/invoke_function/planfact-plan-fact
 *
 * Body format is always:
 * {
 *   "data": {
 *     "app_id": "...",
 *     "environment_id": "...",
 *     "project_id": "...",
 *     "method": "<method_name>",
 *     "user_id": "",
 *     "object_data": { ... }
 *   }
 * }
 *
 * Only `method` and `object_data` change between calls.
 *
 * @param {Object} params
 * @param {Request} params.request - Next.js request object (used to read auth header)
 * @param {string}  params.method  - invoke_function method name (e.g. "create_chart_of_account")
 * @param {Object}  params.objectData - the object_data payload
 * @param {string}  [params.userId] - optional user_id (defaults to "")
 * @returns {Promise<NextResponse>}
 */
export async function makePlanFactRequest({
  request,
  method,
  objectData = {},
  userId = '',
}) {
  try {
    const baseURL = apiConfig.ucode.baseURL
    const projectId = apiConfig.ucode.projectId
    const environmentId = apiConfig.ucode['environment-id']
    const authHeader = request?.headers?.get('authorization') || request?.headers?.get('Authorization')
    const authToken = authHeader?.replace('Bearer ', '') || apiConfig.ucode.authToken

    const url = `${baseURL}/v2/invoke_function/planfact-plan-fact`

    const requestBody = {
      data: {
        method,
        user_id: userId,
        object_data: objectData,
      },
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      'environment-id': environmentId,
      'project-id': projectId,
    }

    console.log(`PlanFact invoke_function [${method}]:`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      url,
    })


    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`PlanFact invoke_function [${method}] error:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      return NextResponse.json(
        {
          status: 'ERROR',
          description: `Request failed: ${response.statusText}`,
          data: errorText || `Failed to call ${method}`,
        },
        { status: response.status, headers: getCorsHeaders() },
      )
    }

    // Parse response
    const contentType = response.headers.get('content-type')
    const hasContent = response.headers.get('content-length') !== '0'

    let responseData
    if (contentType?.includes('application/json') && hasContent) {
      const text = await response.text()
      if (text) {
        try {
          responseData = JSON.parse(text)
        } catch {
          console.warn('Failed to parse response as JSON:', text)
          responseData = { status: 'SUCCESS', description: 'Operation completed successfully' }
        }
      } else {
        responseData = { status: 'SUCCESS', description: 'Operation completed successfully' }
      }
    } else {
      responseData = { status: 'SUCCESS', description: 'Operation completed successfully' }
    }

    return NextResponse.json(responseData, { headers: getCorsHeaders() })
  } catch (error) {
    console.error(`PlanFact invoke_function [${method}] route error:`, error)
    return NextResponse.json(
      {
        status: 'ERROR',
        description: error.message || `Failed to call ${method}`,
        data: error.message || 'Internal server error',
      },
      { status: 500, headers: getCorsHeaders() },
    )
  }
}

/**
 * Parse data parameter from query string
 * @param {Request} request - Next.js request object
 * @returns {Object} Parsed data object
 */
export function parseDataParam(request) {
  const { searchParams } = new URL(request.url)
  const dataParam = searchParams.get('data')

  let dataParams = {}
  if (dataParam) {
    try {
      dataParams = JSON.parse(dataParam)
    } catch (e) {
      console.error('Failed to parse data parameter:', e)
    }
  }

  return dataParams
}
