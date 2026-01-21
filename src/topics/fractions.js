export default {
  render: (container) => {
    container.innerHTML = `
      <h2>Fractions</h2>
      
      <section class="explanation">
        <div class="card">
          <h3>🍕 What is a Fraction?</h3>
          <p>A fraction represents a <strong>part</strong> of a <strong>whole</strong> object or set of objects.</p>
          <p>The top number (<strong>Numerator</strong>) says how many parts we have.</p>
          <p>The bottom number (<strong>Denominator</strong>) says how many parts make up a whole.</p>
        </div>
      </section>

      <section class="interactive-tool">
        <h3>🎨 Visualize Fractions</h3>
        <div class="fraction-container">
          <div class="controls">
            <label>Numerator: <input type="range" id="num-slider" min="0" max="10" value="1"></label>
            <span id="num-val">1</span>
            <br>
            <label>Denominator: <input type="range" id="den-slider" min="1" max="12" value="4"></label>
            <span id="den-val">4</span>
          </div>
          
          <h2 id="fraction-display" style="font-family: 'Courier New', monospace; font-size: 3rem;">1/4</h2>
          
          <div class="pie-chart" id="pie-viz"></div>
          
          <div id="bar-viz" style="margin-top: 20px; width: 200px; height: 50px; border: 2px solid #333; display: flex;">
            <!-- bars injected here -->
          </div>
        </div>
      </section>

      <section class="quiz-section">
        <h3>❓ Quiz Time</h3>
        <div id="quiz-container">
          <button id="start-fraction-quiz" class="btn btn-secondary">Start Quiz</button>
        </div>
      </section>
    `;

    const numSlider = container.querySelector('#num-slider');
    const denSlider = container.querySelector('#den-slider');
    const numVal = container.querySelector('#num-val');
    const denVal = container.querySelector('#den-val');
    const display = container.querySelector('#fraction-display');
    const pieViz = container.querySelector('#pie-viz');
    const barViz = container.querySelector('#bar-viz');

    function updateFraction() {
      let n = parseInt(numSlider.value);
      let d = parseInt(denSlider.value);

      // Start Constraint Logic
      // Ensure numerator max follows denominator
      numSlider.max = d;

      // If n > d, clamp it
      if (n > d) {
        n = d;
        numSlider.value = n;
      }
      // End Constraint Logic

      numVal.textContent = n;
      denVal.textContent = d;
      display.textContent = `${n}/${d}`;

      const percentage = (n / d) * 100;
      pieViz.style.background = `conic-gradient(var(--accent-color) 0% ${percentage}%, #ddd ${percentage}% 100%)`;

      // Bar Viz
      barViz.innerHTML = '';
      for (let i = 0; i < d; i++) {
        const part = document.createElement('div');
        part.style.flex = '1';
        part.style.borderRight = i < d - 1 ? '1px solid #333' : 'none';
        part.style.backgroundColor = i < n ? 'var(--secondary-color)' : 'transparent';
        barViz.appendChild(part);
      }
    }

    numSlider.addEventListener('input', updateFraction);
    denSlider.addEventListener('input', updateFraction);

    // Init
    updateFraction();

    // Quiz Internal
    const startBtn = container.querySelector('#start-fraction-quiz');
    const quizDiv = container.querySelector('#quiz-container');

    startBtn.addEventListener('click', () => {
      runQuiz(quizDiv);
    });

    function createPieSVG(n, d) {
      const r = 50;
      const cx = 50, cy = 50;
      // Helper to get coordinates
      const getCoords = (percent) => {
        const angle = 2 * Math.PI * percent - Math.PI / 2; // start at top
        return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
      };

      let svg = `<svg width="150" height="150" viewBox="0 0 100 100" style="margin: 0 auto; display: block; overflow: visible;">`;

      // 1. Background (Total Slices)
      // We draw the full circle as background
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#eee" stroke="#333" stroke-width="2" />`;

      // 2. Filled Sector (Numerator)
      if (n === d) {
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--primary-color)" stroke="#333" stroke-width="2" />`;
      } else if (n > 0) {
        const [x, y] = getCoords(n / d);
        // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
        const largeArc = n / d > 0.5 ? 1 : 0;
        // Move to center, Line to top, Arc to coords, Close (back to center)
        const path = `M ${cx} ${cy} L 50 0 A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} Z`;
        svg += `<path d="${path}" fill="var(--primary-color)" />`;
      }

      // 3. Slice Lines (Denominator)
      for (let i = 0; i < d; i++) {
        const [x, y] = getCoords(i / d);
        svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#333" stroke-width="1" />`;
      }

      // Outer Border again to be clean
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#333" stroke-width="2" />`;
      svg += `</svg>`;
      return svg;
    }

    function runQuiz(box) {
      // Simple Question: "Identify the fraction"
      const num = Math.floor(Math.random() * 3) + 1; // 1 to 3
      const den = Math.floor(Math.random() * 3) + 4; // 4 to 6

      const svgChart = createPieSVG(num, den);

      box.innerHTML = `
            <p>What fraction is shown below?</p>
            ${svgChart}
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                <button class="choice-btn btn" data-val="${num}/${den}">${num}/${den}</button>
                <button class="choice-btn btn" data-val="${num + 1}/${den}">${num + 1}/${den}</button>
                <button class="choice-btn btn" data-val="${num}/${den + 1}">${num}/${den + 1}</button>
            </div>
            <p id="f-feedback" style="min-height: 1.5em; font-weight: bold; margin-top: 10px;"></p>
            <button id="f-next" class="btn btn-secondary" style="display:none; margin-top:10px;">Next</button>
        `;

      // Shuffle buttons (simple append sort)
      const btns = Array.from(box.querySelectorAll('.choice-btn'));
      btns.sort(() => Math.random() - 0.5);
      btns.forEach(b => box.querySelector('div[style*="gap"]').appendChild(b));

      const feedback = box.querySelector('#f-feedback');
      const next = box.querySelector('#f-next');

      btns.forEach(b => {
        b.addEventListener('click', () => {
          if (b.dataset.val === `${num}/${den}`) {
            feedback.textContent = "✅ Correct! Great job.";
            feedback.style.color = "var(--primary-color)";
          } else {
            feedback.textContent = `❌ Not quite. Count the colored parts! (${num}/${den})`;
            feedback.style.color = "red";
          }
          next.style.display = 'block';
        });
      });

      next.addEventListener('click', () => runQuiz(box));
    }
  }
}
