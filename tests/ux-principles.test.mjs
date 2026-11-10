import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const main = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/refined.css', import.meta.url), 'utf8');

assert.ok(main.includes('let visibleStageCount = 8'), 'A lista deve usar divulgação progressiva.');
assert.ok(main.includes('data-show-more'), 'A pessoa deve poder revelar mais etapas.');
assert.ok(main.includes('data-next-stage'), 'O próximo passo deve estar acessível.');
assert.ok(main.includes('role="status" aria-live="polite"'), 'O feedback deve ser anunciado por leitores de tela.');
assert.ok(main.includes('Jornada concluída!'), 'A conclusão deve receber feedback memorável.');
assert.match(styles, /\.stage-actions button\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/s, 'Ações principais devem ter alvo mínimo de 44px.');
assert.match(styles, /\.filter\s*\{[^}]*min-height:\s*44px;/s, 'Filtros devem ter alvo mínimo de 44px.');

console.log('Testes dos princípios de UX passaram.');
