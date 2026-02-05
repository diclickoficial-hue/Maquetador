/* =========================
   app.talles.js (FULL - corregido)
   - Talles (cards retractiles)
   - Medidas: UN SOLO "+" abajo + "✖" para borrar
   - Subtítulos: permitido al inicio (0 talles) o cada 2 talles (2,4,6...)
     y SOLO 1 por bloque (evita duplicados)
========================= */

/* ===== Helpers ===== */
function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function setStatus(msg, isError = false) {
  const el = qs("#status");
  if (!el) return;
  el.style.borderColor = isError ? "rgba(239,68,68,0.35)" : "rgba(229,231,235,1)";
  el.style.color = isError ? "var(--danger)" : "var(--muted)";
  el.textContent = msg;
}

function setCount() {
  const n = qsa(".talle-card").length;
  const badge = qs("#count-badge");
  if (badge) badge.textContent = String(n);
}

/* ===== TN entities ===== */
function tnEntities(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("Á", "&Aacute;").replaceAll("É", "&Eacute;").replaceAll("Í", "&Iacute;").replaceAll("Ó", "&Oacute;").replaceAll("Ú", "&Uacute;")
    .replaceAll("á", "&aacute;").replaceAll("é", "&eacute;").replaceAll("í", "&iacute;").replaceAll("ó", "&oacute;").replaceAll("ú", "&uacute;")
    .replaceAll("Ñ", "&Ntilde;").replaceAll("ñ", "&ntilde;")
    .replaceAll("–", "&ndash;");
}
function tnAttr(s) { return tnEntities(s); }

/* ===== Medidas ===== */
function refreshMeasureButtons(measuresEl) {
  const rows = qsa(".measure-row", measuresEl);
  const canDelete = rows.length > 2;

  rows.forEach(r => {
    const del = qs(".btn-measure-del", r);
    if (!del) return;
    del.disabled = !canDelete;
    del.style.opacity = canDelete ? "1" : "0.35";
    del.style.cursor = canDelete ? "pointer" : "not-allowed";
  });

  const footerDel = qs('[data-action="del-last-measure"]', measuresEl.parentElement);
  if (footerDel) {
    footerDel.disabled = !canDelete;
    footerDel.style.opacity = canDelete ? "1" : "0.35";
    footerDel.style.cursor = canDelete ? "pointer" : "not-allowed";
  }
}

function createMeasureRow({ label = "", value = "", unit = "cm" } = {}) {
  const row = document.createElement("div");
  row.className = "measure-row";

  row.innerHTML = `
    <input class="m-label" placeholder="Medida (ej: Pecho)" value="${label}">
    <input class="m-value" placeholder="Valor (ej: 90–94)" value="${value}">
    <input class="m-unit"  placeholder="Unidad" value="${unit}">
    <button class="mini del btn-remove btn-measure-del" type="button" title="Eliminar medida">✖</button>
  `;

  const onChange = () => { refreshHeaderSummary(row); window.updatePreview?.(); };

  qs(".m-label", row).addEventListener("input", onChange);
  qs(".m-value", row).addEventListener("input", onChange);
  qs(".m-unit", row).addEventListener("input", onChange);

  qs(".btn-measure-del", row).addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const measures = row.closest(".measures");
    if (!measures) return;

    const rows = qsa(".measure-row", measures);
    if (rows.length <= 2) return; // mantiene base

    row.remove();
    refreshMeasureButtons(measures);
    refreshHeaderSummary(measures);
    window.updatePreview?.();
  });

  return row;
}

/* ===== Summary ===== */
function buildMeasureSummaryFromCard(card) {
  const rows = qsa(".measure-row", card).map(r => {
    const label = (qs(".m-label", r)?.value ?? "").trim();
    const value = (qs(".m-value", r)?.value ?? "").trim();
    if (!label) return null;
    return `${label}: ${value || "—"}`;
  }).filter(Boolean);

  if (rows.length === 0) return "Medidas: —";
  const shown = rows.slice(0, 2).join(" | ");
  return rows.length > 2 ? `Medidas: ${shown} | …` : `Medidas: ${shown}`;
}

function refreshHeaderSummary(target) {
  const card =
    (target?.classList?.contains("talle-card") ? target :
      target?.closest?.(".talle-card")) || null;
  if (!card) return;

  const num = qs(".talle-num", card)?.value ?? "";
  const eu = qs(".talle-eu", card)?.value ?? "";

  qs(".h-num", card).textContent = num || "—";
  qs(".h-eu", card).textContent = eu || "—";
  qs(".h-sum", card).textContent = buildMeasureSummaryFromCard(card);
}

function refreshHeaderSummaryForAll() {
  qsa(".talle-card").forEach(refreshHeaderSummary);
}

/* ===== Talles (retractil) ===== */
function toggleCard(card) {
  if (!card) return;

  const openNow = !card.classList.contains("open");

  if (openNow) {
    qsa(".talle-card.open").forEach(x => {
      if (x !== card) {
        x.classList.remove("open");
        qs(".chev", x).textContent = "▸";
      }
    });
  }

  card.classList.toggle("open");
  const open = card.classList.contains("open");
  qs(".chev", card).textContent = open ? "▾" : "▸";
}

function removeTalle(card) {
  card?.remove();
  setCount();
  window.updatePreview?.();
}

function clearTalles() {
  qs("#form-container").innerHTML = "";
  setCount();
  window.updatePreview?.();
  setStatus("Talles borrados.");
}

