'use client'

import { useEffect, useMemo, useState } from 'react'

const initialLead = { business: '', contact: '', channel: 'WhatsApp', website: '', observation: '', status: 'Novo' }

function makeMessage(lead) {
  const firstName = lead.contact?.trim().split(' ')[0]
  const greeting = firstName ? `Oi, ${firstName}!` : 'Olá, tudo bem?'
  const siteNote = lead.website ? 'dei uma olhada na presença online da empresa' : 'encontrei a empresa enquanto pesquisava negócios da região'
  return `${greeting}\n\nEu ${siteNote} e tive uma ideia que pode ajudar a ${lead.business || 'empresa'} a passar ainda mais credibilidade e transformar mais visitas em clientes.\n\nMontei uma sugestão de site pensada para o negócio: rápida, bonita no celular e com caminhos claros para orçamento e WhatsApp. Um site bem feito facilita que quem já está procurando pelo serviço confie e entre em contato.\n\nPosso te mostrar a ideia sem compromisso? Se não fizer sentido, é só me avisar que não insisto.`
}

export default function Home() {
  const [leads, setLeads] = useState([])
  const [form, setForm] = useState(initialLead)
  const [filter, setFilter] = useState('Todos')
  const [copied, setCopied] = useState('')
  const [search, setSearch] = useState({ niche: '', city: '' })
  useEffect(() => { try { setLeads(JSON.parse(localStorage.getItem('encontra-leads') || '[]')) } catch { setLeads([]) } }, [])
  useEffect(() => { localStorage.setItem('encontra-leads', JSON.stringify(leads)) }, [leads])
  const visible = useMemo(() => filter === 'Todos' ? leads : leads.filter(l => l.status === filter), [leads, filter])
  const updateForm = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const addLead = event => { event.preventDefault(); if (!form.business.trim()) return; setLeads(current => [{ ...form, id: crypto.randomUUID() }, ...current]); setForm(initialLead) }
  const updateLead = (id, patch) => setLeads(current => current.map(lead => lead.id === id ? { ...lead, ...patch } : lead))
  const removeLead = id => setLeads(current => current.filter(lead => lead.id !== id))
  const copy = async lead => { await navigator.clipboard.writeText(makeMessage(lead)); setCopied(lead.id); setTimeout(() => setCopied(''), 1600) }
  const openMaps = () => { const term = [search.niche, search.city].filter(Boolean).join(' em '); if (term) window.open(`https://www.google.com/maps/search/${encodeURIComponent(term)}`, '_blank', 'noopener,noreferrer') }
  return <main>
    <header className="hero"><div className="brand"><span className="brand-mark">E</span> encontra<span>leads</span></div><div className="hero-copy"><p className="eyebrow">PROSPECÇÃO LOCAL, DO SEU JEITO</p><h1>Encontre boas empresas.<br /><em>Comece conversas reais.</em></h1><p>Uma bancada simples para pesquisar, registrar e abordar negócios da sua região — sem assinatura, sem limite e sem disparo automático.</p></div><div className="hero-stat"><strong>{leads.length}</strong><span>leads salvos<br />neste navegador</span></div></header>
    <section className="finder panel"><div><p className="eyebrow">01 — ENCONTRE</p><h2>Abra uma busca local</h2><p>Use o Maps para descobrir empresas. Depois, adicione só as que fazem sentido para você.</p></div><div className="search-row"><input placeholder="Ex.: clínicas odontológicas" value={search.niche} onChange={e => setSearch({ ...search, niche: e.target.value })} /><input placeholder="Cidade ou bairro" value={search.city} onChange={e => setSearch({ ...search, city: e.target.value })} /><button className="primary" onClick={openMaps}>Pesquisar no Maps ↗</button></div></section>
    <section className="workbench"><form className="panel add-form" onSubmit={addLead}><p className="eyebrow">02 — REGISTRE</p><h2>Adicionar um lead</h2><label>Empresa<input required placeholder="Nome da empresa" value={form.business} onChange={e => updateForm('business', e.target.value)} /></label><div className="two"><label>Contato<input placeholder="Nome da pessoa" value={form.contact} onChange={e => updateForm('contact', e.target.value)} /></label><label>Canal<select value={form.channel} onChange={e => updateForm('channel', e.target.value)}><option>WhatsApp</option><option>Instagram</option><option>E-mail</option><option>LinkedIn</option></select></label></div><label>Site ou perfil (opcional)<input placeholder="https://..." value={form.website} onChange={e => updateForm('website', e.target.value)} /></label><label>O que você percebeu?<textarea placeholder="Ex.: Instagram ativo, mas não tem site próprio." value={form.observation} onChange={e => updateForm('observation', e.target.value)} /></label><button className="primary full" type="submit">Salvar lead</button></form>
    <section className="pipeline"><div className="pipeline-head"><div><p className="eyebrow">03 — ABORDE</p><h2>Seus leads</h2></div><div className="filters">{['Todos', 'Novo', 'Contatado', 'Respondeu', 'Fechado'].map(status => <button key={status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{status}</button>)}</div></div>{visible.length === 0 ? <div className="empty"><span>◎</span><h3>Sua lista está limpa</h3><p>Pesquise um nicho, escolha uma empresa e registre o primeiro contato aqui.</p></div> : <div className="lead-list">{visible.map(lead => <article className="lead" key={lead.id}><div className="lead-main"><div className="lead-title"><h3>{lead.business}</h3>{lead.contact && <span>• {lead.contact}</span>}</div><p>{lead.observation || `Canal: ${lead.channel}`}</p>{lead.website && <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank">Ver presença online ↗</a>}</div><div className="lead-actions"><select value={lead.status} onChange={e => updateLead(lead.id, { status: e.target.value })}><option>Novo</option><option>Contatado</option><option>Respondeu</option><option>Fechado</option></select><button className="copy" onClick={() => copy(lead)}>{copied === lead.id ? 'Copiado!' : 'Copiar mensagem'}</button><button className="trash" aria-label="Excluir lead" onClick={() => removeLead(lead.id)}>×</button></div><details><summary>Ver mensagem sugerida</summary><p className="message">{makeMessage(lead)}</p></details></article>)}</div>}</section></section><footer>Feito para abordagens pessoais e relevantes. Revise cada mensagem, respeite recusas e não use para disparos em massa.</footer>
  </main>
}
