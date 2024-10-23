import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Home';
import Persediaan from './Persediaan';
import Ruangan from './Ruangan';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar'; 
import Pesanan from './components/Pesanan'; 
import LoginModal from './components/LoginModal'; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow flex"> {/* Added flex to allow sidebar layout */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/persediaan" element={<Persediaan />} />
              <Route path="/ruangan" element={<Ruangan />} />
              <Route path="/login" element={<LoginModal />} />
              {/* Wrap Dashboard in Sidebar */}
              <Route path="/dashboard" element={
              
                  <Dashboard />
              
              } />
              <Route path="/pesanan" element={
              
                  <Pesanan />
              
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;