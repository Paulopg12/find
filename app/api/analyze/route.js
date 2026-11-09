import { NextResponse } from 'next/server'

export async function POST(request) {
  if (!process.env.NVIDIA_API_KEY) return NextResponse.json({ error: 'A chave NVIDIA_API_KEY ainda não foi configurada na Vercel.' }, { status: 503 })
  try {
    const lead = await request.json()
    if (!lead?.name || typeof lead.name !== 'string') return NextResponse.json({ error: 'Lead inválido.' }, { status: 400 })
    const prompt = `Analise este negócio local usando somente estes dados públicos: ${JSON.stringify({ nome: lead.name, endereco: lead.address, telefone: lead.phone, site: lead.website, sinais: lead.reasons, criterios: lead.criteria })}. Dê mais peso aos critérios do usuário. Responda SOMENTE JSON válido, sem markdown, neste formato: {"score":number de 0 a 100,"resumo":"até 160 caracteres, sem inventar fatos","mensagem":"abordagem curta em português brasileiro, pessoal, educada e sem pressão","proximoPasso":"uma ação concreta"}. A mensagem deve posicionar o serviço como presença digital estratégica e profissional. Nunca use “site simples”, “barato”, “sem compromisso”, “rapidinho”, “só uma ideia” ou linguagem que diminua valor. Não afirme ter visitado o site se ele não foi fornecido.`
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-8b-instruct', temperature: 0.35, max_tokens: 420, stream: false, messages: [{ role: 'system', content: 'Você é um analista ético de prospecção B2B. Use apenas os dados fornecidos e não invente informações.' }, { role: 'user', content: prompt }] })
    })
    if (!response.ok) return NextResponse.json({ error: 'A NVIDIA não conseguiu concluir a análise agora.' }, { status: 502 })
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.replace(/^```json\s*|\s*```$/g, '').trim()
    const result = JSON.parse(content)
    if (!Number.isFinite(result.score) || !result.resumo || !result.mensagem) throw new Error('Resposta inválida')
    return NextResponse.json({ score: Math.max(0, Math.min(100, Math.round(result.score))), resumo: String(result.resumo).slice(0, 160), mensagem: String(result.mensagem).slice(0, 1200), proximoPasso: String(result.proximoPasso || '').slice(0, 180) })
  } catch { return NextResponse.json({ error: 'Não foi possível interpretar a análise da NVIDIA.' }, { status: 502 }) }
}
