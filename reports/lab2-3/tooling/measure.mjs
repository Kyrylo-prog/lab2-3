import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parse, tokenizer } from 'acorn';
import { Linter } from 'eslint';

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(out, '../..');
const files = ['server/services/ai/aiCatalogService.js', 'server/services/ai/aiPlannerService.js', 'server/controllers/orderController.js'];
const functionTypes = new Set(['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration']);
const linter = new Linter();

// Lexical convention is intentionally explicit, matching the report's hand tally.
// Parentheses/braces/brackets and ?: count as paired operators. Interpolations
// count as ${}; template text segments are operands, including nonempty spaces.
function halstead(source, excluded = []) {
  const operators = Object.create(null), operands = Object.create(null), ledger = [];
  const inc = (kind, token, line) => {
    const counts = kind === 'operator' ? operators : operands;
    counts[token] = (counts[token] || 0) + 1;
    ledger.push({ line, kind, token });
  };
  const stack = [];
  for (const t of tokenizer(source, { ecmaVersion: 'latest', locations: true })) {
    if (excluded.some(([s, e]) => t.start >= s && t.end <= e)) continue;
    const label = t.type.label, raw = source.slice(t.start, t.end), line = t.loc.start.line;
    if (label === 'eof') continue;
    if (label === '(' || label === '[' || label === '{' || label === '${') {
      stack.push(label);
      inc('operator', { '(': '()', '[': '[]', '{': '{}', '${': '${}' }[label], line);
    } else if (label === ')' || label === ']' || label === '}') {
      const expected = { ')': '(', ']': '[' }[label];
      const opened = stack.pop();
      if (expected ? opened !== expected : opened !== '{' && opened !== '${') throw new Error('Unbalanced token tally');
    } else if (label === '`') {
      if (stack.at(-1) === '`') stack.pop();
      else { stack.push('`'); inc('operator', 'template', line); }
    } else if (label === 'template') {
      if (t.value.length) inc('operand', JSON.stringify(t.value), line);
    } else if (label === '?') {
      stack.push('?'); inc('operator', '?:', line);
    } else if (label === ':' && stack.at(-1) === '?') {
      stack.pop();
    } else if (label === 'string') inc('operand', JSON.stringify(t.value), line);
    else if (['num', 'regexp', 'null', 'true', 'false'].includes(label)) inc('operand', raw, line);
    else if (label === 'name' && !['let', 'of', 'async', 'await', 'yield'].includes(raw)) inc('operand', raw, line);
    else inc('operator', raw, line);
  }
  if (stack.length) throw new Error('Unclosed token tally');
  const n1 = Object.keys(operators).length, n2 = Object.keys(operands).length;
  const N1 = Object.values(operators).reduce((a, b) => a + b, 0);
  const N2 = Object.values(operands).reduce((a, b) => a + b, 0);
  const n = n1 + n2, N = N1 + N2, V = N * Math.log2(n);
  const D = n2 ? n1 / 2 * N2 / n2 : 0;
  return { n1, n2, N1, N2, n, N, V, D, E: V * D, operators, operands, ledger };
}

