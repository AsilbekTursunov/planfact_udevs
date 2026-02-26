import { NextResponse } from 'next/server'
import { register } from '@/lib/api/auth'

/**
 * POST /api/auth/register
 * Handle registration request
 */
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Extract properties
    const { data } = body
    const { name, email, phone, password } = data || {}

    // Validate required fields
    if (!name || !password || (!email && !phone)) {
      return NextResponse.json(
        {
          status: 'ERROR',
          description: 'Missing required fields',
          data: 'Необходимо указать имя, пароль и email/телефон'
        },
        { status: 400 }
      )
    }

    // Call register function
    const result = await register({
      name,
      email,
      phone,
      password
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Register error:', error)
    
    // Return error response
    return NextResponse.json(
      {
        status: 'ERROR',
        description: error.message || 'Registration failed',
        data: error.message || 'Ошибка при регистрации'
      },
      { status: 401 }
    )
  }
}
