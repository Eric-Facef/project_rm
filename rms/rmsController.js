import { pool } from "../db.js";

export async function seedRMs() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rms (
      id SERIAL PRIMARY KEY,
      numero VARCHAR(10) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'disponivel',
      data_usado TIMESTAMP
    );
  `);

  const res = await pool.query("SELECT numero FROM rms ORDER BY numero DESC LIMIT 1");
  let ultimoNumero = 5499;
  if (res.rows.length > 0) {
    const match = res.rows[0].numero.match(/RM-(\d+)/);
    if (match) ultimoNumero = parseInt(match[1]);
  }

  if (ultimoNumero >= 7000) return;

  const valores = [];
  for (let n = ultimoNumero + 1; n <= 7000; n++) {
    const numero = `RM-${n.toString().padStart(4, "0")}`;
    valores.push(`('${numero}', 'disponivel')`);
  }

  if (valores.length > 0) {
    const query = `
      INSERT INTO rms (numero, status)
      VALUES ${valores.join(",")}
      ON CONFLICT (numero) DO NOTHING;
    `;
    await pool.query(query);
    console.log(`RMs carregados de ${ultimoNumero + 1} até 7000`);
  }
}

export async function listarRMs() {
  const result = await pool.query("SELECT * FROM rms ORDER BY numero ASC");
  return result.rows;
}

export async function usarRM(numero) {
  const next = await pool.query(`
    SELECT numero FROM rms
    WHERE status='disponivel'
    ORDER BY numero ASC
    LIMIT 1
  `);

  if (next.rowCount === 0) throw new Error("Nenhum RM disponível");

  const proximoNumero = next.rows[0].numero;

  if (numero !== proximoNumero) {
    throw new Error(`Você só pode usar o próximo RM disponível (${proximoNumero})`);
  }

  await pool.query(
    "UPDATE rms SET status='usado', data_usado=NOW() WHERE numero=$1",
    [numero]
  );
}

export async function voltarUltimoRM() {
  const last = await pool.query(`
    SELECT numero FROM rms WHERE status='usado'
    ORDER BY data_usado DESC LIMIT 1
  `);
  if (last.rowCount === 0) throw new Error("Nenhum RM usado encontrado");
  const numero = last.rows[0].numero;
  await pool.query("UPDATE rms SET status='disponivel', data_usado=NULL WHERE numero=$1", [numero]);
  return numero;
}

export async function adicionarRMs(qtd) {
  const ultimo = await pool.query("SELECT numero FROM rms ORDER BY numero DESC LIMIT 1");
  let lastNum = 7000;
  if (ultimo.rowCount > 0) {
    const m = ultimo.rows[0].numero.match(/RM-(\d+)/);
    if (m) lastNum = parseInt(m[1]);
  }

  const inseridos = [];
  for (let i = 1; i <= qtd; i++) {
    const n = lastNum + i;
    const numero = `RM-${n.toString().padStart(4, "0")}`;
    await pool.query(
      "INSERT INTO rms (numero, status) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [numero, "disponivel"]
    );
    inseridos.push(numero);
  }
  return inseridos;
}
