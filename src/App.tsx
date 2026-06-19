import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import VocabLearn from './pages/VocabLearn';
import GrammarLearn from './pages/GrammarLearn';
import SpeakingLearn from './pages/SpeakingLearn';
import ListeningLearn from './pages/ListeningLearn';
import Progress from './pages/Progress';
import Recommend from './pages/Recommend';
import Achievements from './pages/Achievements';
import Learning from './pages/Learning';
import Community from './pages/Community';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/learn/vocab/:courseId" element={<VocabLearn />} />
          <Route path="/learn/grammar/:courseId" element={<GrammarLearn />} />
          <Route path="/learn/speaking/:courseId" element={<SpeakingLearn />} />
          <Route path="/learn/listening/:courseId" element={<ListeningLearn />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/community" element={<Community />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
