/* =========================
   app.core.js (FULL)
   Requiere: app.talles.js (expone window.qs/qsa/setStatus/setCount/addTalle/clearTalles/refreshHeaderSummaryForAll/tnEntities/tnAttr)
========================= */

let CURRENT_GENDER = "hombre";

/* ===== Safe wrappers ===== */
function _qs(sel, root=document){
  return (window.qs ? window.qs(sel, root) : root.querySelector(sel));
}
function _qsa(sel, root=document){
  return (window.qsa ? window.qsa(sel, root) : Array.from(root.querySelectorAll(sel)));
}
function _tn(s){ return window.tnEntities ? window.tnEntities(s) : String(s ?? ""); }
function _attr(s){ return window.tnAttr ? window.tnAttr(s) : String(s ?? ""); }

/* ===== Género ===== */
function setGender(g) {
  CURRENT_GENDER = (g === "mujer") ? "mujer" : "hombre";

  _qsa("#genderSeg .seg-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.gender === CURRENT_GENDER);
  });

  updatePreview();
}

/* ===== Data read ===== */
function readConfig() {
  return {
    titulo: _tn(_qs("#guia-titulo")?.value ?? "GUÍA DE TALLES"),
    subtitulo: _tn(_qs("#guia-subtitulo")?.value ?? "ELEGÍ TU TALLE SEGÚN TUS MEDIDAS"),
    verTodoText: _tn(_qs("#ver-todo-text")?.value ?? "VER TODO CRUZO"),
    verTodoHref: _attr(_qs("#ver-todo-href")?.value ?? "#"),
  };
}

function readTalles() {
  return _qsa(".talle-card").map(card => {
    const num  = _tn(_qs(".talle-num", card)?.value ?? "");
    const eu   = _tn(_qs(".talle-eu", card)?.value ?? "");
    const link = _attr(_qs(".talle-link", card)?.value ?? "#");

    const measures = _qsa(".measure-row", card).map(r => ({
      label: _tn(_qs(".m-label", r)?.value ?? ""),
      value: _tn(_qs(".m-value", r)?.value ?? ""),
      unit:  _tn(_qs(".m-unit",  r)?.value ?? "")
    })).filter(m => (m.label.trim() || m.value.trim()));

    return { num, eu, link, measures };
  });
}

/* =========================
   PREVIEW: mismos grids, distintos colores
========================= */

function buildCardHtml(t, theme) {
  const measuresHtml = (t.measures || [])
    .map(m => {
      const label = (m.label || "").trim();
      const value = (m.value || "").trim();
      const unit  = (m.unit  || "").trim();
      if (!label) return "";
      const unitPart = unit ? ` ${unit}` : "";
      return `<strong>${label}:</strong> ${value}${unitPart}`;
    })
    .filter(Boolean)
    .join("<br />");

  return `
<div style="
  background:${theme.cardBg};
  border:2px solid ${theme.cardBorder};
  padding:22px 18px 18px;
  text-align:center;

  /* ✅ tamaño estable */
  min-height:340px;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
">
  <div>
    <div style="font-size:56px; font-weight:900; color:${theme.numColor}; line-height:1;">${t.num || "&nbsp;"}</div>
    <div style="font-size:56px; font-weight:900; color:${theme.numGhostColor}; line-height:1;">&nbsp;</div>

    <!-- ✅ Badge angosto (solo valor) -->
    <div style="
      margin:10px auto 16px;
      padding:5px 10px;
      font-size:12px;
      color:${theme.euColor};
      font-weight:800;
      border:1px solid ${theme.cardBorder};
      background:transparent;
      display:inline-block;
      width:fit-content;
      border-radius:999px;
      line-height:1;
      white-space:nowrap;
    ">${t.eu || "&nbsp;"}</div>

    <!-- ✅ bloque medidas estable -->
    <div style="
      font-size:13px;
      line-height:1.8;
      color:${theme.textColor};
      margin-bottom:18px;
      min-height:80px;
      overflow:hidden;
    ">
      ${measuresHtml || "&nbsp;"}
    </div>
  </div>

  <div>
    <a style="
      padding:12px 22px;
      background:${theme.btnCardBg};
      color:${theme.btnCardText};
      text-decoration:none;
      font-size:13px;
      font-weight:900;
      line-height:1;
      display:inline-block;
    " href="${t.link}">VER</a>
  </div>
</div>`.trim();
}

function buildGridTable2Cols(cardsHtml, theme) {
  let rows = "";
  for (let i = 0; i < cardsHtml.length; i += 2) {
    const a = cardsHtml[i] || "";
    const b = cardsHtml[i + 1] || "";
    rows += `
<tr>
  <td style="width:50%; padding:10px; vertical-align:top;">${a || "&nbsp;"}</td>
  <td style="width:50%; padding:10px; vertical-align:top;">${b || "&nbsp;"}</td>
</tr>`;
  }

  return `
<table style="
  width:100%;
  border-collapse:collapse;
  table-layout:fixed;
  margin:0 auto;
">
  <tbody>${rows}</tbody>
</table>`.trim();
}

