/* Venture 9.3.0: novidades apresentadas após login; não altera pontuação nem sincronização. */
(function () {
  "use strict";
  var auth = document.getElementById("authModal");
  var history = document.getElementById("tab-updates");
  var storagePrefix = "venture_novidades_entrada_930_";
  var previousFocus = null;
  var pendingTimer = null;
  var fallbackSeen = Object.create(null);
  if (!auth || !history) return;

  var overlay = document.createElement("div");
  overlay.id = "ventureNewsModal";
  overlay.className = "vnews-overlay hidden";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "ventureNewsTitle");
  overlay.setAttribute("aria-describedby", "ventureNewsDescription");
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = [
    '<div class="vnews-dialog" role="document" tabindex="-1">',
      '<button type="button" id="ventureNewsClose" class="vnews-x" aria-label="Fechar novidades" title="Fechar novidades">✕</button>',
      '<div class="vnews-scroller">',
        '<header class="vnews-hero">',
          '<span class="vnews-brand">OLIMPÍADAS DO BÁSICO • VENTURE</span>',
          '<span class="vnews-logo" aria-hidden="true">🏆</span>',
          '<h2 id="ventureNewsTitle">ALL STAR <span>HALLOWEEN!</span></h2>',
          '<p id="ventureNewsDescription">Uma nova temporada chegou: visual roxo e preto, selos dourados e desafios All Star.</p>',
          '<div class="vnews-strip"><span>🎃 HALLOWEEN SEASON</span><strong>VENTURE 9.3.0</strong></div>',
        '</header>',
        '<div class="vnews-body">',
          '<div class="vnews-topline"><span>✨ O QUE MUDOU</span><small>DESTAQUES DO VENTURE</small></div>',
          '<div class="vnews-feature"><span class="vnews-feature-icon" aria-hidden="true">🏅</span><div><strong>Selos dourados do treinamento prático</strong><p>Conclua a avaliação presencial de cada estação e conquiste um selo que aparece no seu perfil.</p></div></div>',
          '<div class="vnews-feature"><span class="vnews-feature-icon" aria-hidden="true">🍔</span><div><strong>All Star com nova identidade</strong><p>Interface roxo profundo e preto, detalhes violeta e conquistas em dourado.</p></div></div>',
          '<div class="vnews-feature"><span class="vnews-feature-icon" aria-hidden="true">⚡</span><div><strong>Seu progresso continua intacto</strong><p>Contas, XP, ligas mensais, histórico e All Star foram preservados nesta atualização.</p></div></div>',
          '<details class="vnews-history"><summary>📜 Consultar histórico completo de versões ▾</summary><div id="ventureNewsArchive" class="vnews-history-content"></div></details>',
          '<div class="vnews-actions">',
            '<button type="button" id="ventureNewsExplore" class="vnews-primary">🎃 ENTRAR NO ALL STAR</button>',
            '<button type="button" id="ventureNewsContinue" class="vnews-secondary">Agora não, continuar no site</button>',
          '</div>',
          '<p class="vnews-footnote">Você pode reabrir estas novidades a qualquer momento em Mais opções.</p>',
        '</div>',
      '</div>',
    '</div>'
  ].join("");
  document.body.appendChild(overlay);

  /* Preserva integralmente o histórico existente de 9.2.3 e versões anteriores,
     movendo-o da aba antiga para dentro da janela, sem duplicar conteúdos. */
  var archive = overlay.querySelector("#ventureNewsArchive");
  var oldCard = history.querySelector(".pro-card");
  if (oldCard) archive.appendChild(oldCard);
  var latest = document.createElement("div");
  latest.className = "vnews-history-entry";
  latest.innerHTML = '<strong>Versão 9.3.0 • Novidades na entrada</strong>O histórico saiu do menu de abas e agora aparece em uma janela que pode ser fechada. O aviso surge uma vez por sessão após o login.';
  archive.insertBefore(latest, archive.firstChild);
  history.remove();

  var closeBtn = overlay.querySelector("#ventureNewsClose");
  function userKey() {
    try {
      if (typeof currentUserKey === "undefined" || typeof users === "undefined") return "";
      return currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted ? String(currentUserKey) : "";
    } catch (_) { return ""; }
  }
  function hasSeen(key) {
    try { return sessionStorage.getItem(storagePrefix + key) === "1"; }
    catch (_) { return !!fallbackSeen[key]; }
  }
  function markSeen(key) {
    fallbackSeen[key] = true;
    try { sessionStorage.setItem(storagePrefix + key, "1"); } catch (_) {}
  }
  function canDisplay() {
    if (!userKey() || !auth.classList.contains("hidden")) return false;
    if (document.getElementById("ventureSplash")) return false;
    if (typeof activeDuel !== "undefined" && activeDuel) return false;
    if (typeof pendingDuelInvite !== "undefined" && pendingDuelInvite) return false;
    return true;
  }
  function openVentureNews() {
    var key = userKey();
    if (!key || !canDisplay() || !overlay.classList.contains("hidden")) return;
    previousFocus = document.activeElement;
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("vnews-lock");
    markSeen(key);
    closeBtn.focus({ preventScroll: true });
  }
  function closeVentureNews() {
    if (overlay.classList.contains("hidden")) return;
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("vnews-lock");
    if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === "function") {
      previousFocus.focus({ preventScroll: true });
    }
    previousFocus = null;
  }
  function maybeOpenVentureNewsOnEntry() {
    var key = userKey();
    if (!key || hasSeen(key)) return;
    if (canDisplay()) { openVentureNews(); return; }
    if (pendingTimer) return;
    var tries = 0;
    pendingTimer = setInterval(function () {
      tries++;
      if (!userKey() || hasSeen(key) || tries > 100) {
        clearInterval(pendingTimer); pendingTimer = null; return;
      }
      if (canDisplay() && userKey() === key) {
        clearInterval(pendingTimer); pendingTimer = null; openVentureNews();
      }
    }, 200);
  }
  overlay.addEventListener("pointerdown", function (event) {
    if (event.target === overlay) closeVentureNews();
  });
  overlay.addEventListener("keydown", function (event) {
    if (event.key === "Escape") { event.preventDefault(); closeVentureNews(); return; }
    if (event.key !== "Tab") return;
    var controls = Array.from(overlay.querySelectorAll("button:not([disabled]),summary,a[href]")).filter(function (el) {
      return el.getClientRects().length > 0;
    });
    if (!controls.length) { event.preventDefault(); return; }
    var first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  closeBtn.addEventListener("click", closeVentureNews);
  overlay.querySelector("#ventureNewsContinue").addEventListener("click", closeVentureNews);
  overlay.querySelector("#ventureNewsExplore").addEventListener("click", function () {
    closeVentureNews();
    if (typeof switchMainTab === "function") switchMainTab("training");
  });
  new MutationObserver(function () {
    if (!auth.classList.contains("hidden")) closeVentureNews();
    else maybeOpenVentureNewsOnEntry();
  }).observe(auth, { attributes: true, attributeFilter: ["class"] });
  window.openVentureNews = openVentureNews;
  window.closeVentureNews = closeVentureNews;
  window.maybeOpenVentureNewsOnEntry = maybeOpenVentureNewsOnEntry;
  if (document.readyState === "complete") maybeOpenVentureNewsOnEntry();
  else window.addEventListener("load", maybeOpenVentureNewsOnEntry, { once: true });
})();
