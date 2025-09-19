// Popup Script for Coding Mentor Extension

document.addEventListener('DOMContentLoaded', async () => {
    await initializePopup();
    setupEventListeners();
});

async function initializePopup() {
    // Load current status
    await loadCurrentStatus();
    
    // Load user stats
    await loadUserStats();
    
    // Load settings
    await loadSettings();
    
    // Update learning progress
    updateLearningProgress();
}

async function loadCurrentStatus() {
    try {
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab) {
            const platform = detectPlatformFromUrl(tab.url);
            document.getElementById('current-platform').textContent = platform || 'Not Supported';
            
            // Try to get current problem from content script
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'getCurrentProblem' });
                if (response && response.problemTitle) {
                    document.getElementById('active-problem').textContent = response.problemTitle;
                }
            } catch (error) {
                // Content script might not be loaded
                document.getElementById('active-problem').textContent = 'Navigate to a problem';
            }
        }
    } catch (error) {
        console.error('Error loading current status:', error);
    }
}

function detectPlatformFromUrl(url) {
    if (!url) return null;
    
    if (url.includes('leetcode.com')) return 'LeetCode';
    if (url.includes('codeforces.com')) return 'Codeforces';
    if (url.includes('hackerrank.com')) return 'HackerRank';
    
    return null;
}

async function loadUserStats() {
    try {
        // Get today's stats
        const today = new Date().toDateString();
        const result = await chrome.storage.local.get(['dailyStats', 'totalStats']);
        
        const dailyStats = result.dailyStats || {};
        const totalStats = result.totalStats || { problemsSolved: 0, totalHints: 0 };
        
        const todayStats = dailyStats[today] || { hintsUsed: 0, problemsSolved: 0 };
        
        document.getElementById('total-hints').textContent = todayStats.hintsUsed;
        document.getElementById('problems-solved').textContent = totalStats.problemsSolved;
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get([
            'hintMode',
            'enableNotifications',
            'trackProgress'
        ]);
        
        // Set hint mode
        const hintModeSelect = document.getElementById('hint-mode');
        hintModeSelect.value = result.hintMode || 'click';
        
        // Set toggles
        const notificationsToggle = document.getElementById('notifications-toggle');
        const progressToggle = document.getElementById('progress-toggle');
        
        if (result.enableNotifications !== false) {
            notificationsToggle.classList.add('active');
        }
        
        if (result.trackProgress !== false) {
            progressToggle.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function updateLearningProgress() {
    // Calculate learning progress based on various factors
    chrome.storage.local.get(['totalStats', 'hintAnalytics'], (result) => {
        const totalStats = result.totalStats || { problemsSolved: 0, totalHints: 0 };
        const analytics = result.hintAnalytics || [];
        
        // Simple progress calculation
        const problemsSolved = totalStats.problemsSolved;
        const efficiency = analytics.length > 0 ?
            Math.max(0, 100 - (totalStats.totalHints / Math.max(1, problemsSolved)) * 10) : 0;
        
        const progress = Math.min(100, (problemsSolved * 10) + (efficiency * 0.5));
        
        document.getElementById('learning-progress').style.width = `${progress}%`;
        
        let progressMessage = 'Keep going! You\'re making great progress.';
        if (progress < 20) {
            progressMessage = 'Just getting started! Every expert was once a beginner.';
        } else if (progress < 50) {
            progressMessage = 'You\'re building momentum! Keep practicing.';
        } else if (progress < 80) {
            progressMessage = 'Great progress! You\'re becoming more efficient.';
        } else {
            progressMessage = 'Excellent! You\'re mastering problem-solving patterns.';
        }
        
        document.getElementById('progress-text').textContent = progressMessage;
    });
}

function setupEventListeners() {
    // Other event listeners...

    // Action buttons
    document.getElementById('dashboard-btn').addEventListener('click', () => {
        // Send a message to the content script to toggle the widget
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "toggleWidget" });
            }
        });
        window.close();
    });

    document.getElementById('help-btn').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://github.com/your-repo/coding-mentor-extension#help' });
        window.close();
    });

    // You should also add a separate button for minimizing the widget if you want
    // that functionality to be explicit in the popup.
}