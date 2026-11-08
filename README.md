# Leadfinder (100% gratuito)

Busca negócios locais no OpenStreetMap e mostra quais não têm site ou têm site fraco.
Sem cartão, sem faturamento.

## Rodar local
1. `npm install`
2. Copie `.env.example` para `.env.local` e defina `APP_PASSWORD`.
3. `npm run dev` → http://localhost:3000

## Deploy na Vercel (plano Hobby, grátis)
1. Suba esta pasta para um repositório no GitHub.
2. Vercel → Add New → Project → importe o repositório.
3. Em Environment Variables, adicione `APP_PASSWORD` (e `GOOGLE_API_KEY`, se quiser).
4. Deploy. Abra a URL e digite a senha na ferramenta.

## Chave opcional do PageSpeed (grátis)
Em console.cloud.google.com ative "PageSpeed Insights API" e crie uma chave.
Não exige faturamento.

## Atenção
Os dados do OpenStreetMap são feitos por voluntários: um negócio "sem site" pode ter site
que ninguém cadastrou. Use o botão "Conferir no Google" antes de abordar.
Status e anotações ficam salvos no navegador (localStorage).
