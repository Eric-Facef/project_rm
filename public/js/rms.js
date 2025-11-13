const grid = document.getElementById("rmsGrid");
const modal = document.getElementById("modal");
const titulo = document.getElementById("modalTitulo");
const texto = document.getElementById("modalTexto");
const confirmar = document.getElementById("modalConfirm");
const cancelar = document.getElementById("modalCancel");

let rms = [];

async function carregarRMs() {
  try {
    const res = await fetch("/rms");
    if (!res.ok) throw new Error("Falha ao carregar RMs");
    rms = await res.json();
    render();
  } catch (err) {
    abrirMensagem("Erro", "Não foi possível carregar os RMs.");
    console.error(err);
  }
}

function render() {
  grid.innerHTML = "";
  if (!rms || rms.length === 0) {
    grid.innerHTML = "<p style='text-align:center'>Nenhum RM encontrado.</p>";
    return;
  }

  rms.forEach(r => {
    const div = document.createElement("div");
    div.className = "rm " + r.status;
    div.textContent = r.numero;

    if (r.status === "disponivel") {
      div.addEventListener("click", () => confirmarUso(r.numero));
    }

    grid.appendChild(div);
  });
}

function abrirModal(tit, msg, onConfirm = null) {
  titulo.textContent = tit;
  texto.textContent = msg;
  modal.classList.remove("hidden");

  if (onConfirm) {
    confirmar.style.display = "inline-block";
    confirmar.onclick = async () => {
      await onConfirm();
      fecharModal();
    };
  } else {
    confirmar.style.display = "none";
  }

  cancelar.onclick = fecharModal;
}

function abrirMensagem(tit, msg) {
  abrirModal(tit, msg);
}

function fecharModal() {
  modal.classList.add("hidden");
}

/* === CONFIRMAR USO === */
async function confirmarUso(numero) {
  const modal = document.getElementById("orderModal");
  const titleEl = document.getElementById("orderModalTitle");
  const textEl = document.getElementById("orderModalText");

  // prepara modal para confirmação
  titleEl.textContent = "Confirmar uso";
  textEl.textContent = `Deseja marcar ${numero} como usado?`;

  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.display = "flex";
  buttonsDiv.style.justifyContent = "center";
  buttonsDiv.style.gap = "10px";

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.style.padding = "8px 12px";
  btnCancelar.style.borderRadius = "8px";
  btnCancelar.style.border = "none";
  btnCancelar.style.background = "#374151";
  btnCancelar.style.color = "#fff";
  btnCancelar.style.cursor = "pointer";

  const btnConfirmar = document.createElement("button");
  btnConfirmar.textContent = "Confirmar";
  btnConfirmar.style.padding = "8px 12px";
  btnConfirmar.style.borderRadius = "8px";
  btnConfirmar.style.border = "none";
  btnConfirmar.style.background = "#38bdf8";
  btnConfirmar.style.color = "#0f172a";
  btnConfirmar.style.cursor = "pointer";
  btnConfirmar.style.fontWeight = "bold";

  const parentDiv = textEl.parentElement;
  const oldButtons = parentDiv.querySelectorAll("button");
  oldButtons.forEach(b => b.remove());
  buttonsDiv.appendChild(btnCancelar);
  buttonsDiv.appendChild(btnConfirmar);
  parentDiv.appendChild(buttonsDiv);

  modal.classList.remove("hidden");
  btnCancelar.onclick = () => modal.classList.add("hidden");

  btnConfirmar.onclick = async () => {
    try {
      const res = await fetch("/rms/usar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero })
      });

      const json = await res.json();

      if (!res.ok) {
        titleEl.textContent = "Ação não permitida";
        textEl.textContent = json.error || "Operação não permitida";
        buttonsDiv.remove();

        const btnFechar = document.createElement("button");
        btnFechar.textContent = "Fechar";
        btnFechar.style.padding = "8px 12px";
        btnFechar.style.borderRadius = "8px";
        btnFechar.style.border = "none";
        btnFechar.style.background = "#374151";
        btnFechar.style.color = "#fff";
        btnFechar.style.cursor = "pointer";

        const novoDiv = document.createElement("div");
        novoDiv.style.display = "flex";
        novoDiv.style.justifyContent = "center";
        novoDiv.style.marginTop = "10px";
        novoDiv.appendChild(btnFechar);
        parentDiv.appendChild(novoDiv);

        btnFechar.onclick = () => modal.classList.add("hidden");
        return;
      }

      modal.classList.add("hidden");
      await carregarRMs();
    } catch (err) {
      console.error(err);
    }
  };
}

