import { NextResponse } from 'next/server'
import { apiConfig } from '@/lib/config/api'
import { getCorsHeaders } from '@/lib/api/ucode/base'

/**
 * POST /api/operations
 * Create a new operation using v2/items/operations endpoint
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { data } = body

    if (!data) {
      return NextResponse.json(
        {
          status: 'ERROR',
          description: 'Data is required',
          data: 'Missing data field in request body'
        },
        { status: 400, headers: getCorsHeaders() }
      )
    }

    const baseURL = apiConfig.ucode.baseURL
    const projectId = apiConfig.ucode.projectId
    const environmentId = apiConfig.ucode['environment-id']

    // Build URL with query parameters
    const queryParams = new URLSearchParams()
    queryParams.append('project-id', projectId)
    queryParams.append('environment-id', environmentId)

    const url = `${baseURL}/v2/items/operations?${queryParams.toString()}`

    console.log('Create operation request:', {
      url,
      data: JSON.stringify(data, null, 2)
    })
    
    // Validate required fields
    if (!data.tip || !Array.isArray(data.tip) || data.tip.length === 0) {
      return NextResponse.json(
        {
          status: 'ERROR',
          description: 'Tip is required and must be an array',
          data: 'Missing or invalid tip field'
        },
        { status: 400, headers: getCorsHeaders() }
      )
    }
    
    if (!data.data_operatsii) {
      return NextResponse.json(
        {
          status: 'ERROR',
          description: 'data_operatsii is required',
          data: 'Missing data_operatsii field'
        },
        { status: 400, headers: getCorsHeaders() }
      )
    }

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'API-KEY',
      'environment-id': environmentId,
      'X-API-KEY': 'P-7LpJciQKbkwuC2ecwefamfEQhoe5F8Bc',
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Create operation error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      return NextResponse.json(
        {
          status: 'ERROR',
          description: `Request failed: ${response.statusText}`,
          data: errorText || 'Failed to create operation'
        },
        { status: response.status, headers: getCorsHeaders() }
      )
    }

    const responseData = await response.json()

    return NextResponse.json(responseData, { status: 200, headers: getCorsHeaders() })
  } catch (error) {
    console.error('Create operation error:', error)
    
    return NextResponse.json(
      {
        status: 'ERROR',
        description: error.message || 'Failed to create operation',
        data: error.message || 'Internal server error'
      },
      { status: 500, headers: getCorsHeaders() }
    )
  }
}

/**
 * PUT /api/operations
 * Update an existing operation using v2/items/operations endpoint
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { data } = body

    if (!data) {
      return NextResponse.json(
        {
          status: 'ERROR',
          description: 'Data is required',
          data: 'Missing data field in request body'
        },
        { status: 400, headers: getCorsHeaders() }
      )
    }

    if (!data.guid) {
      return NextResponse.json(
        {
          status: 'ERROR',
          description: 'Guid is required for update',
          data: 'Missing guid field in data'
        },
        { status: 400, headers: getCorsHeaders() }
      )
    }

    const baseURL = apiConfig.ucode.baseURL
    const projectId = apiConfig.ucode.projectId
    const environmentId = apiConfig.ucode['environment-id']

    // Build URL with query parameters
    const queryParams = new URLSearchParams()
    queryParams.append('project-id', projectId)
    queryParams.append('environment-id', environmentId)

    const url = `${baseURL}/v2/items/operations?${queryParams.toString()}`

    console.log('Update operation request:', {
      url,
      data: JSON.stringify(data, null, 2)
    })

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'API-KEY',
      'environment-id': environmentId,
      'X-API-KEY': 'P-7LpJciQKbkwuC2ecwefamfEQhoe5F8Bc',
    }

    console.log('data => ', data)

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Update operation error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      return NextResponse.json(
        {
          status: 'ERROR',
          description: `Request failed: ${response.statusText}`,
          data: errorText || 'Failed to update operation'
        },
        { status: response.status, headers: getCorsHeaders() }
      )
    }

    const responseData = await response.json()

    return NextResponse.json(responseData, { status: 200, headers: getCorsHeaders() })
  } catch (error) {
    console.error('Update operation error:', error)
    
    return NextResponse.json(
      {
        status: 'ERROR',
        description: error.message || 'Failed to update operation',
        data: error.message || 'Internal server error'
      },
      { status: 500, headers: getCorsHeaders() }
    )
  }
}

export function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders() })
}
