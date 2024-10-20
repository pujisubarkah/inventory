import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Home';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal'; // Pastikan ini sudah benar

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen"> {/* Menambahkan flex container */}
        <Navbar />
        <main className="flex-grow"> {/* flex-grow untuk mengisi ruang yang tersedia */}
          <Routes>
            {/* Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginModal />} />
          <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
