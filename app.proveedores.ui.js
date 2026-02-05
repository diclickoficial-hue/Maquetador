/* =========================
   app.proveedores.ui.js (FULL)
   UI del constructor (cards + eventos)
   Requiere: app.proveedores.core.js (expone:
     window.updatePreview, window.copyPreviewHtml,
     window.tnAttr, window.setStatus, window.setCount,
     window.setGender,
     window.exportProjectJson, window.importProjectJson
   )
========================= */

(function () {
  function qs(sel, root){
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root){
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function call0(fn){
    if (typeof fn === "function") fn();
  }
  function call1(fn, a){
    if (typeof fn === "function") fn(a);
  }
  function call2(fn, a, b){
    if (typeof fn === "function") fn(a, b);
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
    call0(window.updatePreview);
  }

  function duplicateCard(el){
    var clone = el.cloneNode(true);
    wireCard(clone);
    if (el.parentElement) el.parentElement.insertBefore(clone, el.nextSibling);
    call0(window.updatePreview);
  }

  function removeCard(el){
    el.remove();
    call0(window.updatePreview);
  }

  function wireInputs(el){
    qsa("input, textarea", el).forEach(function(inp){
      inp.addEventListener("input", function(){
        call0(window.updatePreview);
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

    // Collapsible SOLO para proveedores
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

          // accordion: cerrar otros abiertos
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
          call0(window.updatePreview);
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

  /* =========================
     ADD CARDS
  ========================= */

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
    call0(window.updatePreview);
  }

  function addCategory(data){
    data = data || {};
    var container = qs("#form-container");
    if (!container) return;

    var card = document.createElement("div");
    card.className = "card category-card";

    card.innerHTML =
      '<div class="head">' +
        '<div class="tag">CATEGORÍA</div>' +
        '<div class="tools"></div>' +
      '</div>' +

      '<div class="split">' +
        '<div>' +
          '<label>Título</label>' +
          '<input class="cat-title" placeholder="Ej: WIDE LEG · PALAZOS" value="' + safeAttr(data.title || "") + '">' +
        '</div>' +
        '<div>' +
          '<label>Link destino</label>' +
          '<input class="cat-link" placeholder="https://..." value="' + safeAttr(data.link || "#") + '">' +
        '</div>' +
      '</div>' +

      '<div class="row">' +
        '<div style="flex:1">' +
          '<label>URL Imagen</label>' +
          '<input class="cat-img" placeholder="https://..." value="' + safeAttr(data.img || "") + '">' +
        '</div>' +
      '</div>';

    container.appendChild(card);
    wireCard(card);
    call0(window.updatePreview);
  }

  function addProvider(data){
    data = data || {};
    var container = qs("#form-container");
    if (!container) return;

    var card = document.createElement("div");
    card.className = "card provider-card"; // arranca colapsado

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

        // lo dejás por UI, aunque core ya no lo use
        '<div class="row">' +
          '<div style="flex:1">' +
            '<label>Link destino (opcional, no se usa si el core genera por nombre)</label>' +
            '<input class="prov-link" placeholder="https://..." value="' + safeAttr(data.link || "#") + '">' +
          '</div>' +
        '</div>' +
      '</div>';

    container.appendChild(card);
    wireCard(card);
    call0(window.updatePreview);
  }

  function clearAll(){
    var c = qs("#form-container");
    if (c) c.innerHTML = "";
    call0(window.updatePreview);
    call2(window.setStatus, "Vacío: agregá proveedores.", true);
  }

  /* =========================
     GÉNERO
  ========================= */

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

  /* =========================
     JSON SAVE / LOAD (usa funciones del CORE)
  ========================= */

  function downloadJson(filename, obj){
    var text = JSON.stringify(obj, null, 2);
    var blob = new Blob([text], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(function(){
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }

  function pickJsonFile(onLoaded){
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", function(){
      var file = input.files && input.files[0];
      if (!file) { input.remove(); return; }

      var reader = new FileReader();
      reader.onload = function(){
        input.remove();
        onLoaded(String(reader.result || ""));
      };
      reader.onerror = function(){
        input.remove();
        call2(window.setStatus, "No se pudo leer el archivo.", true);
      };
      reader.readAsText(file);
    });

    input.click();
  }

  function saveProject(){
    if (typeof window.exportProjectJson !== "function"){
      call2(window.setStatus, "Falta exportProjectJson en core.js", true);
      return;
    }
    var data = window.exportProjectJson();
    var fname = "proveedores_" + (data.gender || "hombre") + "_" + (new Date().getTime()) + ".json";
    downloadJson(fname, data);
    call2(window.setStatus, "JSON guardado ✅ (incluye HTML final).", false);
  }

  function loadProject(){
    if (typeof window.importProjectJson !== "function"){
      call2(window.setStatus, "Falta importProjectJson en core.js", true);
      return;
    }

    pickJsonFile(function(text){
      var data;
      try{
        data = JSON.parse(text);
      }catch(e){
        call2(window.setStatus, "JSON inválido (no se pudo parsear).", true);
        return;
      }

      // limpia cards actuales
      clearAll();

      // core setea inputs + género y devuelve items
      var result;
      try{
        result = window.importProjectJson(data);
      }catch(e2){
        call2(window.setStatus, "JSON inválido: " + (e2.message || "error"), true);
        return;
      }

      // aplicar género (y estado de botones)
      if (result && result.gender && typeof window.setGender === "function"){
        // también marca el botón activo si existe
        var seg = qs("#genderSeg");
        if (seg){
          qsa(".seg-btn", seg).forEach(function(b){
            var g = b.getAttribute("data-gender");
            if (g === result.gender) b.classList.add("active");
            else b.classList.remove("active");
          });
        }
        window.setGender(result.gender);
      }

      // reconstruir cards
      var items = (result && result.items && result.items.length) ? result.items : [];
      for (var i=0; i<items.length; i++){
        var it = items[i];
        if (!it || !it.type) continue;

        if (it.type === "category") addCategory({ title: it.title || "", img: it.img || "", link: it.link || "#" });
        else if (it.type === "section") addSection(it.text || "");
        else if (it.type === "provider") addProvider({ name: it.name || "", note: it.note || "", img: it.img || "" });
      }

      call0(window.updatePreview);
      call2(window.setStatus, "JSON cargado ✅ (constructor restaurado).", false);
    });
  }

  /* =========================
     INIT
  ========================= */

  document.addEventListener("DOMContentLoaded", function () {
    // Exponer
    window.addProvider = addProvider;
    window.addSection  = addSection;
    window.addCategory = addCategory;
    window.clearProviders = clearAll;

    wireGenderSeg();

    // Botones agregar
    var bCat = qs("#btn-add-category");
    if (bCat) bCat.addEventListener("click", function(){ addCategory(); });

    var bProv = qs("#btn-add");
    if (bProv) bProv.addEventListener("click", function(){ addProvider(); });

    var bSec = qs("#btn-add-section");
    if (bSec) bSec.addEventListener("click", function(){ addSection(""); });

    // Guardar / Cargar JSON
    var bSave = qs("#btn-save-json");
    if (bSave) bSave.addEventListener("click", saveProject);

    var bLoad = qs("#btn-load-json");
    if (bLoad) bLoad.addEventListener("click", loadProject);

    // Clear
    var bc = qs("#btn-clear");
    if (bc) bc.addEventListener("click", clearAll);

    var bc2 = qs("#btn-clear-2");
    if (bc2) bc2.addEventListener("click", clearAll);

    // Copy HTML
    var cp = qs("#btn-copy");
    if (cp) cp.addEventListener("click", function(){ call0(window.copyPreviewHtml); });

    var cp2 = qs("#btn-copy-2");
    if (cp2) cp2.addEventListener("click", function(){ call0(window.copyPreviewHtml); });

    var cp3 = qs("#btn-copy-3");
    if (cp3) cp3.addEventListener("click", function(){ call0(window.copyPreviewHtml); });

    // Config inputs -> preview
    ["#prov-titulo","#prov-marca","#prov-subtitulo","#prov-cta-text","#prov-cta-href"].forEach(function(sel){
      var el = qs(sel);
      if (el) el.addEventListener("input", function(){ call0(window.updatePreview); });
    });

    // inicia vacío (preview)
    call0(window.updatePreview);
  });

})();
