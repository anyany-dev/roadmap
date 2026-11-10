const { stages, projects } = window;

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (window.location.hash) history.replaceState(null, '', window.location.href.split('#')[0]);
window.addEventListener('load', () => requestAnimationFrame(() => window.scrollTo(0, 0)));

const isArray = value => Array.isArray(value);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isString = value => typeof value === 'string';
const isStringArray = value => Array.isArray(value) && value.every(isString);
const isStage = value => isObject(value)
  && Number.isSafeInteger(value.id) && value.id > 0
  && ['phase', 'title', 'eyebrow', 'duration', 'level', 'description', 'deliverable', 'checkpoint'].every(key => isString(value[key]))
  && isStringArray(value.skills)
  && (value.iconName === undefined || isString(value.iconName));
const isProject = value => isObject(value)
  && ['number', 'title', 'focus', 'level', 'description'].every(key => isString(value[key]))
  && (value.link === undefined || isString(value.link));
const isToolGroup = value => isObject(value) && Number.isSafeInteger(value.id)
  && isString(value.title) && isString(value.icon) && isStringArray(value.items);
const isSchedulePhase = value => isObject(value) && Number.isSafeInteger(value.id)
  && isString(value.period) && isString(value.title) && isStringArray(value.topics) && isString(value.delivery);

