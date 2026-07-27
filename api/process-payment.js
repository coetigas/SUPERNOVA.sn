// api/process-payment.js
// Função "backend" que roda na Vercel. Recebe os dados do cartão (já tokenizados
// pelo Card Payment Brick, nunca o número real do cartão) e cria a cobrança
// direto no Mercado Pago, usando a Access Token secreta guardada como variável
// de ambiente (nunca fica exposta no código do site).

import { MercadoPagoConfig, Payment, Customer, CustomerCard } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const body = req.body;
    const {
      token,
      issuer_id,
      payment_method_id,
      transaction_amount,
      installments,
      payer,
      customerName,
      customerWhats,
    } = body;

    if (!token || !transaction_amount || !payment_method_id) {
      return res.status(400).json({ error: "Dados do cartão incompletos" });
    }

    const payerEmail = payer?.email || `cliente-${Date.now()}@supernova.store`;

    // 1) Tenta localizar (ou cria) um "Customer" no Mercado Pago pelo e-mail do
    //    cliente. Isso permite guardar o cartão salvo pra próxima compra sem
    //    nunca lidarmos com o número real do cartão.
    const customerClient = new Customer(client);
    let customerId = null;
    try {
      const search = await customerClient.search({ options: { email: payerEmail } });
      if (search?.results?.length > 0) {
        customerId = search.results[0].id;
      } else {
        const newCustomer = await customerClient.create({
          body: {
            email: payerEmail,
            first_name: customerName || "Cliente",
          },
        });
        customerId = newCustomer.id;
      }
    } catch (custErr) {
      console.warn("Não foi possível localizar/criar customer:", custErr?.message);
    }

    // 2) Salva o cartão (tokenizado) no customer, pra próxima compra ser mais
    //    rápida (o cliente só confirma o CVV depois).
    if (customerId) {
      try {
        const cardClient = new CustomerCard(client);
        await cardClient.create({
          customerId,
          body: { token },
        });
      } catch (cardErr) {
        // Não é crítico se falhar em salvar o cartão — a cobrança continua.
        console.warn("Não foi possível salvar o cartão no customer:", cardErr?.message);
      }
    }

    // 3) Cria a cobrança de verdade.
    const paymentClient = new Payment(client);
    const paymentResult = await paymentClient.create({
      body: {
        transaction_amount: Number(transaction_amount),
        token,
        description: "Pedido SUPERNOVA",
        installments: Number(installments) || 1,
        payment_method_id,
        issuer_id,
        payer: {
          email: payerEmail,
          identification: payer?.identification || undefined,
        },
        metadata: {
          customer_name: customerName || "",
          customer_whatsapp: customerWhats || "",
        },
      },
    });

    return res.status(200).json({
      status: paymentResult.status,
      status_detail: paymentResult.status_detail,
      id: paymentResult.id,
      customer_id: customerId,
    });
  } catch (err) {
    console.error("Erro ao processar pagamento:", err);
    return res.status(500).json({ error: "Erro ao processar pagamento", details: err?.message });
  }
}
