import { makePlanFactRequest } from '../../utils/ucode_v2_new'
import { parseDataParam } from '../../utils/ucode_v2_new'

/**
 * GET /api/operations/v2-items
 * Get operations list using invoke_function/planfact-plan-fact
 */
export async function GET(request) {
  const data = parseDataParam(request)

  return makePlanFactRequest({
    request,
    method: 'find_operations',
    objectData: data,
  })
}
