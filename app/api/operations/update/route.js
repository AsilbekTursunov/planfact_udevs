import { NextResponse } from 'next/server'
import { apiConfig } from '@/lib/config/api'

/**
 * PUT /api/operations/update
 * Update an existing operation using invoke_function with update_operation method
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
        { status: 400 }
      )
    }

    if (!data.guid) {
      return NextResponse.json(
        {
          status: 'ERROR',
          description: 'Guid is required for update',
          data: 'Missing guid field in data'
        },
        { status: 400 }
      )
    }

    const baseURL = apiConfig.ucode.baseURL
    const authHeader = request.headers.get('authorization')
    const authToken = authHeader?.replace('Bearer ', '') || apiConfig.ucode.authToken
    const projectId = apiConfig.ucode.projectId
    const appId = apiConfig.ucode.appId || projectId
    const environmentId = apiConfig.ucode['environment-id']

    // Build request body for invoke_function
    const requestBody = {
      auth: {
        type: 'apikey',
        data: {}
      },
      data: {
        app_id: appId,
        environment_id: environmentId,
        project_id: projectId,
        method: 'update_operation',
        user_id: '',
        object_data: data
      }
    }

    const url = `${baseURL}/v2/invoke_function/planfact-plan-fact`

    console.log('Update operation request:', {
      url,
      body: JSON.stringify(requestBody, null, 2)
    })

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
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
        { status: response.status }
      )
    }

    const responseData = await response.json()

    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    console.error('Update operation error:', error)
    
    return NextResponse.json(
      {
        status: 'ERROR',
        description: error.message || 'Failed to update operation',
        data: error.message || 'Internal server error'
      },
      { status: 500 }
    )
  }
}
