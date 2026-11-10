<div align="center">
  <img src="docs/assets/readme/cover.svg" width="100%" alt="AnyRoadmap — uma jornada em dados conectada por uma trilha neon" />

  <h1>AnyRoadmap</h1>
  <p><strong>Transforme dados em direção.</strong></p>
  <p>Uma experiência interativa para organizar estudos, acompanhar o progresso e construir uma jornada sólida em análise de dados.</p>

  <p>
    <a href="https://anyany-dev.github.io/roadmap/"><img src="docs/assets/readme/link-open-roadmap.svg" alt="Abrir o AnyRoadmap" /></a>
  </p>

  <p>
    <a href="#sobre-o-projeto"><img src="docs/assets/readme/link-about.svg" alt="Sobre" /></a>
    <a href="#recursos"><img src="docs/assets/readme/link-features.svg" alt="Recursos" /></a>
    <a href="#executando-localmente"><img src="docs/assets/readme/link-run.svg" alt="Executar" /></a>
    <a href="#estrutura-do-projeto"><img src="docs/assets/readme/link-structure.svg" alt="Estrutura" /></a>
    <a href="#qualidade-e-seguranca"><img src="docs/assets/readme/link-quality.svg" alt="Qualidade" /></a>
  </p>
</div>

---

<h2 id="sobre-o-projeto"><img src="docs/assets/readme/overview.svg" width="28" alt="" /> Sobre o projeto</h2>

O **AnyRoadmap** transforma uma trilha extensa de aprendizado em uma experiência clara, progressiva e personalizável. O site organiza competências, ferramentas, projetos e um cronograma de 18 meses para ajudar quem está começando — ou reorganizando a carreira — a avançar com intenção.

Mais do que uma lista de conteúdos, o projeto funciona como um pequeno painel pessoal: cada etapa pode ser concluída, pesquisada, filtrada e editada, e todo o progresso permanece salvo no navegador.

### O que orienta a experiência

- **Clareza:** cada etapa apresenta objetivo, duração, nível e competências.
- **Progresso visível:** a interface mostra o avanço geral e o próximo passo recomendado.
- **Personalização:** etapas, ferramentas, projetos e cronograma podem ser adaptados.
- **Aprendizado aplicado:** a jornada termina em entregas e projetos de portfólio.
- **Privacidade:** os dados ficam no próprio navegador, sem conta ou servidor externo.

<h2 id="recursos"><img src="docs/assets/readme/features.svg" width="28" alt="" /> Recursos</h2>

| Área | O que oferece |
|---|---|
| **Roadmap interativo** | 21 etapas conectadas, organizadas por nível e objetivo. |
| **Progresso inteligente** | Percentual geral, progresso por nível e sugestão da próxima etapa. |
| **Ecossistema de ferramentas** | Tecnologias agrupadas por função, com acompanhamento individual. |
| **Busca e filtros** | Localização rápida por etapa, competência ou nível. |
| **Edição local** | Personalização de títulos, descrições, competências, entregas e links. |
| **Projetos guiados** | Cases progressivos que transformam aprendizado em evidência prática. |
| **Cronograma de 18 meses** | Sequência realista, dividida em marcos e entregas. |
| **Persistência automática** | Progresso e alterações armazenados com segurança no `localStorage`. |
| **Experiência responsiva** | Interface adaptada para celular, tablet e desktop. |
| **Página 404 personalizada** | Tratamento visual e semântico para rotas inexistentes. |

<h2 id="decisoes-de-experiencia"><img src="docs/assets/readme/features.svg" width="28" alt="" /> Decisões de experiência</h2>

A interface foi refinada com princípios de UX aplicados ao contexto real do produto:

- divulgação progressiva para reduzir carga cognitiva;
- alvos interativos com tamanho mínimo adequado para toque;
- feedback imediato ao salvar ou concluir uma etapa;
- destaque visual para a próxima ação mais importante;
- agrupamento consistente de conteúdos relacionados;
- redução de movimento conforme a preferência do dispositivo;
- navegação por teclado, foco visível e mensagens anunciadas por leitores de tela.

<h2 id="executando-localmente"><img src="docs/assets/readme/terminal.svg" width="28" alt="" /> Executando localmente</h2>

### Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior.
- Um navegador moderno.

O projeto não utiliza dependências externas de JavaScript. Depois de baixar ou clonar o repositório, entre na pasta do projeto e execute:

```bash
npm run dev
```

Acesse:

```text
http://127.0.0.1:5173
```

### Versão de produção

