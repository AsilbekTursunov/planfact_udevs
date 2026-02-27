import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request) {
  try {
    const body = await request.json()
    const { fullname, email, phone, password } = body

    const baseURL = 'https://api.auth.u-code.io'
    const projectId = '3ed54a59-5eda-4cfe-b4ae-8a201c1ea4ed'
    const clientTypeId = '2d3beced-ea36-41ab-9e24-e7ad372300fe'
    const roleId = '653c399c-ed2b-4f16-bfe8-612d2e29e87d'
    const url = `${baseURL}/v2/register?project-id=${projectId}`

    const requestBody = {
      data: {
        // type: 'email',
        name: fullname,
        phone: phone,
        password: password,
        email: email,
        client_type_id: clientTypeId,
        role_id: roleId
      }
    }

    console.log('=== SERVER REGISTER REQUEST (NEW API) ===')
    console.log('URL:', url)
    console.log('Request Body:', JSON.stringify(requestBody, null, 2))
    console.log('==========================================')

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Environment-Id': 'fc258dff-47c0-4ab1-9beb-91a045b4847c',
      },
      validateStatus: () => true,
    })

    console.log('=== SERVER RESPONSE (NEW API) ===')
    console.log('Status:', response.status)
    console.log('Response Data:', response.data)
    console.log('==================================')

    let data
    try {
      data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data
    } catch (e) {
      console.error('Failed to parse response:', e)
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: 500 }
      )
    }

    if (response.status !== 200 && response.status !== 201) {
      return NextResponse.json(
        { error: data.message || data.description || 'Registration failed' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Server error:', error)
    console.error('Error details:', error.response?.data)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
