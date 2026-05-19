let currentAutomaton = null;
let selectedType = 'DFA';

// Type selector
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedType = btn.dataset.type;
  });
});

async function generate() {
  const description = document.getElementById('description').value.trim();
  if (!description) return;

  const btn = document.getElementById('generateBtn');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');

  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline';

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: selectedType, description })
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    currentAutomaton = json.data;
    renderDiagram(json.data);
    renderExplanation(json.data.explanation);
    renderTransitionTable(json.data);

    document.getElementById('diagramCard').style.display = 'block';
    document.getElementById('explanationCard').style.display = 'block';
    document.getElementById('testCard').style.display = 'block';
    document.getElementById('transitionCard').style.display = 'block';

  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
}

function renderExplanation(text) {
  document.getElementById('explanation').innerHTML = text.replace(/\n/g, '<br>');
}

function renderDiagram(data) {
  document.getElementById('typeTag').textContent = data.type;
  const container = document.getElementById('svgContainer');

  if (data.type === 'CFG' || data.type === 'RG') {
    renderGrammar(data, container);
    return;
  }
  if (data.type === 'TM') {
    renderTM(data, container);
    return;
  }
  renderFSM(data, container);
}

// ── FSM RENDERER (DFA/NFA/eNFA/MEALY/MOORE/PDA) ──
function renderFSM(data, container) {
  const states = data.states || [];
  const transitions = data.transitions || [];
  const accept = data.accept || [];
  const start = data.start;
  const outputs = data.outputs || {};

  const n = states.length;
  const cx = 420, cy = 220, r = 160;
  const sr = 36;
  const W = 840, H = 440;

  const positions = {};
  if (n === 1) {
    positions[states[0]] = { x: cx, y: cy };
  } else {
    states.forEach((s, i) => {
      const angle = (2 * Math.PI * i / n) - Math.PI / 2;
      positions[s] = {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      };
    });
  }

  let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:500px">
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#888"/>
    </marker>
    <marker id="arr-g" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#22c55e"/>
    </marker>
    <marker id="arr-r" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#ef4444"/>
    </marker>
  </defs>`;

  // Group transitions by from+to
  const transMap = {};
  transitions.forEach(t => {
    const key = `${t.from}__${t.to}`;
    if (!transMap[key]) transMap[key] = [];
    let label = t.input || 'ε';
    if (data.type === 'MEALY' && t.output !== undefined) label += `/${t.output}`;
    if (data.type === 'PDA') label = `${t.input||'ε'},${t.pop||'ε'}/${t.push||'ε'}`;
    transMap[key].push(label);
  });

  // Draw transitions
  Object.entries(transMap).forEach(([key, labels]) => {
    const [from, to] = key.split('__');
    const p1 = positions[from];
    const p2 = positions[to];
    if (!p1 || !p2) return;

    const label = labels.join(', ');
    const isDead = !accept.includes(to) && data.type !== 'MEALY' && data.type !== 'MOORE';
    const markerColor = accept.includes(to) ? 'url(#arr-g)' : (isDead && to !== start ? 'url(#arr-r)' : 'url(#arr)');
    const strokeColor = accept.includes(to) ? '#22c55e' : (isDead && to !== start ? '#ef4444' : '#888');

    if (from === to) {
      // Self loop
      const lx = p1.x;
      const ly = p1.y - sr;
      svg += `<path d="M${p1.x - 15},${p1.y - sr + 5} C${p1.x - 30},${p1.y - sr - 35} ${p1.x + 30},${p1.y - sr - 35} ${p1.x + 15},${p1.y - sr + 5}"
        stroke="${strokeColor}" stroke-width="1.8" fill="none" marker-end="${markerColor}"/>`;
      svg += `<text x="${lx}" y="${p1.y - sr - 30}" fill="#f0c040" font-family="JetBrains Mono" font-size="11" text-anchor="middle">${label}</text>`;
    } else {
      // Check reverse exists
      const reverseKey = `${to}__${from}`;
      const hasReverse = transMap[reverseKey];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist, uy = dy / dist;

      if (hasReverse) {
        // Curved
        const offset = 30;
        const mx = (p1.x + p2.x) / 2 - uy * offset;
        const my = (p1.y + p2.y) / 2 + ux * offset;
        const x1 = p1.x + ux * sr + (-uy * 10);
        const y1 = p1.y + uy * sr + (ux * 10);
        const x2 = p2.x - ux * sr + (-uy * 10);
        const y2 = p2.y - uy * sr + (ux * 10);
        svg += `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}"
          stroke="${strokeColor}" stroke-width="1.8" fill="none" marker-end="${markerColor}"/>`;
        svg += `<text x="${mx}" y="${my - 8}" fill="#f0c040" font-family="JetBrains Mono" font-size="11" text-anchor="middle">${label}</text>`;
      } else {
        // Straight
        const x1 = p1.x + ux * sr;
        const y1 = p1.y + uy * sr;
        const x2 = p2.x - ux * sr;
        const y2 = p2.y - uy * sr;
        const mx = (x1 + x2) / 2 - uy * 14;
        const my = (y1 + y2) / 2 + ux * 14;
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="${strokeColor}" stroke-width="1.8" marker-end="${markerColor}"/>`;
        svg += `<text x="${mx}" y="${my}" fill="#f0c040" font-family="JetBrains Mono" font-size="11" text-anchor="middle">${label}</text>`;
      }
    }
  });

  // Start arrow
  const sp = positions[start];
  if (sp) {
    svg += `<line x1="${sp.x - sr - 35}" y1="${sp.y}" x2="${sp.x - sr - 2}" y2="${sp.y}"
      stroke="#888" stroke-width="1.8" marker-end="url(#arr)"/>
    <text x="${sp.x - sr - 38}" y="${sp.y - 8}" fill="#888" font-size="10" font-family="JetBrains Mono" text-anchor="middle">start</text>`;
  }

  // Draw states
  states.forEach(s => {
    const p = positions[s];
    if (!p) return;
    const isAccept = accept.includes(s);
    const isDead = !isAccept && s !== start && data.type !== 'MEALY' && data.type !== 'MOORE';
    const fill = isAccept ? '#0f3d2e' : (isDead ? '#3d1515' : '#1e3a5f');
    const stroke = isAccept ? '#22c55e' : (isDead ? '#ef4444' : '#3b82f6');

    svg += `<circle cx="${p.x}" cy="${p.y}" r="${sr}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`;
    if (isAccept) {
      svg += `<circle cx="${p.x}" cy="${p.y}" r="${sr - 6}" fill="none" stroke="${stroke}" stroke-width="1.5" opacity="0.5"/>`;
    }

    // State label
    const hasOutput = data.type === 'MOORE' && outputs[s] !== undefined;
    const labelY = hasOutput ? p.y - 6 : p.y;
    svg += `<text x="${p.x}" y="${labelY}" fill="#fff" font-family="Space Grotesk" font-weight="600" font-size="13" text-anchor="middle" dominant-baseline="middle">${s}</text>`;

    if (hasOutput) {
      svg += `<text x="${p.x}" y="${p.y + 10}" fill="#f0c040" font-family="JetBrains Mono" font-size="10" text-anchor="middle" dominant-baseline="middle">/${outputs[s]}</text>`;
    }
  });

  svg += `</svg>`;
  container.innerHTML = svg;

  // Legend
  const legend = document.getElementById('legend');
  legend.innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="background:#1e3a5f;border-color:#3b82f6"></div> Normal state</div>
    <div class="legend-item"><div class="legend-dot" style="background:#0f3d2e;border-color:#22c55e"></div> Accept state</div>
    <div class="legend-item"><div class="legend-dot" style="background:#3d1515;border-color:#ef4444"></div> Dead/Reject state</div>
  `;
}

// ── TURING MACHINE RENDERER ──
function renderTM(data, container) {
  const states = data.states || [];
  const transitions = data.transitions || [];
  const accept = data.accept;
  const reject = data.reject;
  const start = data.start;

  const n = states.length;
  const cx = 420, cy = 160, r = 130;
  const sr = 36;
  const W = 840, H = 420;

  const positions = {};
  states.forEach((s, i) => {
    const angle = (2 * Math.PI * i / n) - Math.PI / 2;
    positions[s] = {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  });

  let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:500px">
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#888"/>
    </marker>
    <marker id="arr-g" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#22c55e"/>
    </marker>
    <marker id="arr-r" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#ef4444"/>
    </marker>
  </defs>`;

  // Transitions
  const transMap = {};
  transitions.forEach(t => {
    const key = `${t.from}__${t.to}`;
    if (!transMap[key]) transMap[key] = [];
    transMap[key].push(`${t.read}/${t.write},${t.move}`);
  });

  Object.entries(transMap).forEach(([key, labels]) => {
    const [from, to] = key.split('__');
    const p1 = positions[from];
    const p2 = positions[to];
    if (!p1 || !p2) return;

    const label = labels.join(' | ');
    const isAcceptTrans = to === accept;
    const strokeColor = isAcceptTrans ? '#22c55e' : (to === reject ? '#ef4444' : '#888');
    const markerColor = isAcceptTrans ? 'url(#arr-g)' : (to === reject ? 'url(#arr-r)' : 'url(#arr)');

    if (from === to) {
      svg += `<path d="M${p1.x - 15},${p1.y - sr + 5} C${p1.x - 30},${p1.y - sr - 35} ${p1.x + 30},${p1.y - sr - 35} ${p1.x + 15},${p1.y - sr + 5}"
        stroke="${strokeColor}" stroke-width="1.8" fill="none" marker-end="${markerColor}"/>`;
      svg += `<text x="${p1.x}" y="${p1.y - sr - 30}" fill="#f0c040" font-family="JetBrains Mono" font-size="10" text-anchor="middle">${label}</text>`;
    } else {
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / dist, uy = dy / dist;
      const reverseKey = `${to}__${from}`;
      const hasReverse = transMap[reverseKey];

      if (hasReverse) {
        const offset = 30;
        const mx = (p1.x + p2.x) / 2 - uy * offset;
        const my = (p1.y + p2.y) / 2 + ux * offset;
        svg += `<path d="M${p1.x + ux * sr},${p1.y + uy * sr} Q${mx},${my} ${p2.x - ux * sr},${p2.y - uy * sr}"
          stroke="${strokeColor}" stroke-width="1.8" fill="none" marker-end="${markerColor}"/>`;
        svg += `<text x="${mx}" y="${my - 8}" fill="#f0c040" font-family="JetBrains Mono" font-size="10" text-anchor="middle">${label}</text>`;
      } else {
        const x1 = p1.x + ux * sr, y1 = p1.y + uy * sr;
        const x2 = p2.x - ux * sr, y2 = p2.y - uy * sr;
        const mx = (x1 + x2) / 2 - uy * 14;
        const my = (y1 + y2) / 2 + ux * 14;
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="${strokeColor}" stroke-width="1.8" marker-end="${markerColor}"/>`;
        svg += `<text x="${mx}" y="${my}" fill="#f0c040" font-family="JetBrains Mono" font-size="10" text-anchor="middle">${label}</text>`;
      }
    }
  });

  // Start arrow
  const sp = positions[start];
  if (sp) {
    svg += `<line x1="${sp.x - sr - 35}" y1="${sp.y}" x2="${sp.x - sr - 2}" y2="${sp.y}"
      stroke="#888" stroke-width="1.8" marker-end="url(#arr)"/>`;
  }

  // States
  states.forEach(s => {
    const p = positions[s];
    if (!p) return;
    const isAcc = s === accept;
    const isRej = s === reject;
    const fill = isAcc ? '#0f3d2e' : (isRej ? '#3d1515' : '#1e3a5f');
    const stroke = isAcc ? '#22c55e' : (isRej ? '#ef4444' : '#3b82f6');

    svg += `<circle cx="${p.x}" cy="${p.y}" r="${sr}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>`;
    if (isAcc) svg += `<circle cx="${p.x}" cy="${p.y}" r="${sr - 6}" fill="none" stroke="${stroke}" stroke-width="1.5" opacity="0.5"/>`;
    svg += `<text x="${p.x}" y="${p.y - 5}" fill="#fff" font-family="Space Grotesk" font-weight="600" font-size="12" text-anchor="middle" dominant-baseline="middle">${s}</text>`;
    svg += `<text x="${p.x}" y="${p.y + 9}" fill="#aaa" font-family="Space Grotesk" font-size="9" text-anchor="middle">${isAcc ? 'accept' : isRej ? 'reject' : ''}</text>`;
  });

  // Tape visualization
  const tapeSymbols = data.tape_alphabet || [];
  const tapeY = 350;
  const cellW = 40, cellH = 36;
  const tapeX = W / 2 - (tapeSymbols.length * cellW) / 2;

  svg += `<text x="${W/2}" y="${tapeY - 12}" fill="#555" font-family="JetBrains Mono" font-size="10" text-anchor="middle">TAPE ALPHABET</text>`;
  tapeSymbols.forEach((sym, i) => {
    const tx = tapeX + i * cellW;
    svg += `<rect x="${tx}" y="${tapeY}" width="${cellW}" height="${cellH}" fill="#1a1a2e" stroke="#3b82f6" stroke-width="1" rx="4"/>`;
    svg += `<text x="${tx + cellW/2}" y="${tapeY + cellH/2 + 1}" fill="#60a5fa" font-family="JetBrains Mono" font-size="13" text-anchor="middle" dominant-baseline="middle">${sym}</text>`;
  });

  svg += `</svg>`;
  container.innerHTML = svg;

  document.getElementById('legend').innerHTML = `
    <div class="legend-item"><div class="legend-dot" style="background:#1e3a5f;border-color:#3b82f6"></div> Normal</div>
    <div class="legend-item"><div class="legend-dot" style="background:#0f3d2e;border-color:#22c55e"></div> Accept</div>
    <div class="legend-item"><div class="legend-dot" style="background:#3d1515;border-color:#ef4444"></div> Reject</div>
  `;
}

// ── GRAMMAR RENDERER ──
function renderGrammar(data, container) {
  const productions = data.productions || [];
  let html = `<div style="font-family:'JetBrains Mono',monospace;font-size:0.9rem;line-height:2;">`;
  const grouped = {};
  productions.forEach(p => {
    if (!grouped[p.from]) grouped[p.from] = [];
    grouped[p.from].push(p.to);
  });
  Object.entries(grouped).forEach(([lhs, rhs]) => {
    html += `<div><span style="color:#60a5fa;font-weight:600">${lhs}</span> <span style="color:#555">→</span> <span style="color:#f0c040">${rhs.join(' | ')}</span></div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
  document.getElementById('legend').innerHTML = '';
}

// ── TRANSITION TABLE ──
function renderTransitionTable(data) {
  const el = document.getElementById('transitionTable');
  const transitions = data.transitions || [];
  const alphabet = data.alphabet || [];

  if (data.type === 'CFG' || data.type === 'RG') {
    el.innerHTML = '';
    return;
  }

  let html = `<table><thead><tr><th>State</th>`;
  alphabet.forEach(a => { html += `<th>${a}</th>`; });
  if (data.type === 'PDA') html += `<th>Stack Op</th>`;
  if (data.type === 'TM') { html += `<th>Read</th><th>Write</th><th>Move</th>`; }
  html += `</tr></thead><tbody>`;

  (data.states || []).forEach(s => {
    html += `<tr><td style="color:#60a5fa;font-weight:600">${s}</td>`;
    if (data.type === 'TM') {
      const t = transitions.filter(t => t.from === s);
      if (t.length) {
        html += `<td>${t.map(x=>x.read).join(', ')}</td>
                 <td>${t.map(x=>x.write).join(', ')}</td>
                 <td>${t.map(x=>x.move).join(', ')}</td>`;
      } else {
        html += `<td>-</td><td>-</td><td>-</td>`;
      }
    } else {
      alphabet.forEach(a => {
        const t = transitions.filter(x => x.from === s && x.input === a);
        html += `<td>${t.length ? t.map(x=>x.to).join(', ') : '-'}</td>`;
      });
      if (data.type === 'PDA') {
        const t = transitions.filter(x => x.from === s);
        html += `<td>${t.length ? t.map(x=>`${x.pop||'ε'}/${x.push||'ε'}`).join(', ') : '-'}</td>`;
      }
    }
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  el.innerHTML = html;
}

// ── STRING TESTER ──
async function testString() {
  if (!currentAutomaton) return;
  const input = document.getElementById('testInput').value;
  const resultEl = document.getElementById('testResult');

  resultEl.style.display = 'block';
  resultEl.className = '';
  resultEl.textContent = 'Testing...';

  try {
    const res = await fetch('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ automaton: currentAutomaton, input })
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    const d = json.data;
    resultEl.className = d.accepted ? 'accepted' : 'rejected';
    resultEl.innerHTML = `${d.accepted ? '✅ ACCEPTED' : '❌ REJECTED'}<br><br>
      <span style="color:#aaa">Trace: ${(d.trace || []).join(' → ')}</span><br>
      <span style="color:#aaa">${d.reason || ''}</span>`;

  } catch (err) {
    resultEl.className = 'rejected';
    resultEl.textContent = 'Error: ' + err.message;
  }
  }
// Theme toggle
function toggleTheme() {
  const html = document.documentElement;
  const btn = document.getElementById('themeBtn');
  if (html.getAttribute('data-theme') === 'dark') {
    html.setAttribute('data-theme', 'light');
    btn.textContent = '☀️';
  } else {
    html.setAttribute('data-theme', 'dark');
    btn.textContent = '🌙';
  }
}