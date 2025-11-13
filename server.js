import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { pool } from "./db.js";           // usa o pool do db.js
import rmsRoutes from "./rms/rmsRoutes.js"; // rotas de RMs

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Cria tabela de alunos se não existir
pool.query(`
  CREATE TABLE IF NOT EXISTS alunos (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    rm TEXT NOT NULL UNIQUE
  )
`).catch(err => console.error("Erro ao criar tabela de alunos:", err));

// === ROTAS DE ALUNOS ===

// Criar aluno
app.post("/alunos", async (req, res) => {
  const { nome, rm } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO alunos (nome, rm) VALUES ($1, $2) RETURNING *",
      [nome, rm]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar alunos
app.get("/alunos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM alunos ORDER BY nome ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar aluno
app.put("/alunos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, rm } = req.body;
  try {
    const result = await pool.query(
      "UPDATE alunos SET nome=$1, rm=$2 WHERE id=$3 RETURNING *",
      [nome, rm, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir aluno
app.delete("/alunos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM alunos WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === ROTAS DE RMs ===
app.use("/rms", rmsRoutes);

// Inicia o servidor
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
