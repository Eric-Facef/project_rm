import express from "express";
import {
  seedRMs,
  listarRMs,
  usarRM,
  voltarUltimoRM,
  adicionarRMs
} from "./rmsController.js";

const router = express.Router();

await seedRMs();

router.get("/", async (req, res) => {
  try {
    const rms = await listarRMs();
    res.json(rms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/usar", async (req, res) => {
  const { numero } = req.body;
  try {
    await usarRM(numero);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/voltar", async (req, res) => {
  try {
    const reverted = await voltarUltimoRM();
    res.json({ ok: true, reverted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/adicionar", async (req, res) => {
  const { quantidade } = req.body;
  try {
    const inseridos = await adicionarRMs(parseInt(quantidade));
    res.json({ ok: true, inseridos });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
