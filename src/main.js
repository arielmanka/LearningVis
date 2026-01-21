import './style.css'

const contentDiv = document.querySelector('#content');
const buttons = document.querySelectorAll('.nav-links button');

// Topic Loaders
const topics = {
  welcome: async () => {
    return {
      render: (container) => {
        container.innerHTML = `
          <h2>Welcome to Math Viz!</h2>
          <p>This is a fun place to learn math concepts.</p>
          <p>👈 Choose a topic from the sidebar to get started!</p>
          <div style="text-align: center; margin-top: 2rem;">
            <span style="font-size: 5rem;">🎓</span>
          </div>
        `;
      }
    };
  },
  'mean-mode-median': () => import('./topics/meanMedianMode.js'),
  'fractions': () => import('./topics/fractions.js'),
};

// Cleanup Tracker
let currentCleanup = null;

async function loadTopic(topicName) {
  // Clear Active Class
  buttons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`button[data-topic="${topicName}"]`)?.classList.add('active');

  // Cleanup Previous Topic
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  // Clear Content
  contentDiv.innerHTML = '<p>Loading...</p>';

  try {
    const moduleImport = await topics[topicName]();
    // Handle both default export or named export, assuming module returns an object with render(container)
    const module = moduleImport.default || moduleImport;

    contentDiv.innerHTML = ''; // clear loading
    if (module.render) {
      const result = module.render(contentDiv);
      if (typeof result === 'function') {
        currentCleanup = result;
      }
    } else {
      contentDiv.innerHTML = '<p>Error: Module has no render function.</p>';
    }
  } catch (err) {
    console.error(err);
    contentDiv.innerHTML = `<p>Error loading topic: ${err.message}</p>`;
  }
}

// Event Listeners
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const topic = btn.getAttribute('data-topic');
    loadTopic(topic);
  });
});

// Initial Load
loadTopic('welcome');
