// api/save-order.js
// Salva um novo pedido no banco de dados (Vercel KV), indexado pelo WhatsApp
// do cliente (pra "Meus Pedidos") e numa lista geral (pro painel do lojista).

import { kv } from "@vercel/kv";

function normalizeWhats(whats) {
  return (whats || "").replace(/\D/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { whats, nome, cpf, cep, end, cidade, items, total, paymentMethod } = req.body;

    if (!whats || !items || !total) {
      return res.status(400).json({ error: "Dados do pedido incompletos" });
    }

    const code = "SNOVA" + Date.now().toString().slice(-9);
    const whatsKey = normalizeWhats(whats);

    const order = {
      code,
      whats,
      nome: nome || "",
      cpf: cpf || "",
      cep: cep || "",
      end: end || "",
      cidade: cidade || "",
      items,
      total,
      paymentMethod: paymentMethod || "pix",
      status: "confirmado",
      placedAt: Date.now(),
    };

    await kv.set(`order:${code}`, order);
    await kv.lpush(`orders_by_whats:${whatsKey}`, code);
    await kv.lpush("all_orders", code);

    return res.status(200).json({ code });
  } catch (err) {
    console.error("Erro ao salvar pedido:", err);
    return res.status(500).json({ error: "Erro ao salvar pedido" });
  }
}
