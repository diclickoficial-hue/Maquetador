/* =========================
   app.proveedores.ui.js (FULL)
   UI del constructor (cards + eventos)
   Requiere: app.proveedores.core.js (expone window.updatePreview, tnAttr, setStatus, setCount, setGender)
========================= */

(function () {
  function qs(sel, root){
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root){
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function callIfFn(fn, arg){
    if (typeof fn === "function") fn(arg);
  }

  function makeToolBtn(label, onClick, extraClass){
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tool " + (extraClass || "");
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  function moveCard(el, dir){
    var parent = el.parentElement;
    if (!parent) return;
    var items = Array.prototype.slice.call(parent.children);
    var i = items.indexOf(el);
    var j = i + dir;
    if (j < 0 || j >= items.length) return;

    parent.insertBefore(el, dir < 0 ? items[j] : items[j].nextSibling);
    callIfFn(window.updatePreview);
  }

  function duplicateCard(el){
    var clone = el.cloneNode(true);
    wireCard(clone);
    if (el.parentElement) el.parentElement.insertBefore(clone, el.nextSibling);
    callIfFn(window.updatePreview);
  }

  function removeCard(el){
    el.remove();
    callIfFn(window.updatePreview);
  }

  function wireInputs(el){
    qsa("input, textarea", el).forEach(function(inp){
      inp.addEventListener("input", function(){
        callIfFn(window.updatePreview);
      });
    });
  }

  function wireCard(el){
    // tools
    var tools = qs(".tools", el);
    if (tools){
      tools.innerHTML = "";
      tools.appendChild(makeToolBtn("↑", function(){ moveCard(el, -1); }));
      tools.appendChild(makeToolBtn("↓", function(){ moveCard(el, +1); }));
      tools.appendChild(makeToolBtn("Duplicar", function(){ duplicateCard(el); }));
      tools.appendChild(makeToolBtn("Eliminar", function(){ removeCard(el); }, "danger"));
    }

    // Collapsible solo para proveedores
    if (el.classList.contains("provider-card")){
      var head = qs(".head", el);
      var summary = qs(".prov-summary", el);
      var nameInput = qs(".prov-name", el);

      function refreshSummary(){
        var v = "";
        if (nameInput && typeof nameInput.value === "string") v = nameInput.value.trim();
        if (summary) summary.textContent = v ? "· " + v : "";
      }

      if (head){
        head.addEventListener("click", function(ev){
          // no toggle si clickea herramientas
          var t = ev.target;
          if (t && t.closest && t.closest(".tools")) return;

          // accordion opcional: cerrar otros abiertos
          var parent = el.parentElement;
          if (parent){
            qsa(".provider-card.open", parent).forEach(function(x){
              if (x !== el) x.classList.remove("open");
            });
          }

          el.classList.toggle("open");
        });
      }

      if (nameInput){
        nameInput.addEventListener("input", function(){
          refreshSummary();
          callIfFn(window.updatePreview);
        });
      }

      refreshSummary();
    }

    wireInputs(el);
  }

  function safeAttr(v){
    v = (v == null) ? "" : String(v);
    if (typeof window.tnAttr === "function") return window.tnAttr(v);
    return v;
  }

  function addSection(text){
    var container = qs("#form-container");
    if (!container) return;

    var card = document.createElement("div");
    card.className = "card section-card";
    card.innerHTML =
      '<div class="head">' +
        '<div class="tag">SECCIÓN</div>' +
        '<div class="tools"></div>' +
      '</div>' +
      '<label>Título de sección</label>' +
      '<input class="section-text" placeholder="Ej: TELAS / LOGÍSTICA / ETIQUETAS" value="' + safeAttr(text || "") + '">';

    container.appendChild(card);
    wireCard(card);
    callIfFn(window.updatePreview);
  }

  function addProvider(data){
    data = data || {};
    var container = qs("#form-container");
    if (!container) return;

    var card = document.createElement("div");
    card.className = "card provider-card"; // arranca colapsado

    // sin ??, sin template literals para máxima compat
    card.innerHTML =
      '<div class="head">' +
        '<div class="tag">' +
          '<span class="chev">▸</span>PROVEEDOR ' +
          '<span class="prov-summary"></span>' +
        '</div>' +
        '<div class="tools"></div>' +
      '</div>' +

      '<div class="card-body">' +
        '<div class="split">' +
          '<div>' +
            '<label>Nombre</label>' +
            '<input class="prov-name" placeholder="Ej: Volsano" value="' + safeAttr(data.name || "") + '">' +
          '</div>' +
          '<div>' +
            '<label>Texto gris (opcional)</label>' +
            '<input class="prov-note" placeholder="Ej: 38 al 52 / Telas • Remeras" value="' + safeAttr(data.note || "") + '">' +
          '</div>' +
        '</div>' +

        '<div class="row">' +
          '<div style="flex:1">' +
            '<label>URL Imagen / Logo</label>' +
            '<input class="prov-img" placeholder="https://..." value="' + safeAttr(data.img || "") + '">' +
          '</div>' +
        '</div>' +

        '<div class="row">' +
          '<div style="flex:1">' +
            '<label>Link destino (botón VER)</label>' +
            '<input class="prov-link" placeholder="https://..." value="' + safeAttr(data.link || "#") + '">' +
          '</div>' +
        '</div>' +
      '</div>';

    container.appendChild(card);
    wireCard(card);
    callIfFn(window.updatePreview);
  }

  function clearAll(){
    var c = qs("#form-container");
    if (c) c.innerHTML = "";
    callIfFn(window.updatePreview);
    callIfFn(window.setStatus, "Vacío: agregá proveedores.", true);
  }

  function wireGenderSeg(){
    var seg = qs("#genderSeg");
    if (!seg) return;

    qsa(".seg-btn", seg).forEach(function(btn){
      btn.addEventListener("click", function(){
        qsa(".seg-btn", seg).forEach(function(b){ b.classList.remove("active"); });
        btn.classList.add("active");

        if (typeof window.setGender === "function"){
          window.setGender(btn.getAttribute("data-gender"));
        }
      });
    });

    // inicial: si hay uno activo, aplica
    var active = qs(".seg-btn.active", seg) || qs(".seg-btn", seg);
    if (active && typeof window.setGender === "function"){
      window.setGender(active.getAttribute("data-gender"));
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.addProvider = addProvider;
    window.addSection  = addSection;
    window.clearProviders = clearAll;

    wireGenderSeg();

    var bAdd = qs("#btn-add");
    if (bAdd) bAdd.addEventListener("click", function(){ addProvider({}); });

    var bAddSec = qs("#btn-add-section");
    if (bAddSec) bAddSec.addEventListener("click", function(){ addSection(""); });

    var bClear = qs("#btn-clear");
    if (bClear) bClear.addEventListener("click", clearAll);

    var bClear2 = qs("#btn-clear-2");
    if (bClear2) bClear2.addEventListener("click", clearAll);

    var bCopy = qs("#btn-copy");
    if (bCopy) bCopy.addEventListener("click", function(){ callIfFn(window.copyPreviewHtml); });

    var bCopy2 = qs("#btn-copy-2");
    if (bCopy2) bCopy2.addEventListener("click", function(){ callIfFn(window.copyPreviewHtml); });

    var bCopy3 = qs("#btn-copy-3");
    if (bCopy3) bCopy3.addEventListener("click", function(){ callIfFn(window.copyPreviewHtml); });

    ["#prov-titulo","#prov-marca","#prov-subtitulo","#prov-cta-text","#prov-cta-href"].forEach(function(sel){
      var el = qs(sel);
      if (el) el.addEventListener("input", function(){ callIfFn(window.updatePreview); });
    });

    callIfFn(window.updatePreview);
  });
})();
