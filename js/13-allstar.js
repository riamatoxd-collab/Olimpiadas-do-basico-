/* Venture 9.2.0 · trilha preparatória All Star. Não representa classificação oficial da empresa. */
(function () {
  "use strict";
  const TRACKS = [
    { id: "balcao", label: "Balcão e atendimento", icon: "🛎️", detail: "Comunicação, precisão dos pedidos e experiência do cliente." },
    { id: "drive", label: "Drive-Thru", icon: "🚗", detail: "Agilidade, confirmação do pedido e coordenação da equipe." },
    { id: "cozinha", label: "Cozinha", icon: "🍔", detail: "Padrões de montagem, qualidade, tempo e segurança alimentar." },
    { id: "sobremesas", label: "Sobremesas e quiosque", icon: "🍦", detail: "Padronização, higiene, apresentação e atendimento." }
  ];
  const byId = function (id) { return document.getElementById(id); };
  const getUser = function () {
    if (typeof currentUserKey === "undefined" || typeof users === "undefined" || !currentUserKey) return null;
    const user = users[currentUserKey];
    return user && user.name && !user._deleted ? user : null;
  };
  const getTrack = function (id) { return TRACKS.find(function (track) { return track.id === id; }) || TRACKS[0]; };
  function render() {
    const root = byId("ventureAllStar");
    if (!root) return;
    const user = getUser();
    const saved = user && user.ventureAllStar && typeof user.ventureAllStar === "object" ? user.ventureAllStar : {};
    const selected = saved.preferredTrack || "";
    const trackList = byId("ventureAllStarTracks");
    const status = byId("ventureAllStarStatus");
    const assessment = byId("ventureAllStarAssessmentCount");
    const currentLeague = byId("ventureAllStarLeague");
    if (trackList) {
      Array.from(trackList.querySelectorAll("[data-allstar-track]")).forEach(function (button) {
        const active = button.dataset.allstarTrack === selected;
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    if (status) {
      if (!user) status.textContent = "Entre na sua conta para escolher a trilha de preparação.";
      else if (selected) status.textContent = "Sua trilha de foco: " + getTrack(selected).label + ". A escolha pode ser alterada a qualquer momento.";
      else status.textContent = "Escolha uma estação para personalizar sua preparação.";
    }
    if (assessment) {
      const records = user && user.practicalAssessments && user.practicalAssessments.records && typeof user.practicalAssessments.records === "object" ? Object.keys(user.practicalAssessments.records).length : 0;
      assessment.textContent = user ? String(records) : "—";
    }
    if (currentLeague) {
      const league = window.VentureLeagues && user ? window.VentureLeagues.getDivision(user) : null;
      currentLeague.textContent = league ? league.icon + " Liga " + league.name : "Entre na conta";
    }
  }
  function setTrack(trackId) {
    const user = getUser();
    if (!user) { alert("Entre na sua conta para escolher sua trilha All Star."); return; }
    const track = getTrack(trackId);
    if (!user.ventureAllStar || typeof user.ventureAllStar !== "object") user.ventureAllStar = {};
    const previous = user.ventureAllStar.preferredTrack;
    user.ventureAllStar.preferredTrack = track.id;
    user.ventureAllStar.updatedAt = Date.now();
    try { localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users)); } catch (_) {}
    if (typeof scheduleCloudSync === "function") scheduleCloudSync(currentUserKey, false);
    if (!previous && window.VentureNotifications && typeof window.VentureNotifications.addForUser === "function") {
      window.VentureNotifications.addForUser(currentUserKey, "Trilha All Star escolhida", "Sua preparação começa por " + track.label + ". Treine os padrões e peça avaliação prática ao treinador.", "allstar", "allstar-track:" + track.id);
    }
    render();
  }
  function init() {
    const root = byId("ventureAllStar");
    if (!root) return;
    root.addEventListener("click", function (event) {
      const button = event.target.closest("[data-allstar-track]");
      if (button) setTrack(button.dataset.allstarTrack);
    });
    render();
    const oldHeader = typeof updateHeaderUI === "function" ? updateHeaderUI : null;
    if (oldHeader && !oldHeader.__ventureAllStarWrapped) {
      const wrapped = function () {
        const result = oldHeader.apply(this, arguments);
        render();
        return result;
      };
      wrapped.__ventureAllStarWrapped = true;
      updateHeaderUI = wrapped;
    }
    const oldLeagueRender = window.renderVentureMonthlyLeague;
    if (typeof oldLeagueRender === "function" && !oldLeagueRender.__ventureAllStarWrapped) {
      const wrapped = function () {
        const result = oldLeagueRender.apply(this, arguments);
        render();
        return result;
      };
      wrapped.__ventureAllStarWrapped = true;
      window.renderVentureMonthlyLeague = wrapped;
    }
  }
  window.VentureAllStar = { tracks: TRACKS, render: render, setTrack: setTrack };
  window.setVentureAllStarTrack = setTrack;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();