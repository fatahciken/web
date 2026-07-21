const API_BASE = 'https://noderouter.groups.id/v1'
const API_KEY = 'sk-anything'

export async function GET() {
  const response = await fetch(`${API_BASE}/models`, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  })
  const data = await response.json()
  return Response.json(data)
}
