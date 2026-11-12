/* Governança de Serviços — interações */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmtBRL = v => {
    if (v >= 1e6) return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + ' mi';
    if (v >= 1e3) return 'R$ ' + Math.round(v / 1e3).toLocaleString('pt-BR') + ' mil';
    return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  };

  /* ---------- Header / progress ---------- */
  const header = $('.site-header');
  const prog = $('.scroll-progress span');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    updateJourney();
    spyNav();
  };

  /* Mobile menu */
  const burger = $('.burger'), mm = $('.mobile-menu');
  const toggleMenu = (open) => {
    burger.classList.toggle('open', open);
    mm.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    mm.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('locked', open);
  };
  burger.addEventListener('click', () => toggleMenu(!mm.classList.contains('open')));
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  /* Mega menu (click for touch / keyboard) */
  const mega = $('.has-mega');
  $('.nav-link', mega).addEventListener('click', e => {
    const open = !mega.classList.contains('open');
    mega.classList.toggle('open', open);
    e.currentTarget.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', e => { if (!mega.contains(e.target)) mega.classList.remove('open'); });
  $$('.mega a').forEach(a => a.addEventListener('click', () => mega.classList.remove('open')));

  /* Scroll spy */
  const navLinks = $$('.main-nav a.nav-link');
  const spyNav = () => {
    let cur = '';
    navLinks.forEach(a => {
      const sec = $(a.getAttribute('href'));
      if (sec && sec.getBoundingClientRect().top < 140) cur = a.getAttribute('href');
    });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === cur));
  };

  /* ---------- Reveal + counters ---------- */
  const animateCount = el => {
    const target = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    const dur = 1800, t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (p < 1) requestAnimationFrame(step);
    };
    reduce ? (el.textContent = target.toLocaleString('pt-BR', { minimumFractionDigits: dec })) : requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in-view');
      $$('[data-count]', el).forEach(c => { if (!c.dataset.done) { c.dataset.done = 1; animateCount(c); } });
      io.unobserve(el);
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el, i) => {
    // stagger siblings
    const sib = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = (sib.indexOf(el) % 6) * 80 + 'ms';
    io.observe(el);
  });

  /* ---------- Hero rotator ---------- */
  const words = ['o seu negócio.', 'os seus usuários.', 'a sua estratégia.', 'os seus resultados.'];
  const rw = $('.rotator-word'); let wi = 0;
  if (!reduce) setInterval(() => {
    rw.classList.add('out');
    setTimeout(() => {
      wi = (wi + 1) % words.length; rw.textContent = words[wi];
      rw.classList.remove('out'); rw.classList.add('in');
      requestAnimationFrame(() => requestAnimationFrame(() => rw.classList.remove('in')));
    }, 450);
  }, 3200);

  /* ---------- Hero canvas: network of providers orchestrated ---------- */
  const cv = $('#hero-canvas'), ctx = cv.getContext('2d');
  let W, H, nodes = [], mouse = { x: -999, y: -999 }, DPR = Math.min(devicePixelRatio || 1, 2);
  const resize = () => {
    W = cv.offsetWidth; H = cv.offsetHeight;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.min(90, Math.floor(W * H / 16000));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.8 + .8, hub: Math.random() < .08
    }));
  };
  const hub = { x: 0, y: 0 };
  let tick = 0;
  const draw = () => {
    tick++;
    ctx.clearRect(0, 0, W, H);
    hub.x = W * .78 + Math.sin(tick / 200) * 20; hub.y = H * .42 + Math.cos(tick / 240) * 20;
    // orchestration rings
    for (let i = 0; i < 3; i++) {
      const rr = 60 + i * 70 + ((tick * .4) % 70);
      ctx.beginPath(); ctx.arc(hub.x, hub.y, rr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(25,163,252,${Math.max(0, .18 - rr / 1600)})`; ctx.lineWidth = 1; ctx.stroke();
    }
    nodes.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 140) { p.x += (p.x - mouse.x) / dm * .8; p.y += (p.y - mouse.y) / dm * .8; }
    });
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) { ctx.strokeStyle = `rgba(111,195,255,${(1 - d / 130) * .22})`; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      if (a.hub) {
        const d = Math.hypot(a.x - hub.x, a.y - hub.y);
        const g = ctx.createLinearGradient(a.x, a.y, hub.x, hub.y);
        g.addColorStop(0, 'rgba(25,163,252,.0)'); g.addColorStop(1, 'rgba(25,163,252,.35)');
        ctx.strokeStyle = g; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(hub.x, hub.y); ctx.stroke();
        // pulse travelling to hub
        const t = ((tick + i * 37) % 180) / 180;
        ctx.fillStyle = 'rgba(160,220,255,.9)';
        ctx.beginPath(); ctx.arc(a.x + (hub.x - a.x) * t, a.y + (hub.y - a.y) * t, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = a.hub ? 'rgba(111,195,255,.95)' : 'rgba(180,205,255,.55)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.hub ? a.r + 1.6 : a.r, 0, Math.PI * 2); ctx.fill();
    }
    // hub core
    const rg = ctx.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, 34);
    rg.addColorStop(0, 'rgba(25,163,252,.95)'); rg.addColorStop(1, 'rgba(25,163,252,0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(hub.x, hub.y, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hub.x, hub.y, 5, 0, Math.PI * 2); ctx.fill();
    if (heroVisible) requestAnimationFrame(draw);
  };
  let heroVisible = true;
  new IntersectionObserver(([e]) => { const was = heroVisible; heroVisible = e.isIntersecting; if (heroVisible && !was && !reduce) requestAnimationFrame(draw); }).observe($('.hero'));
  $('.hero').addEventListener('mousemove', e => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  $('.hero').addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
  resize(); addEventListener('resize', resize);
  reduce ? (heroVisible = false, draw()) : requestAnimationFrame(draw);
  // hero cards bars
  setTimeout(() => $('.hero-cards').classList.add('in-view'), 300);

  /* ---------- Watermelon toggle ---------- */
  const melon = $('#melon');
  $$('.toggle button', melon).forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.view;
    $$('.toggle button', melon).forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-selected', x === b); });
    melon.classList.toggle('xla', v === 'xla');
    $$('[data-sla]', melon).forEach(el => el.textContent = el.dataset[v]);
  }));
  // auto demo once when visible
  new IntersectionObserver(([e], o) => {
    if (e.isIntersecting) { setTimeout(() => $('[data-view="xla"]', melon).click(), 1800); o.disconnect(); }
  }, { threshold: .6 }).observe(melon);

  /* ---------- Offers modal ---------- */
  const OFFERS = {
    sgo: { tag: 'Service Governance Office', title: 'Escritório de Governança de Serviços',
      desc: 'Uma estrutura permanente — operada pela NTT DATA, pela sua equipe ou de forma híbrida — que garante que todos os serviços de TI estejam alinhados ao negócio, sejam medidos de forma independente e melhorem continuamente.',
      deliver: ['Modelo de governança em três níveis: estratégico, tático e operacional', 'Calendário de ritos, comitês e fóruns de decisão', 'Matriz RACI entre negócio, TI e fornecedores', 'Políticas, padrões e gestão de exceções', 'Relatórios executivos mensais e QBRs'],
      outcomes: ['Decisões mais rápidas e rastreáveis', 'Responsabilidade clara pelo serviço ponta a ponta', 'Alinhamento entre investimento em TI e prioridades do negócio', 'Prontidão para auditorias e órgãos de controle'] },
    siam: { tag: 'Service Integration & Management', title: 'SIAM — Integração Multifornecedor',
      desc: 'Assumimos o papel de integrador de serviços, criando uma camada que conecta fornecedores, processos e ferramentas para que o ecossistema funcione como um único provedor diante do negócio.',
      deliver: ['Desenho do modelo operacional SIAM (cliente, integrador, provedores)', 'Processos integrados de incidentes, problemas, mudanças e releases', 'Acordos de colaboração e OLAs entre fornecedores', 'Gestão de incidentes graves e war room multifornecedor', 'Integração de ferramentas de ITSM e dados'],
      outcomes: ['Fim do pingue-pongue entre fornecedores', 'Redução do MTTR em incidentes complexos', 'Flexibilidade para trocar fornecedores sem ruptura', 'Visão única do desempenho de todo o ecossistema'] },
    sla: { tag: 'Service Level & Experience', title: 'Gestão de SLA & XLA',
      desc: 'Combinamos indicadores contratuais (SLA), operacionais (OLA) e de experiência (XLA) para medir o que realmente importa — com dados objetivos e um modelo de consequências justo.',
      deliver: ['Revisão e racionalização do portfólio de SLAs', 'Desenho de XLAs por persona e jornada', 'Medição independente e automatizada', 'Modelo de créditos de serviço e bônus por desempenho', 'Pesquisas contínuas de experiência e análise de sentimento'],
      outcomes: ['Fim do “efeito melancia”', 'Indicadores que o negócio entende', 'Créditos de serviço efetivamente apurados', 'Fornecedores incentivados a gerar valor, não só a cumprir prazos'] },
    vendor: { tag: 'Vendor & Contract Management', title: 'Gestão de Contratos e Fornecedores',
      desc: 'Gerimos o ciclo de vida completo dos fornecedores de TI — da estratégia de sourcing à renovação — com foco em desempenho, risco, conformidade e valor gerado.',
      deliver: ['Inventário e análise de contratos e escopos', 'Estratégia de sourcing e apoio a RFPs', 'Avaliação periódica de desempenho (scorecards)', 'Gestão de riscos de terceiros e conformidade (LGPD, segurança)', 'Gestão de relacionamento estratégico com parceiros'],
      outcomes: ['Redução de sobreposição de escopo e custos ocultos', 'Renegociações apoiadas por dados', 'Menor risco de dependência de fornecedor', 'Contratos alinhados às metas de negócio'] },
    itsm: { tag: 'ITIL 4 · ISO/IEC 20000 · COBIT', title: 'Governança de Processos de Serviço',
      desc: 'Avaliamos, desenhamos e auditamos os processos de gerenciamento de serviços com base nos principais frameworks de mercado, adaptados à realidade e ao porte da sua organização.',
      deliver: ['Avaliação de maturidade de processos (ITIL 4 / COBIT)', 'Desenho e padronização de práticas de gerenciamento de serviços', 'Catálogo de serviços de negócio e técnico', 'Preparação para certificação ISO/IEC 20000', 'Auditorias internas e programas de capacitação'],
      outcomes: ['Processos consistentes entre áreas e fornecedores', 'Base sólida para escalar e automatizar', 'Certificações que geram confiança no mercado', 'Equipes capacitadas e engajadas'] },
    intel: { tag: 'Service Intelligence & IA', title: 'Inteligência de Serviços',
      desc: 'Transformamos dados de todos os fornecedores e ferramentas em uma camada única de inteligência, com painéis executivos, análise preditiva e agentes de IA que apoiam a gestão.',
      deliver: ['Data lake de serviços com dados de todos os fornecedores', 'Painéis executivos, táticos e operacionais', 'Alertas preditivos de risco de SLA', 'Agentes de IA para relatórios e análise de causa raiz', 'Integração com indicadores financeiros (FinOps)'],
      outcomes: ['Relatórios automáticos, sem planilhas', 'Antecipação de falhas antes do impacto no usuário', 'Comitês orientados por dados', 'Custo de TI conectado ao valor entregue'] }
  };
  const keys = Object.keys(OFFERS);
  const modal = $('#offer-modal'); let curOffer = 0, lastFocus;
  const fillModal = k => {
    const o = OFFERS[k]; curOffer = keys.indexOf(k);
    $('#m-tag').textContent = o.tag; $('#m-title').textContent = o.title; $('#m-desc').textContent = o.desc;
    $('#m-deliver').innerHTML = o.deliver.map(x => `<li>${x}</li>`).join('');
    $('#m-outcomes').innerHTML = o.outcomes.map(x => `<li>${x}</li>`).join('');
  };
  const openModal = k => {
    lastFocus = document.activeElement; fillModal(k);
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('locked');
    setTimeout(() => $('.modal-close', modal).focus(), 50);
  };
  const closeModal = () => {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('locked');
    lastFocus && lastFocus.focus && lastFocus.focus();
  };
  $$('.offer').forEach(c => {
    c.addEventListener('click', () => openModal(c.dataset.offer));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(c.dataset.offer); } });
    c.addEventListener('mousemove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); });
  });
  $$('.mega [data-open]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); $('#ofertas').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => openModal(a.dataset.open), 600); }));
  $$('[data-close]', modal).forEach(b => b.addEventListener('click', closeModal));
  $('#m-prev').addEventListener('click', () => fillModal(keys[(curOffer - 1 + keys.length) % keys.length]));
  $('#m-next').addEventListener('click', () => fillModal(keys[(curOffer + 1) % keys.length]));
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') $('#m-next').click();
    if (e.key === 'ArrowLeft') $('#m-prev').click();
  });

  /* ---------- SIAM layers ---------- */
  const layers = $$('.layer'), panels = $$('.ld-panel');
  const setLayer = i => { layers.forEach((l, j) => l.classList.toggle('active', i === j)); panels.forEach((p, j) => p.classList.toggle('active', i === j)); };
  let layerAuto = setInterval(() => setLayer((layers.findIndex(l => l.classList.contains('active')) + 1) % 3), 4500);
  layers.forEach((l, i) => {
    const go = () => { clearInterval(layerAuto); setLayer(i); };
    l.addEventListener('mouseenter', go); l.addEventListener('click', go); l.addEventListener('focus', go);
  });

  /* ---------- Journey progress ---------- */
  const journey = $('.journey'), jline = $('.journey-line span'), jsteps = $$('.jstep');
  function updateJourney() {
    if (!journey) return;
    const r = journey.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight * .75 - r.top) / (r.height + innerHeight * .2)));
    jline.style.width = p * 100 + '%';
    journey.style.setProperty('--jh', p * 100 + '%');
    jsteps.forEach((s, i) => s.classList.toggle('active', p >= i / jsteps.length + .02));
  }

  /* ---------- Maturity quiz ---------- */
  const DIMS = ['Estratégia', 'Fornecedores', 'Níveis de serviço', 'Processos', 'Dados', 'Experiência', 'Integração', 'Melhoria'];
  const QS = [
    { d: 0, q: 'Como as decisões sobre serviços de TI são tomadas na sua organização?', o: ['De forma reativa, conforme os problemas surgem', 'Existem reuniões, mas sem um modelo definido', 'Há comitês formais com pauta e responsáveis', 'Governança estruturada em níveis, com decisões rastreáveis', 'Governança integrada à estratégia do negócio e revisada continuamente'] },
    { d: 1, q: 'Como vocês avaliam o desempenho dos fornecedores de TI?', o: ['Não há avaliação estruturada', 'Avaliamos apenas quando algo dá errado', 'Relatórios enviados pelos próprios fornecedores', 'Scorecards periódicos com dados independentes', 'Avaliação contínua, comparativa e ligada a incentivos'] },
    { d: 2, q: 'Como estão definidos os acordos de nível de serviço (SLAs)?', o: ['Não temos SLAs formais', 'SLAs genéricos, iguais para todos os serviços', 'SLAs por contrato, mas sem visão ponta a ponta', 'SLAs e OLAs integrados, com créditos de serviço aplicados', 'SLAs ponta a ponta, combinados com XLAs de experiência'] },
    { d: 3, q: 'Qual é o nível de padronização dos processos de gerenciamento de serviços?', o: ['Cada equipe e fornecedor trabalha do seu jeito', 'Alguns processos documentados', 'Processos ITIL principais implantados', 'Processos padronizados entre todos os fornecedores', 'Processos certificados (ex.: ISO 20000) e otimizados'] },
    { d: 4, q: 'Como os relatórios de serviço são produzidos?', o: ['Não existem relatórios regulares', 'Planilhas manuais, montadas sob demanda', 'Relatórios periódicos, cada fornecedor em um formato', 'Painel consolidado, parcialmente automatizado', 'Painéis em tempo real, com análise preditiva e IA'] },
    { d: 5, q: 'Vocês medem a experiência dos usuários com os serviços de TI?', o: ['Não medimos', 'Pesquisa pontual, sem ação posterior', 'Pesquisa de satisfação após os chamados', 'Indicadores de experiência acompanhados pela gestão', 'XLAs por persona, com metas ligadas aos contratos'] },
    { d: 6, q: 'Como funciona a resolução de incidentes que envolvem vários fornecedores?', o: ['Cada um olha só a sua parte', 'A equipe interna coordena manualmente, quando consegue', 'Existe um processo, mas com muitas transferências', 'Um integrador coordena, com regras de colaboração', 'Orquestração automatizada e responsabilidade ponta a ponta'] },
    { d: 7, q: 'Como é conduzida a melhoria contínua dos serviços?', o: ['Não há iniciativas estruturadas', 'Melhorias pontuais após grandes falhas', 'Registro de melhorias, sem priorização clara', 'Programa de melhoria com metas e responsáveis', 'Melhoria orientada por dados, com inovação conjunta com fornecedores'] }
  ];
  const LEVELS = [
    ['Inicial', 'A governança acontece de forma reativa. Há uma grande oportunidade de ganhos rápidos com estruturação básica.'],
    ['Em desenvolvimento', 'Existem iniciativas, mas sem integração. O próximo passo é criar um modelo único de governança e medição.'],
    ['Definido', 'Processos e ritos estão estabelecidos. O desafio agora é integrar fornecedores e automatizar a visão de desempenho.'],
    ['Gerenciado', 'Governança madura e baseada em dados. O foco passa a ser experiência do usuário, IA e otimização de valor.'],
    ['Otimizado', 'Referência de mercado. Sua organização pode evoluir para modelos de inovação conjunta e governança preditiva.']
  ];
  const RECS = {
    0: '<b>Estruture o Escritório de Governança</b> com ritos em três níveis e uma matriz RACI clara.',
    1: '<b>Implante scorecards de fornecedores</b> com dados independentes e avaliação periódica.',
    2: '<b>Revise o portfólio de SLAs</b> e crie OLAs entre fornecedores para uma visão ponta a ponta.',
    3: '<b>Padronize os processos críticos</b> (incidentes, mudanças, problemas) entre todos os parceiros.',
    4: '<b>Automatize os relatórios</b> com um painel único que consolide todos os fornecedores.',
    5: '<b>Introduza XLAs</b> para medir a experiência real dos usuários e combater o “efeito melancia”.',
    6: '<b>Adote um modelo SIAM</b> com um integrador responsável pelos incidentes que atravessam fornecedores.',
    7: '<b>Crie um programa de melhoria contínua</b> com metas, priorização e participação dos fornecedores.'
  };
  const answers = new Array(QS.length).fill(null); let qi = 0;
  const stage = $('#quiz-stage');
  const renderQ = () => {
    const Q = QS[qi];
    stage.innerHTML = `<div class="q"><span class="q-dim">${DIMS[Q.d]}</span><h3>${Q.q}</h3><div class="q-opts">${Q.o.map((t, i) => `<button class="q-opt${answers[qi] === i ? ' sel' : ''}" data-i="${i}"><span class="qn">${i + 1}</span>${t}</button>`).join('')}</div></div>`;
    $('#q-num').textContent = qi + 1; $('#q-total').textContent = QS.length;
    $('#q-bar').style.width = ((qi + 1) / QS.length) * 100 + '%';
    $('#q-prev').disabled = qi === 0;
    $$('.q-opt', stage).forEach(b => b.addEventListener('click', () => {
      answers[qi] = +b.dataset.i;
      $$('.q-opt', stage).forEach(x => x.classList.toggle('sel', x === b));
      setTimeout(() => { if (qi < QS.length - 1) { qi++; renderQ(); } else showResult(); }, 280);
    }));
  };
  $('#q-prev').addEventListener('click', () => { if (qi > 0) { qi--; renderQ(); } });
  const showResult = () => {
    const scores = answers.map(a => a + 1);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    $('#quiz').hidden = true; const res = $('#quiz-result'); res.hidden = false;
    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const lvl = LEVELS[Math.min(4, Math.max(0, Math.round(avg) - 1))];
    $('#r-level').textContent = 'Nível ' + lvl[0]; $('#r-desc').textContent = lvl[1];
    const sc = $('#r-score'); const t0 = performance.now();
    const st = t => { const p = Math.min((t - t0) / 1400, 1); sc.textContent = (avg * (1 - Math.pow(1 - p, 3))).toFixed(1).replace('.', ','); if (p < 1) requestAnimationFrame(st); };
    requestAnimationFrame(st);
    setTimeout(() => { $('#g-fg').style.strokeDashoffset = 327 - 327 * (avg / 5); }, 100);
    const weakest = scores.map((s, i) => [s, i]).sort((a, b) => a[0] - b[0]).slice(0, 3).map(x => QS[x[1]].d);
    $('#r-recs').innerHTML = weakest.map(d => `<li>${RECS[d]}</li>`).join('');
    drawRadar(scores);
  };
  $('#q-restart').addEventListener('click', () => {
    answers.fill(null); qi = 0; $('#quiz-result').hidden = true; $('#quiz').hidden = false;
    $('#g-fg').style.strokeDashoffset = 327; renderQ(); $('#maturidade').scrollIntoView({ behavior: 'smooth' });
  });
  renderQ();

  const drawRadar = scores => {
    const c = $('#radar'), g = c.getContext('2d'); const S = 440; c.width = S * DPR; c.height = S * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0);
    const cx = S / 2, cy = S / 2, R = 140, n = scores.length;
    const pt = (i, r) => [cx + Math.cos(-Math.PI / 2 + i * 2 * Math.PI / n) * r, cy + Math.sin(-Math.PI / 2 + i * 2 * Math.PI / n) * r];
    const t0 = performance.now();
    const frame = t => {
      const p = Math.min((t - t0) / 1200, 1), e = 1 - Math.pow(1 - p, 3);
      g.clearRect(0, 0, S, S);
      for (let l = 1; l <= 5; l++) {
        g.beginPath(); for (let i = 0; i <= n; i++) { const [x, y] = pt(i % n, R * l / 5); i ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.strokeStyle = '#e3e8f0'; g.lineWidth = 1; g.stroke();
      }
      for (let i = 0; i < n; i++) {
        const [x, y] = pt(i, R); g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.strokeStyle = '#e3e8f0'; g.stroke();
        const [lx, ly] = pt(i, R + 30); g.fillStyle = '#2b3440'; g.font = '600 12px "Noto Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(DIMS[i], lx, ly);
      }
      // benchmark (target) polygon
      g.beginPath(); for (let i = 0; i <= n; i++) { const [x, y] = pt(i % n, R * 4 / 5); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.setLineDash([5, 5]); g.strokeStyle = 'rgba(230,182,0,.9)'; g.lineWidth = 1.5; g.stroke(); g.setLineDash([]);
      g.beginPath(); for (let i = 0; i <= n; i++) { const [x, y] = pt(i % n, R * scores[i % n] / 5 * e); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.fillStyle = 'rgba(0,114,188,.22)'; g.fill(); g.strokeStyle = '#0072bc'; g.lineWidth = 2.5; g.stroke();
      for (let i = 0; i < n; i++) { const [x, y] = pt(i, R * scores[i] / 5 * e); g.beginPath(); g.arc(x, y, 4.5, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#0072bc'; g.lineWidth = 2; g.stroke(); }
      g.font = '11px "Noto Sans", sans-serif'; g.textAlign = 'left';
      g.fillStyle = '#0072bc'; g.fillRect(20, S - 26, 12, 3); g.fillStyle = '#5b6876'; g.fillText('Sua organização', 38, S - 24);
      g.fillStyle = '#e6b600'; g.fillRect(160, S - 26, 12, 3); g.fillStyle = '#5b6876'; g.fillText('Meta recomendada (nível 4)', 178, S - 24);
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  /* ---------- Value simulator ---------- */
  const sIn = { spend: $('#s-spend'), vendors: $('#s-vendors'), inc: $('#s-inc'), hour: $('#s-hour'), mat: $('#s-mat') };
  const matNames = ['Inicial', 'Em desenvolvimento', 'Definido', 'Gerenciado', 'Otimizado'];
  let simShown = 0;
  const calcSim = () => {
    Object.values(sIn).forEach(r => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%'));
    const spend = +sIn.spend.value * 1e6, vendors = +sIn.vendors.value, inc = +sIn.inc.value, hour = +sIn.hour.value * 1e3, mat = +sIn.mat.value;
    $('#o-spend').textContent = 'R$ ' + (+sIn.spend.value).toLocaleString('pt-BR') + ' mi';
    $('#o-vendors').textContent = vendors; $('#o-inc').textContent = inc;
    $('#o-hour').textContent = fmtBRL(hour); $('#o-mat').textContent = matNames[mat - 1];
    const gap = (5 - mat) / 4; // 0..1 potential
    const complexity = Math.min(1, Math.log(vendors + 1) / Math.log(40));
    const contract = spend * (0.03 + 0.07 * gap) * (0.6 + 0.4 * complexity);
    const down = inc * 12 * 1.2 /*h por incidente evitável*/ * hour * (0.10 + 0.20 * gap) * (0.5 + 0.5 * complexity);
    const credit = spend * 0.01 * gap * (0.5 + 0.5 * complexity);
    const ops = vendors * 18000 * 12 * 0.25 * (0.4 + 0.6 * gap);
    const total = contract + down + credit + ops;
    const max = Math.max(contract, down, credit, ops) || 1;
    const set = (id, v) => { $('#v-' + id).textContent = fmtBRL(v); $('#b-' + id).style.width = (v / max) * 100 + '%'; };
    set('contract', contract); set('down', down); set('credit', credit); set('ops', ops);
    // animate total
    const from = simShown, t0 = performance.now();
    const st = t => { const p = Math.min((t - t0) / 600, 1); const v = from + (total - from) * (1 - Math.pow(1 - p, 3)); $('#sim-total').textContent = fmtBRL(v); if (p < 1) requestAnimationFrame(st); else simShown = total; };
    requestAnimationFrame(st);
  };
  Object.values(sIn).forEach(r => r.addEventListener('input', calcSim));
  calcSim();

  /* ---------- Dashboard (simulated) ---------- */
  const VENDORS = [['Cloud', 99.1], ['Rede', 97.4], ['Service Desk', 94.8], ['Aplicações', 96.2], ['Segurança', 98.6], ['Data Center', 99.4]];
  const ALERTS = [
    ['hi', 'Risco de violação de SLA no serviço de Aplicações', 'Previsão: 72% de probabilidade em 48h · fila de chamados crescente'],
    ['md', 'Aumento de reaberturas no Service Desk', '+18% na semana · sugestão: revisar base de conhecimento'],
    ['lo', 'Janela de mudança conflitante entre Rede e Cloud', 'Sábado 02h · recomendado reagendar uma das mudanças'],
    ['md', 'Queda no XLA da persona “Força de vendas”', 'Nota 7,1 · lentidão no CRM em horário de pico'],
    ['lo', 'Crédito de serviço apurável identificado', 'Contrato de Data Center · indisponibilidade de 42 min'],
    ['hi', 'Padrão de incidentes recorrentes detectado', 'Mesma causa raiz em 3 fornecedores · abrir problema integrado']
  ];
  const vendorsEl = $('#vendors'), alertsEl = $('#alerts');
  const renderVendors = (jit = 0) => {
    vendorsEl.innerHTML = VENDORS.map(([n, v]) => {
      const val = Math.min(99.9, Math.max(90, v + (Math.random() - .5) * jit));
      const col = val >= 98 ? '#2ee08a' : val >= 96 ? '#19a3fc' : '#e6b600';
      return `<li><span>${n}</span><span class="vbar"><i style="width:${(val - 88) / 12 * 100}%;background:${col}"></i></span><b>${val.toFixed(1).replace('.', ',')}%</b></li>`;
    }).join('');
  };
  let alertIdx = 0;
  const renderAlerts = () => {
    const list = [0, 1, 2].map(k => ALERTS[(alertIdx + k) % ALERTS.length]);
    alertsEl.innerHTML = list.map(([s, t, d]) => `<li><span class="sev ${s}"></span><div>${t}<small>${d}</small></div></li>`).join('');
  };
  renderVendors(); renderAlerts();
  const dc = $('#dash-chart'), dg = dc.getContext('2d');
  let series = null, range = 7, chartProg = 0;
  const genSeries = n => Array.from({ length: n }, (_, i) => {
    const base = 120 + Math.sin(i / 3) * 25 + Math.random() * 30;
    return { v: base, ok: 92 + Math.random() * 6 + (i / n) * 2 };
  });
  const drawChart = () => {
    const w = dc.clientWidth, h = dc.clientHeight; dc.width = w * DPR; dc.height = h * DPR; dg.setTransform(DPR, 0, 0, DPR, 0, 0);
    dg.clearRect(0, 0, w, h);
    const pad = { l: 34, r: 34, t: 10, b: 24 }, cw = w - pad.l - pad.r, ch = h - pad.t - pad.b, n = series.length;
    const maxV = Math.max(...series.map(s => s.v)) * 1.15;
    dg.strokeStyle = 'rgba(255,255,255,.06)'; dg.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const y = pad.t + ch * i / 4; dg.beginPath(); dg.moveTo(pad.l, y); dg.lineTo(w - pad.r, y); dg.stroke(); }
    const bw = cw / n * .55;
    series.forEach((s, i) => {
      const x = pad.l + cw * (i + .5) / n, bh = ch * (s.v / maxV) * chartProg;
      const gr = dg.createLinearGradient(0, pad.t + ch - bh, 0, pad.t + ch); gr.addColorStop(0, 'rgba(25,163,252,.85)'); gr.addColorStop(1, 'rgba(0,114,188,.25)');
      dg.fillStyle = gr; dg.beginPath(); dg.roundRect ? dg.roundRect(x - bw / 2, pad.t + ch - bh, bw, bh, [3, 3, 0, 0]) : dg.rect(x - bw / 2, pad.t + ch - bh, bw, bh); dg.fill();
    });
    dg.beginPath();
    series.forEach((s, i) => { const x = pad.l + cw * (i + .5) / n, y = pad.t + ch - ch * ((s.ok - 85) / 15) * chartProg; i ? dg.lineTo(x, y) : dg.moveTo(x, y); });
    dg.strokeStyle = '#2ee08a'; dg.lineWidth = 2.2; dg.stroke();
    dg.fillStyle = '#6f81a8'; dg.font = '10px "Noto Sans", sans-serif'; dg.textAlign = 'right'; dg.fillText(Math.round(maxV), pad.l - 6, pad.t + 8); dg.fillText('0', pad.l - 6, pad.t + ch);
    dg.textAlign = 'left'; dg.fillText('100%', w - pad.r + 4, pad.t + 8); dg.fillText('85%', w - pad.r + 4, pad.t + ch);
    dg.textAlign = 'left'; dg.fillStyle = '#19a3fc'; dg.fillRect(pad.l, h - 10, 10, 6); dg.fillStyle = '#8ea1c9'; dg.fillText('Incidentes', pad.l + 14, h - 4);
    dg.fillStyle = '#2ee08a'; dg.fillRect(pad.l + 90, h - 9, 10, 3); dg.fillStyle = '#8ea1c9'; dg.fillText('% resolvidos no prazo', pad.l + 104, h - 4);
  };
  const animateChart = () => { chartProg = 0; const t0 = performance.now(); const st = t => { chartProg = Math.min((t - t0) / 900, 1); chartProg = 1 - Math.pow(1 - chartProg, 3); drawChart(); if (chartProg < 1) requestAnimationFrame(st); }; requestAnimationFrame(st); };
  const KPIS = { 7: ['98,4%', '8,6', '3h12', 'R$ 412 mil'], 30: ['97,9%', '8,4', '3h41', 'R$ 1,6 mi'], 90: ['97,2%', '8,1', '4h05', 'R$ 4,3 mi'] };
  const setRange = r => {
    range = r; series = genSeries(r === 7 ? 7 : r === 30 ? 30 : 13);
    const k = KPIS[r];['k-sla', 'k-xla', 'k-mttr', 'k-cred'].forEach((id, i) => { const el = $('#' + id); el.style.opacity = 0; setTimeout(() => { el.textContent = k[i]; el.style.opacity = 1; }, 200); });
    renderVendors(2); animateChart();
  };
  $$('.dash-tabs button').forEach(b => b.addEventListener('click', () => { $$('.dash-tabs button').forEach(x => x.classList.toggle('active', x === b)); setRange(+b.dataset.range); }));
  let dashTimer;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      if (!series) setRange(7);
      clearInterval(dashTimer);
      dashTimer = setInterval(() => { renderVendors(1.5); alertIdx++; renderAlerts(); }, 3500);
    } else clearInterval(dashTimer);
  }, { threshold: .2 }).observe($('.dash'));
  addEventListener('resize', () => series && drawChart());

  /* ---------- Carousel ---------- */
  const car = $('#carousel'), track = $('.car-track', car), cards = $$('.case', track);
  let ci = 0;
  const maxIdx = () => { const step = cards[0].offsetWidth + 24; const vis = Math.max(1, Math.floor((car.offsetWidth) / step)); return Math.max(0, cards.length - vis); };
  const goCar = i => { ci = Math.max(0, Math.min(maxIdx(), i)); track.style.transform = `translateX(${-ci * (cards[0].offsetWidth + 24)}px)`; };
  $('#car-next').addEventListener('click', () => goCar(ci >= maxIdx() ? 0 : ci + 1));
  $('#car-prev').addEventListener('click', () => goCar(ci <= 0 ? maxIdx() : ci - 1));
  let sx = null, dx = 0;
  car.addEventListener('pointerdown', e => { sx = e.clientX; dx = 0; car.classList.add('drag'); });
  addEventListener('pointermove', e => { if (sx !== null) dx = e.clientX - sx; });
  addEventListener('pointerup', () => { if (sx === null) return; if (Math.abs(dx) > 50) goCar(ci + (dx < 0 ? 1 : -1)); sx = null; car.classList.remove('drag'); });
  addEventListener('resize', () => goCar(ci));

  /* ---------- Contact form ---------- */
  const form = $('#contact-form'), toast = $('#toast');
  const sel = $('#f-interest'); sel.addEventListener('change', () => sel.classList.toggle('filled', !!sel.value));
  const showToast = msg => { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 4500); };
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    ['f-name', 'f-company', 'f-email', 'f-interest'].forEach(id => {
      const el = $('#' + id), bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
      el.parentElement.classList.toggle('err', bad); if (bad) ok = false;
    });
    const lg = $('#f-lgpd'); lg.parentElement.classList.toggle('err', !lg.checked); if (!lg.checked) ok = false;
    if (!ok) { showToast('Preencha os campos obrigatórios destacados.'); return; }
    const name = $('#f-name').value.trim().split(' ')[0];
    form.reset(); sel.classList.remove('filled');
    showToast(`Obrigado, ${name}! Em um site real, um especialista entraria em contato em até 1 dia útil.`);
  });

  /* ---------- Init ---------- */
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
