/**
 * ЕНТ / USTUDY ОНЛАЙН-ТЕСТИРОВАНИЕ — ОСНОВНОЙ СКРИПТ
 * Реализация функционала тестирования НЦТ РК
 */

(function () {
  'use strict';

  // --- STATE ---
  const STORAGE_KEY = 'ENT_TEST_STATE_V2';
  const TOTAL_TEST_TIME = 110 * 60; // 110 минут в секундах

  let state = {
    currentVariantId: 1,
    currentQuestionId: 1,
    userAnswers: { 1: {}, 2: {}, 3: {} },
    bookmarks: { 1: {}, 2: {}, 3: {} },
    timeRemaining: { 1: TOTAL_TEST_TIME, 2: TOTAL_TEST_TIME, 3: TOTAL_TEST_TIME },
    isFinished: { 1: false, 2: false, 3: false },
    fontSize: 16,
    resultFilter: 'all'
  };

  let timerInterval = null;

  // --- FORMULA HANDBOOK DATA ---
  const FORMULAS_DATA = [
    {
      category: 'algebra',
      title: 'Формулы сокращённого умножения',
      content: `
        • Квадрат суммы: $(a + b)^2 = a^2 + 2ab + b^2$<br>
        • Квадрат разности: $(a - b)^2 = a^2 - 2ab + b^2$<br>
        • Разность квадратов: $a^2 - b^2 = (a - b)(a + b)$<br>
        • Куб суммы: $(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$<br>
        • Куб разности: $(a - b)^3 = a^3 - 3a^2b + 3ab^2 - b^3$<br>
        • Сумма кубов: $a^3 + b^3 = (a + b)(a^2 - ab + b^2)$<br>
        • Разность кубов: $a^3 - b^3 = (a - b)(a^2 + ab + b^2)$
      `
    },
    {
      category: 'algebra',
      title: 'Квадратное уравнение и теорема Виета',
      content: `
        Для уравнения $ax^2 + bx + c = 0$ ($a \\ne 0$):<br>
        • Дискриминант: $D = b^2 - 4ac$<br>
        • Корни: $x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}$<br>
        • Теорема Виета: $x_1 + x_2 = -\\frac{b}{a}$, $x_1 \\cdot x_2 = \\frac{c}{a}$<br>
        • Координаты вершины параболы: $x_0 = -\\frac{b}{2a}$, $y_0 = f(x_0)$
      `
    },
    {
      category: 'algebra',
      title: 'Арифметическая и геометрическая прогрессии',
      content: `
        <strong>Арифметическая прогрессия:</strong><br>
        • $n$-й член: $a_n = a_1 + (n - 1)d$<br>
        • Сумма $n$ членов: $S_n = \\frac{a_1 + a_n}{2} \\cdot n = \\frac{2a_1 + (n - 1)d}{2} \\cdot n$<br><br>
        <strong>Геометрическая прогрессия:</strong><br>
        • $n$-й член: $b_n = b_1 \\cdot q^{n - 1}$<br>
        • Сумма $n$ членов ($q \\ne 1$): $S_n = \\frac{b_1(q^n - 1)}{q - 1}$<br>
        • Бесконечно убывающая ($|q| < 1$): $S = \\frac{b_1}{1 - q}$
      `
    },
    {
      category: 'trig',
      title: 'Основные тригонометрические тождества',
      content: `
        • $\\sin^2 \\alpha + \\cos^2 \\alpha = 1$<br>
        • $\\text{tg}\\,\\alpha = \\frac{\\sin \\alpha}{\\cos \\alpha}$, $\\text{ctg}\\,\\alpha = \\frac{\\cos \\alpha}{\\sin \\alpha}$<br>
        • $\\text{tg}\\,\\alpha \\cdot \\text{ctg}\\,\\alpha = 1$<br>
        • $1 + \\text{tg}^2 \\alpha = \\frac{1}{\\cos^2 \\alpha}$, $1 + \\text{ctg}^2 \\alpha = \\frac{1}{\\sin^2 \\alpha}$
      `
    },
    {
      category: 'trig',
      title: 'Формулы двойного угла',
      content: `
        • $\\sin 2\\alpha = 2\\sin \\alpha \\cos \\alpha$<br>
        • $\\cos 2\\alpha = \\cos^2 \\alpha - \\sin^2 \\alpha = 2\\cos^2 \\alpha - 1 = 1 - 2\\sin^2 \\alpha$<br>
        • $\\text{tg}\\,2\\alpha = \\frac{2\\text{tg}\\,\\alpha}{1 - \\text{tg}^2 \\alpha}$
      `
    },
    {
      category: 'trig',
      title: 'Таблица точных значений тригонометрических функций',
      content: `
        <table style="width:100%; text-align:center; font-size:13px;">
          <tr><th>Угол $\\alpha$</th><th>$0^\\circ$ ($0$)</th><th>$30^\\circ$ ($\\frac{\\pi}{6}$)</th><th>$45^\\circ$ ($\\frac{\\pi}{4}$)</th><th>$60^\\circ$ ($\\frac{\\pi}{3}$)</th><th>$90^\\circ$ ($\\frac{\\pi}{2}$)</th></tr>
          <tr><td>$\\sin \\alpha$</td><td>$0$</td><td>$1/2$</td><td>$\\sqrt{2}/2$</td><td>$\\sqrt{3}/2$</td><td>$1$</td></tr>
          <tr><td>$\\cos \\alpha$</td><td>$1$</td><td>$\\sqrt{3}/2$</td><td>$\\sqrt{2}/2$</td><td>$1/2$</td><td>$0$</td></tr>
          <tr><td>$\\text{tg}\\,\\alpha$</td><td>$0$</td><td>$\\sqrt{3}/3$</td><td>$1$</td><td>$\\sqrt{3}$</td><td>—</td></tr>
        </table>
      `
    },
    {
      category: 'logs',
      title: 'Свойства логарифмов и степеней',
      content: `
        • $\\log_a(x \\cdot y) = \\log_a x + \\log_a y$<br>
        • $\\log_a(\\frac{x}{y}) = \\log_a x - \\log_a y$<br>
        • $\\log_a(x^k) = k \\log_a x$<br>
        • $\\log_{a^p}(x) = \\frac{1}{p}\\log_a x$<br>
        • Переход к новому основанию: $\\log_a b = \\frac{\\log_c b}{\\log_c a}$<br>
        • Основное тождество: $a^{\\log_a b} = b$
      `
    },
    {
      category: 'planimetry',
      title: 'Площади плоских фигур (Планиметрия)',
      content: `
        • Треугольник: $S = \\frac{1}{2}ah = \\frac{1}{2}ab\\sin\\gamma = \\sqrt{p(p-a)(p-b)(p-c)}$ (Герон)<br>
        • Прямоугольный треугольник: $S = \\frac{1}{2}ab$, $R = c/2$, $r = \\frac{a+b-c}{2}$<br>
        • Правильный треугольник: $S = \\frac{a^2\\sqrt{3}}{4}$<br>
        • Параллелограмм: $S = ah = ab\\sin\\alpha$<br>
        • Ромб: $S = ah = \\frac{d_1 d_2}{2} = a^2\\sin\\alpha$<br>
        • Трапеция: $S = \\frac{a + b}{2} \\cdot h$<br>
        • Круг и сектор: $S = \\pi R^2$, $S_{\\text{сект}} = \\frac{\\pi R^2 \\alpha}{360^\\circ}$
      `
    },
    {
      category: 'stereometry',
      title: 'Объёмы и площади поверхностей (Стереометрия)',
      content: `
        • Прямая призма: $V = S_{\\text{осн}} \\cdot h$, $S_{\\text{бок}} = P_{\\text{осн}} \\cdot h$<br>
        • Пирамида: $V = \\frac{1}{3}S_{\\text{осн}} \\cdot h$, правильная: $S_{\\text{бок}} = \\frac{1}{2}P_{\\text{осн}} \\cdot l$<br>
        • Цилиндр: $V = \\pi R^2 h$, $S_{\\text{бок}} = 2\\pi R h$, $S_{\\text{полн}} = 2\\pi R(R + h)$<br>
        • Конус: $V = \\frac{1}{3}\\pi R^2 h$, $S_{\\text{бок}} = \\pi R l$, $l = \\sqrt{R^2 + h^2}$<br>
        • Шар и сфера: $V = \\frac{4}{3}\\pi R^3$, $S = 4\\pi R^2$
      `
    },
    {
      category: 'calculus',
      title: 'Производные и первообразные',
      content: `
        • $(x^n)' = n x^{n-1}$, $(c)' = 0$<br>
        • $(\\sin x)' = \\cos x$, $(\\cos x)' = -\\sin x$<br>
        • $(e^x)' = e^x$, $(a^x)' = a^x \\ln a$<br>
        • $(\\ln x)' = \\frac{1}{x}$<br>
        • Уравнение касательной: $y = f(x_0) + f'(x_0)(x - x_0)$<br>
        • Формула Ньютона-Лейбница: $\\int_a^b f(x)\\,dx = F(b) - F(a)$
      `
    }
  ];

  // --- SVG DIAGRAM GENERATORS FOR CONTEXT TASKS ---
  function getContextDiagramSvg(variantId) {
    if (variantId === 1) {
      // Parabolic greenhouse arch (0 to 8m, height 4m, horizontal tie at y=3m)
      return `
        <svg viewBox="0 0 460 220" width="100%" max-width="460" height="190" style="background:#ffffff; border-radius:8px; border:1px solid #cbd5e1;">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#e0f2fe"/>
              <stop offset="100%" stop-color="#f8fafc"/>
            </linearGradient>
          </defs>
          <!-- Sky background -->
          <rect x="10" y="10" width="440" height="200" fill="url(#skyGrad)" rx="6"/>
          <!-- Ground line -->
          <line x1="30" y1="180" x2="430" y2="180" stroke="#334155" stroke-width="3"/>
          <text x="435" y="184" font-size="11" fill="#475569" font-weight="bold">y=0</text>
          
          <!-- Parabola arch: scale x: 0..8 -> 70..390 (dx=320, 1m=40px). y: 0..4 -> 180..60 (1m=30px) -->
          <!-- x=0 -> (70, 180), x=2 -> (150, 90), x=4 -> (230, 60), x=6 -> (310, 90), x=8 -> (390, 180) -->
          <path d="M 70 180 Q 230 -60 390 180" fill="rgba(34, 197, 94, 0.15)" stroke="#16a34a" stroke-width="3.5"/>
          
          <!-- Height indicator (Apex at x=4, y=4 -> 230, 60) -->
          <line x1="230" y1="60" x2="230" y2="180" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4 3"/>
          <circle cx="230" cy="60" r="4" fill="#dc2626"/>
          <text x="238" y="75" font-size="12" fill="#dc2626" font-weight="bold">Купол (x₀=4, y₀=4 м)</text>
          
          <!-- Horizontal tie at y=3m (height = 180 - 3*30 = 90px). x from 2 to 6 -> 150 to 310 (length 4m=160px) -->
          <line x1="150" y1="90" x2="310" y2="90" stroke="#2563eb" stroke-width="2.5"/>
          <circle cx="150" cy="90" r="3.5" fill="#2563eb"/>
          <circle cx="310" cy="90" r="3.5" fill="#2563eb"/>
          <text x="180" y="84" font-size="11" fill="#2563eb" font-weight="bold">Стяжка (y=3 м, длина 4 м)</text>
          
          <!-- Ground span dimension -->
          <line x1="70" y1="198" x2="390" y2="198" stroke="#0f172a" stroke-width="1.2"/>
          <line x1="70" y1="193" x2="70" y2="203" stroke="#0f172a" stroke-width="1.2"/>
          <line x1="390" y1="193" x2="390" y2="203" stroke="#0f172a" stroke-width="1.2"/>
          <text x="200" y="212" font-size="12" fill="#0f172a" font-weight="bold">Ширина основания: 8 м</text>
        </svg>
      `;
    } else if (variantId === 2) {
      // Parabolic bridge arch (span 20m, height 5m)
      return `
        <svg viewBox="0 0 460 210" width="100%" max-width="460" height="190" style="background:#ffffff; border-radius:8px; border:1px solid #cbd5e1;">
          <defs>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
          </defs>
          <!-- Water level -->
          <rect x="10" y="150" width="440" height="50" fill="url(#waterGrad)" opacity="0.3" rx="4"/>
          <line x1="20" y1="150" x2="440" y2="150" stroke="#0284c7" stroke-width="2"/>
          <text x="390" y="166" font-size="11" fill="#0369a1" font-weight="bold">Уровень воды</text>
          
          <!-- Bridge Arch: span 20m (x from 50 to 410, dx=360). apex at x=230, height 5m (y=50) -->
          <path d="M 50 150 Q 230 -50 410 150" fill="rgba(59, 130, 246, 0.12)" stroke="#1d4ed8" stroke-width="3.5"/>
          
          <!-- Apex -->
          <circle cx="230" cy="50" r="4" fill="#dc2626"/>
          <text x="238" y="55" font-size="12" fill="#dc2626" font-weight="bold">Вершина (h = 5 м)</text>
          
          <!-- Vertical suspension cables at x=5m and 15m (x=140 and 320) -->
          <line x1="140" y1="87" x2="140" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3"/>
          <line x1="320" y1="87" x2="320" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3"/>
          <line x1="140" y1="87" x2="320" y2="87" stroke="#e11d48" stroke-width="1.8"/>
          <text x="185" y="80" font-size="11" fill="#be123c" font-weight="bold">Тросы (y = 3,75 м, L = 10 м)</text>
          
          <!-- Span dimension -->
          <line x1="50" y1="185" x2="410" y2="185" stroke="#0f172a" stroke-width="1.2"/>
          <line x1="50" y1="180" x2="50" y2="190" stroke="#0f172a" stroke-width="1.2"/>
          <line x1="410" y1="180" x2="410" y2="190" stroke="#0f172a" stroke-width="1.2"/>
          <text x="195" y="200" font-size="12" fill="#0f172a" font-weight="bold">Пролёт моста: 20 м</text>
        </svg>
      `;
    } else {
      // Cylinder + conical roof tank
      return `
        <svg viewBox="0 0 360 230" width="100%" max-width="360" height="200" style="background:#ffffff; border-radius:8px; border:1px solid #cbd5e1;">
          <!-- Conical Roof (Apex at 180, 20. Base at 180, 70 with rx=75, ry=15) -->
          <path d="M 105 70 L 180 20 L 255 70" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
          <ellipse cx="180" cy="70" rx="75" ry="14" fill="#ffedd5" stroke="#ea580c" stroke-width="1.5"/>
          <text x="185" y="42" font-size="11" fill="#c2410c" font-weight="bold">Крыша (h=4 м, l=5 м)</text>
          
          <!-- Cylinder body (Height 8m, from y=70 to y=170) -->
          <path d="M 105 70 L 105 170 A 75 14 0 0 0 255 170 L 255 70" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
          <ellipse cx="180" cy="170" rx="75" ry="14" fill="#bae6fd" stroke="#0284c7" stroke-width="2"/>
          <text x="135" y="125" font-size="12" fill="#0369a1" font-weight="bold">Цилиндр (H = 8 м)</text>
          
          <!-- Radius indicator -->
          <line x1="180" y1="170" x2="255" y2="170" stroke="#dc2626" stroke-width="1.5"/>
          <circle cx="180" cy="170" r="3" fill="#dc2626"/>
          <text x="195" y="165" font-size="11" fill="#dc2626" font-weight="bold">R = 3 м</text>
          
          <text x="110" y="210" font-size="12" fill="#334155" font-weight="bold">Водонапорный резервуар</text>
        </svg>
      `;
    }
  }

  // --- MATH RENDERING HELPER ---
  function renderMath(container) {
    if (!container) return;
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(container, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
        return;
      } catch (e) {
        console.warn("KaTeX render error:", e);
      }
    }
  }

  // --- AUDIO / BEEP NOTIFIER ---
  function playAlertSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  // --- PERSISTENCE ---
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = Object.assign(state, parsed);
      }
    } catch (e) {
      console.warn("Failed to load local state:", e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to save local state:", e);
    }
  }

  // --- CURRENT VARIANT GETTER ---
  function getVariant() {
    if (!window.ENT_VARIANTS || !window.ENT_VARIANTS[state.currentVariantId]) {
      return null;
    }
    return window.ENT_VARIANTS[state.currentVariantId];
  }

  function getQuestion(qId = state.currentQuestionId) {
    const v = getVariant();
    if (!v) return null;
    return v.questions.find(q => q.id === qId);
  }

  // --- TIMER ENGINE ---
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      const vId = state.currentVariantId;
      if (state.isFinished[vId]) return;

      if (state.timeRemaining[vId] > 0) {
        state.timeRemaining[vId]--;
        updateTimerDisplay();

        // Warning sound when exactly 10 minutes (600s) left
        if (state.timeRemaining[vId] === 600) {
          playAlertSound();
        }

        // Auto-save timer every 10 seconds
        if (state.timeRemaining[vId] % 10 === 0) {
          saveState();
        }
      } else {
        // Time expired!
        finishTest(true);
      }
    }, 1000);

    updateTimerDisplay();
  }

  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function updateTimerDisplay() {
    const timerElem = document.getElementById('timerDigits');
    const container = document.getElementById('timerContainer');
    if (!timerElem || !container) return;

    const remaining = state.timeRemaining[state.currentVariantId];
    timerElem.textContent = formatTime(remaining);

    // Warning styling when less than 10 minutes
    if (remaining <= 600 && !state.isFinished[state.currentVariantId]) {
      container.classList.add('timer-warning');
    } else {
      container.classList.remove('timer-warning');
    }
  }

  // --- QUESTION RENDERING ---
  function renderCurrentQuestion() {
    const q = getQuestion();
    if (!q) return;

    const qPane = document.getElementById('questionPane');
    if (!qPane) return;

    // Header info
    document.getElementById('qNumberTitle').textContent = `Вопрос № ${q.id} из 50`;
    
    // Block badge
    const blockBadge = document.getElementById('qBlockBadge');
    if (q.section === 'math_literacy') {
      blockBadge.className = 'badge-block badge-literacy';
      blockBadge.textContent = 'Блок I. Матграмотность';
    } else {
      blockBadge.className = 'badge-block badge-profile';
      blockBadge.textContent = 'Блок II. Профильная математика';
    }

    // Type badge
    const typeBadge = document.getElementById('qTypeBadge');
    if (q.type === 'single') {
      typeBadge.textContent = q.context_id ? 'Контекстное задание' : 'Один правильный ответ';
    } else if (q.type === 'matching') {
      typeBadge.textContent = 'На установление соответствия';
    } else if (q.type === 'multiple') {
      typeBadge.textContent = 'Множественный выбор (1–3 ответа)';
    }

    // Points badge
    document.getElementById('qPointsBadge').textContent = `${q.points} ${q.points === 1 ? 'балл' : 'балла'}`;

    // Bookmark button
    const bmBtn = document.getElementById('btnBookmarkToggle');
    const isBookmarked = !!(state.bookmarks[state.currentVariantId] && state.bookmarks[state.currentVariantId][q.id]);
    if (isBookmarked) {
      bmBtn.classList.add('bookmarked');
      bmBtn.innerHTML = '★ В закладках';
    } else {
      bmBtn.classList.remove('bookmarked');
      bmBtn.innerHTML = '☆ В закладки';
    }

    // Context Box (if context question)
    const contextContainer = document.getElementById('contextContainer');
    if (q.context_id) {
      contextContainer.style.display = 'block';
      let tableHtml = '';
      let textWithoutTable = q.context_text;

      // Render markdown table inside context if present
      if (q.context_text.includes('|')) {
        const parts = q.context_text.split('\n\n');
        const textPart = parts[0];
        const tableLines = parts.slice(1).join('\n').trim().split('\n');
        
        let parsedTable = '<table><thead>';
        let isHead = true;
        tableLines.forEach(line => {
          if (!line.trim() || line.includes('---')) {
            if (line.includes('---')) isHead = false;
            return;
          }
          const cells = line.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
          parsedTable += '<tr>';
          cells.forEach(cell => {
            parsedTable += isHead ? `<th>${cell.trim()}</th>` : `<td>${cell.trim()}</td>`;
          });
          parsedTable += isHead ? '</tr></thead><tbody>' : '</tr>';
        });
        parsedTable += '</tbody></table>';
        tableHtml = parsedTable;
        textWithoutTable = textPart;
      }

      contextContainer.innerHTML = `
        <div class="context-box">
          <div class="context-box-header">
            <div class="context-box-title">📋 КОНТЕКСТ: ${q.context_title}</div>
          </div>
          <div class="context-box-body">
            <p>${textWithoutTable}</p>
            <div class="context-diagram-wrapper">
              ${getContextDiagramSvg(state.currentVariantId)}
            </div>
            ${tableHtml}
          </div>
        </div>
      `;
    } else {
      contextContainer.style.display = 'none';
      contextContainer.innerHTML = '';
    }

    // Question Text
    const qTextElem = document.getElementById('questionText');
    qTextElem.style.fontSize = `${state.fontSize}px`;
    
    // Check if question text has a table (e.g. Q4 of math literacy)
    if (q.text.includes('| Курьерская служба') || q.text.includes('| Тариф') || q.text.includes('| Поставщик')) {
      const parts = q.text.split('\n\n');
      const intro = parts[0];
      const tableLines = parts[1] ? parts[1].split('\n') : [];
      let parsedTable = '<table><thead>';
      let isHead = true;
      tableLines.forEach(line => {
        if (!line.trim() || line.includes('---')) {
          if (line.includes('---')) isHead = false;
          return;
        }
        const cells = line.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        parsedTable += '<tr>';
        cells.forEach(cell => {
          parsedTable += isHead ? `<th>${cell.trim()}</th>` : `<td>${cell.trim()}</td>`;
        });
        parsedTable += isHead ? '</tr></thead><tbody>' : '</tr>';
      });
      parsedTable += '</tbody></table>';
      const outro = parts.slice(2).join('\n\n');
      qTextElem.innerHTML = `<p>${intro}</p>${parsedTable}<p>${outro}</p>`;
    } else {
      qTextElem.innerHTML = q.text;
    }

    // Answers container
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';

    const currentAnswer = state.userAnswers[state.currentVariantId][q.id];

    if (q.type === 'single') {
      const letters = ['A', 'B', 'C', 'D'];
      let optionsHtml = '<div class="options-list">';
      q.options.forEach((opt, idx) => {
        const letter = letters[idx];
        const isSelected = currentAnswer === letter;
        optionsHtml += `
          <div class="option-card ${isSelected ? 'selected' : ''}" data-letter="${letter}">
            <div class="option-letter">${letter}</div>
            <div class="option-text">${opt}</div>
          </div>
        `;
      });
      optionsHtml += '</div>';
      answersContainer.innerHTML = optionsHtml;

      // Event listeners for single choice
      answersContainer.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
          const letter = card.getAttribute('data-letter');
          saveUserAnswer(q.id, letter);
          renderCurrentQuestion();
          renderSidebarGrid();
        });
      });

    } else if (q.type === 'matching') {
      const selectedA = (currentAnswer && currentAnswer.A) || '';
      const selectedB = (currentAnswer && currentAnswer.B) || '';

      let matchingHtml = `
        <div class="matching-container">
          <div class="matching-items-grid">
            <div class="matching-column">
              <div class="matching-column-title">Позиция (Левый столбец)</div>
              ${q.matching_left.map(item => `<div class="matching-item-line">${item.label || item}</div>`).join('')}
            </div>
            <div class="matching-column">
              <div class="matching-column-title">Значение (Правый столбец)</div>
              ${q.matching_right.map(item => `<div class="matching-item-line">${item.label || item}</div>`).join('')}
            </div>
          </div>

          <div class="matching-matrix">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th style="width: 30%;">Позиция</th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 700; background:#f8fafc;">А</td>
                  ${['1', '2', '3', '4'].map(val => `
                    <td>
                      <label class="matrix-cell-radio">
                        <input type="radio" name="match_A" value="${val}" ${selectedA === val ? 'checked' : ''}>
                      </label>
                    </td>
                  `).join('')}
                </tr>
                <tr>
                  <td style="font-weight: 700; background:#f8fafc;">Б</td>
                  ${['1', '2', '3', '4'].map(val => `
                    <td>
                      <label class="matrix-cell-radio">
                        <input type="radio" name="match_B" value="${val}" ${selectedB === val ? 'checked' : ''}>
                      </label>
                    </td>
                  `).join('')}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      answersContainer.innerHTML = matchingHtml;

      // Event listeners for matching matrix
      answersContainer.querySelectorAll('input[name="match_A"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          const current = state.userAnswers[state.currentVariantId][q.id] || {};
          current.A = e.target.value;
          saveUserAnswer(q.id, current);
          renderSidebarGrid();
        });
      });

      answersContainer.querySelectorAll('input[name="match_B"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          const current = state.userAnswers[state.currentVariantId][q.id] || {};
          current.B = e.target.value;
          saveUserAnswer(q.id, current);
          renderSidebarGrid();
        });
      });

    } else if (q.type === 'multiple') {
      const selectedArr = Array.isArray(currentAnswer) ? currentAnswer : [];
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

      let multipleHtml = `
        <div class="multiple-instruction">
          <span>Выберите от 1 до 3 правильных ответов:</span>
          <span class="multiple-counter">Выбрано: ${selectedArr.length} из 3</span>
        </div>
        <div class="options-list">
      `;

      q.options.forEach((opt, idx) => {
        const letter = letters[idx];
        const isChecked = selectedArr.includes(letter);
        multipleHtml += `
          <div class="option-card ${isChecked ? 'selected' : ''}" data-letter="${letter}">
            <div class="checkbox-custom">${isChecked ? '✓' : ''}</div>
            <div class="option-letter">${letter}</div>
            <div class="option-text">${opt}</div>
          </div>
        `;
      });

      multipleHtml += '</div>';
      answersContainer.innerHTML = multipleHtml;

      // Event listeners for multiple choice
      answersContainer.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
          const letter = card.getAttribute('data-letter');
          let arr = Array.isArray(state.userAnswers[state.currentVariantId][q.id]) 
            ? [...state.userAnswers[state.currentVariantId][q.id]] 
            : [];

          if (arr.includes(letter)) {
            arr = arr.filter(l => l !== letter);
          } else {
            if (arr.length >= 3) {
              alert("Можно выбрать максимум 3 варианта ответа!");
              return;
            }
            arr.push(letter);
          }

          saveUserAnswer(q.id, arr.length > 0 ? arr : null);
          renderCurrentQuestion();
          renderSidebarGrid();
        });
      });
    }

    // Navigation buttons state
    document.getElementById('btnNavPrev').disabled = (q.id === 1);
    const nextBtn = document.getElementById('btnNavNext');
    if (q.id === 50) {
      nextBtn.innerHTML = 'Завершить тест 🏁';
      nextBtn.className = 'btn-nav btn-finish-test';
    } else {
      nextBtn.innerHTML = 'Далее →';
      nextBtn.className = 'btn-nav btn-nav-next';
    }

    // Render KaTeX in the container
    renderMath(qPane);
  }

  // --- SAVE ANSWER ---
  function saveUserAnswer(qId, val) {
    const vId = state.currentVariantId;
    if (val === null || val === undefined) {
      delete state.userAnswers[vId][qId];
    } else {
      state.userAnswers[vId][qId] = val;
    }
    saveState();
  }

  // --- SIDEBAR GRID RENDERING ---
  function renderSidebarGrid() {
    const v = getVariant();
    if (!v) return;

    const vId = state.currentVariantId;
    const grid1 = document.getElementById('gridBlock1');
    const grid2 = document.getElementById('gridBlock2');
    if (!grid1 || !grid2) return;

    grid1.innerHTML = '';
    grid2.innerHTML = '';

    let answeredCount = 0;
    let bookmarkCount = 0;

    v.questions.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'q-grid-btn';
      btn.textContent = q.id;

      const hasAnswer = isQuestionAnswered(vId, q);
      const isBookmarked = !!(state.bookmarks[vId] && state.bookmarks[vId][q.id]);
      const isActive = (q.id === state.currentQuestionId);

      if (hasAnswer) {
        btn.classList.add('answered');
        answeredCount++;
      }
      if (isBookmarked) {
        btn.classList.add('bookmarked');
        bookmarkCount++;
      }
      if (isActive) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        state.currentQuestionId = q.id;
        renderCurrentQuestion();
        renderSidebarGrid();
      });

      if (q.id <= 10) {
        grid1.appendChild(btn);
      } else {
        grid2.appendChild(btn);
      }
    });

    // Update progress stats
    const total = 50;
    const percent = Math.round((answeredCount / total) * 100);
    document.getElementById('progressBarFill').style.width = `${percent}%`;
    document.getElementById('statAnsweredCount').textContent = `${answeredCount} / ${total} (${percent}%)`;
    document.getElementById('statBookmarksCount').textContent = bookmarkCount;
  }

  function isQuestionAnswered(vId, q) {
    const ans = state.userAnswers[vId] && state.userAnswers[vId][q.id];
    if (!ans) return false;
    if (q.type === 'single') return typeof ans === 'string' && ans.length > 0;
    if (q.type === 'matching') return typeof ans === 'object' && (ans.A || ans.B);
    if (q.type === 'multiple') return Array.isArray(ans) && ans.length > 0;
    return false;
  }

  // --- SCORE CALCULATION ENGINE ---
  function calculateScore(vId) {
    const v = window.ENT_VARIANTS[vId];
    if (!v) return null;

    let totalPoints = 0; // max 60
    let totalQuestionsCorrect = 0; // max 50
    let mathLiteracyScore = 0; // max 10
    let profileMathScore = 0; // max 50 points (40 questions)
    let profileQuestionsCorrect = 0;

    const details = [];

    v.questions.forEach(q => {
      const userAns = state.userAnswers[vId] && state.userAnswers[vId][q.id];
      let earned = 0;
      let status = 'incorrect'; // 'correct', 'partial', 'incorrect', 'skipped'

      if (!userAns) {
        status = 'skipped';
        earned = 0;
      } else if (q.type === 'single') {
        if (userAns === q.correct_answer) {
          earned = 1;
          status = 'correct';
          totalQuestionsCorrect++;
          if (q.section === 'math_literacy') mathLiteracyScore += 1;
          else {
            profileMathScore += 1;
            profileQuestionsCorrect += 1;
          }
        } else {
          earned = 0;
          status = 'incorrect';
        }
      } else if (q.type === 'matching') {
        // Matching: 2 points if both A and B correct, 1 point if 1 correct
        const matchA = (userAns.A === q.correct_answer.A);
        const matchB = (userAns.B === q.correct_answer.B);

        if (matchA && matchB) {
          earned = 2;
          status = 'correct';
          totalQuestionsCorrect++;
          profileQuestionsCorrect++;
        } else if (matchA || matchB) {
          earned = 1;
          status = 'partial';
        } else {
          earned = 0;
          status = 'incorrect';
        }
        profileMathScore += earned;

      } else if (q.type === 'multiple') {
        // Multiple choice (1-3 answers out of 6)
        // 2 points: exact match
        // 1 point: 1 mistake
        // 0 points: 2+ mistakes
        const correctSet = new Set(q.correct_answer);
        const userSet = new Set(Array.isArray(userAns) ? userAns : []);

        let correctMatches = 0;
        let incorrectSelections = 0;

        userSet.forEach(item => {
          if (correctSet.has(item)) correctMatches++;
          else incorrectSelections++;
        });

        const missing = correctSet.size - correctMatches;
        const totalMistakes = incorrectSelections + missing;

        if (totalMistakes === 0) {
          earned = 2;
          status = 'correct';
          totalQuestionsCorrect++;
          profileQuestionsCorrect++;
        } else if (totalMistakes === 1) {
          earned = 1;
          status = 'partial';
        } else {
          earned = 0;
          status = 'incorrect';
        }
        profileMathScore += earned;
      }

      totalPoints += earned;

      details.push({
        id: q.id,
        q: q,
        userAnswer: userAns,
        correctAnswer: q.correct_answer,
        earned: earned,
        maxPoints: q.points,
        status: status,
        explanation: q.explanation
      });
    });

    const passed = (mathLiteracyScore >= 3 && profileMathScore >= 5);

    return {
      totalPoints, // out of 60
      totalQuestionsCorrect, // out of 50
      mathLiteracyScore, // out of 10
      profileMathScore, // out of 50
      profileQuestionsCorrect, // out of 40
      passed,
      details
    };
  }

  // --- RESULT SCREEN RENDERING ---
  function showResultsScreen() {
    const vId = state.currentVariantId;
    const res = calculateScore(vId);
    if (!res) return;

    document.getElementById('testingInterface').style.display = 'none';
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.className = 'results-container active';

    // Summary Score
    document.getElementById('resScoreNum').textContent = res.totalPoints;
    document.getElementById('resScoreMax').textContent = 'из 60 баллов';
    document.getElementById('resCorrectQuestions').textContent = `${res.totalQuestionsCorrect} из 50`;
    
    // Time spent
    const spentSec = TOTAL_TEST_TIME - state.timeRemaining[vId];
    const spentMin = Math.floor(spentSec / 60);
    const spentRemSec = spentSec % 60;
    document.getElementById('resTimeSpent').textContent = `${spentMin} мин ${spentRemSec} сек`;

    // Pass Pill
    const passPill = document.getElementById('resPassPill');
    if (res.passed) {
      passPill.className = 'pass-status-pill pass-passed';
      passPill.textContent = '✓ Пороговый балл преодолён';
    } else {
      passPill.className = 'pass-status-pill pass-failed';
      passPill.textContent = '✗ Пороговый балл не набран';
    }

    // Block Breakdown
    document.getElementById('resLiteracyScore').textContent = `${res.mathLiteracyScore} / 10`;
    document.getElementById('resProfileScore').textContent = `${res.profileMathScore} / 50 (${res.profileQuestionsCorrect}/40 заданий)`;

    renderResultQuestionsList(res.details);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderResultQuestionsList(details) {
    const listContainer = document.getElementById('reviewQuestionsList');
    listContainer.innerHTML = '';

    const filter = state.resultFilter;

    const filtered = details.filter(item => {
      if (filter === 'all') return true;
      if (filter === 'correct') return item.status === 'correct';
      if (filter === 'partial') return item.status === 'partial';
      if (filter === 'incorrect') return item.status === 'incorrect';
      if (filter === 'skipped') return item.status === 'skipped';
      return true;
    });

    filtered.forEach(item => {
      const q = item.q;
      const card = document.createElement('div');
      card.className = 'review-item-card';

      let statusBadgeHtml = '';
      if (item.status === 'correct') {
        statusBadgeHtml = `<span class="review-badge review-badge-correct">Верно (+${item.earned} б.)</span>`;
      } else if (item.status === 'partial') {
        statusBadgeHtml = `<span class="review-badge review-badge-partial">Частично (+1 из 2 б.)</span>`;
      } else if (item.status === 'incorrect') {
        statusBadgeHtml = `<span class="review-badge review-badge-incorrect">Неверно (0 б.)</span>`;
      } else {
        statusBadgeHtml = `<span class="review-badge review-badge-skipped">Пропущено (0 б.)</span>`;
      }

      // Format answers for display
      let userAnsFormatted = '—';
      let correctAnsFormatted = '';

      if (q.type === 'single') {
        userAnsFormatted = item.userAnswer || 'Не отвечено';
        correctAnsFormatted = item.correctAnswer;
      } else if (q.type === 'matching') {
        if (item.userAnswer) {
          userAnsFormatted = `А → ${item.userAnswer.A || '—'}, Б → ${item.userAnswer.B || '—'}`;
        } else {
          userAnsFormatted = 'Не отвечено';
        }
        correctAnsFormatted = `А → ${item.correctAnswer.A}, Б → ${item.correctAnswer.B}`;
      } else if (q.type === 'multiple') {
        if (Array.isArray(item.userAnswer) && item.userAnswer.length > 0) {
          userAnsFormatted = item.userAnswer.sort().join(', ');
        } else {
          userAnsFormatted = 'Не отвечено';
        }
        correctAnsFormatted = item.correctAnswer.sort().join(', ');
      }

      card.innerHTML = `
        <div class="review-item-header">
          <span class="review-q-num">№ ${q.id}. ${q.section === 'math_literacy' ? 'Матграмотность' : 'Профильная математика'}</span>
          ${statusBadgeHtml}
        </div>
        <div class="question-text" style="font-size: 15px; margin-bottom: 10px;">${q.text}</div>
        
        <div class="review-answers-box">
          <div class="ans-row">
            <strong>Ваш ответ:</strong>
            <span class="${item.status === 'correct' ? 'ans-val-user-correct' : (item.status === 'skipped' ? '' : 'ans-val-user-wrong')}">${userAnsFormatted}</span>
          </div>
          <div class="ans-row">
            <strong>Правильный ответ:</strong>
            <span class="ans-val-correct">${correctAnsFormatted}</span>
          </div>
        </div>

        <button class="btn-toggle-solution" data-qid="${q.id}">
          <span>📖 Показать подробное пошаговое решение</span>
        </button>

        <div class="solution-box" id="sol_${q.id}">
          <strong style="color: #6b21a8; display: block; margin-bottom: 6px;">💡 Пошаговое обоснование:</strong>
          <div>${item.explanation.replace(/\n/g, '<br>')}</div>
        </div>
      `;

      // Toggle solution
      card.querySelector('.btn-toggle-solution').addEventListener('click', (e) => {
        const solBox = card.querySelector(`#sol_${q.id}`);
        solBox.classList.toggle('open');
        const btn = e.currentTarget;
        if (solBox.classList.contains('open')) {
          btn.innerHTML = '<span>✕ Скрыть решение</span>';
          renderMath(solBox);
        } else {
          btn.innerHTML = '<span>📖 Показать подробное пошаговое решение</span>';
        }
      });

      listContainer.appendChild(card);
    });

    renderMath(listContainer);
  }

  // --- FINISH TEST CONFIRMATION ---
  function openFinishConfirmationModal() {
    const vId = state.currentVariantId;
    const v = getVariant();
    if (!v) return;

    let answered = 0;
    let bookmarks = 0;

    v.questions.forEach(q => {
      if (isQuestionAnswered(vId, q)) answered++;
      if (state.bookmarks[vId] && state.bookmarks[vId][q.id]) bookmarks++;
    });

    const unanswered = 50 - answered;

    document.getElementById('modalStatAnswered').textContent = answered;
    document.getElementById('modalStatUnanswered').textContent = unanswered;
    document.getElementById('modalStatBookmarked').textContent = bookmarks;

    document.getElementById('finishModalBackdrop').classList.add('active');
  }

  function finishTest(force = false) {
    const vId = state.currentVariantId;
    state.isFinished[vId] = true;
    saveState();
    document.getElementById('finishModalBackdrop').classList.remove('active');
    showResultsScreen();
  }

  // --- RESET ATTEMPT ---
  function resetCurrentAttempt() {
    if (!confirm(`Вы действительно хотите сбросить все ответы для Варианта ${state.currentVariantId}?`)) {
      return;
    }
    const vId = state.currentVariantId;
    state.userAnswers[vId] = {};
    state.bookmarks[vId] = {};
    state.timeRemaining[vId] = TOTAL_TEST_TIME;
    state.isFinished[vId] = false;
    state.currentQuestionId = 1;
    saveState();

    document.getElementById('resultsContainer').className = 'results-container';
    document.getElementById('testingInterface').style.display = 'grid';

    startTimer();
    renderCurrentQuestion();
    renderSidebarGrid();
  }

  // --- CALCULATOR IMPLEMENTATION ---
  let calcExpr = '';
  let calcAngleMode = 'DEG'; // DEG or RAD

  function initCalculator() {
    const calcWindow = document.getElementById('floatingCalc');
    const toggleBtn = document.getElementById('btnToggleCalc');
    const closeBtn = document.getElementById('btnCloseCalc');

    if (!calcWindow || !toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      calcWindow.classList.toggle('open');
    });

    closeBtn.addEventListener('click', () => {
      calcWindow.classList.remove('open');
    });

    // Angle mode switcher
    document.getElementById('btnDeg').addEventListener('click', () => {
      calcAngleMode = 'DEG';
      document.getElementById('btnDeg').classList.add('active');
      document.getElementById('btnRad').classList.remove('active');
    });

    document.getElementById('btnRad').addEventListener('click', () => {
      calcAngleMode = 'RAD';
      document.getElementById('btnRad').classList.add('active');
      document.getElementById('btnDeg').classList.remove('active');
    });

    // Draggable header
    const header = document.getElementById('calcHeader');
    let isDragging = false;
    let startX, startY, initialX, initialY;

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = calcWindow.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      calcWindow.style.bottom = 'auto';
      calcWindow.style.right = 'auto';
      calcWindow.style.left = `${initialX}px`;
      calcWindow.style.top = `${initialY}px`;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      calcWindow.style.left = `${Math.max(10, Math.min(window.innerWidth - 340, initialX + dx))}px`;
      calcWindow.style.top = `${Math.max(10, Math.min(window.innerHeight - 380, initialY + dy))}px`;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Buttons actions
    const currScreen = document.getElementById('calcCurrVal');
    const prevScreen = document.getElementById('calcPrevExpr');

    calcWindow.querySelectorAll('.btn-calc').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const val = btn.getAttribute('data-val');

        if (val) {
          calcExpr += val;
          currScreen.textContent = calcExpr;
        } else if (action === 'clear') {
          calcExpr = '';
          currScreen.textContent = '0';
          prevScreen.textContent = '';
        } else if (action === 'backspace') {
          calcExpr = calcExpr.slice(0, -1);
          currScreen.textContent = calcExpr || '0';
        } else if (action === 'eval') {
          try {
            prevScreen.textContent = calcExpr + ' =';
            let sanitized = calcExpr
              .replace(/×/g, '*')
              .replace(/÷/g, '/')
              .replace(/\^/g, '**');
            
            // eslint-disable-next-line no-eval
            let res = Function('"use strict";return (' + sanitized + ')')();
            if (typeof res === 'number') {
              res = Math.round(res * 100000000) / 100000000;
            }
            currScreen.textContent = res;
            calcExpr = String(res);
          } catch (e) {
            currScreen.textContent = 'Ошибка';
            calcExpr = '';
          }
        } else if (action === 'sqrt') {
          try {
            let num = parseFloat(calcExpr || '0');
            let res = Math.sqrt(num);
            prevScreen.textContent = `√(${num}) =`;
            currScreen.textContent = res;
            calcExpr = String(res);
          } catch (e) { currScreen.textContent = 'Ошибка'; }
        } else if (action === 'sin' || action === 'cos' || action === 'tan') {
          try {
            let num = parseFloat(calcExpr || '0');
            let rad = (calcAngleMode === 'DEG') ? (num * Math.PI / 180) : num;
            let res = 0;
            if (action === 'sin') res = Math.sin(rad);
            if (action === 'cos') res = Math.cos(rad);
            if (action === 'tan') res = Math.tan(rad);
            res = Math.round(res * 100000000) / 100000000;
            prevScreen.textContent = `${action}(${num}) =`;
            currScreen.textContent = res;
            calcExpr = String(res);
          } catch (e) { currScreen.textContent = 'Ошибка'; }
        } else if (action === 'log') {
          try {
            let num = parseFloat(calcExpr || '0');
            let res = Math.log10(num);
            prevScreen.textContent = `log(${num}) =`;
            currScreen.textContent = res;
            calcExpr = String(res);
          } catch (e) { currScreen.textContent = 'Ошибка'; }
        } else if (action === 'ln') {
          try {
            let num = parseFloat(calcExpr || '0');
            let res = Math.log(num);
            prevScreen.textContent = `ln(${num}) =`;
            currScreen.textContent = res;
            calcExpr = String(res);
          } catch (e) { currScreen.textContent = 'Ошибка'; }
        }
      });
    });
  }

  // --- FORMULA HANDBOOK IMPLEMENTATION ---
  function initFormulaModal() {
    const modalBackdrop = document.getElementById('formulaModalBackdrop');
    const openBtn = document.getElementById('btnToggleFormulas');
    const closeBtn = document.getElementById('btnCloseFormulas');
    const searchInput = document.getElementById('formulaSearchInput');
    const container = document.getElementById('formulaListContainer');

    if (!modalBackdrop || !openBtn) return;

    let activeCategory = 'all';

    function renderFormulas() {
      const query = (searchInput.value || '').toLowerCase().trim();
      container.innerHTML = '';

      const filtered = FORMULAS_DATA.filter(f => {
        const matchesCat = (activeCategory === 'all' || f.category === activeCategory);
        const matchesQuery = (!query || f.title.toLowerCase().includes(query) || f.content.toLowerCase().includes(query));
        return matchesCat && matchesQuery;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">Формулы не найдены</div>';
        return;
      }

      filtered.forEach(f => {
        const card = document.createElement('div');
        card.className = 'formula-card';
        card.innerHTML = `
          <div class="formula-card-title">${f.title}</div>
          <div class="formula-card-content">${f.content}</div>
        `;
        container.appendChild(card);
      });

      renderMath(container);
    }

    openBtn.addEventListener('click', () => {
      modalBackdrop.classList.add('active');
      renderFormulas();
    });

    closeBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) modalBackdrop.classList.remove('active');
    });

    searchInput.addEventListener('input', renderFormulas);

    document.querySelectorAll('.formula-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.formula-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-cat');
        renderFormulas();
      });
    });
  }

  // --- INITIALIZATION ---
  function init() {
    loadState();

    // Check if current variant is already finished
    if (state.isFinished[state.currentVariantId]) {
      showResultsScreen();
    } else {
      startTimer();
      renderCurrentQuestion();
      renderSidebarGrid();
    }

    // Variant pills
    document.querySelectorAll('.variant-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const newVId = parseInt(pill.getAttribute('data-variant'), 10);
        if (state.currentVariantId === newVId) return;

        state.currentVariantId = newVId;
        state.currentQuestionId = 1;
        saveState();

        document.querySelectorAll('.variant-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        if (state.isFinished[newVId]) {
          showResultsScreen();
        } else {
          document.getElementById('resultsContainer').className = 'results-container';
          document.getElementById('testingInterface').style.display = 'grid';
          startTimer();
          renderCurrentQuestion();
          renderSidebarGrid();
        }
      });
    });

    // Font size controls
    document.getElementById('btnFontSmaller').addEventListener('click', () => {
      if (state.fontSize > 14) {
        state.fontSize -= 1.5;
        renderCurrentQuestion();
        saveState();
      }
    });

    document.getElementById('btnFontBigger').addEventListener('click', () => {
      if (state.fontSize < 24) {
        state.fontSize += 1.5;
        renderCurrentQuestion();
        saveState();
      }
    });

    // Bookmark toggle
    document.getElementById('btnBookmarkToggle').addEventListener('click', () => {
      const vId = state.currentVariantId;
      const qId = state.currentQuestionId;
      if (!state.bookmarks[vId]) state.bookmarks[vId] = {};
      state.bookmarks[vId][qId] = !state.bookmarks[vId][qId];
      saveState();
      renderCurrentQuestion();
      renderSidebarGrid();
    });

    // Clear answer
    document.getElementById('btnClearAnswer').addEventListener('click', () => {
      saveUserAnswer(state.currentQuestionId, null);
      renderCurrentQuestion();
      renderSidebarGrid();
    });

    // Prev / Next Question
    document.getElementById('btnNavPrev').addEventListener('click', () => {
      if (state.currentQuestionId > 1) {
        state.currentQuestionId--;
        renderCurrentQuestion();
        renderSidebarGrid();
      }
    });

    document.getElementById('btnNavNext').addEventListener('click', () => {
      if (state.currentQuestionId < 50) {
        state.currentQuestionId++;
        renderCurrentQuestion();
        renderSidebarGrid();
      } else {
        openFinishConfirmationModal();
      }
    });

    // Header finish button
    document.getElementById('btnFinishTest').addEventListener('click', () => {
      openFinishConfirmationModal();
    });

    // Finish modal buttons
    document.getElementById('btnCancelFinish').addEventListener('click', () => {
      document.getElementById('finishModalBackdrop').classList.remove('active');
    });

    document.getElementById('btnConfirmFinish').addEventListener('click', () => {
      finishTest();
    });

    // Reset attempt button
    document.getElementById('btnResetAttempt').addEventListener('click', resetCurrentAttempt);

    // Results Actions
    document.getElementById('btnRetryVariant').addEventListener('click', resetCurrentAttempt);
    
    document.getElementById('btnNextVariant').addEventListener('click', () => {
      const nextVId = (state.currentVariantId % 3) + 1;
      const targetPill = document.querySelector(`.variant-pill[data-variant="${nextVId}"]`);
      if (targetPill) targetPill.click();
    });

    document.getElementById('btnPrintResults').addEventListener('click', () => {
      window.print();
    });

    // Results filter buttons
    document.querySelectorAll('.filter-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.resultFilter = btn.getAttribute('data-filter');
        const res = calculateScore(state.currentVariantId);
        if (res) renderResultQuestionsList(res.details);
      });
    });

    // Init popups
    initCalculator();
    initFormulaModal();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
