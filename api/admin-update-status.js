// api/admin-update-status.js
// Atualiza o status de rastreio de um pedido — só quem tem a senha de
// administrador consegue alterar isso, os clientes só podem visualizar.

import { kv } from "@vercel/kv";

const VALID_STATUSES = ["confirmado", "preparando", "postado", "transito", "saiu", "entregue"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { password, code, status } = req.body;

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: "Senha incorreta" });
    }

    if (!code || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const order = await kv.get(`order:${code}`);
    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    order.status = status;
    await kv.set(`order:${code}`, order);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    return res.status(500).json({ error: "Erro ao atualizar status" });
  }
}
