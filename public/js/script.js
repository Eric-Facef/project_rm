const API_URL = ""; // se backend e frontend estiverem juntos, deixe vazio ""

let alunos = [];

// ======== UTIL ========
function validaRM(rm) {
  return /^\d{1,4}$/.test(rm);
}
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, c => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]
  ));
}

// ======== MODAL ========
function abrirModal(titulo, corpoHtml, onConfirm) {
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-title">${titulo}</div>
      <div class="modal-body">${corpoHtml}</div>
      <div class="modal-actions">
        <button id="cancelarBtn" class="btn neutral">Cancelar</button>
        <button id="confirmarBtn" class="btn primary">Confirmar</button>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
  const cancelar = document.getElementById("cancelarBtn");
  const confirmar = document.getElementById("confirmarBtn");
  const fechar = () => {
    modal.classList.add("hidden");
    modal.innerHTML = "";
  };
  cancelar.addEventListener("click", fechar, { once: true });
  confirmar.addEventListener("click", async () => {
    await onConfirm();
    fechar();
  }, { once: true });
}

// ======== CRUD ========
async function carregarAlunos() {
  try {
    const res = await fetch(`${API_URL}/alunos`);
    alunos = await res.json();
    renderTabela(alunos);
  } catch (e) {
    console.error("Erro ao carregar alunos:", e);
  }
}

function renderTabela(lista) {
  const tbody = document.getElementById("tabelaCorpo");
  tbody.innerHTML = "";
  lista.forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(a.nome)}</td>
      <td>${escapeHtml(a.rm)}</td>
      <td>
        <button class="small-btn edit">Editar</button>
        <button class="small-btn delete">Excluir</button>
      </td>
    `;
    tr.querySelector(".edit").onclick = () => editarAluno(a);
    tr.querySelector(".delete").onclick = () => excluirAluno(a.id);
    tbody.appendChild(tr);
  });
}

function abrirAdicionarModal() {
  abrirModal(
    "Adicionar Aluno",
    `
      <input id="nomeInput" type="text" placeholder="Nome (máx 80 caracteres)" maxlength="80">
      <input id="rmInput" type="text" inputmode="numeric" placeholder="RM (até 4 dígitos)" maxlength="4">
      <div class="center">RM deve ser único e numérico até 4 dígitos</div>
    `,
    async () => {
      const nome = document.getElementById("nomeInput").value.trim();
      const rm = document.getElementById("rmInput").value.trim();
      if (!nome) return alert("Digite o nome.");
      if (!validaRM(rm)) return alert("RM inválido: deve ter até 4 dígitos numéricos.");
      if (alunos.some(a => a.rm === rm)) return alert("Este RM já está cadastrado.");

      await fetch(`${API_URL}/alunos`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ nome, rm }),
      });
      await carregarAlunos();
    }
  );

  setTimeout(() => {
    const rmInput = document.getElementById("rmInput");
    if (rmInput)
      rmInput.addEventListener("input", () => {
        rmInput.value = rmInput.value.replace(/\D/g, "").slice(0, 4);
      });
  }, 50);
}

function editarAluno(a) {
  abrirModal(
    "Editar Aluno",
    `
      <input id="nomeInput" type="text" value="${escapeHtml(a.nome)}" maxlength="80">
      <input id="rmInput" type="text" value="${escapeHtml(a.rm)}" inputmode="numeric" maxlength="4">
      <div class="center">RM deve ser único e numérico até 4 dígitos</div>
    `,
    async () => {
      const nome = document.getElementById("nomeInput").value.trim();
      const rm = document.getElementById("rmInput").value.trim();
      if (!nome) return alert("Digite o nome.");
      if (!validaRM(rm)) return alert("RM inválido: deve ter até 4 dígitos numéricos.");
      if (alunos.some(x => x.rm === rm && x.id !== a.id)) return alert("Este RM já está cadastrado.");

      await fetch(`${API_URL}/alunos/${a.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ nome, rm }),
      });
      await carregarAlunos();
    }
  );

  setTimeout(() => {
    const rmInput = document.getElementById("rmInput");
    if (rmInput)
      rmInput.addEventListener("input", () => {
        rmInput.value = rmInput.value.replace(/\D/g, "").slice(0, 4);
      });
  }, 50);
}

function excluirAluno(id) {
  abrirModal(
    "Excluir Aluno",
    `<div class="center">Tem certeza que deseja excluir este aluno?</div>`,
    async () => {
      await fetch(`${API_URL}/alunos/${id}`, { method: "DELETE" });
      await carregarAlunos();
    }
  );
}

function pesquisarAluno() {
  const termo = document.getElementById("pesquisaInput").value.trim().toLowerCase();
  if (!termo) return renderTabela(alunos);
  const filtrados = alunos.filter(
    a =>
      a.nome.toLowerCase().includes(termo) ||
      a.rm.toString().includes(termo)
  );
  renderTabela(filtrados);
}

// ======== EVENTOS ========
document.getElementById("adicionarBtn").addEventListener("click", abrirAdicionarModal);
document.getElementById("listarBtn").addEventListener("click", carregarAlunos);
document.getElementById("pesquisarBtn").addEventListener("click", pesquisarAluno);

// ======== INICIALIZAÇÃO ========
carregarAlunos();
