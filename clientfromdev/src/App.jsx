import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MyClaims from "./pages/MyClaims";
import PostDetails from "./pages/PostDetails";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
        
        {/* 1. Sidebar Navigation (Fixed Left) */}
        <Sidebar />

        {/* 2. Main Content Area */}
        {/* 'md:ml-64' pushes content right to make room for sidebar on desktop */}
        <main className="flex-1 md:ml-64 p-8 transition-all duration-300">
          <Routes>
            {/* Route for Browse Items / Home */}
            <Route path="/" element={<PostDetails />} />
            
            {/* Route for My Dashboard */}
            <Route path="/my-claims" element={<MyClaims />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;