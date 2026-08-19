// api/order-status.js
// Devolve o status atual de um pedido específico, pra tela de rastreio.

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: "Informe o código do pedido" });
    }

    const order = await kv.get(`order:${code}`);
    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado", status: "confirmado" });
    }

    return res.status(200).json({ status: order.status || "confirmado", code: order.code });
  } catch (err) {
    console.error("Erro ao buscar status do pedido:", err);
    return res.status(500).json({ error: "Erro ao buscar status" });
  }
}
