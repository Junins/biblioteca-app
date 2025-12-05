const express = require("express");
const db = require("../db");
const { authenticate, authorizeRole } = require("../auth/authMiddleware");
const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  const items = await db("items").select();
  res.json(items);
});

router.post("/", authenticate, async (req, res) => {
  const { name, description } = req.body;
  await db("items").insert({
    name,
    description,
    owner_id: req.user.id,
  });

  res.json({ message: "Item criado." });
});

router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const item = await db("items").where({ id }).first();

  if (!item) return res.status(404).json({ error: "Item não encontrado." });

  if (item.owner_id !== req.user.id && req.user.role !== "admin")
    return res.status(403).json({ error: "Sem permissão." });

  await db("items")
    .where({ id })
    .update({ name: req.body.name, description: req.body.description });

  res.json({ message: "Item atualizado." });
});

router.delete("/:id", authenticate, authorizeRole("admin"), async (req, res) => {
  await db("items").where({ id: req.params.id }).delete();
  res.json({ message: "Removido." });
});

module.exports = router;