function buildTnBlockUnified(cfg, talles, theme, genderLabel) {
  const cards = talles.map(t => buildCardHtml(t, theme));
  const grid = buildGridTable2Cols(cards, theme);

  return `
<div style="
  max-width:900px;
  margin:0 auto;
  padding:20px 15px;
  font-family:Arial, Helvetica, sans-serif;
  background:${theme.pageBg};
">
  <div style="text-align:center; margin:0 0 22px 0;">
    <h2 style="text-align:center; font-size:22px; color:${theme.titleColor}; margin:0 0 10px 0;">
      ${cfg.titulo}
    </h2>

    <p style="text-align:center; font-size:18px; color:${theme.brandLineColor}; margin:0 0 14px 0; font-weight:900;">
      ${genderLabel}
    </p>

    <h3 style="text-align:center; font-size:16px; color:${theme.titleColor}; margin:0 0 18px 0; font-weight:900;">
      ${cfg.subtitulo}
    </h3>
  </div>

  <div style="text-align:center; margin:0 0 22px 0;">
    <a style="
      background:${theme.btnMainBg};
      color:${theme.btnMainText};
      text-decoration:none;
      font-size:14px;
      padding:12px 40px;
      font-weight:900;
      display:inline-block;
    " href="${cfg.verTodoHref}">${cfg.verTodoText}</a>
  </div>

  ${grid}

  <div style="text-align:center; margin:22px 0 0 0;">
    <a style="
      background:${theme.btnMainBg};
      color:${theme.btnMainText};
      text-decoration:none;
      font-size:14px;
      padding:12px 40px;
      font-weight:900;
      display:inline-block;
    " href="${cfg.verTodoHref}">${cfg.verTodoText}</a>
  </div>

  <div style="background:${theme.footerPadBg}; padding:20px; margin-top:20px;">&nbsp;</div>
</div>`.trim();
}

/* ===== Themes ===== */
const THEME_WOMAN = {
  pageBg: "#F7F7F7",
  titleColor: "#2b2b2b",
  subColor: "#6b4e57",
  brandLineColor: "#D94A72",

  cardBg: "#FFE9EF",
  cardBorder: "#F2C6D3",
  numColor: "#2b2b2b",
  numGhostColor: "#d6b8c4",
  euColor: "#c86a82",
  textColor: "#2b2b2b",

  btnCardBg: "#E56B8C",
  btnCardText: "#ffffff",

  btnMainBg: "#D94A72",
  btnMainText: "#ffffff",

  footerPadBg: "#f5f5f5"
};

const THEME_MAN = {
  pageBg: "#F7F7F7",
  titleColor: "#1a1a1a",
  subColor: "#444444",
  brandLineColor: "#1a1a1a",

  cardBg: "#FFFFFF",
  cardBorder: "#888888",
  numColor: "#1a1a1a",
  numGhostColor: "#d0d0d0",
  euColor: "#555555",
  textColor: "#555555",

  btnCardBg: "#4a4a4a",
  btnCardText: "#ffffff",

  btnMainBg: "#1a1a1a",
  btnMainText: "#ffffff",

  footerPadBg: "#f5f5f5"
};

/* ===== Preview update (export global) ===== */
function updatePreview() {
  window.refreshHeaderSummaryForAll?.();

  const cfg = readConfig();
  const talles = readTalles();

  const preview = _qs("#preview");
  if (!preview) return;

  const isMan = (CURRENT_GENDER === "hombre");

  preview.innerHTML = buildTnBlockUnified(
    cfg,
    talles,
    isMan ? THEME_MAN : THEME_WOMAN,
    isMan ? "CRUZO - HOMBRE" : "CRUZO - MUJER"
  );

  if (talles.length === 0) window.setStatus?.("No hay talles. Agregá al menos 1.", true);
  else window.setStatus?.(`OK: ${talles.length} talle(s). Preview listo (${CURRENT_GENDER.toUpperCase()}).`);
}
window.updatePreview = updatePreview;

/* ===== Copy TN HTML ===== */
async function copyPreviewHtml() {
  const html = _qs("#preview")?.innerHTML?.trim() ?? "";
  if (!html) return window.setStatus?.("No hay HTML para copiar.", true);

  try {
    await navigator.clipboard.writeText(html);
    window.setStatus?.("HTML TN copiado ✅ Pegalo en Tiendanube > Pages.");
  } catch {
    const ta = document.createElement("textarea");
    ta.value = html;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    window.setStatus?.("HTML TN copiado ✅ (fallback).");
  }
}

/* ===== Init ===== */
document.addEventListener("DOMContentLoaded", () => {
  // Segment género
  _qsa("#genderSeg .seg-btn").forEach(btn => {
    btn.addEventListener("click", () => setGender(btn.dataset.gender));
  });

  // Agregar talle
  _qs("#btn-add")?.addEventListener("click", () => window.addTalle?.());

  // Borrar talles (izquierda)
  _qs("#btn-clear")?.addEventListener("click", () => {
    window.clearTalles?.();
    window.setStatus?.("Talles borrados.");
  });

  // Copiar arriba + abajo (preview)
  _qs("#btn-copy")?.addEventListener("click", copyPreviewHtml);
  _qs("#btn-copy-2")?.addEventListener("click", copyPreviewHtml);

  // X abajo (preview): borra talles
  _qs("#btn-clear-2")?.addEventListener("click", () => {
    window.clearTalles?.();
    window.setStatus?.("Talles borrados.");
  });

  // Inputs config
  ["#guia-titulo", "#guia-subtitulo", "#ver-todo-text", "#ver-todo-href"].forEach(sel => {
    _qs(sel)?.addEventListener("input", updatePreview);
  });

  // Demo inicial
  if (_qsa(".talle-card").length === 0) {
    window.addTalle?.({
      num: "38",
      eu: "S",
      link: "#",
      measures: [
        { label: "Cintura", value: "74–83", unit: "cm" },
        { label: "Cadera", value: "90–94", unit: "cm" }
      ]
    });
  }

  window.setCount?.();

  // respeta activo HTML
  const activeBtn = _qs("#genderSeg .seg-btn.active");
  if (activeBtn?.dataset?.gender) CURRENT_GENDER = activeBtn.dataset.gender;

  updatePreview();
});
