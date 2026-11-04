import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const dir = path.resolve(process.argv[2] ?? 'artifacts/native');
const results = [];
for (const platform of ['ios', 'android']) {
  const graph = JSON.parse(readFileSync(path.join(dir, `metro-${platform}.json`), 'utf8'));
  const map = new Map(graph.modules.map((m) => [m.path, m]));
  const prefix = 'node_modules/@hamster-note/components-native/dist/';
  const roots = ['index', 'button', 'icon', 'popover', 'menu', 'text-field', 'theme'].map(
    (e) => prefix + e + '.js',
  );
  for (const root of roots)
    if (!map.has(root)) throw new Error(`Missing ${root} in ${platform} graph`);
  const reachable = new Set();
  const visit = (p) => {
    if (reachable.has(p)) return;
    reachable.add(p);
    for (const d of map.get(p)?.dependencies ?? []) visit(d);
  };
  roots.forEach(visit);
  const forbidden = [...reachable].filter((p) =>
    /(?:react-dom|react-native-web|node_modules\/@hamster-note\/components\/|\.css$|react-native-svg\/lib\/module\/web\/)/.test(
      p,
    ),
  );
  if (forbidden.length) throw new Error('Forbidden modules: ' + forbidden.join(', '));
  const owned = [...reachable].filter((p) => p.startsWith(prefix));
  // Inspect actual serialized package modules, not source repository files.
  const codeFindings = owned.flatMap((p) => {
    const code = readFileSync(path.join('examples/native', p), 'utf8');
    return /\b(?:document|window)\s*\.|createPortal|\.css['"]|react-dom|createElement\(\s*['"](?:div|svg|input|button)/.test(
      code,
    )
      ? [p]
      : [];
  });
  if (codeFindings.length)
    throw new Error('DOM renderer in packaged modules: ' + codeFindings.join(', '));
  results.push({
    platform,
    totalModules: map.size,
    roots,
    reachableCount: reachable.size,
    packageModules: owned,
    forbidden,
    codeFindings,
    boundary:
      'Library closure includes React/RN/SVG native runtime; host Expo tools and its winter globals are outside library roots. Native RN internals may name window/Event; those names do not denote a DOM renderer.',
  });
}
writeFileSync(path.join(dir, 'metro-audit.json'), JSON.stringify(results, null, 2));
console.log(
  results
    .map(
      (r) =>
        `${r.platform}: ${r.totalModules} host modules, ${r.reachableCount} library closure, seven public entries, zero forbidden modules`,
    )
    .join('\n'),
);
