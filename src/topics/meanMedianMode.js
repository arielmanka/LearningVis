export default {
  render: (container) => {
    container.innerHTML = `
      <h2>Mean, Median, and Mode</h2>
      
      <section class="explanation">
        <div class="card">
          <h3>📚 What are they?</h3>
          <p><strong>Mean (Average):</strong> Add all the numbers up and divide by how many there are. It's like sharing equally! <br><em>(Watch the green line level out!)</em></p>
          <p><strong>Median (Middle):</strong> The number in the exact middle when you line them up from smallest to biggest.</p>
          <p><strong>Mode (Most Popular):</strong> The number that appears the most times.</p>
        </div>
      </section>

      <section class="interactive-tool">
        <h3>🧪 Try it yourself!</h3>
        <p><strong>Drag the orange bars up and down</strong> to change the numbers. Watch the Mean (Green Line) move!</p>
        <button id="gen-btn" class="btn btn-primary">Randomize Numbers</button>
        
        <div class="stats-display" style="display: none;" id="stats-panel">
          <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px;">
            <div class="stat-box">Mean: <span id="val-mean"></span></div>
            <div class="stat-box">Median: <span id="val-median"></span></div>
            <div class="stat-box">Mode: <span id="val-mode"></span></div>
          </div>
          
          <div id="viz-container">
            <!-- Bars & Mean Line injected here -->
          </div>
        </div>
      </section>

      <section class="quiz-section">
        <h3>❓ Quiz Time</h3>
        <div id="quiz-container">
          <p>Click "Start Quiz" to test your knowledge!</p>
          <button id="start-quiz-btn" class="btn btn-secondary">Start Quiz</button>
        </div>
      </section>
    `;

    // State
    let numbers = [];
    const MAX_VAL = 20;

    // Elements
    const genBtn = container.querySelector('#gen-btn');
    const statsPanel = container.querySelector('#stats-panel');
    const valMean = container.querySelector('#val-mean');
    const valMedian = container.querySelector('#val-median');
    const valMode = container.querySelector('#val-mode');
    const vizContainer = container.querySelector('#viz-container');
    const startQuizBtn = container.querySelector('#start-quiz-btn');
    const quizContainer = container.querySelector('#quiz-container');

    // Drag State
    let isDragging = false;
    let dragIndex = -1;

    // Initial Event Listeners
    genBtn.addEventListener('click', () => {
      const count = Math.floor(Math.random() * 4) + 4; // 4 to 7 numbers
      numbers = Array.from({ length: count }, () => Math.floor(Math.random() * 15) + 2); // 2-17 range
      renderViz();
    });

    startQuizBtn.addEventListener('click', () => {
      startQuiz(quizContainer);
    });

    // Global Drag Handlers (attached to window to handle fast movements/off-element)
    // We bind these once or handle cleanup? In a pure SPA we might need cleanup. 
    // For simplicity, we'll add them to the document but check context or remove on destroy if we had a destroy hook.
    // Since this is a simple module, we will add them to the container or safely document.
    // A clearer way for this scope:
    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const rect = vizContainer.getBoundingClientRect();
      const bottomY = rect.bottom;
      const topY = rect.top;
      const height = rect.height;

      // Calculate mouse Y relative to bottom
      let relativeY = bottomY - e.clientY;

      // Clamp
      if (relativeY < 0) relativeY = 0;
      if (relativeY > height) relativeY = height;

      // Convert to Value (height mapped to MAX_VAL)
      // Visual height of container = 300px roughly (350 - padding). 
      // Let's say max val 20 = 100% height? No, allow some headroom. 
      // Let's map 0-20 to 0-300px.
      const pxPerUnit = (height - 50) / MAX_VAL;
      let newVal = Math.round(relativeY / pxPerUnit);
      if (newVal > MAX_VAL) newVal = MAX_VAL;

      if (numbers[dragIndex] !== newVal) {
        numbers[dragIndex] = newVal;
        updateStats(); // Update numbers/mean line immediately
        updateBarVisuals(); // Move the bar
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      dragIndex = -1;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Initial Data
    numbers = [5, 10, 8, 12, 5];
    renderViz();

    function renderViz() {
      statsPanel.style.display = 'block';
      vizContainer.innerHTML = ''; // Clear

      // Create Bars
      numbers.forEach((n, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'bar-wrapper';
        wrapper.dataset.index = idx;

        const valueLabel = document.createElement('div');
        valueLabel.className = 'bar-value';
        valueLabel.textContent = n;

        const bar = document.createElement('div');
        bar.className = 'bar';

        wrapper.appendChild(valueLabel);
        wrapper.appendChild(bar);
        vizContainer.appendChild(wrapper);

        // Individual Drag Start
        wrapper.addEventListener('mousedown', (e) => {
          isDragging = true;
          dragIndex = idx;
          document.body.style.cursor = 'ns-resize';
        });
      });

      // Create Mean Line
      const meanLine = document.createElement('div');
      meanLine.className = 'mean-line';
      meanLine.id = 'mean-line';

      const meanLabel = document.createElement('div');
      meanLabel.className = 'mean-label';
      meanLabel.id = 'mean-label';
      meanLine.appendChild(meanLabel);

      vizContainer.appendChild(meanLine);

      updateStats();
      updateBarVisuals();
    }

    function calculateStats() {
      // Sort for median
      const sorted = [...numbers].sort((a, b) => a - b);

      // Calculate Mean
      const sum = numbers.reduce((a, b) => a + b, 0);
      const mean = (sum / numbers.length); // Keep precision for line

      // Calculate Median
      let median;
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 0) {
        median = ((sorted[mid - 1] + sorted[mid]) / 2);
      } else {
        median = sorted[mid];
      }

      // Calculate Mode
      const freq = {};
      let maxFreq = 0;
      let modes = [];
      numbers.forEach(n => {
        freq[n] = (freq[n] || 0) + 1;
        if (freq[n] > maxFreq) maxFreq = freq[n];
      });
      if (maxFreq > 1) {
        for (let n in freq) {
          if (freq[n] === maxFreq) modes.push(Number(n));
        }
      } else {
        modes = [];
      }

      return { mean, median, modes, sorted };
    }

    function updateStats() {
      const { mean, median, modes } = calculateStats();

      // Update Text
      valMean.textContent = mean.toFixed(1);
      valMedian.textContent = median.toFixed(1);
      valMode.textContent = modes.length > 0 ? modes.join(', ') : 'None';

      // Update Mean Line Position
      // Reuse scale logic: (Height - 50) / MAX_VAL = pxPerUnit
      const rect = vizContainer.getBoundingClientRect(); // Might be 0 if hidden, but it is shown.
      const pxPerUnit = (350 - 50) / MAX_VAL; // Hardcoded based on CSS height to allow stability
      const bottomPx = mean * pxPerUnit;

      const line = vizContainer.querySelector('#mean-line');
      const label = vizContainer.querySelector('#mean-label');
      if (line) {
        line.style.bottom = `${bottomPx}px`;
        label.textContent = `Mean: ${mean.toFixed(1)}`;
      }
    }

    function updateBarVisuals() {
      const wrappers = vizContainer.querySelectorAll('.bar-wrapper');
      const pxPerUnit = (350 - 50) / MAX_VAL;

      wrappers.forEach((el, idx) => {
        const val = numbers[idx];
        const bar = el.querySelector('.bar');
        const label = el.querySelector('.bar-value');

        if (bar) bar.style.height = `${val * pxPerUnit}px`;
        if (label) label.textContent = val;
      });
    }

    // --- Quiz Logic Reused (Simplified) ---
    function startQuiz(container) {
      // (Similar to previous, but maybe less complex for now to focus on viz)
      const qNums = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
      const sortedQ = [...qNums].sort((a, b) => a - b);
      const median = sortedQ[2];

      container.innerHTML = `
        <div class="quiz-card">
          <p><strong>Numbers:</strong> ${qNums.join(', ')}</p>
          <p>What is the <strong>Median</strong>?</p>
          <input type="number" id="quiz-input" placeholder="Answer">
          <button id="quiz-submit" class="btn btn-primary">Submit</button>
          <p id="quiz-feedback"></p>
          <button id="next-q" class="btn btn-secondary" style="margin-top:10px; display:none;">Next Question</button>
        </div>
      `;

      const submit = container.querySelector('#quiz-submit');
      const input = container.querySelector('#quiz-input');
      const feedback = container.querySelector('#quiz-feedback');
      const nextBtn = container.querySelector('#next-q');

      submit.addEventListener('click', () => {
        if (parseInt(input.value) === median) {
          feedback.textContent = "✅ Correct! Great job.";
          feedback.style.color = "green";
        } else {
          feedback.textContent = `❌ Oops! The median is the middle number when sorted: ${sortedQ.join(', ')}. So it is ${median}.`;
          feedback.style.color = "red";
        }
        nextBtn.style.display = 'inline-block';
      });

      nextBtn.addEventListener('click', () => startQuiz(container));
    }

    // Return cleanup function
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }
}
