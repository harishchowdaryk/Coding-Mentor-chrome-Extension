// Dashboard Script for Coding Mentor Extension

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    // Load all stored data
    const [localData, syncData] = await Promise.all([
      chrome.storage.local.get(['hintAnalytics', 'dailyStats', 'totalStats']),
      chrome.storage.sync.get(['userPreferences', 'achievements'])
    ]);
    
    // Update statistics
    updateStatistics(localData, syncData);
    
    // Update skill progress
    updateSkillProgress(localData);
    
    // Update achievements
    updateAchievements(syncData.achievements || []);
    
    // Update recent activity
    updateRecentActivity(localData.hintAnalytics || []);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function updateStatistics(localData, syncData) {
  const totalStats = localData.totalStats || { 
    problemsSolved: 0, 
    totalHints: 0, 
    totalTime: 0 
  };
  
  const analytics = localData.hintAnalytics || [];
  
  // Calculate efficiency score
  const efficiency = totalStats.problemsSolved > 0 ? 
    Math.max(0, 100 - (totalStats.totalHints / totalStats.problemsSolved) * 20) : 0;
  
  // Calculate study streak
  const streak = calculateStudyStreak(localData.dailyStats || {});
  
  // Update DOM elements
  document.getElementById('problems-solved').textContent = totalStats.problemsSolved;
  document.getElementById('total-hints').textContent = totalStats.totalHints;
  document.getElementById('efficiency-score').textContent = Math.round(efficiency) + '%';
  document.getElementById('study-streak').textContent = streak;
  
  // Calculate weekly changes
  const weeklyStats = calculateWeeklyStats(localData.dailyStats || {});
  document.getElementById('problems-change').textContent = `+${weeklyStats.problems} this week`;
  document.getElementById('hints-change').textContent = `+${weeklyStats.hints} this week`;
  document.getElementById('efficiency-change').textContent = `+${weeklyStats.efficiency}% this week`;
}

function calculateStudyStreak(dailyStats) {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();
    
    if (dailyStats[dateString] && dailyStats[dateString].problemsSolved > 0) {
      streak++;
    } else if (i > 0) {
      break; // Streak broken
    }
  }
  
  return streak;
}

function calculateWeeklyStats(dailyStats) {
  const today = new Date();
  let weeklyProblems = 0;
  let weeklyHints = 0;
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toDateString();
    
    if (dailyStats[dateString]) {
      weeklyProblems += dailyStats[dateString].problemsSolved || 0;
      weeklyHints += dailyStats[dateString].hintsUsed || 0;
    }
  }
  
  return {
    problems: weeklyProblems,
    hints: weeklyHints,
    efficiency: Math.round(Math.random() * 10) // Placeholder calculation
  };
}

function updateSkillProgress(localData) {
  const analytics = localData.hintAnalytics || [];
  
  // Categorize problems by type
  const categories = {
    array: 0,
    dp: 0,
    graph: 0
  };
  
  analytics.forEach(entry => {
    if (entry.problemType) {
      if (entry.problemType.includes('array') || entry.problemType.includes('string')) {
        categories.array++;
      } else if (entry.problemType.includes('dp') || entry.problemType.includes('dynamic')) {
        categories.dp++;
      } else if (entry.problemType.includes('graph') || entry.problemType.includes('tree')) {
        categories.graph++;
      }
    }
  });
  
  // Calculate progress percentages (out of 50 problems each)
  const arrayProgress = Math.min(100, (categories.array / 50) * 100);
  const dpProgress = Math.min(100, (categories.dp / 50) * 100);
  const graphProgress = Math.min(100, (categories.graph / 50) * 100);
  
  // Update progress bars
  document.getElementById('array-progress').textContent = Math.round(arrayProgress) + '%';
  document.getElementById('array-fill').style.width = arrayProgress + '%';
  
  document.getElementById('dp-progress').textContent = Math.round(dpProgress) + '%';
  document.getElementById('dp-fill').style.width = dpProgress + '%';
  
  document.getElementById('graph-progress').textContent = Math.round(graphProgress) + '%';
  document.getElementById('graph-fill').style.width = graphProgress + '%';
}

function updateAchievements(achievements) {
  // This would be expanded to show actual user achievements
  // For now, we'll show some sample achievements
  const achievementCards = document.querySelectorAll('.achievement-card');
  
  // Sample logic to unlock achievements based on stats
  chrome.storage.local.get(['totalStats'], (result) => {
    const stats = result.totalStats || {};
    
    // Unlock achievements based on progress
    if (stats.totalHints > 0) {
      achievementCards[0].classList.add('unlocked');
    }
    
    if (stats.problemsSolved >= 10) {
      achievementCards[1].classList.add('unlocked');
    }
    
    // Add more achievement logic here
  });
}

function updateRecentActivity(analytics) {
  // This would show real recent activity
  // For now, we'll keep the sample data in HTML
  
  // In a real implementation, you would:
  // 1. Sort analytics by timestamp
  // 2. Take the most recent entries
  // 3. Format them for display
  // 4. Update the activity list in the DOM
}

// Export functions for potential use by other scripts
window.dashboardUtils = {
  loadDashboardData,
  updateStatistics,
  calculateStudyStreak
};