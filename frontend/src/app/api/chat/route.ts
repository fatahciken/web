import { NextRequest } from 'next/server'

const API_BASE = 'https://noderouter.groups.id/v1'
const API_KEY = 'sk-anything'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (body.stream) {
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }

  const data = await response.json()
  return Response.json(data)
}