```bash
npm run build
npm run preview
```

O build é gerado em `dist/` e pode ser servido como um site estático.

<h2 id="comandos-disponiveis"><img src="docs/assets/readme/terminal.svg" width="28" alt="" /> Comandos disponíveis</h2>

| Comando | Finalidade |
|---|---|
| `npm run dev` | Inicia o servidor local usando os arquivos-fonte. |
| `npm run check` | Verifica a sintaxe dos arquivos JavaScript. |
| `npm test` | Executa os testes de armazenamento, segurança e UX. |
| `npm run build` | Gera a versão de produção em `dist/`. |
| `npm run preview` | Serve localmente o conteúdo compilado. |

<h2 id="estrutura-do-projeto"><img src="docs/assets/readme/structure.svg" width="28" alt="" /> Estrutura do projeto</h2>

```text
roadmap/
├── docs/
│   └── assets/readme/       # Capa e ícones da documentação
├── public/
│   └── assets/              # Imagens utilizadas pela aplicação
├── scripts/
│   ├── build.mjs            # Geração do diretório de produção
│   └── server.mjs           # Servidor HTTP local
├── src/
│   ├── 404.css              # Estilos da página não encontrada
│   ├── data.js              # Conteúdo padrão da jornada
│   ├── main.js              # Interface, edição e persistência
│   ├── refined.css          # Refinamentos do design system
│   └── styles.css           # Estrutura visual e responsividade
├── tests/
│   ├── security.test.mjs    # Proteções contra regressão de XSS
│   ├── storage.test.mjs     # Persistência e dados corrompidos
│   └── ux-principles.test.mjs
├── 404.html
├── .gitignore
├── index.html
├── robots.txt
└── site.webmanifest
```

<h2 id="qualidade-e-seguranca"><img src="docs/assets/readme/shield.svg" width="28" alt="" /> Qualidade e segurança</h2>

O projeto inclui proteções e validações voltadas para uso em produção:

- escape de conteúdo editável antes da renderização;
- validação estrutural dos dados recuperados do navegador;
- recuperação segura quando o armazenamento está corrompido;
- restrição de protocolos em links externos;
- `rel="noopener noreferrer"` em links que abrem novas abas;
- Content Security Policy e cabeçalhos HTTP defensivos no servidor local;
- página 404 com resposta HTTP correta;
- testes automatizados contra regressões de segurança e UX.

Execute todas as verificações com:

```bash
npm run check
npm test
npm run build
```

<h2 id="acessibilidade"><img src="docs/assets/readme/shield.svg" width="28" alt="" /> Acessibilidade</h2>

O AnyRoadmap foi estruturado para oferecer:

- link de salto para o conteúdo principal;
- navegação semântica e compatível com teclado;
- indicadores de foco visíveis;
- nomes acessíveis em botões e controles;
- feedback por região `aria-live`;
- áreas de toque adequadas;
- suporte a `prefers-reduced-motion`;
- hierarquia de títulos e landmarks semânticos.

<h2 id="armazenamento"><img src="docs/assets/readme/storage.svg" width="28" alt="" /> Como os dados são armazenados</h2>

Todas as personalizações ficam no `localStorage` do navegador. Nenhuma informação é enviada para APIs ou serviços externos.

Isso significa que:

- o projeto funciona sem cadastro;
- os dados permanecem no dispositivo e navegador utilizados;
- limpar os dados do site no navegador também remove o progresso salvo;
- abrir o projeto em outro dispositivo começa uma nova jornada local.

<h2 id="publicacao"><img src="docs/assets/readme/deploy.svg" width="28" alt="" /> Publicação</h2>

Por ser um site estático, o conteúdo de `dist/` pode ser publicado em serviços como GitHub Pages, Cloudflare Pages, Netlify ou Vercel.

Antes de publicar em um domínio definitivo, recomenda-se:

1. configurar a URL canonical e as URLs absolutas de compartilhamento;
2. gerar o `sitemap.xml` com o domínio final;
3. confirmar os cabeçalhos de segurança na plataforma escolhida;
4. executar Lighthouse na versão publicada;
5. otimizar as imagens para WebP ou AVIF.

<h2 id="autoria"><img src="docs/assets/readme/profile.svg" width="28" alt="" /> Autoria</h2>

Criado por **Ariany**.

<a href="https://github.com/anyany-dev">github.com/anyany-dev</a>

---

<div align="center">
  <strong>AnyRoadmap</strong><br />
  <sub>Uma jornada delicada, prática e orientada por dados.</sub>
</div>