const readStorage = (key, fallback, isValid) => {
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) return fallback;

    const parsedValue = JSON.parse(storedValue);
    if (!isValid(parsedValue)) throw new TypeError('Formato inesperado');
    return parsedValue;
  } catch (error) {
    console.warn(`[AnyRoadmap] Não foi possível carregar "${key}". Os dados padrão serão usados.`, error);
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[AnyRoadmap] Não foi possível salvar "${key}".`, error);
    return false;
  }
};

const storageKey = 'datapath-progress-v1';
const completed = new Set(readStorage(storageKey, [], value => isArray(value) && value.every(Number.isSafeInteger)));
const toolStorageKey = 'datapath-tools-v1';
const knownTools = new Set(readStorage(toolStorageKey, [], isStringArray));
const skillsStorageKey = 'datapath-custom-skills-v1';
const customSkills = readStorage(skillsStorageKey, {}, value => isObject(value) && Object.values(value).every(isStringArray));
stages.forEach(stage => {
  if (Array.isArray(customSkills[stage.id])) stage.skills = customSkills[stage.id];
});
const stagesStorageKey = 'anyroadmap-stages-v2';
const savedStages = readStorage(stagesStorageKey, {}, value => isObject(value) && Object.values(value).every(isStage));
stages.forEach(stage => { if (savedStages[stage.id]) Object.assign(stage, savedStages[stage.id]); });
Object.values(savedStages).forEach(saved => { if (!stages.some(stage => stage.id === saved.id)) stages.push(saved); });
stages.sort((a, b) => a.id - b.id);
const projectsStorageKey = 'anyroadmap-projects-v1';
const projectItems = readStorage(projectsStorageKey, projects, value => isArray(value) && value.every(isProject));
const toolGroupsStorageKey = 'anyroadmap-tool-groups-v1';
const defaultToolGroups = [
  { id: 1, title: 'Linguagens', icon: 'code', items: ['SQL', 'Python', 'R (opcional)'] },
  { id: 2, title: 'Planilhas & preparação', icon: 'sheet', items: ['Excel', 'Power Query', 'Pandas', 'NumPy'] },
  { id: 3, title: 'Bancos de dados', icon: 'database', items: ['PostgreSQL', 'SQL Server', 'DBeaver'] },
  { id: 4, title: 'Visualização & BI', icon: 'chart', items: ['Power BI', 'DAX', 'Tableau', 'Plotly', 'Matplotlib'] },
  { id: 5, title: 'Desenvolvimento & notebooks', icon: 'notebook', items: ['VS Code', 'Jupyter Notebook', 'Google Colab', 'Git', 'GitHub'] },
  { id: 6, title: 'Estatística & negócio', icon: 'statistics', items: ['Estatística descritiva', 'Probabilidade', 'Testes de hipóteses', 'KPIs', 'Análise exploratória'] },
  { id: 7, title: 'Qualidade & governança', icon: 'quality', items: ['Validação de dados', 'Data profiling', 'LGPD', 'dbt', 'Testes de qualidade'] },
  { id: 8, title: 'Cloud & automação', icon: 'cloud', items: ['Databricks', 'AWS / Azure / Google Cloud', 'Apache Airflow', 'Docker'] }
];
const toolGroups = readStorage(toolGroupsStorageKey, defaultToolGroups, value => isArray(value) && value.every(isToolGroup));

const iconDrawings = {
  code: '<path d="M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  notebook: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M12 8h4M12 12h4M12 16h3"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z"/><path d="M9 14h6"/>',
  orchestration: '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="m7 7 4 9m6-9-4 9M7 6h10"/>',
  mlops: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/><circle cx="12" cy="12" r="2"/>',
  chart: '<path d="M4 20V5M4 20h17"/><path d="m7 16 4-5 3 2 5-7"/><circle cx="7" cy="16" r="1"/><circle cx="19" cy="6" r="1"/>',
  quality: '<path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  observe: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v2M12 19v2"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5Z"/>',
  sheet: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 4v16M14 9v11"/>',
  clean: '<path d="m5 17 8-8 4 4-8 8H5Z"/><path d="m13 9 2-4 4 4-2 4M11 19h9"/>',
  explore: '<circle cx="10" cy="10" r="6"/><path d="m14.5 14.5 5 5M7 11l2-2 2 2 3-4"/>',
  pipeline: '<rect x="3" y="4" width="6" height="5" rx="1"/><rect x="15" y="15" width="6" height="5" rx="1"/><path d="M9 6.5h4a4 4 0 0 1 4 4V15M7 9v4a4 4 0 0 0 4 4h4"/>',
  formula: '<path d="M5 6h6M8 6l-3 12M4 12h6M14 8l6 8M20 8l-6 8"/>',
  story: '<path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="m4 7 6-4 6 6 6-8"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
  dashboard: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12M13 14h5M13 17h3"/>',
  automation: '<path d="M7 7a7 7 0 0 1 11 2l2-1v6h-6l2-2a4 4 0 0 0-7-3M17 17a7 7 0 0 1-11-2l-2 1v-6h6l-2 2a4 4 0 0 0 7 3"/>',
  portfolio: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M9 6V4h6v2M3 11h18M10 11v2h4v-2"/>',
  statistics: '<path d="M4 18h16M6 15l4-5 3 2 5-7"/><circle cx="6" cy="15" r="1"/><circle cx="10" cy="10" r="1"/><circle cx="13" cy="12" r="1"/><circle cx="18" cy="5" r="1"/>',
  git: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 6h8M6 8c0 5 6 3 6 8M18 8c0 5-6 3-6 8"/>',
  api: '<path d="M8 8 4 12l4 4M16 8l4 4-4 4M10 19l4-14"/><circle cx="4" cy="12" r="1"/><circle cx="20" cy="12" r="1"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  clouddata: '<path d="M7 17h10a4 4 0 0 0 0-8h-.5A5.5 5.5 0 0 0 6 8a4.5 4.5 0 0 0 1 9Z"/><path d="M9 13h6M10 16h4"/>',
  monitor: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="m6 13 3-3 3 2 4-5 2 2M9 21h6M12 18v3"/>',
  governance: '<path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7Z"/><path d="M9 12h6M12 9v6"/>',
  brain: '<path d="M9 5a3 3 0 0 0-5 2.2A3 3 0 0 0 3 12a3 3 0 0 0 2 5.7A3 3 0 0 0 10 20V4a3 3 0 0 0-1 1ZM15 5a3 3 0 0 1 5 2.2A3 3 0 0 1 21 12a3 3 0 0 1-2 5.7A3 3 0 0 1 14 20V4a3 3 0 0 1 1 1Z"/><path d="M7 9h3M14 9h3M7 15h3M14 15h3"/>',
  catalog: '<path d="M5 4h14v16H5zM9 4v16M12 8h4M12 12h4M12 16h3"/>'
};

const stageIconNames = ['compass', 'sheet', 'clean', 'explore', 'pipeline', 'formula', 'story', 'database', 'dashboard', 'automation', 'statistics', 'git', 'api', 'layers', 'clouddata', 'orchestration', 'monitor', 'governance', 'brain', 'portfolio'];
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${iconDrawings[name] || iconDrawings.portfolio}</svg>`;
const iconLabels = {
  code: 'Código', notebook: 'Notebook', cloud: 'Nuvem', orchestration: 'Orquestração',
  mlops: 'MLOps', chart: 'Gráfico', quality: 'Qualidade', observe: 'Observabilidade',
  compass: 'Bússola', sheet: 'Planilha', clean: 'Limpeza', explore: 'Exploração',
  pipeline: 'Pipeline', formula: 'Fórmula', story: 'Storytelling', database: 'Banco de dados',
  dashboard: 'Dashboard', automation: 'Automação', portfolio: 'Portfólio', statistics: 'Estatística',
  git: 'Git', api: 'API', layers: 'Camadas', clouddata: 'Dados na nuvem', monitor: 'Monitoramento',
  governance: 'Governança', brain: 'Inteligência', catalog: 'Catálogo'
};

const scheduleStorageKey = 'anyroadmap-schedule-v2';
const defaultStudyPlan = [
  { id: 1, period: '2', title: 'Fundamentos', topics: ['Mentalidade analítica', 'Excel e organização', 'SQL básico', 'KPIs e Git'], delivery: 'Análise comercial com Excel e SQL' },
  { id: 2, period: '4', title: 'Exploração & qualidade', topics: ['SQL intermediário', 'Limpeza e validação', 'Estatística descritiva', 'Análise exploratória'], delivery: 'Auditoria comercial documentada' },
  { id: 3, period: '6', title: 'Preparação & BI', topics: ['Power Query', 'Power BI básico', 'Modelagem dimensional', 'Relacionamentos'], delivery: 'Dashboard com atualização de dados' },
  { id: 4, period: '9', title: 'BI & comunicação', topics: ['DAX e medidas', 'Indicadores analíticos', 'Storytelling', 'Dashboards executivos'], delivery: 'Produto analítico em Power BI' },
  { id: 5, period: '12', title: 'Python & automação', topics: ['Python e Pandas', 'APIs e integração', 'Estatística aplicada', 'Automação de análises'], delivery: 'Análise automatizada com Python e SQL' },
  { id: 6, period: '15', title: 'Qualidade & arquitetura', topics: ['Qualidade e governança', 'Cloud para dados', 'Analytics Engineering', 'Pipelines analíticos'], delivery: 'Pipeline analítico documentado e validado' },
  { id: 7, period: '18', title: 'Especialização & carreira', topics: ['Aprofundamento técnico', 'Projeto final', 'Portfólio profissional', 'Preparação para entrevistas'], delivery: 'Portfólio com estudos de caso completos' }
];
const studyPlan = readStorage(scheduleStorageKey, defaultStudyPlan, value => isArray(value) && value.every(isSchedulePhase));

const app = document.querySelector('#app');
app.innerHTML = `
  <header class="nav-shell">
    <nav class="nav container" aria-label="Navegação principal">
      <a class="brand" href="#top" aria-label="AnyRoadmap — início"><span class="brand-mark"><img src="./public/assets/an-bunny.png" width="1254" height="1254" alt=""></span><span>Any<span>Roadmap</span></span></a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation"><span></span><span></span><span></span><span class="sr-only">Abrir menu</span></button>
      <div class="nav-links" id="primary-navigation">
        <a href="#metodo">Métodos</a><a href="#roadmap">Roadmap</a><a href="#projetos">Projetos</a><a href="#cronograma">Cronograma</a>
      </div>
    </nav>
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-art" aria-hidden="true"></div>
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="container hero-content reveal">
        <h1><span>Transforme dados</span><span>em direção.</span></h1>
        <p>Uma trilha prática e progressiva para sair do zero, desenvolver repertório analítico e construir projetos que demonstram como você pensa.</p>
        <div class="hero-actions">
          <a class="button" href="#metodo">Explorar métodos <span>↓</span></a>
        </div>
        <div class="hero-stats">
          <div><strong id="stage-count-stat">21</strong><span>etapas conectadas</span></div>
          <div><strong id="tool-count-stat">34</strong><span>ferramentas-chave</span></div>
          <div><strong>4</strong><span>projetos guiados</span></div>
          <div><strong>18</strong><span>meses de cronograma</span></div>
        </div>
      </div>
    </section>

    <section class="section intro" id="metodo">
      <div class="container split-heading reveal">
        <div><span class="section-kicker">01 / Métodos</span><h2>Seu ecossistema<br /><em>de ferramentas</em></h2></div>
        <div class="intro-copy"><p>Conheça as tecnologias por função, entenda como elas se conectam e escolha a ferramenta certa para cada problema.</p><p>Você não precisa dominar tudo de uma vez.<br />A trilha organiza o que aprender, quando praticar e como transformar conhecimento em entregas reais.</p></div>
      </div>
      <div class="container tool-ecosystem reveal" id="tool-ecosystem"></div>
      <div class="container progress-track tool-progress reveal">
        <div class="progress-summary"><div><strong>Progresso das ferramentas</strong><span id="tool-progress-value">0 / 34</span></div></div>
        <div class="tool-progress-bar"><i></i></div>
      </div>
    </section>

    <section class="section roadmap-section" id="roadmap">
      <div class="container">
        <div class="roadmap-intro reveal">
          <span class="section-kicker">02 / Roadmap</span>
          <div class="roadmap-heading"><h2>Do primeiro insight<br /><em>ao seu portfólio</em></h2><p>Marque seu progresso e filtre por nível.<br />Abra cada etapa para consultar e editar<br />o seu plano de prática.</p></div>
          <section class="journey-summary" aria-labelledby="journey-title">
            <div class="journey-progress" aria-hidden="true"><i id="journey-progress-bar"></i></div>
            <div><span class="section-kicker" id="journey-title">Seu foco agora</span><strong id="journey-message">Comece pela primeira etapa</strong><small id="journey-progress-text">0 de 20 etapas concluídas</small></div>
            <button class="button journey-action" type="button" id="next-stage-button" data-next-stage>Ver próxima etapa <span aria-hidden="true">→</span></button>
          </section>
          <div class="progress-track level-progress-track" aria-label="Progresso por nível"><div class="level-progress-grid" id="level-progress-grid"></div></div>
        </div>
        <div class="toolbar reveal">
          <div class="toolbar-primary"><label class="search"><span aria-hidden="true">⌕</span><span class="sr-only">Buscar competência ou etapa</span><input id="search" type="search" autocomplete="off" placeholder="Buscar competência ou etapa..." /></label><button class="add-stage-button" data-add-stage aria-label="Adicionar nova etapa">＋</button></div>
          <div class="filters" role="group" aria-label="Filtrar por nível">
            <button class="filter active" data-filter="Todos">Todos</button><button class="filter" data-filter="Essencial">Essencial</button><button class="filter" data-filter="Iniciante">Iniciante</button><button class="filter" data-filter="Intermediário">Intermediário</button><button class="filter" data-filter="Avançado">Avançado</button>
          </div>
        </div>
        <div class="roadmap-list" id="roadmap-list"></div>
        <p class="empty-state" hidden>Nenhuma etapa encontrada. Tente outro termo.</p>
        <button class="show-more-button" type="button" data-show-more hidden>Mostrar mais etapas</button>
      </div>
    </section>

    <section class="section projects-section" id="projetos">
      <div class="container reveal">
        <span class="section-kicker">03 / Projetos</span>
        <div class="projects-heading"><h2>Projetos que viram<br /><em>evidências</em></h2><p><span class="no-wrap">Projetos progressivos para praticar o ciclo completo.</span><br />Do problema e dos dados até a recomendação<br />e a apresentação final.</p></div>
        <div class="project-grid" id="project-grid"></div>
      </div>
    </section>

    <section class="section schedule-section" id="cronograma">
      <div class="container reveal">
        <span class="section-kicker">04 / Cronograma</span>
        <div class="schedule-heading"><h2>Evolução em<br /><em>18 meses</em></h2><p><span class="no-wrap">Estude em uma sequência realista,</span><br /><span class="no-wrap">sem atropelar os fundamentos.</span><br /><span class="no-wrap">Cada período termina em uma entrega</span><br /><span class="no-wrap">que transforma aprendizado em portfólio.</span></p></div>
        <div class="schedule-grid" id="schedule-grid"></div>
      </div>
    </section>

    <section class="cta-section">
      <div class="cta-art" aria-hidden="true"></div>
      <div class="container reveal"><span class="section-kicker">Seu próximo passo</span><h2>Não espere estar pronto.<br /><em>Comece preparado.</em></h2><a class="button" href="#roadmap">Iniciar minha jornada <span>↗</span></a></div>
    </section>
  </main>

  <footer>
    <div class="container footer-inner">
      <div class="footer-brand"><a class="brand" href="#top"><span class="brand-mark"><img src="./public/assets/an-bunny.png" width="1254" height="1254" loading="lazy" alt=""></span><span>Any<span>Roadmap</span></span></a><p>Uma jornada delicada, prática e orientada por dados.</p></div>
      <nav class="footer-nav" aria-label="Navegação do rodapé"><a href="#metodo">Métodos</a><a href="#roadmap">Roadmap</a><a href="#projetos">Projetos</a><a href="#cronograma">Cronograma</a><a href="https://github.com/anyany-dev" target="_blank" rel="noopener noreferrer" aria-label="Perfil de Ariany no GitHub, abre em uma nova aba">GitHub <span aria-hidden="true">↗</span></a></nav>
    </div>
    <div class="container footer-bottom"><a class="back-top" href="#top"><span>↑</span> Voltar para o topo <span>↑</span></a><small>© 2026 · Ariany</small></div>
  </footer>

  <dialog id="stage-dialog"><button class="modal-close" aria-label="Fechar">×</button><div id="modal-content"></div></dialog>
  <div class="toast" role="status" aria-live="polite" aria-atomic="true" hidden></div>
`;

const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const iconOptions = Object.keys(iconDrawings).map(name => `<option value="${name}">${name}</option>`).join('');
const projectHref = value => {
  const input = String(value || '').trim();
  if (!input) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
};

function renderToolGroups() {
  document.querySelector('#tool-ecosystem').innerHTML = toolGroups.map((group, index) => `<article><div class="tool-heading"><div class="principle-icon">${icon(group.icon)}</div><button class="editable-title" data-open-tool="${group.id}">${esc(group.title)}</button><span>${String(index + 1).padStart(2, '0')}</span></div><div class="tool-checks">${group.items.map(tool => `<label><input type="checkbox" data-tool="${esc(tool)}"><i></i><span>${esc(tool)}</span></label>`).join('')}</div></article>`).join('');
  updateToolProgress();
}

function renderProjects() {
  document.querySelector('#project-grid').innerHTML = projectItems.map((project, index) => {
    const href = projectHref(project.link);
    const projectArrow = href
      ? `<a class="project-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir projeto ${esc(project.title)}">↗</a>`
      : `<span class="project-link is-disabled" aria-label="Adicione um link para este projeto">↗</span>`;
    return `<article class="project-card"><span>${esc(project.number || String(index + 1).padStart(2, '0'))}</span><div><small>${esc(project.level)} · ${esc(project.focus)}</small><button class="editable-title project-title" data-open-project="${index}">${esc(project.title)}</button><p>${esc(project.description)}</p></div>${projectArrow}</article>`;
  }).join('');
}

function renderSchedule() {
  document.querySelector('#schedule-grid').innerHTML = studyPlan.map((phase, index) => `<article class="schedule-card"><div class="schedule-period"><strong>${esc(phase.period)}</strong><span>meses</span></div><span class="schedule-index">0${index + 1}</span><button class="editable-title schedule-title" data-open-schedule="${phase.id}">${esc(phase.title)}</button><ul>${phase.topics.map(topic => `<li><i>✓</i>${esc(topic)}</li>`).join('')}</ul><div class="schedule-delivery"><small>Entrega</small><strong>${esc(phase.delivery)}</strong></div></article>`).join('');
}

function field(label, name, value, type = 'input') {
  const control = type === 'textarea'
    ? `<textarea data-field="${name}" rows="3">${esc(value)}</textarea>`
    : `<input type="${name === 'link' ? 'url' : 'text'}" data-field="${name}" value="${esc(value)}" ${name === 'link' ? 'placeholder="https://github.com/seu-projeto"' : ''}>`;
  return `<label class="edit-field"><span>${label}</span>${control}</label>`;
}

function selectField(label, name, value, options) {
  return `<label class="edit-field"><span>${label}</span><select data-field="${name}">${options.map(option => `<option value="${esc(option)}" ${option === value ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select></label>`;
}

function iconSelectField(label, name, value, options) {
  const optionMarkup = options.map(option => `<button type="button" class="icon-option ${option === value ? 'is-selected' : ''}" data-icon-option="${esc(option)}" role="option" aria-selected="${option === value}">${icon(option)}<span>${esc(iconLabels[option] || option)}</span></button>`).join('');
  return `<div class="edit-field icon-field">
    <span>${label}</span>
    <div class="icon-select" data-icon-select>
      <button type="button" class="icon-select-trigger" data-icon-trigger aria-haspopup="listbox" aria-expanded="false">${icon(value)}<span>${esc(iconLabels[value] || value)}</span><i>⌄</i></button>
      <div class="icon-options" role="listbox" hidden>${optionMarkup}</div>
      <input type="hidden" data-field="${name}" value="${esc(value)}">
    </div>
  </div>`;
}

function tagField(label, name, items, placeholder) {
  return `<div class="edit-field tag-field">
    <span>${label}</span>
    <div class="tag-editor" data-tag-editor>
      <div class="tag-list">${items.map(item => `<span class="editor-tag">${esc(item)}<button type="button" data-remove-tag aria-label="Remover ${esc(item)}">×</button></span>`).join('')}</div>
      <input class="tag-entry" type="text" placeholder="${placeholder}" aria-label="Adicionar ${label.toLowerCase()}">
      <input type="hidden" data-field="${name}" value="${esc(items.join('\n'))}">
    </div>
    <small class="tag-hint">Digite um item e pressione Enter</small>
  </div>`;
}

function syncTagField(editor) {
  editor.querySelector('[data-field]').value = [...editor.querySelectorAll('.editor-tag')]
    .map(tag => tag.firstChild.textContent.trim()).join('\n');
}

function growTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function showEditor(type, id, title, content) {
  const dialog = document.querySelector('#stage-dialog');
  const kicker = type === 'tool' ? 'Personalize seu quadro' : 'Personalize este conteúdo';
  document.querySelector('#modal-content').innerHTML = `<span class="modal-kicker">${kicker}</span><h2 data-editor-title>${esc(title)}</h2><div class="editor-grid">${content}</div><button class="button editor-save" data-save-type="${type}" data-save-id="${id}">Salvar alterações</button>`;
  if (!dialog.open) dialog.showModal();
  dialog.querySelectorAll('textarea').forEach(growTextarea);
}

let activeFilter = 'Todos';
let visibleStageCount = 8;
let toastTimer;

function showToast(message) {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

function renderStages() {
  const query = document.querySelector('#search').value.trim().toLowerCase();
  const filtered = stages.filter(stage => {
    const matchesFilter = activeFilter === 'Todos' || stage.level === activeFilter;
    const haystack = [stage.title, stage.phase, stage.description, ...stage.skills].join(' ').toLowerCase();
    return matchesFilter && haystack.includes(query);
  });
  const visibleStages = filtered.slice(0, visibleStageCount);
  document.querySelector('#roadmap-list').innerHTML = visibleStages.map(stage => `
    <article class="stage-card scroll-reveal ${completed.has(stage.id) ? 'is-complete' : ''}" data-id="${Number(stage.id)}">
      <div class="stage-number">${Number(stage.id)}</div>
      <div class="stage-icon">${icon(stage.iconName || stageIconNames[stage.id - 1] || 'portfolio')}</div>
      <div class="stage-main"><div class="stage-meta"><span>${esc(stage.phase)}</span><span>${esc(stage.duration)}</span><span>${esc(stage.level)}</span></div><h3>${esc(stage.title)}</h3><p>${esc(stage.description)}</p><div class="skill-list">${stage.skills.map(skill => `<span>${esc(skill)}</span>`).join('')}</div></div>
      <div class="stage-actions"><button class="complete-button" data-complete="${Number(stage.id)}" aria-label="${completed.has(stage.id) ? 'Marcar como não concluída' : 'Marcar como concluída'}">${completed.has(stage.id) ? '✓' : ''}</button><button class="open-button" data-open="${Number(stage.id)}" aria-label="Abrir detalhes de ${esc(stage.title)}">↗</button></div>
    </article>`).join('');
  document.querySelector('.empty-state').hidden = filtered.length > 0;
  const showMore = document.querySelector('[data-show-more]');
  showMore.hidden = visibleStages.length >= filtered.length;
  showMore.textContent = `Mostrar mais etapas (${filtered.length - visibleStages.length})`;
  updateProgress();
  document.querySelectorAll('.scroll-reveal').forEach(element => observer.observe(element));
}

function updateProgress() {
  const levels = ['Essencial', 'Iniciante', 'Intermediário', 'Avançado'];
  document.querySelector('#level-progress-grid').innerHTML = levels.map(level => {
    const levelStages = stages.filter(stage => stage.level === level);
    const done = levelStages.filter(stage => completed.has(stage.id)).length;
    const percent = levelStages.length ? Math.round((done / levelStages.length) * 100) : 0;
    return `<section class="level-progress"><header><strong>${level}</strong><span>${percent}%</span></header><div class="level-progress-line">${levelStages.map(stage => `<button class="level-progress-point ${completed.has(stage.id) ? 'is-complete' : ''}" data-step="${stage.id}" aria-label="Ir para ${esc(stage.title)}"><i></i><small>${String(stage.id).padStart(2, '0')}</small></button>`).join('')}</div></section>`;
  }).join('');
  document.querySelector('#stage-count-stat').textContent = stages.length;
  const done = stages.filter(stage => completed.has(stage.id)).length;
  const percent = stages.length ? Math.round((done / stages.length) * 100) : 0;
  const nextStage = stages.find(stage => !completed.has(stage.id));
  document.querySelector('#journey-progress-bar').style.width = `${percent}%`;
  document.querySelector('#journey-progress-text').textContent = `${done} de ${stages.length} etapas concluídas · ${percent}%`;
  document.querySelector('#journey-message').textContent = nextStage
    ? `Próxima: ${nextStage.title}`
    : 'Jornada concluída — celebre essa conquista!';
  const nextButton = document.querySelector('#next-stage-button');
  nextButton.hidden = !nextStage;
  nextButton.dataset.nextStage = nextStage?.id || '';
  writeStorage(storageKey, [...completed]);
}

function updateToolProgress() {
  const checkboxes = [...document.querySelectorAll('[data-tool]')];
  const available = new Set(checkboxes.map(checkbox => checkbox.dataset.tool));
  [...knownTools].forEach(tool => { if (!available.has(tool)) knownTools.delete(tool); });
  checkboxes.forEach(checkbox => { checkbox.checked = knownTools.has(checkbox.dataset.tool); });
  const percent = checkboxes.length ? Math.round((knownTools.size / checkboxes.length) * 100) : 0;
  document.querySelector('#tool-progress-value').textContent = `${knownTools.size} / ${checkboxes.length}`;
  document.querySelector('#tool-count-stat').textContent = checkboxes.length;
  document.querySelector('.tool-progress-bar i').style.width = `${percent}%`;
  writeStorage(toolStorageKey, [...knownTools]);
}

function openStage(id) {
  const stage = stages.find(item => item.id === id);
  showEditor('stage', id, stage.title, [
    field('Título', 'title', stage.title),
    field('Categoria', 'phase', stage.phase),
    field('Projeto sugerido', 'eyebrow', stage.eyebrow),
    field('Duração', 'duration', stage.duration),
    selectField('Nível', 'level', stage.level, ['Essencial', 'Iniciante', 'Intermediário', 'Avançado']),
    iconSelectField('Ícone', 'iconName', stage.iconName || stageIconNames[id - 1], Object.keys(iconDrawings)),
    field('Descrição', 'description', stage.description, 'textarea'),
    tagField('Competências', 'skills', stage.skills, 'Adicionar competência'),
    field('Entrega da etapa', 'deliverable', stage.deliverable, 'textarea'),
    field('Critério para avançar', 'checkpoint', stage.checkpoint, 'textarea')
  ].join(''));
}

function openTool(id) {
  const group = toolGroups.find(item => item.id === id);
  showEditor('tool', id, group.title, [
    field('Título', 'title', group.title),
    iconSelectField('Ícone', 'icon', group.icon, Object.keys(iconDrawings)),
    tagField('Ferramentas', 'items', group.items, 'Adicionar ferramenta')
  ].join(''));
}

function openProject(index) {
  const project = projectItems[index];
  showEditor('project', index, project.title, [
    field('Número', 'number', project.number),
    field('Título', 'title', project.title),
    field('Subtítulo / foco', 'focus', project.focus),
    selectField('Classificação', 'level', project.level, ['Essencial', 'Iniciante', 'Intermediário', 'Avançado']),
    field('Descrição', 'description', project.description, 'textarea'),
    field('Link do projeto', 'link', project.link || '')
  ].join(''));
}

function openSchedule(id) {
  const phase = studyPlan.find(item => item.id === id);
  showEditor('schedule', id, phase.title, [
    field('Prazo final em meses', 'period', phase.period),
    field('Título', 'title', phase.title),
    tagField('Conteúdos', 'topics', phase.topics, 'Adicionar conteúdo'),
    field('Entrega', 'delivery', phase.delivery, 'textarea')
  ].join(''));
}

function readEditorFields() {
  return Object.fromEntries([...document.querySelectorAll('#modal-content [data-field]')].map(input => [input.dataset.field, input.value.trim()]));
}

document.addEventListener('click', event => {
  const navToggle = event.target.closest('.nav-toggle');
  if (navToggle) {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navToggle.querySelector('.sr-only').textContent = expanded ? 'Abrir menu' : 'Fechar menu';
    document.querySelector('#primary-navigation').classList.toggle('is-open', !expanded);
  }
  if (event.target.closest('#primary-navigation a')) {
    const menuButton = document.querySelector('.nav-toggle');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('.sr-only').textContent = 'Abrir menu';
    document.querySelector('#primary-navigation').classList.remove('is-open');
  }
  const completeButton = event.target.closest('[data-complete], [data-modal-complete]');
  if (completeButton) {
    const id = Number(completeButton.dataset.complete || completeButton.dataset.modalComplete);
    const wasComplete = completed.has(id);
    wasComplete ? completed.delete(id) : completed.add(id);
    renderStages();
    const allComplete = stages.every(stage => completed.has(stage.id));
    showToast(wasComplete
      ? 'Etapa marcada como pendente.'
      : allComplete ? 'Jornada concluída! Seu roadmap está completo.' : 'Etapa concluída. Bom progresso!');
    if (completeButton.dataset.modalComplete) openStage(id);
  }
  const nextStageButton = event.target.closest('[data-next-stage]');
  if (nextStageButton?.dataset.nextStage) {
    const id = Number(nextStageButton.dataset.nextStage);
    activeFilter = 'Todos';
    document.querySelector('#search').value = '';
    document.querySelectorAll('.filter').forEach(button => button.classList.toggle('active', button.dataset.filter === 'Todos'));
    visibleStageCount = Math.max(visibleStageCount, stages.findIndex(stage => stage.id === id) + 1);
    renderStages();
    document.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  if (event.target.closest('[data-show-more]')) {
    visibleStageCount += 8;
    renderStages();
  }
  const openButton = event.target.closest('[data-open]');
  if (openButton) openStage(Number(openButton.dataset.open));
  const addStageButton = event.target.closest('[data-add-stage]');
  if (addStageButton) {
    const id = Math.max(0, ...stages.map(stage => stage.id)) + 1;
    const newStage = {
      id,
      phase: 'Nova etapa',
      title: 'Novo conteúdo',
      eyebrow: 'Defina um projeto sugerido',
      duration: '2 semanas',
      level: 'Iniciante',
      iconName: 'compass',
      description: 'Descreva o objetivo desta nova etapa.',
      skills: ['Nova competência'],
      deliverable: 'Defina a entrega esperada.',
      checkpoint: 'Defina o critério para avançar.'
    };
    stages.push(newStage);
    savedStages[id] = newStage;
    writeStorage(stagesStorageKey, savedStages);
    renderStages();
    openStage(id);
  }
  const toolTitle = event.target.closest('[data-open-tool]');
  if (toolTitle) openTool(Number(toolTitle.dataset.openTool));
  const projectTitle = event.target.closest('[data-open-project]');
  if (projectTitle) openProject(Number(projectTitle.dataset.openProject));
  const scheduleTitle = event.target.closest('[data-open-schedule]');
  if (scheduleTitle) openSchedule(Number(scheduleTitle.dataset.openSchedule));
  const saveButton = event.target.closest('[data-save-type]');
  if (saveButton) {
    const type = saveButton.dataset.saveType;
    const id = Number(saveButton.dataset.saveId);
    const values = readEditorFields();
    if (!values.title) {
      document.querySelector('#modal-content [data-field="title"]')?.focus();
      showToast('Informe um título antes de salvar.');
      return;
    }
    if (type === 'stage') {
      const stage = stages.find(item => item.id === id);
      Object.assign(stage, values, { skills: values.skills.split('\n').map(item => item.trim()).filter(Boolean) });
      savedStages[id] = stage;
      writeStorage(stagesStorageKey, savedStages);
      renderStages();
    }
    if (type === 'tool') {
      const group = toolGroups.find(item => item.id === id);
      Object.assign(group, values, { items: values.items.split('\n').map(item => item.trim()).filter(Boolean) });
      writeStorage(toolGroupsStorageKey, toolGroups);
      renderToolGroups();
    }
    if (type === 'project') {
      Object.assign(projectItems[id], values);
      writeStorage(projectsStorageKey, projectItems);
      renderProjects();
    }
    if (type === 'schedule') {
      const phase = studyPlan.find(item => item.id === id);
      Object.assign(phase, values, { topics: values.topics.split('\n').map(item => item.trim()).filter(Boolean) });
      writeStorage(scheduleStorageKey, studyPlan);
      renderSchedule();
    }
    showToast('Alterações salvas com sucesso.');
    document.querySelector('#stage-dialog').close();
  }
  if (event.target.closest('.modal-close')) document.querySelector('#stage-dialog').close();
  const progressStep = event.target.closest('[data-step]');
  if (progressStep) {
    const target = document.querySelector(`[data-id="${progressStep.dataset.step}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => target?.classList.add('attention'), 450);
  }
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    activeFilter = filter.dataset.filter;
    visibleStageCount = 8;
    document.querySelectorAll('.filter').forEach(button => button.classList.toggle('active', button === filter));
    renderStages();
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const menuButton = document.querySelector('.nav-toggle');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = 'Abrir menu';
  document.querySelector('#primary-navigation').classList.remove('is-open');
});

document.querySelector('#stage-dialog').addEventListener('click', event => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
document.querySelector('#stage-dialog').addEventListener('keydown', event => {
  const input = event.target.closest('.tag-entry');
  if (!input || event.key !== 'Enter') return;
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  const editor = input.closest('[data-tag-editor]');
  const existing = [...editor.querySelectorAll('.editor-tag')].some(tag => tag.firstChild.textContent.trim().toLowerCase() === value.toLowerCase());
  if (existing) return;
  const tag = document.createElement('span');
  tag.className = 'editor-tag';
  tag.append(document.createTextNode(value));
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.dataset.removeTag = '';
  remove.setAttribute('aria-label', `Remover ${value}`);
  remove.textContent = '×';
  tag.append(remove);
  editor.querySelector('.tag-list').append(tag);
  input.value = '';
  syncTagField(editor);
});
document.querySelector('#stage-dialog').addEventListener('click', event => {
  const remove = event.target.closest('[data-remove-tag]');
  if (remove) {
    const editor = remove.closest('[data-tag-editor]');
    remove.closest('.editor-tag').remove();
    syncTagField(editor);
    return;
  }

  const trigger = event.target.closest('[data-icon-trigger]');
  if (trigger) {
    const select = trigger.closest('[data-icon-select]');
    const options = select.querySelector('.icon-options');
    const willOpen = options.hidden;
    document.querySelectorAll('.icon-options').forEach(list => { list.hidden = true; });
    document.querySelectorAll('[data-icon-trigger]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    options.hidden = !willOpen;
    trigger.setAttribute('aria-expanded', String(willOpen));
    return;
  }

  const option = event.target.closest('[data-icon-option]');
  if (option) {
    const select = option.closest('[data-icon-select]');
    const value = option.dataset.iconOption;
    select.querySelector('[data-field]').value = value;
    select.querySelector('[data-icon-trigger]').innerHTML = `${icon(value)}<span>${esc(iconLabels[value] || value)}</span><i>⌄</i>`;
    select.querySelectorAll('[data-icon-option]').forEach(item => {
      const selected = item === option;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    select.querySelector('.icon-options').hidden = true;
    select.querySelector('[data-icon-trigger]').setAttribute('aria-expanded', 'false');
    return;
  }

  document.querySelectorAll('.icon-options').forEach(list => { list.hidden = true; });
  document.querySelectorAll('[data-icon-trigger]').forEach(button => button.setAttribute('aria-expanded', 'false'));
});
document.querySelector('#stage-dialog').addEventListener('input', event => {
  if (event.target.matches('textarea')) growTextarea(event.target);
  if (event.target.matches('[data-field="title"]')) {
    document.querySelector('[data-editor-title]').textContent = event.target.value.trim() || 'Sem título';
  }
});
document.querySelector('#search').addEventListener('input', () => {
  visibleStageCount = 8;
  renderStages();
});
document.addEventListener('change', event => {
  const checkbox = event.target.closest('[data-tool]');
  if (!checkbox) return;
  checkbox.checked ? knownTools.add(checkbox.dataset.tool) : knownTools.delete(checkbox.dataset.tool);
  updateToolProgress();
});

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  entry.target.classList.toggle('visible', entry.isIntersecting);
}), { threshold: .02, rootMargin: '0px 0px -18% 0px' });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

renderToolGroups();
renderStages();
renderProjects();
renderSchedule();