function addTalle(prefill = null) {
  const container = qs("#form-container");
  const card = document.createElement("div");
  card.className = "talle-card";

  const num = prefill?.num ?? "";
  const eu = prefill?.eu ?? "";
  const link = prefill?.link ?? "#";

  card.innerHTML = `
    <div class="talle-header" title="Click para abrir/cerrar">
      <div class="chev">▸</div>

      <div class="tline">
        <span class="pill"><strong>Talle:</strong> <span class="h-num">${num || "—"}</span></span>
        <span class="pill"><span class="h-eu">${eu || "—"}</span></span>
        <span class="summary h-sum">Medidas: —</span>
      </div>

      <div class="t-actions">
        <button class="mini btn-edit" type="button">Editar</button>
        <button class="mini del btn-remove" type="button">Eliminar</button>
      </div>
    </div>

    <div class="talle-body">
      <div class="grid3">
        <input class="talle-num" placeholder="Talle (ej: 38)" value="${num}">
        <input class="talle-eu" placeholder="EU (ej: S)" value="${eu}">
        <input class="talle-link" placeholder="Link botón VER" value="${link}">
      </div>

      <div class="measures"></div>

      <div class="measures-footer">
        <button class="btn mini" type="button" data-action="add-measure" title="Agregar medida">＋</button>
        <button class="btn btn-danger mini" type="button" data-action="del-last-measure" title="Eliminar última medida">✖</button>
      </div>
    </div>
  `;

  const header = qs(".talle-header", card);
  const actions = qs(".t-actions", card);

  header.addEventListener("click", (e) => {
    if (actions.contains(e.target)) return;
    toggleCard(card);
  });

  qs(".btn-edit", card).addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleCard(card);
  });

  qs(".btn-remove", card).addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    removeTalle(card);
  });

  qs(".talle-num", card).addEventListener("input", () => { refreshHeaderSummary(card); window.updatePreview?.(); });
  qs(".talle-eu", card).addEventListener("input", () => { refreshHeaderSummary(card); window.updatePreview?.(); });
  qs(".talle-link", card).addEventListener("input", () => window.updatePreview?.());

  const measuresEl = qs(".measures", card);
  const defaultMeasures = prefill?.measures ?? [
    { label: "Cintura", value: "", unit: "cm" },
    { label: "Cadera", value: "", unit: "cm" }
  ];
  defaultMeasures.forEach(m => measuresEl.appendChild(createMeasureRow(m)));

  qs('[data-action="add-measure"]', card).addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    measuresEl.appendChild(createMeasureRow({ label: "", value: "", unit: "cm" }));
    refreshMeasureButtons(measuresEl);
    refreshHeaderSummary(card);
    window.updatePreview?.();
  });

  qs('[data-action="del-last-measure"]', card).addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();

    const rows = qsa(".measure-row", measuresEl);
    if (rows.length <= 2) return;
    rows[rows.length - 1].remove();

    refreshMeasureButtons(measuresEl);
    refreshHeaderSummary(card);
    window.updatePreview?.();
  });

  container.appendChild(card);

  refreshMeasureButtons(measuresEl);
  refreshHeaderSummary(card);
  setCount();
  window.updatePreview?.();
}

/* ===== Subtítulos ===== */
function getTallesCount() {
  return qsa("#form-container .talle-card").length;
}

function canInsertSubtitleNow() {
  const container = qs("#form-container");
  if (!container) return false;

  const n = getTallesCount();

  // ✅ Permite al inicio (0) SOLO si no hay un subtítulo ya al principio
  if (n === 0) {
    const first = container.firstElementChild;
    return !(first && first.classList.contains("subtitle-card"));
  }

  // ✅ Solo en múltiplos de 2 talles (2,4,6...)
  if (n % 2 !== 0) return false;

  // ✅ Solo 1 por bloque: no permitir si ya hay un subtítulo justo después del talle #n
  const talleCards = qsa("#form-container .talle-card");
  const lastTalle = talleCards[n - 1];
  if (!lastTalle) return false;

  const next = lastTalle.nextElementSibling;
  return !(next && next.classList.contains("subtitle-card"));
}

function addSubtitle(prefillText = "TALLES NUMÉRICOS") {
  const container = qs("#form-container");
  if (!container) return;

  if (!canInsertSubtitleNow()) {
    setStatus("Subtítulo: al inicio (0) o cada 2 talles (2,4,6...) y solo 1 por bloque.", true);
    return;
  }

  const block = document.createElement("div");
  block.className = "subtitle-card";
  block.innerHTML = `
    <span class="pill">Subtítulo</span>
    <input class="subtitle-text" type="text" value="${prefillText}">
    <button class="mini del btn-remove subtitle-del" type="button">Eliminar</button>
  `;

  qs(".subtitle-text", block).addEventListener("input", () => window.updatePreview?.());

  qs(".subtitle-del", block).addEventListener("click", (e) => {
    e.preventDefault();
    block.remove();
    window.updatePreview?.();
    setStatus("Subtítulo eliminado.");
  });

  const n = getTallesCount();

  if (n === 0) {
    container.prepend(block);
  } else {
    const talleCards = qsa("#form-container .talle-card");
    const lastTalle = talleCards[n - 1];
    if (lastTalle) lastTalle.insertAdjacentElement("afterend", block);
    else container.appendChild(block);
  }

  window.updatePreview?.();
  setStatus("Subtítulo agregado ✅");
}

/* ===== Export globals (para app.core.js) ===== */
window.qs = qs;
window.qsa = qsa;
window.setStatus = setStatus;
window.setCount = setCount;
window.tnEntities = tnEntities;
window.tnAttr = tnAttr;

window.addTalle = addTalle;
window.clearTalles = clearTalles;
window.refreshHeaderSummaryForAll = refreshHeaderSummaryForAll;

window.addSubtitle = addSubtitle;
window.canInsertSubtitleNow = canInsertSubtitleNow;
