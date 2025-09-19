# 🧠 Coding Mentor Chrome Extension

A Chrome extension that acts as your AI coding mentor, providing progressive hints and guidance for competitive programming problems on LeetCode, Codeforces, and HackerRank.

## 🌟 Features

### 🎯 Progressive Hint System
- **4-tier hint structure**: Problem understanding → Approach direction → Data structures → Implementation guide
- **Flexible delivery**: Choose between click-to-unlock or timed release
- **Smart adaptation**: AI analyzes your behavior and provides personalized nudges

### 🤖 AI-Powered Mentoring
- **Context awareness**: Automatically detects problem statements and constraints
- **Interactive Q&A**: Ask specific questions about complexity, debugging, or approaches
- **Problem classification**: Identifies problem types (DP, Graph, Array, etc.) for targeted hints

### 📊 Progress Tracking & Gamification
- **Detailed analytics**: Track hints used, time spent, and efficiency scores
- **Skill progression**: Monitor improvement across different problem categories
- **Achievement system**: Unlock badges for milestones and efficient problem-solving
- **Study streaks**: Maintain motivation with daily coding streaks

### 🎨 Multi-Platform Support
- **LeetCode**: Full integration with problem pages
- **Codeforces**: Contest and practice problem support
- **HackerRank**: Challenge and interview preparation problems

## 🚀 Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "Coding Mentor"
3. Click "Add to Chrome"

### Manual Installation (Development)
1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your browser toolbar

## 💡 How to Use

### Getting Started
1. Navigate to any supported coding platform (LeetCode, Codeforces, HackerRank)
2. Open a problem page
3. The Coding Mentor widget will automatically appear in the top-right corner
4. Click "Get First Hint" to start your guided journey

### Hint Progression
- **Hint 1**: Problem restatement in simpler terms
- **Hint 2**: Approach direction (brute force → optimization)
- **Hint 3**: Suggested data structures and algorithms
- **Hint 4**: Implementation guidance and pseudo-code structure

### Interactive Features
- **Ask Questions**: Type specific questions about your approach
- **Settings**: Customize hint delivery mode and notifications
- **Dashboard**: View detailed progress analytics and achievements

## 🛠️ Technical Architecture

### Frontend (Extension)
- **Manifest V3**: Modern Chrome extension architecture
- **Content Scripts**: Inject mentor UI into coding platforms
- **Popup Interface**: Quick access to settings and stats
- **Dashboard**: Comprehensive progress tracking

### Backend Integration
- **AI API**: Powered by OpenAI/Google Gemini for intelligent responses
- **Problem Analysis**: Automatic classification and hint generation
- **Progress Storage**: Chrome storage APIs for user data persistence

### Platform Detection
```javascript
// Automatic platform detection
const platform = detectPlatform(window.location.hostname);
// Extracts problem data specific to each platform
const problemData = extractProblemData(platform);
```

## 📈 Analytics & Privacy

### Data Collection
- **Problem-solving patterns**: Hints used, time spent, success rates
- **Learning progress**: Skill development across different topics
- **Usage analytics**: Feature usage and user preferences

### Privacy Commitment
- **Local storage**: All personal data stored locally in your browser
- **No tracking**: We don't track your identity or personal information
- **Optional sync**: Choose to sync progress across devices

## 🎮 Gamification System

### Achievements
- 🌟 **First Steps**: Use your first hint
- 🎯 **Problem Solver**: Solve 10 problems
- ⚡ **Efficient Coder**: Solve 5 problems with minimal hints
- 🔥 **Streak Master**: Maintain a 7-day study streak
- 🧠 **Algorithm Expert**: Master different problem categories

### Progress Metrics
- **Efficiency Score**: Based on hints-to-solutions ratio
- **Category Mastery**: Progress in Arrays, DP, Graphs, etc.
- **Study Consistency**: Daily and weekly activity tracking

## 🔧 Development

### Setup
```bash
# Clone the repository
git clone https://github.com/your-username/coding-mentor-extension.git

# Navigate to project directory
cd coding-mentor-extension

# Install dependencies (if any)
npm install
```

### File Structure
```
coding-mentor-extension/
├── manifest.json          # Extension configuration
├── content.js             # Main content script
├── background.js          # Service worker
├── popup.html/js          # Extension popup
├── dashboard.html/js      # Analytics dashboard
├── styles.css             # Extension styling
└── icons/                 # Extension icons
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🤝 Support

### Getting Help
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check our comprehensive guides
- **Community**: Join our Discord server for discussions

### Feedback
We'd love to hear from you! Please share your experience and suggestions:
- **Email**: support@codingmentor.dev
- **Feedback Form**: [Link to form]
- **GitHub Discussions**: Share ideas with the community

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI**: For providing the AI capabilities
- **Coding Platforms**: LeetCode, Codeforces, and HackerRank for the learning opportunities
- **Community**: All the developers who provided feedback and suggestions

---

**Happy Coding! 🚀**

*Remember: The goal isn't to get the answer quickly, but to build your problem-solving intuition step by step.*