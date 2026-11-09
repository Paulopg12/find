import { NextResponse } from 'next/server'

const tags = {'Clínicas':['amenity','clinic'],'Dentistas':['amenity','dentist'],'Restaurantes':['amenity','restaurant'],'Salões de beleza':['shop','hairdresser'],'Academias':['leisure','fitness_centre'],'Imobiliárias':['office','estate_agent'],'Advogados':['office','lawyer'],'Pet shops':['shop','pet']}
const overpassEndpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter']

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 16000)
  try { return await fetch(url, { ...options, signal: controller.signal }) } finally { clearTimeout(timeout) }
}

export async function GET(request) {
  const {searchParams} = new URL(request.url)
  const city = searchParams.get('city')?.trim(), category = searchParams.get('category')
  if (!city || !tags[category]) return NextResponse.json({error:'Informe cidade e segmento válidos.'},{status:400})
  try {
    const geo = await fetchWithTimeout(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(`${city}, Brasil`)}`, { headers:{'User-Agent':'EncontraLeads/1.0'} })
    if (!geo.ok) throw new Error('geocoder')
    const places = await geo.json()
    if (!places[0]?.boundingbox) return NextResponse.json({error:'Cidade não encontrada. Use “Cidade, UF”.'},{status:404})
    const [south, north, west, east] = places[0].boundingbox
    const [key,value] = tags[category]
    const query = `[out:json][timeout:25];(nwr["${key}"="${value}"]["name"](${south},${west},${north},${east}););out center tags 50;`
    let data
    for (const endpoint of overpassEndpoints) {
      try {
        const response = await fetchWithTimeout(endpoint, {method:'POST',body:query,headers:{'Content-Type':'text/plain','User-Agent':'EncontraLeads/1.0'},cache:'no-store'})
        if (response.ok) { data = await response.json(); break }
      } catch {}
    }
    if (!data) return NextResponse.json({error:'As fontes de dados estão ocupadas agora. Aguarde um minuto e tente de novo.'},{status:503})
    const leads = data.elements.map(x => ({id:`${x.type}-${x.id}`,name:x.tags.name,address:[x.tags['addr:street'],x.tags['addr:housenumber'],x.tags['addr:city']].filter(Boolean).join(', '),phone:x.tags.phone||x.tags['contact:phone']||'',website:x.tags.website||x.tags['contact:website']||'',tags:x.tags}))
    return NextResponse.json({leads})
  } catch { return NextResponse.json({error:'Não foi possível localizar essa cidade agora. Tente usar “Cidade, UF”.'},{status:503}) }
}
