import { NextResponse } from 'next/server'
import { register } from '@/lib/api/auth'
import { apiConfig } from '@/lib/config/api'

/**
 * POST /api/auth/register
 * Handle registration request
 */
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Extract properties
    const { data } = body
    const { name, email, phone, password, client_type_id, role_id } = data || {}

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

    // Get default values from config if not provided
    const finalClientTypeId = client_type_id || apiConfig.ucode.clientTypeId
    const finalRoleId = role_id || apiConfig.ucode.roleId

    // Call register function
    const result = await register({
      name,
      email,
      phone,
      password,
      clientTypeId: finalClientTypeId,
      roleId: finalRoleId
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
