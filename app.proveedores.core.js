/* =========================
   app.proveedores.core.js (FULL)
   Genera HTML TN (Hombre/Mujer) + preview + copiar
========================= */

var CURRENT_GENDER = "hombre";

function setGender(g){
  CURRENT_GENDER = (g === "mujer") ? "mujer" : "hombre";
  if (typeof window.updatePreview === "function") window.updatePreview();
}
window.setGender = setGender;

(function () {
  function qs(sel, root){
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root){
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /* ===== Sanitizado TN ===== */
  function tnEntities(s){
    s = String(s == null ? "" : s);
    return s
      .split("&").join("&amp;")
      .split("<").join("&lt;")
      .split(">").join("&gt;")
      .split('"').join("&quot;")
      .split("'").join("&#39;");
  }
  function tnAttr(s){
    return tnEntities(s).split("`").join("&#96;");
  }

  window.tnEntities = tnEntities;
  window.tnAttr = tnAttr;

  /* ===== Status UI ===== */
  function setStatus(msg, isErr){
    if (isErr == null) isErr = false;

    var el = qs("#statusMsg");
    if (el) el.textContent = msg;

    var pill = qs("#pillState");
    if (!pill) return;

    pill.classList.remove("ok","err");
    pill.classList.add(isErr ? "err" : "ok");
    pill.textContent = isErr ? "Error" : "OK";
  }

  function setCount(){
    var count = readItems().filter(function(x){ return x.type === "provider"; }).length;
    var pill = qs("#pillCount");
    if (pill) pill.textContent = "Proveedores: " + count;
  }

  window.setStatus = setStatus;
  window.setCount  = setCount;

  /* ===== Read config/items ===== */
  function readConfig(){
    return {
      titulo: tnEntities((qs("#prov-titulo") && qs("#prov-titulo").value) ? qs("#prov-titulo").value : "PROVEEDORES"),
      marca: tnEntities((qs("#prov-marca") && qs("#prov-marca").value) ? qs("#prov-marca").value : ""),
      subtitulo: tnEntities((qs("#prov-subtitulo") && qs("#prov-subtitulo").value) ? qs("#prov-subtitulo").value : "Elegí un proveedor"),
      ctaText: tnEntities((qs("#prov-cta-text") && qs("#prov-cta-text").value) ? qs("#prov-cta-text").value : "VER TODO"),
      ctaHref: tnAttr((qs("#prov-cta-href") && qs("#prov-cta-href").value) ? qs("#prov-cta-href").value : "#")
    };
  }
  
  function readItems(){
	  var container = qs("#form-container");
	  if (!container) return [];

	  return Array.prototype.slice.call(container.children).map(function(el){

		// SUBTITULOS / SECCIONES (los que ya usás)
		if (el.classList.contains("section-card")){
		  var inp = qs(".section-text", el);
		  return { type: "section", text: tnEntities(inp ? inp.value : "") };
		}

		// ✅ NUEVO: CATEGORÍA (imagen + link + texto)
		if (el.classList.contains("category-card")){
		  var t = qs(".cat-title", el);
		  var i = qs(".cat-img", el);
		  var l = qs(".cat-link", el);
		  return {
			type: "category",
			title: tnEntities(t ? t.value : ""),
			img:   tnAttr(i ? i.value : ""),
			link:  tnAttr(l ? l.value : "#")
		  };
		}

		// PROVEEDOR (igual que antes)
		if (el.classList.contains("provider-card")){
		  var name = qs(".prov-name", el);
		  var note = qs(".prov-note", el);
		  var img  = qs(".prov-img", el);
		  var link = qs(".prov-link", el); // lo dejás si querés, no se usa

		  return {
			type: "provider",
			name: tnEntities(name ? name.value : ""),
			note: tnEntities(note ? note.value : ""),
			img:  tnAttr(img ? img.value : ""),
			link: tnAttr(link ? link.value : "#")
		  };
		}

		return null;
	  }).filter(Boolean);
  }


  /* =========================================================
     URL AUTOMÁTICA: https://margusoficial.com/guia-<proveedor>/
  ========================================================= */
  function slugify(s){
    s = String(s == null ? "" : s).toLowerCase();

    // sin normalize (compat)
    var from = "áàäâãåéèëêíìïîóòöôõúùüûñç·/_,:;";
    var to   = "aaaaaaeeeeiiiiooooouuuunc------";
    for (var i=0; i<from.length; i++){
      s = s.split(from[i]).join(to[i]);
    }

    s = s.replace(/[^a-z0-9\s-]/g, "");
    s = s.replace(/\s+/g, "-");
    s = s.replace(/-+/g, "-");
    s = s.replace(/^-|-$/g, "");
    return s;
  }

  function buildProviderUrlFromName(providerName){
    var prov = slugify(providerName || "");
    if (!prov) return "#";
    return "https://margusoficial.com/guia-" + prov + "/";
  }

  /* =========================================================
     THEMES: MISMA ESTRUCTURA, SOLO CAMBIA COLOR
  ========================================================= */
  var THEME_MAN = {
    wrapPad: "20px 15px",
    pageBg: "#f7f7f7",

    titleColor: "#1a1a1a",
    subColor: "#1a1a1a",

    sectionColor: "#555",
    sectionWeight: "bold",

    cardBg: "#ffffff",
    cardBorder: "#888",
    nameColor: "#1a1a1a",
    noteColor: "#888",

    btnBg: "#4a4a4a",
    btnText: "#ffffff",

    ctaBg: "#1a1a1a",
    ctaText: "#ffffff",

    footerBg: "#f5f5f5"
  };

  var THEME_WOMAN = {
    wrapPad: "40px 16px",
    pageBg: "#FFF5F7",

    titleColor: "#2b2b2b",
    subColor: "#6b4e57",

    sectionColor: "#2b2b2b",
    sectionWeight: "900",

    cardBg: "#FFE9EF",
    cardBorder: "#F2C6D3",
    nameColor: "#2b2b2b",
    noteColor: "#6b4e57",

    btnBg: "#E56B8C",
    btnText: "#ffffff",

    ctaBg: "#D94A72",
    ctaText: "#ffffff",

    footerBg: "#FFF5F7"
  };

  function getTheme(){
    return (CURRENT_GENDER === "mujer") ? THEME_WOMAN : THEME_MAN;
  }

  /* =========================================================
     BUILDERS (estructura única)
  ========================================================= */

  function buildSectionTitle(text, theme){
    return (
      '<p style="text-align:center; font-size:14px; color:' + theme.sectionColor + '; margin:0 0 15px 0; font-weight:' + theme.sectionWeight + ';">' +
        (text || "&nbsp;") +
      "</p>"
    );
  }
	/* =========================
	   JSON EXPORT / IMPORT (CORE)
	========================= */

  function exportProjectJson(){
	  var cfg = readConfig();
	  var items = readItems();
	  var html = buildTnHtml(cfg, items);

	  return {
		v: 1,
		app: "tn_proveedores_builder",
		ts: (new Date()).toISOString ? (new Date()).toISOString() : String(+new Date()),
		gender: CURRENT_GENDER,
		config: cfg,
		items: items,
		html: html
	  };
	}

  function importProjectJson(data){
	  if (!data || typeof data !== "object") throw new Error("JSON inválido");

	  // género
	  if (data.gender === "mujer" || data.gender === "hombre"){
		CURRENT_GENDER = data.gender;
	  }

	  // config -> inputs
	  var cfg = data.config || {};
	  var el;

	  el = qs("#prov-titulo");    if (el) el.value = cfg.titulo || "";
	  el = qs("#prov-marca");     if (el) el.value = cfg.marca || "";
	  el = qs("#prov-subtitulo"); if (el) el.value = cfg.subtitulo || "";
	  el = qs("#prov-cta-text");  if (el) el.value = cfg.ctaText || "";
	  el = qs("#prov-cta-href");  if (el) el.value = cfg.ctaHref || "#";

	  // devolver items para que UI reconstruya cards
	  var items = data.items;
	  if (!items || typeof items.length !== "number") items = [];

	  return {
		gender: CURRENT_GENDER,
		items: items
	  };
	}

	// ✅ Exponer (lo que te falta)
	window.exportProjectJson = exportProjectJson;
	window.importProjectJson = importProjectJson;

  function buildProviderCard(p, theme){
	  var img = p.img
		? '<img style="max-width:120px; max-height:80px; object-fit:contain; display:block; margin:0 auto;" src="' + p.img + '" alt="' + tnAttr(p.name || "Proveedor") + '" />'
		: '<div style="height:80px; display:flex; align-items:center; justify-content:center; color:' + theme.noteColor + '; font-weight:bold;">&nbsp;</div>';

	  var noteText = (p.note || "").trim();
	  var note =
		'<p style="font-size:11px; color:' + theme.noteColor + '; margin:8px 0 12px 0; min-height:14px;">' +
		  (noteText ? noteText : "&nbsp;") +
		"</p>";

	  // ✅ si hay link manual, úsalo. si no, default por nombre
	  var manual = (p && p.link) ? String(p.link).trim() : "";
	  var href = (manual && manual !== "#") ? manual : buildProviderUrlFromName(p && p.name ? p.name : "");

	  return (
		'<div style="' +
		  "background:" + theme.cardBg + ";" +
		  "border:2px solid " + theme.cardBorder + ";" +
		  "padding:20px;" +
		  "text-align:center;" +
		  "height:240px;" +
		  "display:flex;" +
		  "flex-direction:column;" +
		  "justify-content:space-between;" +
		'">' +

		  "<div>" +
			'<div style="height:80px; display:flex; align-items:center; justify-content:center; margin-bottom:10px;">' +
			  img +
			"</div>" +

			'<p style="' +
			  "font-size:16px;" +
			  "font-weight:bold;" +
			  "margin:0;" +
			  "color:" + theme.nameColor + ";" +
			  "overflow:hidden;" +
			  "text-overflow:ellipsis;" +
			  "white-space:nowrap;" +
			'">' + (p.name || "&nbsp;") + "</p>" +

			note +
		  "</div>" +

		  "<div>" +
			'<a style="' +
			  "background:" + theme.btnBg + ";" +
			  "color:" + theme.btnText + ";" +
			  "text-decoration:none;" +
			  "font-size:13px;" +
			  "padding:10px 30px;" +
			  "font-weight:bold;" +
			  "display:inline-block;" +
			'" href="' + (href || "#") + '">VER</a>' +
		  "</div>" +

		"</div>"
	  );
	}

  function pickProviderHref(p){
	  var manual = (p && p.link) ? String(p.link).trim() : "";
	  if (manual && manual !== "#") return manual;
	  return buildProviderUrlFromName(p && p.name ? p.name : "");
	}

  function buildTable3Cols(cardsHtml){
    var rows = "";
    for (var i=0; i<cardsHtml.length; i+=3){
      var a = cardsHtml[i] || "";
      var b = cardsHtml[i+1] || "";
      var c = cardsHtml[i+2] || "";
      rows +=
        "<tr>" +
          '<td style="width:33.3333%; padding:10px; vertical-align:top;">' + (a || '<div style="padding:20px; text-align:center;">&nbsp;</div>') + "</td>" +
          '<td style="width:33.3333%; padding:10px; vertical-align:top;">' + (b || '<div style="padding:20px; text-align:center;">&nbsp;</div>') + "</td>" +
          '<td style="width:33.3333%; padding:10px; vertical-align:top;">' + (c || '<div style="padding:20px; text-align:center;">&nbsp;</div>') + "</td>" +
        "</tr>";
    }

    return '<table style="width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:30px;"><tbody>' + rows + "</tbody></table>";
  }

  function buildSections(items, theme){
    var out = [];
    var currentTitle = "";
    var currentCards = [];

    function flush(){
      if (!currentTitle && currentCards.length === 0) return;

      if (currentTitle) out.push(buildSectionTitle(currentTitle, theme));
      out.push(buildTable3Cols(currentCards));

      currentTitle = "";
      currentCards = [];
    }

    for (var k=0; k<items.length; k++){
      var it = items[k];
      if (it.type === "section"){
        flush();
        currentTitle = it.text;
        continue;
      }
      if (it.type === "provider"){
        currentCards.push(buildProviderCard(it, theme));
      }
    }
    flush();

    return out.join("\n");
  }

function buildTnHtml(cfg, items){
	  var theme = getTheme();

	  // separar items
	  var categories = [];
	  var providersAndSections = [];

	  for (var i=0; i<items.length; i++){
		if (items[i].type === "category") categories.push(items[i]);
		else providersAndSections.push(items[i]);
	  }

	  var categoriesHtml = buildCategoriesTable(categories, theme);
	  var providersHtml  = buildSections(providersAndSections, theme);

	  var cta =
		'<div style="text-align:center; margin-bottom:25px;">' +
		  '<a style="background:' + theme.ctaBg + "; color:" + theme.ctaText + '; text-decoration:none; font-size:14px; padding:12px 40px; font-weight:900; display:inline-block;" href="' + cfg.ctaHref + '">' +
			cfg.ctaText +
		  "</a>" +
		"</div>";

	  return (
		'<div style="max-width:900px; margin:0 auto; padding:' + theme.wrapPad + "; font-family: Arial, Helvetica, sans-serif; background:" + theme.pageBg + ';">' +

		  '<h2 style="text-align:center; font-size:22px; color:' + theme.titleColor + '; margin:0 0 10px 0; font-weight:900;">' + cfg.titulo + "</h2>" +

		  '<p style="text-align:center; font-size:18px; color:' + theme.titleColor + '; margin:0 0 25px 0; font-weight:900;">' + cfg.marca + "</p>" +

		  '<h3 style="text-align:center; font-size:16px; color:' + theme.subColor + '; margin:0 0 20px 0; font-weight:900;">' + cfg.subtitulo + "</h3>" +

		  // ✅ CATEGORIAS ARRIBA
		  (categoriesHtml
			? (buildSubtitle("CATEGORÍAS", theme) + categoriesHtml)
			: '<div style="padding:10px 0; text-align:center; color:' + theme.subColor + '; font-size:12px; font-weight:900;">(Sin categorías)</div>'
		  ) +

		  // ✅ PROVEEDORES ABAJO
		  (providersHtml
			? (buildSubtitle("PROVEEDORES", theme) + providersHtml)
			: '<div style="padding:14px; text-align:center; color:' + theme.subColor + '; font-size:13px; font-weight:900;">Agregá proveedores para generar la tabla.</div>'
		  ) +

		  cta +

		  '<div style="background:' + theme.footerBg + '; padding:20px; margin-bottom:20px;">&nbsp;</div>' +
		"</div>"
	  );
  }

  function buildSubtitle(text, theme){
  return (
    '<div style="text-align:center; margin: 18px 0 10px 0;">' +
      '<div style="font-size:13px; color:' + theme.sectionColor + '; font-weight:' + theme.sectionWeight + '; letter-spacing:.3px;">' +
        (text || "&nbsp;") +
      "</div>" +
    "</div>"
  );
}

function buildCategoryCell(cat, theme){
	  // imagen chica (si no hay, deja espacio)
	  var img = cat.img
		  ? '<img style="width:40px; height:40px; object-fit:cover; border-radius:10px; display:inline-block; vertical-align:middle; margin-right:8px;" src="' + cat.img + '" alt="' + tnAttr(cat.title || "Categoria") + '" />'
		  : '<span style="display:inline-block; width:40px; height:40px; margin-right:8px;">&nbsp;</span>';


	  // estilo tipo tu tabla (pero adaptado a theme)
	  // mujer -> borde rosa, hombre -> borde gris
	  var borderCol = (CURRENT_GENDER === "mujer") ? "#f8d7da" : theme.cardBorder;

	  return (
		'<td style="' +
		  "width:50%;" +
		  "text-align:center;" +
		  "padding:12px 6px;" +
		  "vertical-align:middle;" +
		  "background:#fff;" +
		  "border:2px solid " + borderCol + ";" +
		'">' +
		  '<a style="' +
			"color:" + theme.titleColor + ";" +
			"text-decoration:none;" +
			"font-size:10px;" +
			"font-weight:800;" +
			"letter-spacing:.2px;" +
			"display:inline-flex;" +
			"align-items:center;" +
			"justify-content:center;" +
			"gap:6px;" +
		  '" href="' + (cat.link || "#") + '">' +
			img +
			(cat.title || "&nbsp;") +
		  "</a>" +
		"</td>"
	  );
  }

function buildCategoriesTable(categories, theme){
		  if (!categories || categories.length === 0) return "";

		  var rows = "";
		  for (var i=0; i<categories.length; i+=2){
			var a = categories[i] || null;
			var b = categories[i+1] || null;

			rows += "<tr>";
			rows += a ? buildCategoryCell(a, theme) : '<td style="width:50%;padding:12px 6px;background:#fff;">&nbsp;</td>';
			rows += b ? buildCategoryCell(b, theme) : '<td style="width:50%;padding:12px 6px;background:#fff;">&nbsp;</td>';
			rows += "</tr>";
		  }

		  return (
			'<table style="width:100%; border-collapse:separate; border-spacing:6px; table-layout:fixed; margin-bottom:18px;">' +
			  "<tbody>" + rows + "</tbody>" +
			"</table>"
		  );
  }

  /* ===== Preview / Copy ===== */
  function updatePreview(){
    var cfg = readConfig();
    var items = readItems();

    var preview = qs("#preview");
    if (preview) preview.innerHTML = buildTnHtml(cfg, items);

    var count = items.filter(function(x){ return x.type === "provider"; }).length;
    setCount();

    if (count === 0) setStatus("Vacío: agregá al menos 1 proveedor.", true);
    else setStatus("OK: " + count + " proveedor(es). Preview listo (" + String(CURRENT_GENDER).toUpperCase() + ").");
  }

  function copyPreviewHtml(){
    var html = "";
    var prev = qs("#preview");
    if (prev && prev.innerHTML) html = String(prev.innerHTML).trim();

    if (!html) return setStatus("No hay HTML para copiar.", true);

    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(html).then(function(){
        setStatus("HTML TN copiado ✅ Pegalo en Tiendanube > Pages.");
      }).catch(function(){
        fallbackCopy(html);
      });
    }else{
      fallbackCopy(html);
    }
  }

  function fallbackCopy(html){
    var ta = document.createElement("textarea");
    ta.value = html;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch(e){}
    ta.remove();
    setStatus("HTML TN copiado ✅ (fallback).");
  }

  window.updatePreview = updatePreview;
  window.copyPreviewHtml = copyPreviewHtml;

  document.addEventListener("DOMContentLoaded", function(){
    updatePreview();
  });
})();
