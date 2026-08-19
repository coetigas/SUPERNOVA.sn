// api/my-orders.js
// Devolve todos os pedidos de um cliente, buscando pelo número de WhatsApp
// (usado como "login" simples, sem senha).

import { kv } from "@vercel/kv";

function normalizeWhats(whats) {
  return (whats || "").replace(/\D/g, "");
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const whats = req.query.whats;
    if (!whats) {
      return res.status(400).json({ error: "Informe o WhatsApp" });
    }

    const whatsKey = normalizeWhats(whats);
    const codes = (await kv.lrange(`orders_by_whats:${whatsKey}`, 0, -1)) || [];

    const orders = [];
    for (const code of codes) {
      const order = await kv.get(`order:${code}`);
      if (order) orders.push(order);
    }

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("Erro ao buscar pedidos:", err);
    return res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
}
