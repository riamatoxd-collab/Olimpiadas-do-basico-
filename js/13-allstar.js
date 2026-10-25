/* Venture 9.2.0 · trilhas de preparação All Star e badges mensais nos perfis.
   Conteúdo de preparação independente; não é integração oficial da empresa.
*/
(function () {
  'use strict';
  const TRACKS = [
    { id: 'balcao', label: 'Balcão e atendimento', icon: '🛎️', detail: 'Comunicação, precisão dos pedidos e experiência do cliente.' },
    { id: 'drive', label: 'Drive-Thru', icon: '🚗', detail: 'Agilidade, confirmação do pedido e coordenação da equipe.' },
    { id: 'cozinha', label: 'Cozinha', icon: '🍔', detail: 'Padrões de montagem, qualidade, tempo e segurança alimentar.' },
    { id: 'sobremesas', label: 'Sobremesas e quiosque', icon: '🍦', detail: 'Padronização, higiene, apresentação e atendimento.' }
  ];
  const byId = id => document.getElementById(id);
  const getUser = key => {
    if (typeof users === 'undefined' || !users) return null;
    const userKey = key || (typeof currentUserKey !== 'undefined' ? currentUserKey : null);
    const user = userKey && users[userKey];
    return user && user.name && !user._deleted ? user : null;
  };
  const getTrack = id => TRACKS.find(track => track.id === id) || TRACKS[0];
  function persist() {
    try { localStorage.setItem(typeof STORAGE_USERS_KEY === 'string' ? STORAGE_USERS_KEY : 'mequi_olimpiadas_users_v6', JSON.stringify(users)); } catch (_) {}
    if (typeof currentUserKey !== 'undefined' && currentUserKey && typeof scheduleCloudSync === 'function') scheduleCloudSync(currentUserKey, false);
  }
  function currentDivision(user) {
    if (!user || typeof ventureMonthlyNormalizeState !== 'function' || typeof VENTURE_MONTHLY_LEAGUE_DIVISIONS === 'undefined') return { name: 'Bronze', css: 'bronze', image: 'assets/ligas/bronze.webp', index: 0 };
    const state = ventureMonthlyNormalizeState(user.ventureMonthlyLeague) || { division: 0 };
    const index = Math.max(0, Math.min(9, Number(state.division) || 0));
    return Object.assign({ index }, VENTURE_MONTHLY_LEAGUE_DIVISIONS[index] || VENTURE_MONTHLY_LEAGUE_DIVISIONS[0]);
  }
  function renderProfileBadge(targetId, user) {
    const root = byId(targetId); if (!root) return;
    if (!user) { root.classList.add('hidden'); return; }
    const division = currentDivision(user);
    root.classList.remove('hidden'); root.className = 'vml-profile-badge vml-' + division.css;
    root.setAttribute('aria-label', 'Liga mensal ' + division.name);
    root.replaceChildren();
    const iconWrap = document.createElement('span'); iconWrap.className = 'vml-profile-burger'; iconWrap.setAttribute('aria-hidden', 'true');
    const image = document.createElement('img'); image.className = 'vml-profile-image'; image.src = division.image; image.alt = ''; image.decoding = 'async'; image.loading = 'lazy'; image.draggable = false; iconWrap.appendChild(image);
    const copy = document.createElement('span'); copy.className = 'vml-profile-copy';
    const label = document.createElement('span'); label.className = 'vml-profile-label'; label.textContent = 'Liga ' + division.name;
    const season = document.createElement('span'); season.className = 'vml-profile-season'; season.textContent = 'Ranking mensal';
    copy.append(label, season); root.append(iconWrap, copy);
  }
  function render() {
    const root = byId('ventureAllStar');
    const user = getUser();
    if (root) {
      const saved = user && savedAllStar(user);
      const selected = saved ? saved.preferredTrack : '';
      root.querySelectorAll('[data-allstar-track]').forEach(button => {
        const active = button.dataset.allstarTrack === selected;
        button.classList.toggle('is-selected', active); button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      const status = byId('ventureAllStarStatus');
      if (status) {
        if (!user) status.textContent = 'Entre na sua conta para escolher sua trilha de preparação.';
        else if (selected) status.textContent = 'Sua trilha de foco: ' + getTrack(selected).label + '. Você pode alterá-la a qualquer momento.';
        else status.textContent = 'Escolha uma estação para personalizar sua preparação.';
      }
      const assessment = byId('ventureAllStarAssessmentCount');
      if (assessment) {
        const records = user && user.practicalAssessments && user.practicalAssessments.records && typeof user.practicalAssessments.records === 'object' ? Object.keys(user.practicalAssessments.records).length : 0;
        assessment.textContent = user ? String(records) : '—';
      }
      const league = byId('ventureAllStarLeague'); if (league) league.textContent = user ? '🍔 Liga ' + currentDivision(user).name : 'Entre na conta';
    }
    renderProfileBadge('premiumMonthlyLeagueBadge', user);
    const publicKey = typeof publicProfileSelectedKey !== 'undefined' ? publicProfileSelectedKey : null;
    renderProfileBadge('publicProfileMonthlyLeagueBadge', publicKey ? getUser(publicKey) : null);
  }
  function savedAllStar(user) {
    if (!user.ventureAllStar || typeof user.ventureAllStar !== 'object' || Array.isArray(user.ventureAllStar)) user.ventureAllStar = {};
    return user.ventureAllStar;
  }
  function setTrack(trackId) {
    const user = getUser();
    if (!user) { alert('Entre na sua conta para escolher sua trilha All Star.'); return; }
    const track = getTrack(trackId), saved = savedAllStar(user), previous = saved.preferredTrack;
    if (previous === track.id) return;
    saved.preferredTrack = track.id; saved.updatedAt = Date.now();
    if (window.VentureNotifications && typeof window.VentureNotifications.addForUser === 'function') {
      window.VentureNotifications.addForUser(currentUserKey, previous ? 'Trilha All Star atualizada' : 'Trilha All Star escolhida', 'Sua preparação agora está focada em ' + track.label + '. Treine os padrões e peça avaliação prática ao treinador.', 'allstar', 'allstar-track:' + track.id, false);
    }
    persist(); render();
  }
  function installMergeHook() {
    const original = window.mergeSingleUser;
    if (typeof original !== 'function' || original.__ventureAllStarMergeWrapped) return;
    const wrapped = function (existing, incoming) {
      const merged = original.apply(this, arguments);
      if (!merged || !existing || !incoming) return merged;
      const notifications = new Map();
      [existing.ventureNotifications, incoming.ventureNotifications].forEach(items => {
        if (!Array.isArray(items)) return;
        items.forEach(item => {
          if (!item || !item.id) return;
          const old = notifications.get(String(item.id));
          if (!old) notifications.set(String(item.id), Object.assign({}, item));
          else {
            const newer = (Number(item.createdAt) || 0) > (Number(old.createdAt) || 0) ? item : old;
            notifications.set(String(item.id), Object.assign({}, newer, { readAt: Math.max(Number(item.readAt) || 0, Number(old.readAt) || 0) || null }));
          }
        });
      });
      if (notifications.size) merged.ventureNotifications = Array.from(notifications.values()).sort((a,b) => (Number(b.createdAt)||0) - (Number(a.createdAt)||0)).slice(0,100);
      const a = existing.ventureAllStar, b = incoming.ventureAllStar;
      const winner = !a ? b : !b ? a : (Number(b.updatedAt)||0) >= (Number(a.updatedAt)||0) ? b : a;
      if (winner && typeof winner === 'object') merged.ventureAllStar = Object.assign({}, winner);
      else delete merged.ventureAllStar;
      return merged;
    };
    wrapped.__ventureAllStarMergeWrapped = true;
    window.mergeSingleUser = wrapped;
  }
  function wrapFunction(name) {
    const original = window[name];
    if (typeof original !== 'function' || original.__ventureAllStarWrapped) return;
    const wrapped = function () { const result = original.apply(this, arguments); render(); return result; };
    wrapped.__ventureAllStarWrapped = true; window[name] = wrapped;
  }
  function init() {
    installMergeHook();
    const root = byId('ventureAllStar');
    if (root) root.addEventListener('click', event => { const button = event.target.closest('[data-allstar-track]'); if (button) setTrack(button.dataset.allstarTrack); });
    ['updateHeaderUI', 'renderPremiumProfile', 'renderPublicProfile', 'switchMainTab', 'renderVentureMonthlyLeague'].forEach(wrapFunction);
    render();
  }
  window.VentureAllStar = { tracks: TRACKS, render, setTrack };
  window.setVentureAllStarTrack = setTrack;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
