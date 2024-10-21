import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import the AuthProvider
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Home';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal'; // Ensure this is correct

function App() {
  return (
    <AuthProvider> {/* Wrap everything with AuthProvider */}
      <Router>
        <div className="flex flex-col min-h-screen"> {/* Flex container */}
          <Navbar />
          <main className="flex-grow"> {/* Flex-grow for available space */}
            <Routes>
              {/* Define your routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginModal />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
