import { NextResponse } from 'next/server'

const cleanText = value => String(value || '').replace(/\s+/g, ' ').trim()
const phoneFrom = value => cleanText(value).match(/(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/)?.[0] || ''

export async function GET(request) {
  if (!process.env.FIRECRAWL_API_KEY) return NextResponse.json({ error: 'A variável FIRECRAWL_API_KEY ainda não está configurada na Vercel.' }, { status: 503 })
  const { searchParams } = new URL(request.url)
  const city = cleanText(searchParams.get('city'))
  const category = cleanText(searchParams.get('category'))
  if (!city || !category) return NextResponse.json({ error: 'Informe cidade e segmento.' }, { status: 400 })
  try {
    const response = await fetch('https://api.firecrawl.dev/v2/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `${category} em ${city}, Brasil`, limit: 5, sources: [{ type: 'web' }], scrapeOptions: { formats: ['markdown'] } }),
      cache: 'no-store'
    })
    const result = await response.json()
    if (!response.ok) return NextResponse.json({ error: result.error || 'O Firecrawl não conseguiu executar a busca.' }, { status: response.status })
    const items = Array.isArray(result.data?.web) ? result.data.web : []
    const leads = items.filter(item => item.url).map((item, index) => {
      const text = `${item.description || ''} ${item.markdown || ''}`.slice(0, 3000)
      const title = cleanText(item.title || item.metadata?.title || new URL(item.url).hostname.replace('www.', ''))
      return { id: `firecrawl-${index}-${item.url}`, name: title, address: cleanText(item.metadata?.ogLocale || city), phone: phoneFrom(text), website: item.url, tags: { website: item.url, phone: phoneFrom(text), description: cleanText(item.description), opening_hours: '', instagram: /instagram\.com/i.test(text) ? 'found' : '' } }
    })
    return NextResponse.json({ leads })
  } catch { return NextResponse.json({ error: 'Não foi possível conectar ao Firecrawl agora.' }, { status: 502 }) }
}
