// api/admin-orders.js
// Lista TODOS os pedidos da loja — só acessível com a senha de administrador
// (guardada na variável de ambiente ADMIN_PASSWORD, nunca no código).

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { password } = req.query;

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: "Senha incorreta" });
    }

    const codes = (await kv.lrange("all_orders", 0, 200)) || [];
    const orders = [];
    for (const code of codes) {
      const order = await kv.get(`order:${code}`);
      if (order) orders.push(order);
    }

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("Erro ao buscar pedidos (admin):", err);
    return res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
}
