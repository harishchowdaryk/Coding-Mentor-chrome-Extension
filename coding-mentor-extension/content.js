// Coding Mentor Content Script
class CodingMentor {
  constructor() {
    this.currentPlatform = this.detectPlatform();
    this.problemData = null;
    this.userProgress = {
      hintsUsed: 0,
      timeSpent: 0,
      attempts: 0
    };
    this.hints = [];
    this.isMinimized = false;
    this.startTime = Date.now();
    this.widgetInitialized = false;

    // Start initialization process
    this.init();
  }

  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('leetcode.com')) return 'leetcode';
    if (hostname.includes('codeforces.com')) return 'codeforces';
    if (hostname.includes('hackerrank.com')) return 'hackerrank';
    return 'unknown';
  }

  async init() {
    console.log("Coding Mentor: Initializing...");
    
    // First, create a basic widget to show a loading state
    this.createWidgetShell();

    try {
      // Wait for page to be fully loaded
      await this.waitForPageLoad();
      
      // Attempt to extract problem data
      this.problemData = await this.extractProblemData();

      // Check if problem data was successfully extracted
      if (this.problemData && this.problemData.title && this.problemData.description) {
        console.log("Coding Mentor: Problem data found.", this.problemData.title);
        // Populate the widget with problem-specific content
        this.updateWidgetForProblem();
        // Generate hints based on the problem
        await this.generateHints();
        // Set up event listeners for the interactive elements
        this.setupEventListeners();
        // Start tracking user activity
        this.startBehaviorTracking();
      } else {
        console.log("Coding Mentor: Could not detect problem on this page.");
        this.updateWidgetForFailure();
      }
    } catch (error) {
      console.error('Coding Mentor: An error occurred during initialization.', error);
      this.updateWidgetForFailure();
    }
  }

  waitForPageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  }

  async extractProblemData() {
    let problemData = {};
    try {
      switch (this.currentPlatform) {
        case 'leetcode':
          problemData = this.extractLeetCodeData();
          break;
        case 'codeforces':
          problemData = this.extractCodeforcesData();
          break;
        case 'hackerrank':
          problemData = this.extractHackerRankData();
          break;
      }
    } catch (error) {
      console.error('Error extracting problem data:', error);
    }
    return problemData;
  }

  extractLeetCodeData() {
    // New, more robust selectors for modern LeetCode UI
    const titleElement = document.querySelector('a.hover\\:text-blue-s') ||
                         document.querySelector('[data-cy="question-title"]') ||
                         document.querySelector('div.flex-col > div.flex.items-start > div.flex.items-start > div.flex.items-start > div > div > a.text-title-large');

    const descriptionElement = document.querySelector('[data-track-load="description_content"]') ||
                               document.querySelector('.content__u3I1') ||
                               document.querySelector('.question-content');

    const tagsElements = document.querySelectorAll('[class*="tag"]') ||
                         document.querySelectorAll('.topic-tag');

    const difficultyElement = document.querySelector('[diff]') ||
                              document.querySelector('.difficulty');

    return {
      title: titleElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      tags: Array.from(tagsElements).map(el => el.textContent.trim()),
      difficulty: difficultyElement?.textContent?.trim() || '',
      platform: 'LeetCode'
    };
  }

  extractCodeforcesData() {
    const titleElement = document.querySelector('.title') ||
                         document.querySelector('.problem-statement .header .title');

    const descriptionElement = document.querySelector('.problem-statement');

    const tagsElements = document.querySelectorAll('.tag-box');

    return {
      title: titleElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      tags: Array.from(tagsElements).map(el => el.textContent.trim()),
      difficulty: '',
      platform: 'Codeforces'
    };
  }

  extractHackerRankData() {
    const titleElement = document.querySelector('.ui-icon-label') ||
                         document.querySelector('.challenge-name');

    const descriptionElement = document.querySelector('.challenge-body') ||
                               document.querySelector('.problem-statement');

    const difficultyElement = document.querySelector('.difficulty');

    return {
      title: titleElement?.textContent?.trim() || '',
      description: descriptionElement?.textContent?.trim() || '',
      tags: [],
      difficulty: difficultyElement?.textContent?.trim() || '',
      platform: 'HackerRank'
    };
  }

  createWidgetShell() {
    if (this.widgetInitialized) return;
    const existingWidget = document.getElementById('coding-mentor-widget');
    if (existingWidget) {
      existingWidget.remove();
    }
    const widget = document.createElement('div');
    widget.id = 'coding-mentor-widget';
    widget.className = 'coding-mentor-widget';
    widget.innerHTML = `
      <div class="mentor-header">
        <h3 class="mentor-title">🧠 Coding Mentor</h3>
        <button class="mentor-toggle">−</button>
      </div>
      <div class="mentor-content">
        <div class="mentor-status">
          <div class="status-indicator loading" style="background: var(--mentor-warning);"></div>
          <span>Loading...</span>
        </div>
        <p style="font-size: 14px; margin-top: 12px; color: var(--mentor-text-muted);">
          Please wait while your mentor analyzes the problem.
        </p>
      </div>
    `;
    document.body.appendChild(widget);
    this.widgetInitialized = true;
  }

  updateWidgetForProblem() {
    const content = document.querySelector('.coding-mentor-widget .mentor-content');
    content.innerHTML = `
      <div class="mentor-status">
        <div class="status-indicator" style="background: var(--mentor-success);"></div>
        <span>Analyzing problem: ${this.problemData?.title || 'Unknown'}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: 0%"></div>
      </div>
      <div class="gamification-stats">
        <div class="stat-card">
          <div class="stat-value" id="hints-used">0</div>
          <div class="stat-label">Hints Used</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" id="time-spent">0m</div>
          <div class="stat-label">Time Spent</div>
        </div>
      </div>
      <div id="hints-container">
        <div class="hint-section">
          <div class="hint-level">
            <span class="hint-badge locked">Hint 1</span>
            <span>Problem Understanding</span>
          </div>
          <div class="hint-content locked">
            Click "Get First Hint" to start your guided journey
          </div>
        </div>
      </div>
      <div class="mentor-actions">
        <button class="mentor-button" id="get-hint-btn">
          Get First Hint
        </button>
        <button class="mentor-button secondary" id="settings-btn">
          Settings
        </button>
      </div>
      <div class="qa-section">
        <div class="qa-title">Ask Your Mentor</div>
        <input type="text" class="mentor-input" id="mentor-question"
               placeholder="e.g., Why is my solution O(n²)?"
               onkeypress="if(event.key==='Enter') codingMentor.askQuestion()">
        <button class="mentor-button" id="ask-question-btn">
          Ask Question
        </button>
        <div id="mentor-response"></div>
      </div>
    `;
  }

  updateWidgetForFailure() {
    const content = document.querySelector('.coding-mentor-widget .mentor-content');
    content.innerHTML = `
      <div class="mentor-status">
        <div class="status-indicator" style="background: var(--mentor-warning);"></div>
        <span>Problem not detected on this page.</span>
      </div>
      <p style="font-size: 14px; margin-top: 12px; color: var(--mentor-text-muted);">
        The mentor widget is active but could not find a problem statement on this page. Please navigate to a valid problem URL on LeetCode, Codeforces, or HackerRank.
      </p>
    `;
  }

  setupEventListeners() {
    // Header toggle
    const header = document.querySelector('.mentor-header');
    if (header) {
      header.addEventListener('click', () => this.toggleWidget());
    }

    // Get First Hint button
    const getHintButton = document.getElementById('get-hint-btn');
    if (getHintButton) {
      getHintButton.addEventListener('click', () => this.getNextHint());
    }

    // Ask Question button
    const askQuestionButton = document.getElementById('ask-question-btn');
    if (askQuestionButton) {
      askQuestionButton.addEventListener('click', () => this.askQuestion());
    }

    // Question input (for Enter key)
    const questionInput = document.getElementById('mentor-question');
    if (questionInput) {
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.askQuestion();
            }
        });
    }

    // Settings button (if you have one)
    const settingsButton = document.getElementById('settings-btn');
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            // Placeholder for settings logic
            console.log('Settings button clicked');
            this.showMessage('Settings not yet implemented.', 'info');
        });
    }
  }
  
  // ... (rest of the class methods remain the same)
  async generateHints() {
    const problemType = this.analyzeProblemType();
    
    this.hints = [
      {
        level: 1,
        title: "Problem Understanding",
        content: this.generateUnderstandingHint(),
        unlocked: false
      },
      {
        level: 2,
        title: "Approach Direction",
        content: this.generateApproachHint(problemType),
        unlocked: false
      },
      {
        level: 3,
        title: "Data Structures",
        content: this.generateDataStructureHint(problemType),
        unlocked: false
      },
      {
        level: 4,
        title: "Implementation Guide",
        content: this.generateImplementationHint(problemType),
        unlocked: false
      }
    ];
  }

  analyzeProblemType() {
    const description = this.problemData?.description?.toLowerCase() || '';
    const title = this.problemData?.title?.toLowerCase() || '';
    const tags = this.problemData?.tags?.map(tag => tag.toLowerCase()) || [];
    const text = `${description} ${title} ${tags.join(' ')}`;
    if (text.includes('array') || text.includes('sum') || text.includes('target')) {
      return 'array';
    } else if (text.includes('tree') || text.includes('binary')) {
      return 'tree';
    } else if (text.includes('graph') || text.includes('node') || text.includes('edge')) {
      return 'graph';
    } else if (text.includes('dynamic') || text.includes('dp') || text.includes('optimal')) {
      return 'dp';
    } else if (text.includes('string') || text.includes('substring')) {
      return 'string';
    }
    return 'general';
  }

  generateUnderstandingHint() {
    const hints = [
      "Let's break down what this problem is really asking. Can you identify the input, output, and constraints?",
      "Think about this problem step by step. What's the core operation you need to perform?",
      "Before jumping to code, make sure you understand the problem with a simple example.",
      "What patterns do you notice in the given examples? How does the input relate to the output?"
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  }

  generateApproachHint(problemType) {
    const hintMap = {
      array: "Start with a brute force approach - try all possible combinations. Then think about how to optimize using techniques like two pointers or hash maps.",
      tree: "Consider tree traversal methods. Would DFS or BFS be more appropriate here? Think about the order you need to visit nodes.",
      graph: "This looks like a graph problem. Consider if you need to find paths, detect cycles, or explore connected components.",
      dp: "This might benefit from dynamic programming. Can you identify overlapping subproblems? What would be your base case?",
      string: "For string problems, consider if you need pattern matching, sliding window, or character frequency analysis.",
      general: "Start with the simplest approach that works, even if it's not optimal. What's the most straightforward way to solve this?"
    };
    return hintMap[problemType] || hintMap.general;
  }

  generateDataStructureHint(problemType) {
    const hintMap = {
      array: "Consider using a hash map to store values you've seen, or two pointers to avoid nested loops.",
      tree: "You might need a stack for iterative traversal, or a queue for level-order traversal.",
      graph: "Think about using adjacency lists, visited arrays, or union-find data structures.",
      dp: "A 2D array or memoization map could help store intermediate results.",
      string: "Hash maps for character counting, or arrays for character frequency might be useful.",
      general: "What data structure would help you access or organize the data more efficiently?"
    };
    return hintMap[problemType] || hintMap.general;
  }

  generateImplementationHint(problemType) {
    const hints = [
      "Here's a pseudo-code structure to get you started. Focus on the main logic flow first, then handle edge cases.",
      "Break your solution into smaller functions. What are the key operations you need to implement?",
      "Consider the time and space complexity of your approach. Can you optimize further?",
      "Don't forget to handle edge cases like empty inputs, single elements, or boundary conditions."
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  }

  getNextHint() {
    const nextHintIndex = this.userProgress.hintsUsed;
    if (nextHintIndex >= this.hints.length) {
      this.showMessage("You've unlocked all available hints! Try implementing your solution.", "success");
      return;
    }
    this.hints[nextHintIndex].unlocked = true;
    this.userProgress.hintsUsed++;
    this.updateHintsDisplay();
    this.updateStats();
    this.updateProgress();
    this.trackHintUsage(nextHintIndex + 1);
  }

  updateHintsDisplay() {
    const container = document.getElementById('hints-container');
    container.innerHTML = this.hints.map((hint, index) => `
      <div class="hint-section">
        <div class="hint-level">
          <span class="hint-badge ${hint.unlocked ? '' : 'locked'}">
            Hint ${index + 1}
          </span>
          <span>${hint.title}</span>
        </div>
        <div class="hint-content ${hint.unlocked ? '' : 'locked'}">
          ${hint.unlocked ? hint.content : 'Unlock previous hints to see this one'}
        </div>
      </div>
    `).join('');
    const button = document.querySelector('.mentor-actions .mentor-button');
    if (this.userProgress.hintsUsed >= this.hints.length) {
      button.textContent = 'All Hints Unlocked!';
      button.disabled = true;
    } else {
      button.textContent = `Get Hint ${this.userProgress.hintsUsed + 1}`;
    }
  }

  updateStats() {
    document.getElementById('hints-used').textContent = this.userProgress.hintsUsed;
    const timeSpent = Math.floor((Date.now() - this.startTime) / 60000);
    document.getElementById('time-spent').textContent = `${timeSpent}m`;
  }

  updateProgress() {
    const progress = (this.userProgress.hintsUsed / this.hints.length) * 100;
    document.querySelector('.progress-fill').style.width = `${progress}%`;
  }

  async askQuestion() {
    const questionInput = document.getElementById('mentor-question');
    const question = questionInput.value.trim();
    if (!question) return;
    const responseDiv = document.getElementById('mentor-response');
    responseDiv.innerHTML = '<div class="loading-spinner"></div> Thinking...';
    setTimeout(() => {
      const response = this.generateResponse(question);
      responseDiv.innerHTML = `<div class="mentor-response">${response}</div>`;
    }, 1500);
    questionInput.value = '';
  }

  generateResponse(question) {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('complexity') || lowerQuestion.includes('time') || lowerQuestion.includes('space')) {
      return "Great question about complexity! Let's analyze your approach step by step. What operations are you performing in nested loops? Each nested loop typically adds a factor to your time complexity.";
    } else if (lowerQuestion.includes('optimize') || lowerQuestion.includes('faster')) {
      return "To optimize your solution, consider: 1) Can you eliminate redundant operations? 2) Is there a more efficient data structure? 3) Can you solve it in fewer passes through the data?";
    } else if (lowerQuestion.includes('stuck') || lowerQuestion.includes('help')) {
      return "When you're stuck, try: 1) Work through a small example manually, 2) Think about what data structure could help, 3) Consider if you've seen a similar problem before.";
    } else {
      return "That's a thoughtful question! Try breaking it down into smaller parts. What specific aspect would you like me to elaborate on?";
    }
  }

  toggleWidget() {
    this.isMinimized = !this.isMinimized;
    const widget = document.getElementById('coding-mentor-widget');
    const toggle = document.querySelector('.mentor-toggle');
    if (this.isMinimized) {
      widget.classList.add('minimized');
      toggle.textContent = '+';
    } else {
      widget.classList.remove('minimized');
      toggle.textContent = '−';
    }
  }

  startBehaviorTracking() {
    setInterval(() => {
      this.updateStats();
    }, 60000);
    this.trackCodeEditorActivity();
  }

  trackCodeEditorActivity() {
    const editorSelectors = [
      '.monaco-editor',
      '.CodeMirror',
      '.ace_editor'
    ];
    editorSelectors.forEach(selector => {
      const editor = document.querySelector(selector);
      if (editor) {
        editor.addEventListener('click', () => {
          this.userProgress.attempts++;
        });
      }
    });
  }

  trackHintUsage(hintLevel) {
    console.log(`Hint ${hintLevel} used for problem: ${this.problemData?.title}`);
  }

  showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `mentor-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#3b82f6'};
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 10001;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }
}

let codingMentor;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    codingMentor = new CodingMentor();
  });
} else {
  codingMentor = new CodingMentor();
}

window.codingMentor = codingMentor;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggleWidget") {
        if (window.codingMentor) {
            window.codingMentor.toggleWidget();
        }
    }
});