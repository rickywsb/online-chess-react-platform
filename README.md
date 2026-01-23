# 🤖 AI Chess Agent Platform

An intelligent chess training and analysis platform powered by AI. Play against AI, analyze positions, and improve your chess skills with real-time evaluation and move recommendations.

![AI Chess Agent](https://img.shields.io/badge/AI-Chess%20Agent-blue)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Python](https://img.shields.io/badge/Python-AI%20Service-yellow)

## ✨ Features

### 🎮 Play Mode
- **Play against AI**: Challenge our intelligent chess AI that adapts to your skill level
- **Real-time move validation**: Instant feedback on legal and illegal moves
- **Auto-response**: AI responds within seconds with strategic moves

### 🔬 Analyze Mode
- **Position Analysis**: Get detailed evaluation of any chess position
- **Top Moves Panel**: View the best 3 recommended moves with scores
- **Real-time Evaluation Bar**: Visual thermometer showing who's winning
  - White rises from bottom when white is ahead
  - Black descends from top when black is ahead
- **Material & Positional Scoring**: Understand the factors behind each evaluation

### ✏️ Edit Mode
- **Free Piece Placement**: Drag and drop pieces anywhere on the board
- **Position Setup**: Create custom positions for analysis or practice
- **FEN Import/Export**: Load positions using FEN notation or copy current position
- **Clear & Reset**: Quickly clear the board or reset to starting position

### 📊 Analysis Features
- **Move History**: Track all moves made during the game
- **Collapsible Panels**: Clean UI with expandable analysis sections
- **Click-to-Play Variations**: Click on recommended moves to play them instantly

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **react-chessboard** - Interactive chess board component
- **chess.js** - Chess move validation and game logic
- **CSS3** - Modern styling with gradients and animations

### Backend
- **Node.js / Express** - REST API server
- **MongoDB** - Database for user data and game history

### AI Service
- **Python / FastAPI** - High-performance AI service
- **python-chess** - Chess library for move generation
- **Rule-based Engine** - Strategic move selection algorithm
- **Optional ML Model** - Transformer-based move prediction (if available)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Python 3.9+
- MongoDB

### Installation

1. **Clone the repositories**
```bash
# Frontend
git clone https://github.com/rickywsb/online-chess-react-platform.git
cd online-chess-react-platform
npm install

# Backend
git clone https://github.com/rickywsb/online-chess-platform-node-server.git
cd online-chess-platform-node-server
npm install

# AI Service
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment variables**
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:5001/api

# Backend (.env)
PORT=5001
MONGODB_URI=your_mongodb_uri
AI_SERVICE_URL=http://localhost:8000
```

3. **Start the services**
```bash
# Terminal 1 - AI Service
cd ai-service
python main.py

# Terminal 2 - Backend
cd online-chess-platform-node-server
npm start

# Terminal 3 - Frontend
cd online-chess-react-platform
npm start
```

4. **Open your browser**
Navigate to `http://localhost:3001`

## 📱 Screenshots

### Home Page
Modern dark theme with hero section, user stats, and quick navigation.

### Chess Analyzer
- Interactive chessboard with evaluation bar
- Mode selector (Play / Analyze / Edit)
- Control buttons and FEN input
- Move history and analysis panels

## 🎯 Roadmap

- [ ] User authentication and profiles
- [ ] Game history and statistics
- [ ] Opening explorer and database
- [ ] Puzzle training mode
- [ ] Multiplayer online games
- [ ] Mobile responsive improvements
- [ ] Advanced AI with deep learning

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## ��‍💻 Author

**Ricky Wu**
- GitHub: [@rickywsb](https://github.com/rickywsb)

---

⭐ Star this repo if you find it helpful!
