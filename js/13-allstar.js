/* Venture 9.2.0 · All Star Cozinha: treinamento e competição.
   Questões baseadas nos PDFs fornecidos pelo usuário. Nota/medalhas All Star não alteram XP oficial. */
(function () {
  "use strict";

  const TRACKS = [
    { id: "balcao", label: "Balcão e atendimento", icon: "🛎️", detail: "Comunicação, precisão dos pedidos e experiência do cliente." },
    { id: "drive", label: "Drive-Thru", icon: "🚗", detail: "Agilidade, confirmação do pedido e coordenação da equipe." },
    { id: "cozinha", label: "Cozinha", icon: "🍔", detail: "Padrões de montagem, qualidade, tempo e segurança alimentar." },
    { id: "sobremesas", label: "Sobremesas e quiosque", icon: "🍦", detail: "Padronização, higiene, apresentação e atendimento." }
  ];

  const AREAS = [
    { id: "cozinha", label: "Cozinha completa", icon: "🍳", detail: "Prova mista com questões de todas as estações disponíveis." },
    { id: "linha", label: "Linha", icon: "🥪", detail: "Higiene, tostagem, monitor e sequência de montagem." },
    { id: "chapas", label: "Chapas e carnes", icon: "🍔", detail: "Preparação, parâmetros do material e procedimentos de chapa." },
    { id: "mcfritas", label: "McFritas", icon: "🍟", detail: "Preparação, fritura, salga e manutenção da estação." },
    { id: "fritos", label: "Produtos fritos", icon: "🍗", detail: "Frango, nuggets, tortas e rotinas de fritura." }
  ];

  const QUESTIONS = [
    { id: "LIN-01", area: "linha", prompt: "Segundo o material, por quanto tempo devem ser lavados mãos e antebraços com sabonete bactericida?", options: ["5 segundos", "10 segundos", "20 segundos", "1 minuto"], answer: 2, explanation: "O material indica lavagem de mãos e antebraços por 20 segundos e uso de gel sanitizante nas situações descritas.", source: "Material de Estudo — Produção Linha, p. 2" },
    { id: "LIN-02", area: "linha", prompt: "Qual configuração o material informa para a tostadeira rápida?", options: ["275°C, compressão 5, ciclo de 15 segundos", "293°C, compressão 5D, ciclo de 22 segundos", "180°C, compressão 5D, ciclo de 22 segundos", "293°C, compressão 3, ciclo de 30 segundos"], answer: 1, explanation: "Para a tostadeira rápida, o documento indica 293°C, compressão 5D e ciclo de caramelização de 22 segundos.", source: "Material de Estudo — Produção Linha, p. 2" },
    { id: "LIN-03", area: "linha", prompt: "Qual configuração aparece para a tostadeira HEBT5V?", options: ["275°C, compressão 5 e ciclo de 22 segundos", "293°C, compressão 5D e ciclo de 22 segundos", "168°C e ciclo de 3 minutos e 10 segundos", "218°C, compressão 4 e ciclo de 18 segundos"], answer: 0, explanation: "O material informa 275°C, compressão 5 e ciclo de caramelização de 22 segundos para a HEBT5V.", source: "Material de Estudo — Produção Linha, p. 2" },
    { id: "LIN-04", area: "linha", prompt: "Qual é o tempo de reação indicado para o Iniciador?", options: ["1 a 2 segundos", "3 a 5 segundos", "10 a 15 segundos", "35 a 50 segundos"], answer: 1, explanation: "O documento indica tempo de reação de 3 a 5 segundos para o Iniciador.", source: "Material de Estudo — Produção Linha, p. 2" },
    { id: "LIN-05", area: "linha", prompt: "Qual faixa de tempo de linha está registrada no material?", options: ["15 a 20 segundos", "20 a 30 segundos", "35 a 50 segundos", "60 a 90 segundos"], answer: 2, explanation: "O material registra tempo de linha de 35 a 50 segundos.", source: "Material de Estudo — Produção Linha, p. 2" },
    { id: "LIN-06", area: "linha", prompt: "Se surgir um novo pedido no monitor antes de terminar o ciclo de caramelização, o que o material orienta?", options: ["Esperar o ciclo terminar para iniciar outra rodada", "Ativar uma nova rodada sem esperar terminar o ciclo", "Desligar a tostadeira", "Retirar todos os pães da estação"], answer: 1, explanation: "O documento orienta ativar uma nova rodada quando houver novo pedido, sem esperar o término do ciclo de caramelização.", source: "Material de Estudo — Produção Linha, p. 3" },

    { id: "CHA-01", area: "chapas", prompt: "Quais temperaturas de chapa estão indicadas no Material de Estudo — Produção Linha?", options: ["177°C inferior e 218°C superior", "168°C inferior e 180°C superior", "85°C inferior e 79°C superior", "293°C inferior e 275°C superior"], answer: 0, explanation: "A página de Chapas do material de estudo registra 177°C para a parte inferior e 218°C para a superior.", source: "Material de Estudo — Produção Linha, p. 4" },
    { id: "CHA-02", area: "chapas", prompt: "Qual combinação de máximo de carnes por platen está registrada no material?", options: ["10:1 = 8; 4:1 = 6; 3:1 = 4", "10:1 = 6; 4:1 = 8; 3:1 = 4", "10:1 = 4; 4:1 = 4; 3:1 = 8", "10:1 = 8; 4:1 = 8; 3:1 = 8"], answer: 0, explanation: "O quadro do material indica máximo de 8 unidades para 10:1, 6 para 4:1 e 4 para 3:1 por platen.", source: "Material de Estudo — Produção Linha, p. 4" },
    { id: "CHA-03", area: "chapas", prompt: "Segundo o Material de Estudo, quais são os tempos de remoção das carnes?", options: ["10:1 = 15 s; 4:1 = 18 s; 3:1 = 18 s", "10:1 = 18 s; 4:1 = 15 s; 3:1 = 15 s", "Todas = 22 s", "10:1 = 30 s; 4:1 = 20 s; 3:1 = 10 s"], answer: 1, explanation: "O documento lista 18 segundos para 10:1 e 15 segundos para 4:1 e 3:1.", source: "Material de Estudo — Produção Linha, p. 4" },
    { id: "CHA-04", area: "chapas", prompt: "Quantos panos limpos, sanitizados e dobrados o material pede para a estação de chapas?", options: ["2 panos: um para tudo e outro reserva", "3 panos: um para inox, um para utensílios e um para gordura", "4 panos: um para inox/áreas não gordurosas, dois para utensílios e um para áreas gordurosas", "5 panos, todos com a mesma finalidade"], answer: 2, explanation: "O material descreve quatro panos com as finalidades especificadas na alternativa correta.", source: "Material de Estudo — Produção Linha, p. 4" },
    { id: "CHA-05", area: "chapas", prompt: "Ao soar o timer aos 5 segundos, quais utensílios o procedimento manda ter à mão?", options: ["Somente um pano e o raspador", "Saleiro em uma mão e espátula e apoio de carnes na outra", "Somente a bandeja UHC", "O pegador de frango e uma embalagem"], answer: 1, explanation: "O procedimento descreve o saleiro em uma mão e a espátula e o apoio de carnes na outra.", source: "Material de Estudo — Produção Linha, p. 5" },
    { id: "CHA-06", area: "chapas", prompt: "Para carnes 10:1, como o material orienta organizar as carnes na gaveta UHC?", options: ["De duas em duas, apenas nas pontas", "De quatro em quatro, primeiro no centro e depois nas pontas, formando no máximo quatro pilhas", "Todas soltas em uma única camada", "De três em três, formando no máximo três pilhas"], answer: 1, explanation: "O material descreve colocar as carnes 10:1 de quatro em quatro, começando pelo centro e depois pelas pontas, com no máximo quatro pilhas.", source: "Material de Estudo — Produção Linha, p. 5" },
    { id: "CHA-07", area: "chapas", prompt: "Qual espaçamento aproximado entre carnes é indicado no Guia de Implementação Best Burger 2025?", options: ["Sem espaço entre as carnes", "Aproximadamente 1 cm", "Aproximadamente 5 cm", "Aproximadamente 10 cm"], answer: 1, explanation: "O guia recomenda separação aproximada de 1 cm entre as carnes para favorecer o cozimento e a eficiência da chapa.", source: "Guia de Implementação BB VF 2025, p. 58" },
    { id: "CHA-08", area: "chapas", prompt: "Qual quantidade mínima de carnes por vez o Guia de Implementação Best Burger 2025 recomenda cozinhar?", options: ["Uma carne", "Duas carnes", "Seis carnes", "Oito carnes"], answer: 1, explanation: "O guia afirma que o restaurante deve cozinhar sempre um mínimo de duas carnes por vez.", source: "Guia de Implementação BB VF 2025, p. 58" },

    { id: "FRI-01", area: "mcfritas", prompt: "Qual temperatura de fritadeira está indicada na seção McFritas do material?", options: ["150°C", "168°C", "180°C", "193°C"], answer: 1, explanation: "A seção McFritas registra temperatura da fritadeira de 168°C.", source: "Material de Estudo — Produção Linha, p. 7" },
    { id: "FRI-02", area: "mcfritas", prompt: "Qual é o tempo de fritura programado para McFritas, com o Duty indicado no material?", options: ["3 min e 10 s, com Duty de 30 s", "3 min e 15 s, com Duty de 20 s", "6 min, com Duty de 30 s", "7 min, sem Duty"], answer: 0, explanation: "O material registra fritura programada de 3 minutos e 10 segundos, com Duty de 30 segundos.", source: "Material de Estudo — Produção Linha, p. 7" },
    { id: "FRI-03", area: "mcfritas", prompt: "Quais tempos de vida o material informa para McFritas no congelador portátil e no encestador automático?", options: ["1 hora e 2 horas", "2 horas e 24 horas", "7 minutos e 15 minutos", "24 horas e 48 horas"], answer: 1, explanation: "O documento informa 2 horas no congelador portátil e 24 horas no encestador automático.", source: "Material de Estudo — Produção Linha, p. 7–8" },
    { id: "FRI-04", area: "mcfritas", prompt: "Ao soar o timer do Duty de 30 segundos durante a fritura, o que o procedimento orienta?", options: ["Retirar as McFritas e já embalá-las", "Erguer o cesto completamente do óleo, sacudir para separar os palitos e voltar o cesto à cuba", "Desligar a fritadeira", "Adicionar sal enquanto o cesto continua submerso"], answer: 1, explanation: "O procedimento manda erguer o cesto com as duas mãos, retirá-lo totalmente do óleo, sacudir para separar os palitos e retorná-lo à cuba.", source: "Material de Estudo — Produção Linha, p. 8" },
    { id: "FRI-05", area: "mcfritas", prompt: "Depois de a fritura terminar e o cesto ficar preso no suporte da cuba, por quanto tempo o óleo deve escorrer?", options: ["1 a 2 segundos", "5 a 10 segundos", "20 segundos", "1 minuto"], answer: 1, explanation: "O material indica deixar o óleo escorrer por 5 a 10 segundos.", source: "Material de Estudo — Produção Linha, p. 8" },
    { id: "FRI-06", area: "mcfritas", prompt: "Como o material orienta aplicar o sal às McFritas?", options: ["Espalhar o sal com as mãos", "Segurar o saleiro a 20 cm, sobre o centro, aplicar 4 g com uma única virada sem agitar", "Aplicar 10 g em duas viradas nas bordas", "Aplicar o sal antes de colocar as batatas no óleo"], answer: 1, explanation: "A seção orienta segurar o saleiro pela alça a 20 cm, no centro das McFritas, virá-lo uma única vez sem agitar e despejar 4 g.", source: "Material de Estudo — Produção Linha, p. 8" },

    { id: "PFR-01", area: "fritos", prompt: "Qual temperatura o material indica para as fritadeiras de produtos de frango e tortas?", options: ["168°C", "175°C", "180°C", "193°C"], answer: 2, explanation: "A seção Produtos Fritos indica 180°C para produtos de frango e tortas.", source: "Material de Estudo — Produção Linha, p. 9" },
    { id: "PFR-02", area: "fritos", prompt: "Quais tempos de fritura programados aparecem para McChicken, McJunior, McNuggets e tortas?", options: ["3 min e 10 s para todos", "3 min e 15 s para McChicken, McJunior e McNuggets; 6 min para tortas", "6 min para frango e 20 min para tortas", "2 min para frango e 3 min para tortas"], answer: 1, explanation: "O material informa 3 minutos e 15 segundos para McChicken, McJunior e McNuggets, e 6 minutos para tortas.", source: "Material de Estudo — Produção Linha, p. 9" },
    { id: "PFR-03", area: "fritos", prompt: "Quais tempos de validade na UHC estão indicados para os produtos citados?", options: ["McChicken 20 min; McNuggets e McJunior 30 min", "McChicken 30 min; McNuggets e McJunior 20 min", "Todos 15 min", "Todos 60 min"], answer: 1, explanation: "O material lista McChicken com 30 minutos e McNuggets e McJunior com 20 minutos.", source: "Material de Estudo — Produção Linha, p. 9" },
    { id: "PFR-04", area: "fritos", prompt: "Segundo o material, qual é o tempo de resfriamento das tortas e o tempo total de vida indicado?", options: ["10 min de resfriamento e 120 min de vida", "20 min de resfriamento e 240 min de vida total, incluindo o resfriamento", "30 min de resfriamento e 240 min de vida adicional", "Não há resfriamento nem marcação de validade"], answer: 1, explanation: "O documento informa resfriamento de 20 minutos e vida total de 240 minutos, incluindo o tempo de resfriamento.", source: "Material de Estudo — Produção Linha, p. 9–10" },
    { id: "PFR-05", area: "fritos", prompt: "Ao colocar tortas no cesto, qual posição o procedimento descreve?", options: ["Costura voltada para baixo", "Costura para cima, encostando a parte superior na lâmina que separa os espaços do cesto", "Tortas empilhadas umas sobre as outras", "A posição é livre, sem orientação no material"], answer: 1, explanation: "O procedimento indica colocar as tortas com a costura para cima, encostando a parte superior na lâmina separadora dos espaços do cesto.", source: "Material de Estudo — Produção Linha, p. 10" },
    { id: "PFR-06", area: "fritos", prompt: "Qual pegador o material indica para carnes de frango, com a exceção expressamente citada?", options: ["Pegador bege para todas as carnes", "Pegador preto, exceto para McNuggets", "Pegador verde para todas as carnes", "Nenhum pegador deve ser utilizado"], answer: 1, explanation: "O material manda manter um pegador preto para carnes de frango e especifica exceção para McNuggets.", source: "Material de Estudo — Produção Linha, p. 9–10" }
  ];

  const state = { area: "cozinha", mode: "study", session: null };
  const byId = function (id) { return document.getElementById(id); };
  const getUser = function () {
    if (typeof currentUserKey === "undefined" || typeof users === "undefined" || !currentUserKey) return null;
    const user = users[currentUserKey];
    return user && user.name && !user._deleted ? user : null;
  };
  const getTrack = function (id) { return TRACKS.find(function (track) { return track.id === id; }) || TRACKS[0]; };
  const getArea = function (id) { return AREAS.find(function (area) { return area.id === id; }) || AREAS[0]; };
  const escapeHtml = function (value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  const questionsFor = function (areaId) {
    return QUESTIONS.filter(function (question) { return areaId === "cozinha" || question.area === areaId; });
  };
  const shuffle = function (items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = result[i]; result[i] = result[j]; result[j] = temp;
    }
    return result;
  };
  function saveUser(sync) {
    const user = getUser();
    if (!user) return;
    user.updatedAt = Date.now();
    try {
      if (typeof STORAGE_USERS_KEY !== "undefined") localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (_) {}
    if (typeof scheduleCloudSync === "function" && typeof currentUserKey !== "undefined") scheduleCloudSync(currentUserKey, sync === true);
  }
  function getProgress(user, areaId) {
    const allstar = user && user.ventureAllStar && typeof user.ventureAllStar === "object" ? user.ventureAllStar : {};
    const progress = allstar.progress && typeof allstar.progress === "object" ? allstar.progress : {};
    return progress[areaId] && typeof progress[areaId] === "object" ? progress[areaId] : { trainingAttempts: 0, challengeAttempts: 0, bestTrainingScore: 0, bestChallengeScore: 0, lastScore: null, lastMode: "", lastAt: 0 };
  }
  function getProgressSummary() {
    const user = getUser();
    if (!user) return { trainingAttempts: 0, challengeAttempts: 0, bestTrainingScore: 0, bestChallengeScore: 0, lastScore: null };
    const current = getProgress(user, state.area);
    return current;
  }
  function render() {
    const root = byId("ventureAllStar");
    if (!root) return;
    const user = getUser();
    const saved = user && user.ventureAllStar && typeof user.ventureAllStar === "object" ? user.ventureAllStar : {};
    const selectedTrack = saved.preferredTrack || "";
    const trackList = byId("ventureAllStarTracks");
    const status = byId("ventureAllStarStatus");
    const assessment = byId("ventureAllStarAssessmentCount");
    const currentLeague = byId("ventureAllStarLeague");
    if (trackList) {
      Array.from(trackList.querySelectorAll("[data-allstar-track]")).forEach(function (button) {
        const active = button.dataset.allstarTrack === selectedTrack;
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    if (status) {
      if (!user) status.textContent = "Entre na sua conta para salvar seu progresso All Star.";
      else if (selectedTrack) status.textContent = "Sua trilha de foco: " + getTrack(selectedTrack).label + ". A escolha pode ser alterada a qualquer momento.";
      else status.textContent = "Escolha sua trilha de foco e depois selecione uma estação da Cozinha.";
    }
    if (assessment) {
      const records = user && user.ventureAllStar && Array.isArray(user.ventureAllStar.history) ? user.ventureAllStar.history.length : 0;
      assessment.textContent = user ? String(records) : "—";
    }
    if (currentLeague) {
      const league = window.VentureLeagues && user ? window.VentureLeagues.getDivision(user) : null;
      currentLeague.textContent = league ? league.icon + " Liga " + league.name : "Entre na conta";
    }
    renderAreaControls();
    renderProgress();
    renderQuiz();
  }
  function renderAreaControls() {
    const areaList = byId("ventureAllStarAreas");
    if (areaList) {
      Array.from(areaList.querySelectorAll("[data-allstar-area]")).forEach(function (button) {
        const active = button.dataset.allstarArea === state.area;
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    const modeList = byId("ventureAllStarModes");
    if (modeList) {
      Array.from(modeList.querySelectorAll("[data-allstar-mode]")).forEach(function (button) {
        const active = button.dataset.allstarMode === state.mode;
        button.classList.toggle("is-selected", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
  }
  function renderProgress() {
    const box = byId("ventureAllStarProgress");
    if (!box) return;
    const user = getUser();
    if (!user) {
      box.innerHTML = '<div class="vas-progress-empty">Entre na sua conta para guardar notas, tentativas e evolução entre dispositivos.</div>';
      return;
    }
    const progress = getProgressSummary();
    const best = state.mode === "challenge" ? progress.bestChallengeScore : progress.bestTrainingScore;
    const attempts = state.mode === "challenge" ? progress.challengeAttempts : progress.trainingAttempts;
    const modeLabel = state.mode === "challenge" ? "provas" : "treinos";
    box.innerHTML = '<div class="vas-progress-card"><div><span>Melhor nota em ' + modeLabel + '</span><strong>' + (best || 0) + '%</strong></div><div><span>' + (state.mode === "challenge" ? "Provas concluídas" : "Treinos concluídos") + '</span><strong>' + attempts + '</strong></div><div><span>Última nota</span><strong>' + (progress.lastScore == null ? "—" : progress.lastScore + "%") + '</strong></div></div>';
  }
  function renderQuiz() {
    const box = byId("ventureAllStarQuiz");
    if (!box) return;
    const area = getArea(state.area);
    if (!state.session) {
      const count = questionsFor(state.area).length;
      const modeLabel = state.mode === "study" ? "Treinamento guiado" : "Prova competitiva";
      const modeCopy = state.mode === "study" ? "Responda uma questão por vez. Após cada resposta, veja o gabarito, a explicação e a página de origem." : "A prova não mostra o gabarito durante as respostas. Ao finalizar, você verá a nota, as respostas corretas e as fontes.";
      const questionCount = state.mode === "challenge" ? Math.min(10, count) : count;
      box.innerHTML = '<div class="vas-quiz-intro"><div class="vas-quiz-kicker">' + escapeHtml(area.icon + " " + modeLabel) + '</div><h3>' + escapeHtml(area.label) + '</h3><p>' + escapeHtml(area.detail) + '</p><div class="vas-quiz-facts"><span><strong>' + questionCount + '</strong> questões nesta sessão</span><span><strong>0 XP</strong> concedido por esta atividade</span></div><p class="vas-quiz-copy">' + escapeHtml(modeCopy) + '</p><button class="vas-primary" type="button" data-allstar-action="start">Começar ' + (state.mode === "study" ? "treino" : "prova") + ' <span aria-hidden="true">→</span></button></div>';
      return;
    }
    const session = state.session;
    if (session.completed) {
      renderResult(box, session);
      return;
    }
    const question = session.questions[session.index];
    const selected = session.answers[session.index];
    const answered = selected !== null && selected !== undefined;
    const total = session.questions.length;
    const answeredCount = session.answers.filter(function (value) { return value !== null && value !== undefined; }).length;
    const percent = Math.round(((session.index + 1) / total) * 100);
    let optionsHtml = "";
    question.options.forEach(function (option, index) {
      const isSelected = selected === index;
      let className = "vas-answer";
      if (session.mode === "study" && answered && index === question.answer) className += " is-correct";
      else if (session.mode === "study" && answered && isSelected && index !== question.answer) className += " is-wrong";
      else if (session.mode === "challenge" && isSelected) className += " is-selected";
      optionsHtml += '<button class="' + className + '" type="button" data-allstar-answer="' + index + '"' + (session.mode === "study" && answered ? " disabled" : "") + '><span class="vas-answer-letter">' + String.fromCharCode(65 + index) + '</span><span>' + escapeHtml(option) + '</span>' + (session.mode === "study" && answered && index === question.answer ? '<span class="vas-answer-check" aria-hidden="true">✓</span>' : "") + '</button>';
    });
    let feedbackHtml = "";
    if (session.mode === "study" && answered) {
      feedbackHtml = '<div class="vas-feedback ' + (selected === question.answer ? "is-correct" : "is-wrong") + '"><strong>' + (selected === question.answer ? "Resposta correta!" : "Vamos revisar esse ponto.") + '</strong><p>' + escapeHtml(question.explanation) + '</p><small>Fonte: ' + escapeHtml(question.source) + '</small></div>';
    }
    const navBack = session.index > 0 && session.mode === "challenge" ? '<button type="button" class="vas-secondary" data-allstar-nav="prev">Anterior</button>' : "";
    let nextLabel = "";
    if (session.mode === "study") nextLabel = session.index === total - 1 ? "Concluir treino" : "Próxima questão";
    else nextLabel = session.index === total - 1 ? "Finalizar prova" : "Próxima questão";
    const canAdvance = session.mode === "study" ? answered : answered;
    const nextAction = session.index === total - 1 ? "finish" : "next";
    const challengeStatus = session.mode === "challenge" ? '<p class="vas-quiz-copy">Respostas registradas: ' + answeredCount + ' de ' + total + '. O gabarito aparece apenas ao finalizar.</p>' : "";
    box.innerHTML = '<div class="vas-question-card"><div class="vas-question-top"><span>' + escapeHtml(area.icon + " " + area.label) + '</span><span>Questão ' + (session.index + 1) + ' de ' + total + '</span></div><div class="vas-progress-track"><span style="width:' + percent + '%"></span></div><div class="vas-question-meta">' + escapeHtml(question.source) + '</div><h3>' + escapeHtml(question.prompt) + '</h3><div class="vas-answers">' + optionsHtml + '</div>' + feedbackHtml + challengeStatus + '<div class="vas-question-nav">' + navBack + '<button type="button" class="vas-primary" data-allstar-nav="' + nextAction + '"' + (!canAdvance ? " disabled" : "") + '>' + nextLabel + ' <span aria-hidden="true">→</span></button></div></div>';
  }
  function renderResult(box, session) {
    const correct = session.answers.reduce(function (sum, value, index) { return sum + (value === session.questions[index].answer ? 1 : 0); }, 0);
    const total = session.questions.length;
    const score = Math.round((correct / total) * 100);
    const passed = session.mode === "challenge" && score >= 80;
    const heading = session.mode === "study" ? "Treino concluído" : (passed ? "Meta do simulado atingida!" : "Prova concluída");
    const copy = session.mode === "study" ? "Revise as explicações e pratique novamente para consolidar o conteúdo." : (passed ? "Você atingiu a meta sugerida de 80% neste simulado do Venture." : "Use a revisão abaixo para identificar os assuntos que precisam de mais treino.");
    let review = "";
    session.questions.forEach(function (question, index) {
      const selected = session.answers[index];
      const isCorrect = selected === question.answer;
      review += '<div class="vas-review-item ' + (isCorrect ? "is-correct" : "is-wrong") + '"><div><strong>' + (isCorrect ? "✓ " : "↺ ") + escapeHtml(question.id + " · " + question.prompt) + '</strong><p>Sua resposta: ' + escapeHtml(selected == null ? "Não respondida" : question.options[selected]) + '</p>' + (!isCorrect ? '<p>Resposta correta: ' + escapeHtml(question.options[question.answer]) + '</p>' : "") + '<small>' + escapeHtml(question.source) + '</small></div></div>';
    });
    box.innerHTML = '<div class="vas-result-card"><div class="vas-result-medal">' + (passed ? "🏆" : "⭐") + '</div><div class="vas-quiz-kicker">' + (session.mode === "study" ? "RESULTADO DO TREINO" : "RESULTADO DA PROVA") + '</div><h3>' + heading + '</h3><div class="vas-score">' + score + '<span>%</span></div><p>' + correct + ' de ' + total + ' respostas corretas. ' + escapeHtml(copy) + '</p><div class="vas-result-facts"><span><strong>' + correct + '/' + total + '</strong> acertos</span><span><strong>0 XP</strong> concedido</span><span><strong>' + (passed ? "Meta atingida" : "Revisão disponível") + '</strong> resultado Venture</span></div><div class="vas-review"><h4>Revisão das respostas</h4>' + review + '</div><div class="vas-question-nav"><button class="vas-secondary" type="button" data-allstar-action="home">Voltar às estações</button><button class="vas-primary" type="button" data-allstar-action="restart">Tentar novamente ↻</button></div><p class="vas-quiz-copy">A meta de 80% é uma regra sugerida para o simulado do Venture, não uma certificação ou resultado oficial da competição All Star.</p></div>';
  }
  function startSession() {
    const pool = questionsFor(state.area);
    if (!pool.length) return;
    const chosen = state.mode === "challenge" ? shuffle(pool).slice(0, Math.min(10, pool.length)) : pool.slice();
    state.session = { area: state.area, mode: state.mode, questions: chosen, index: 0, answers: chosen.map(function () { return null; }), completed: false, startedAt: Date.now() };
    renderQuiz();
  }
  function recordResult(session, correct, total, score) {
    const user = getUser();
    if (!user) return;
    if (!user.ventureAllStar || typeof user.ventureAllStar !== "object") user.ventureAllStar = {};
    const allstar = user.ventureAllStar;
    if (!allstar.progress || typeof allstar.progress !== "object") allstar.progress = {};
    const progress = getProgress(user, session.area);
    if (session.mode === "challenge") {
      progress.challengeAttempts = (Number(progress.challengeAttempts) || 0) + 1;
      progress.bestChallengeScore = Math.max(Number(progress.bestChallengeScore) || 0, score);
    } else {
      progress.trainingAttempts = (Number(progress.trainingAttempts) || 0) + 1;
      progress.bestTrainingScore = Math.max(Number(progress.bestTrainingScore) || 0, score);
    }
    progress.lastScore = score;
    progress.lastMode = session.mode;
    progress.lastAt = Date.now();
    allstar.progress[session.area] = progress;
    if (!Array.isArray(allstar.history)) allstar.history = [];
    allstar.history.push({ id: "allstar-" + Date.now() + "-" + Math.floor(Math.random() * 1000000), area: session.area, mode: session.mode, correct: correct, total: total, score: score, startedAt: session.startedAt, completedAt: Date.now(), xpAwarded: 0 });
    allstar.history = allstar.history.slice(-30);
    saveUser(false);
    if (window.VentureNotifications && typeof window.VentureNotifications.addForUser === "function") {
      window.VentureNotifications.addForUser(currentUserKey, session.mode === "challenge" ? "Prova All Star concluída" : "Treino All Star concluído", "Resultado: " + score + "% em " + getArea(session.area).label + ". Nenhum XP oficial foi alterado.", "allstar", "allstar-result:" + allstar.history[allstar.history.length - 1].id);
    }
  }
  function finishSession() {
    if (!state.session || state.session.completed) return;
    const session = state.session;
    const correct = session.answers.reduce(function (sum, value, index) { return sum + (value === session.questions[index].answer ? 1 : 0); }, 0);
    const total = session.questions.length;
    const score = Math.round((correct / total) * 100);
    session.completed = true;
    session.correct = correct;
    session.score = score;
    recordResult(session, correct, total, score);
    renderProgress();
    renderQuiz();
    render();
  }
  function selectArea(areaId) {
    if (!AREAS.some(function (area) { return area.id === areaId; })) return;
    state.area = areaId;
    state.session = null;
    const user = getUser();
    if (user) {
      if (!user.ventureAllStar || typeof user.ventureAllStar !== "object") user.ventureAllStar = {};
      user.ventureAllStar.selectedArea = areaId;
      saveUser(false);
    }
    renderAreaControls();
    renderProgress();
    renderQuiz();
  }
  function setMode(modeId) {
    if (modeId !== "study" && modeId !== "challenge") return;
    state.mode = modeId;
    state.session = null;
    renderAreaControls();
    renderProgress();
    renderQuiz();
  }
  function setTrack(trackId) {
    const user = getUser();
    if (!user) { alert("Entre na sua conta para escolher sua trilha All Star."); return; }
    const track = getTrack(trackId);
    if (!user.ventureAllStar || typeof user.ventureAllStar !== "object") user.ventureAllStar = {};
    const previous = user.ventureAllStar.preferredTrack;
    user.ventureAllStar.preferredTrack = track.id;
    user.ventureAllStar.updatedAt = Date.now();
    saveUser(false);
    if (!previous && window.VentureNotifications && typeof window.VentureNotifications.addForUser === "function") {
      window.VentureNotifications.addForUser(currentUserKey, "Trilha All Star escolhida", "Sua preparação começa por " + track.label + ".", "allstar", "allstar-track:" + track.id);
    }
    render();
  }
  function handleClick(event) {
    const trackButton = event.target.closest("[data-allstar-track]");
    if (trackButton) { setTrack(trackButton.dataset.allstarTrack); return; }
    const areaButton = event.target.closest("[data-allstar-area]");
    if (areaButton) { selectArea(areaButton.dataset.allstarArea); return; }
    const modeButton = event.target.closest("[data-allstar-mode]");
    if (modeButton) { setMode(modeButton.dataset.allstarMode); return; }
    const answerButton = event.target.closest("[data-allstar-answer]");
    if (answerButton) {
      if (!state.session || state.session.completed) return;
      const session = state.session;
      const index = Number(answerButton.dataset.allstarAnswer);
      if (!Number.isInteger(index) || index < 0 || index >= session.questions[session.index].options.length) return;
      if (session.mode === "study" && session.answers[session.index] !== null) return;
      session.answers[session.index] = index;
      renderQuiz();
      return;
    }
    const navButton = event.target.closest("[data-allstar-nav]");
    if (navButton) {
      if (!state.session || state.session.completed) return;
      const session = state.session;
      const action = navButton.dataset.allstarNav;
      if (action === "prev") { session.index = Math.max(0, session.index - 1); renderQuiz(); return; }
      if (action === "next") {
        if (session.answers[session.index] === null) return;
        session.index = Math.min(session.questions.length - 1, session.index + 1);
        renderQuiz();
        return;
      }
      if (action === "finish") {
        if (session.answers[session.index] === null && session.mode === "study") return;
        finishSession();
        return;
      }
    }
    const actionButton = event.target.closest("[data-allstar-action]");
    if (actionButton) {
      const action = actionButton.dataset.allstarAction;
      if (action === "start") startSession();
      else if (action === "restart") startSession();
      else if (action === "home") { state.session = null; renderQuiz(); }
    }
  }
  function init() {
    const root = byId("ventureAllStar");
    if (!root) return;
    const user = getUser();
    if (user && user.ventureAllStar && AREAS.some(function (area) { return area.id === user.ventureAllStar.selectedArea; })) state.area = user.ventureAllStar.selectedArea;
    root.addEventListener("click", handleClick);
    render();
    const oldHeader = typeof updateHeaderUI === "function" ? updateHeaderUI : null;
    if (oldHeader && !oldHeader.__ventureAllStarWrapped) {
      const wrapped = function () { const result = oldHeader.apply(this, arguments); render(); return result; };
      wrapped.__ventureAllStarWrapped = true;
      updateHeaderUI = wrapped;
    }
    const oldLeagueRender = window.renderVentureMonthlyLeague;
    if (typeof oldLeagueRender === "function" && !oldLeagueRender.__ventureAllStarWrapped) {
      const wrapped = function () { const result = oldLeagueRender.apply(this, arguments); render(); return result; };
      wrapped.__ventureAllStarWrapped = true;
      window.renderVentureMonthlyLeague = wrapped;
    }
  }
  window.VentureAllStar = { tracks: TRACKS, areas: AREAS, questions: QUESTIONS, render: render, setTrack: setTrack, selectArea: selectArea, setMode: setMode, startSession: startSession };
  window.setVentureAllStarTrack = setTrack;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();