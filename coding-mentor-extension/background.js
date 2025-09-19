// Background Service Worker for Coding Mentor Extension

// Extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Coding Mentor Extension installed');
    // Set default settings
    chrome.storage.sync.set({
      hintMode: 'click', // 'click' or 'timed'
      timedDelay: 30, // seconds
      enableNotifications: true,
      trackProgress: true
    });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'trackHintUsage':
      trackHintUsage(request.data);
      break;
    case 'saveProgress':
      saveUserProgress(request.data);
      break;
    case 'getProblemHints':
      generateProblemHints(request.problemData).then(sendResponse);
      return true; // Keep message channel open for async response
    case 'askMentorQuestion':
      handleMentorQuestion(request.question, request.context).then(sendResponse);
      return true;
  }
});

// Track hint usage analytics
function trackHintUsage(data) {
  chrome.storage.local.get(['hintAnalytics'], (result) => {
    const analytics = result.hintAnalytics || [];
    analytics.push({
      ...data,
      timestamp: Date.now(),
      url: data.url
    });
    
    // Keep only last 1000 entries
    if (analytics.length > 1000) {
      analytics.splice(0, analytics.length - 1000);
    }
    
    chrome.storage.local.set({ hintAnalytics: analytics });
  });
}

// Save user progress
function saveUserProgress(progressData) {
  const key = `progress_${progressData.problemId}`;
  chrome.storage.sync.set({ [key]: progressData });
}

// Generate AI-powered hints (simulated)
async function generateProblemHints(problemData) {
  // In a real implementation, this would call an AI API
  // For now, we'll return structured hints based on problem analysis
  
  const hints = await analyzeProblemAndGenerateHints(problemData);
  return { hints };
}

function analyzeProblemAndGenerateHints(problemData) {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const problemType = classifyProblem(problemData);
      const hints = generateHintsByType(problemType, problemData);
      resolve(hints);
    }, 1000);
  });
}

function classifyProblem(problemData) {
  const text = `${problemData.title} ${problemData.description}`.toLowerCase();
  const tags = problemData.tags?.map(tag => tag.toLowerCase()) || [];
  
  // Advanced problem classification
  if (tags.includes('dynamic programming') || text.includes('optimal') || text.includes('maximum') || text.includes('minimum')) {
    return 'dynamic_programming';
  } else if (tags.includes('graph') || text.includes('node') || text.includes('edge') || text.includes('connected')) {
    return 'graph';
  } else if (tags.includes('tree') || text.includes('binary tree') || text.includes('root')) {
    return 'tree';
  } else if (tags.includes('array') || text.includes('array') || text.includes('sum') || text.includes('target')) {
    return 'array';
  } else if (tags.includes('string') || text.includes('string') || text.includes('substring')) {
    return 'string';
  } else if (text.includes('sort') || text.includes('order')) {
    return 'sorting';
  } else if (text.includes('search') || text.includes('find')) {
    return 'search';
  }
  
  return 'general';
}

