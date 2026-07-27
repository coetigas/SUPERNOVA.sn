# SUPERNOVA Store

## Antes de publicar

1. **Troque a Public Key do Mercado Pago**
   Abra `index.html`, procure por `MP_PUBLIC_KEY` (é só usar Ctrl+F) e troque
   `"TEST-COLE-SUA-PUBLIC-KEY-AQUI"` pela sua Public Key de teste do Mercado Pago.

2. **Configure a Access Token na Vercel (NUNCA no código)**
   No painel do seu projeto na Vercel, vá em:
   `Settings` → `Environment Variables`
   Adicione:
   - Nome: `MP_ACCESS_TOKEN`
   - Valor: sua Access Token do Mercado Pago (de teste primeiro)

   Depois de adicionar, clique em **Redeploy** pra ela valer.

## Testando

Use os cartões de teste do Mercado Pago pra simular pagamentos sem gastar
dinheiro de verdade, enquanto estiver usando as credenciais de TESTE (as que
começam com `TEST-`).

## Indo pra produção (dinheiro de verdade)

1. No painel do Mercado Pago, pegue as credenciais de **produção** (Public Key
   e Access Token, sem o prefixo `TEST-`).
2. Troque a Public Key no `index.html` (mesmo passo do item 1 acima).
3. Troque o valor da variável `MP_ACCESS_TOKEN` na Vercel pela Access Token de
   produção.
4. Redeploy.

## Estrutura do projeto

- `index.html` — o site inteiro (loja + carrinho + checkout)
- `api/process-payment.js` — roda no servidor da Vercel, cria a cobrança no
  Mercado Pago usando a Access Token secreta. Também salva o cartão do cliente
  (via token, nunca o número real) pra facilitar a próxima compra.
