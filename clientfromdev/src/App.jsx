import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MyClaims from "./pages/MyClaims";
import Starter from "./components/Starter";
import Feed from "./components/Feed";
import RedditNavbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public landing: Hero + Login */}
        <Route path="/" element={<Starter />} />

        {/* App layout with sidebar */}
        <Route
          path="/feed"
          element={
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
              <RedditNavbar />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-8 transition-all duration-300">
                  <Feed />
                </main>
              </div>
            </div>
          }
        />
        <Route
          path="/my-claims"
          element={
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
              <RedditNavbar />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-8 transition-all duration-300">
                  <MyClaims />
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;