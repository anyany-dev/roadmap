import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const storageSection = source.slice(0, source.indexOf('const app = document.querySelector'));

const runStorageSection = initialEntries => {
  const entries = new Map(Object.entries(initialEntries));
  const warnings = [];
  const errors = [];
  const stages = [{ id: 1, title: 'Etapa original', skills: [] }];
  const projects = [{ title: 'Projeto original' }];

  const context = {
    window: {
      stages,
      projects,
      location: { hash: '', href: 'http://127.0.0.1:5173/' },
      addEventListener() {}
    },
    history: { scrollRestoration: 'auto', replaceState() {} },
    requestAnimationFrame() {},
    localStorage: {
      getItem: key => entries.has(key) ? entries.get(key) : null,
      setItem: (key, value) => entries.set(key, value)
    },
    console: {
      warn: (...args) => warnings.push(args),
      error: (...args) => errors.push(args)
    }
  };

  const exposeValues = `
    globalThis.testValues = {
      completed: [...completed],
      knownTools: [...knownTools],
      projectItems,
      toolGroups,
      studyPlan,
      writeStorage
    };
  `;

  vm.runInNewContext(storageSection + exposeValues, context);
  return { entries, warnings, errors, values: context.testValues };
};

const valid = runStorageSection({
  'datapath-progress-v1': JSON.stringify([1, 3]),
  'datapath-tools-v1': JSON.stringify(['SQL']),
  'anyroadmap-projects-v1': JSON.stringify([{
    number: '01',
    title: 'Projeto salvo',
    focus: 'Validação',
    level: 'Iniciante',
    description: 'Projeto válido'
  }])
});

assert.deepEqual(Array.from(valid.values.completed), [1, 3]);
assert.deepEqual(Array.from(valid.values.knownTools), ['SQL']);
assert.equal(valid.values.projectItems[0].title, 'Projeto salvo');
assert.equal(valid.values.writeStorage('datapath-progress-v1', [1, 3, 5]), true);
assert.equal(valid.entries.get('datapath-progress-v1'), '[1,3,5]');

const corrupted = runStorageSection({
  'datapath-progress-v1': '{json quebrado',
  'datapath-tools-v1': JSON.stringify({ formato: 'incorreto' }),
  'anyroadmap-projects-v1': JSON.stringify({ formato: 'incorreto' })
});

assert.deepEqual(Array.from(corrupted.values.completed), []);
assert.deepEqual(Array.from(corrupted.values.knownTools), []);
assert.equal(corrupted.values.projectItems[0].title, 'Projeto original');
assert.equal(corrupted.warnings.length, 3);
assert.equal(corrupted.errors.length, 0);

console.log('Testes de persistência e recuperação de dados corrompidos passaram.');
