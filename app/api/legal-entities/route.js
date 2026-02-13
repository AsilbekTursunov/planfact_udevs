import { NextResponse } from 'next/server'
import { getCorsHeaders } from '@/lib/api/ucode/base'
import { makeUcodeV2Request, parseDataParam } from '@/app/api/utils/ucode-v2'

export async function GET(request) {
  const dataParams = parseDataParam(request)
  return makeUcodeV2Request({
    request,
    endpoint: 'legal_entity',
    method: 'GET',
    queryParams: {
      data: JSON.stringify(dataParams)
    }
  })
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          status: 'ERROR',
          description: 'ids array is required',
          data: 'Missing or empty ids array in request body'
        },
        { status: 400, headers: getCorsHeaders() }
      )
    }

    return makeUcodeV2Request({
      request,
      endpoint: 'legal_entity',
      method: 'DELETE',
      data: { ids }
    })
  } catch (error) {
    console.error('Delete legal entities route error:', error)
    return NextResponse.json(
      {
        status: 'ERROR',
        description: error.message || 'Failed to delete legal entities',
        data: error.message || 'Internal server error'
      },
      { status: 500, headers: getCorsHeaders() }
    )
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: getCorsHeaders() })
}
