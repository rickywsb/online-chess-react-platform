import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourseModulesPage from './pages/CourseModulesPage.js';

import { AuthProvider } from './contexts/AuthContext.js';
import { Navigate } from 'react-router-dom';

import './index.css';

// Import Navbar component
import Navbar from './components/Navbar.js';

// Import page components
import HomePage from './pages/HomePage.js';
import CoursesPage from './pages/CoursesPage.js';
import BlogPage from './pages/BlogPage.js';
import LoginPage from './pages/LoginPage.js';
import CartPage from './pages/CartPage.js';
import RegisterPage from './pages/RegisterPage.js';
import ProfilePage from './pages/Profile.js';
import Course101 from "./pages/Course101";
import AdminPage from './pages/AdminPage.js';
import DetailPage from './pages/DetailPage';
import TitlePlayersPage from './pages/TitlePlayersPage';
import PuzzlePage from './pages/PuzzlePage.js';
import LeaderboardPage from './pages/LeaderboardPage.js';
import ChessTVPage from './pages/ChessTVPage.js';
import BroadcastViewPage from './pages/BroadcastViewPage.js';

function App() {
  return (
    <Router>
      <AuthProvider>

        <div className="App">
          <header className="App-header">
            {/* 使用Navbar组件 */}
            <Navbar />
          </header>
          {/* 路由设置 */}
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />

            <Route path="/home" element={<HomePage />} />
            <Route path="/player/:username" element={<DetailPage />} />
            <Route path="/title/:title" element={<TitlePlayersPage />} /> {/* 添加新路由 */}

            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId/modules" element={<CourseModulesPage />} />
            <Route path="/admin" element={<AdminPage />} />

            <Route path="/blog" element={<BlogPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/course101" element={<Course101 />} />
            <Route path="/puzzle" element={<PuzzlePage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/chess-tv" element={<ChessTVPage />} />
            <Route path="/chess-tv/:tournamentId/:roundId" element={<BroadcastViewPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
