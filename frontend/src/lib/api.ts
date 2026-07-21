const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export async function fetchModels() {
  const res = await fetch(`${API_URL}/models`)
  return res.json()
}

export async function sendMessage(messages: any[], model: string, stream: boolean = true, tools?: any[]) {
  const body: any = { model, messages, stream }
  if (tools) body.tools = tools
  
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  
  if (stream) {
    return res.body
  }
  return res.json()
}