function analyze(code, file) {
  const ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  const funcs = [];
  function walk(node, parent, owner) {
    if (!node || typeof node !== 'object') return;
    let currentOwner = owner;
    if (functionTypes.has(node.type)) {
      const name = parent?.type === 'VariableDeclarator' ? parent.id.name : node.id?.name || `${owner || 'module'}::<callback@${node.loc.start.line}:${node.loc.start.column + 1}>`;
      funcs.push({ node, name, topLevel: !owner });
      currentOwner = name;
    }
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'start', 'end'].includes(key)) continue;
      if (Array.isArray(value)) for (const v of value) walk(v, node, currentOwner);
      else if (value?.type) walk(value, node, currentOwner);
    }
  }
  walk(ast, null, null);
  const diagnostics = linter.verify(code, [{ languageOptions: { ecmaVersion: 'latest', sourceType: 'module' }, rules: { complexity: ['warn', { max: 0, variant: 'classic' }] } }]);
  if (diagnostics.some(d => d.fatal)) throw new Error(JSON.stringify(diagnostics));
  const rows = funcs.map(({ node, name, topLevel }) => {
    const nested = funcs.filter(f => f.node.start > node.start && f.node.end < node.end);
    const fragment = code.slice(node.start, node.end);
    const excluded = nested.map(f => [f.node.start - node.start, f.node.end - node.start]);
    const h = halstead(fragment, excluded);
    const ownTokens = [...tokenizer(fragment, { ecmaVersion: 'latest', locations: true })].filter(t => t.type.label !== 'eof' && !excluded.some(([s, e]) => t.start >= s && t.end <= e));
    const lines = new Set();
    for (const t of ownTokens) for (let l = t.loc.start.line; l <= t.loc.end.line; l++) lines.add(l);
    const LOC = lines.size;
    // ESLint loc for arrows can point at => rather than the start of parameters.
    const matching = diagnostics.filter(d => d.ruleId === 'complexity' && d.line >= node.loc.start.line && d.line <= node.loc.end.line && !nested.some(f => d.line > f.node.loc.start.line && d.line < f.node.loc.end.line));
    const exact = matching.find(d => d.line === node.loc.start.line && d.column === node.loc.start.column + 1);
    // Choose diagnostic within this function that belongs to the smallest enclosing AST function.
    const own = diagnostics.find(d => {
      if (d.ruleId !== 'complexity') return false;
      const offset = code.split('\n').slice(0, d.line - 1).reduce((n, line) => n + line.length + 1, 0) + d.column - 1;
      return offset >= node.start && offset < node.end && !nested.some(f => offset >= f.node.start && offset < f.node.end);
    });
    const diagnostic = exact || own;
    if (!diagnostic) throw new Error(`No ESLint complexity diagnostic: ${file} ${name}`);
    const CC = Number(diagnostic.message.match(/complexity of (\d+)/)[1]);
    const MI = Math.max(0, (171 - 5.2 * Math.log(h.V) - 0.23 * CC - 16.2 * Math.log(LOC)) * 100 / 171);
    return { file, name, topLevel, line: node.loc.start.line, LOC, CC, MI, halstead: h, source: fragment };
  });
  return { file, sha256: createHash('sha256').update(code).digest('hex'), rows, diagnostics };
}

for (const stage of ['before', 'after']) {
  const modules = files.map(file => analyze(fs.readFileSync(path.join(stage === 'before' ? path.join(out, 'before') : root, file), 'utf8'), file));
  const result = { stage, nodeVersion: process.version, eslintVersion: Linter.version, convention: 'Token SLOC; own function tokens excluding nested callbacks; lexical Halstead v1; normalized MI without comments', modules };
  fs.writeFileSync(path.join(out, `metrics-${stage}.json`), JSON.stringify(result, null, 2) + '\n');
  const csv = ['file,function,line,LOC,CC,MI,n1,n2,N1,N2,V,D,E'];
  for (const m of modules) for (const r of m.rows) csv.push([r.file, r.name, r.line, r.LOC, r.CC, r.MI.toFixed(2), ...['n1','n2','N1','N2','V','D','E'].map(k => Number(r.halstead[k].toFixed(4)))].map(v => JSON.stringify(v)).join(','));
  fs.writeFileSync(path.join(out, `metrics-${stage}.csv`), csv.join('\n') + '\n');
  console.log(`${stage}: ${modules.length} modules, ${modules.flatMap(m => m.rows).length} functions`);
  for (const m of modules) for (const r of m.rows.filter(r => ['findBestProductByHint','scoreProductByHint'].includes(r.name))) console.log(`${r.name}: LOC=${r.LOC}, CC=${r.CC}, MI=${r.MI.toFixed(2)}, E=${r.halstead.E.toFixed(2)}`);
}