/* === VOLTAR ÚLTIMO RM === */
document.getElementById("reverterBtn").onclick = () => {
  const modal = document.getElementById("orderModal");
  const titleEl = document.getElementById("orderModalTitle");
  const textEl = document.getElementById("orderModalText");

  titleEl.textContent = "Voltar RM";
  textEl.textContent = "Deseja voltar o último RM usado?";

  const buttonsDiv = document.createElement("div");
  buttonsDiv.style.display = "flex";
  buttonsDiv.style.justifyContent = "center";
  buttonsDiv.style.gap = "10px";
  buttonsDiv.style.marginTop = "10px";

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.style.padding = "8px 12px";
  btnCancelar.style.borderRadius = "8px";
  btnCancelar.style.border = "none";
  btnCancelar.style.background = "#374151";
  btnCancelar.style.color = "#fff";
  btnCancelar.style.cursor = "pointer";

  const btnConfirmar = document.createElement("button");
  btnConfirmar.textContent = "Confirmar";
  btnConfirmar.style.padding = "8px 12px";
  btnConfirmar.style.borderRadius = "8px";
  btnConfirmar.style.border = "none";
  btnConfirmar.style.background = "#38bdf8";
  btnConfirmar.style.color = "#0f172a";
  btnConfirmar.style.cursor = "pointer";
  btnConfirmar.style.fontWeight = "bold";

  const parentDiv = textEl.parentElement;
  const oldButtons = parentDiv.querySelectorAll("button");
  oldButtons.forEach(b => b.remove());
  buttonsDiv.appendChild(btnCancelar);
  buttonsDiv.appendChild(btnConfirmar);
  parentDiv.appendChild(buttonsDiv);

  modal.classList.remove("hidden");
  btnCancelar.onclick = () => modal.classList.add("hidden");

  btnConfirmar.onclick = async () => {
    try {
      const res = await fetch("/rms/voltar", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        titleEl.textContent = "Erro";
        textEl.textContent = json.error || "Nenhum RM usado encontrado.";
        buttonsDiv.remove();

        const btnFechar = document.createElement("button");
        btnFechar.textContent = "Fechar";
        btnFechar.style.padding = "8px 12px";
        btnFechar.style.borderRadius = "8px";
        btnFechar.style.border = "none";
        btnFechar.style.background = "#374151";
        btnFechar.style.color = "#fff";
        btnFechar.style.cursor = "pointer";

        const divFechar = document.createElement("div");
        divFechar.style.display = "flex";
        divFechar.style.justifyContent = "center";
        divFechar.style.marginTop = "10px";
        divFechar.appendChild(btnFechar);
        parentDiv.appendChild(divFechar);

        btnFechar.onclick = () => modal.classList.add("hidden");
        return;
      }

      modal.classList.add("hidden");
      await carregarRMs();
    } catch (err) {
      console.error(err);
      modal.classList.add("hidden");
      alert("Erro ao tentar reverter RM.");
    }
  };
};

/* === ADICIONAR NOVOS RMS === */
document.getElementById("adicionarBtn").onclick = () => {
  abrirModal("Adicionar RMs", "Quantos novos RMs deseja adicionar?", async () => {
    const qtd = prompt("Digite a quantidade:");
    if (qtd) {
      const n = parseInt(qtd, 10);
      if (isNaN(n) || n <= 0) {
        abrirMensagem("Erro", "Informe uma quantidade válida.");
        return;
      }
      try {
        const res = await fetch("/rms/adicionar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantidade: n })
        });
        const data = await res.json();
        if (!res.ok) {
          abrirMensagem("Erro", data.error || "Falha ao adicionar RMs.");
          return;
        }
        await carregarRMs();
      } catch (err) {
        abrirMensagem("Erro", "Falha ao comunicar com o servidor.");
        console.error(err);
      }
    }
  });
};

carregarRMs();
