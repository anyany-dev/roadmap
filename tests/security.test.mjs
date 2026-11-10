import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

for (const expression of [
  '${esc(stage.phase)}',
  '${esc(stage.duration)}',
  '${esc(stage.level)}',
  '${esc(stage.title)}',
  '${esc(stage.description)}',
  '<span>${esc(skill)}</span>',
  'aria-label="Abrir detalhes de ${esc(stage.title)}"'
]) {
  assert.ok(source.includes(expression), `Renderização segura ausente: ${expression}`);
}

assert.ok(source.includes('Object.values(value).every(isStage)'), 'Etapas persistidas precisam de validação estrutural.');
assert.ok(source.includes('value.every(isProject)'), 'Projetos persistidos precisam de validação estrutural.');
assert.ok(source.includes('value.every(isToolGroup)'), 'Ferramentas persistidas precisam de validação estrutural.');
assert.ok(source.includes('value.every(isSchedulePhase)'), 'Cronograma persistido precisa de validação estrutural.');

console.log('Testes de escape de HTML e validação estrutural passaram.');