function generateHintsByType(problemType, problemData) {
  const hintTemplates = {
    dynamic_programming: [
      "This problem has optimal substructure. Can you identify the smaller subproblems?",
      "Think about memoization - what values would you want to cache to avoid recalculation?",
      "Consider bottom-up vs top-down approaches. Which feels more natural for this problem?",
      "Define your DP state clearly: dp[i] represents what exactly?"
    ],
    graph: [
      "How would you represent this graph? Adjacency list or matrix?",
      "Do you need to visit all nodes, find shortest path, or detect cycles?",
      "Consider BFS for shortest path, DFS for exploration or cycle detection.",
      "Don't forget to track visited nodes to avoid infinite loops."
    ],
    tree: [
      "What type of tree traversal would be most helpful here?",
      "Think recursively - what would you do at each node?",
      "Consider the base case: what happens at leaf nodes?",
      "Would you need to pass information up or down the tree?"
    ],
    array: [
      "Can you solve this with a single pass through the array?",
      "Would sorting the array first make the problem easier?",
      "Consider using two pointers or a sliding window technique.",
      "A hash map might help you track elements you've seen before."
    ],
    string: [
      "Are you looking for patterns, substrings, or character frequencies?",
      "Consider using a sliding window for substring problems.",
      "Hash maps are great for character counting problems.",
      "Think about whether you need to process the string left-to-right or if other orders help."
    ],
    sorting: [
      "What sorting algorithm would be most appropriate here?",
      "Can you solve this without explicitly sorting? (using heap, etc.)",
      "Consider the time complexity requirements - is O(n log n) acceptable?",
      "Sometimes partial sorting or finding kth element is sufficient."
    ],
    search: [
      "Is this a linear search problem or can you use binary search?",
      "For binary search, what property makes the search space 'sorted'?",
      "Consider whether you're searching for an exact value or a condition.",
      "What are your search boundaries and how do they change?"
    ],
    general: [
      "Break down the problem into smaller, manageable parts.",
      "What's the brute force approach? Can you optimize from there?",
      "Consider the constraints - they often hint at the expected solution complexity.",
      "Work through a small example step by step to understand the pattern."
    ]
  };
  
  const hints = hintTemplates[problemType] || hintTemplates.general;
  
  return [
    {
      level: 1,
      title: "Problem Understanding",
      content: `Let's understand what this problem is asking. ${hints[0]}`
    },
    {
      level: 2,
      title: "Approach Direction",
      content: hints[1]
    },
    {
      level: 3,
      title: "Data Structures & Algorithms",
      content: hints[2]
    },
    {
      level: 4,
      title: "Implementation Strategy",
      content: hints[3]
    }
  ];
}

// Handle mentor Q&A
async function handleMentorQuestion(question, context) {
  // Simulate AI response generation
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = generateMentorResponse(question, context);
      resolve({ response });
    }, 1500);
  });
}

function generateMentorResponse(question, context) {
  const lowerQuestion = question.toLowerCase();
  
  // Pattern matching for common questions
  if (lowerQuestion.includes('time complexity') || lowerQuestion.includes('big o')) {
    return "To analyze time complexity, count the number of operations relative to input size. Nested loops often indicate O(n²), while single loops are O(n). Hash map lookups are O(1) on average.";
  }
  
  if (lowerQuestion.includes('space complexity')) {
    return "Space complexity considers extra memory used. Recursive calls use O(depth) stack space. Arrays and hash maps use O(n) space where n is the number of elements stored.";
  }
  
  if (lowerQuestion.includes('optimize') || lowerQuestion.includes('improve')) {
    return "Common optimization strategies: 1) Use better data structures (hash maps for O(1) lookup), 2) Eliminate redundant work, 3) Use two pointers instead of nested loops, 4) Consider sorting first if it simplifies the logic.";
  }
  
  if (lowerQuestion.includes('debug') || lowerQuestion.includes('wrong') || lowerQuestion.includes('error')) {
    return "Debugging tips: 1) Test with simple examples, 2) Check edge cases (empty input, single element), 3) Verify loop boundaries, 4) Print intermediate values to trace execution.";
  }
  
  if (lowerQuestion.includes('approach') || lowerQuestion.includes('algorithm')) {
    return "When choosing an approach: 1) Start with brute force to understand the problem, 2) Identify bottlenecks, 3) Consider if sorting helps, 4) Think about what data structure would make operations efficient.";
  }
  
  // Default response
  return "That's a great question! Can you be more specific about what aspect you'd like help with? For example, are you asking about the algorithm approach, implementation details, or complexity analysis?";
}

// Notification system
function showNotification(title, message) {
  chrome.storage.sync.get(['enableNotifications'], (result) => {
    if (result.enableNotifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: title,
        message: message
      });
    }
  });
}

// Context menu for quick actions (optional)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'askMentor',
    title: 'Ask Coding Mentor',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'askMentor') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'askAboutSelection',
      selectedText: info.selectionText
    });
  }
});