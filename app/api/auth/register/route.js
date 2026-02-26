import { NextResponse } from 'next/server'
import { apiConfig } from '@/lib/config/api'

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = body

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        {
          status: 'ERROR',
          description: 'Missing required fields',
          data: 'name, email, phone, and password are required'
        },
        { status: 400 }
      )
    }

    const baseURL = apiConfig.ucode.baseURL
    const projectId = apiConfig.ucode.projectId
    const invokeFunctionEndpoint = '/v2/invoke_function/planfact-plan-fact'

    // Build URL
    const url = `${baseURL}${invokeFunctionEndpoint}?project-id=${projectId}`

    // Prepare request body - exactly as in Postman (order matters!)
    const requestBody = {
      data: {
        auth: {
          data: {},
          type: 'apikey'
        },
        method: 'auth_register',
        object_data: {
          name,
          password,
          email,
          phone
        }
      }
    }

    console.log('Register API request:', {
      url,
      body: JSON.stringify(requestBody, null, 2)
    })

    // Make request to u-code API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()
    let data

    try {
      data = responseText ? JSON.parse(responseText) : {}
    } catch (parseError) {
      console.error('Failed to parse register response:', parseError)
      return NextResponse.json(
        {
          status: 'ERROR',
          description: 'Failed to parse response',
          data: responseText
        },
        { status: 500 }
      )
    }

    console.log('Register API response:', data)

    // Check for errors
    if (!response.ok || data.status === 'ERROR' || data.status === 'BAD_REQUEST') {
      return NextResponse.json(data, { status: response.status })
    }

    // Return success response
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Register API error:', error)
    return NextResponse.json(
      {
        status: 'ERROR',
        description: 'Internal server error',
        data: error.message
      },
      { status: 500 }
    )
  }
}
