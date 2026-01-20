import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyClaims from "./pages/MyClaims";
import MyPosts from "./pages/MyPosts";
import Starter from "./components/Starter";
import Feed from "./components/Feed";
import RedditNavbar from "./components/Navbar";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Public landing: Hero + Login */}
//         <Route path="/" element={<Starter />} />
import AppLayout from "./components/AppLayout";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import CreatePostPage from "./pages/CreatePostPage";
import IncomingClaims from "./pages/IncomingClaims";


function App() {
  return (
    <Provider store={appStore}>
      <Router>
        <Routes>

          {/* Public Route */}
          <Route path="/" element={<Starter />} />

          {/* Protected Layout */}
          <Route element={<AppLayout />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/create" element={<CreatePostPage />} />
            <Route path="/my-claims" element={<MyClaims />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/requests" element={<IncomingClaims />} />
          </Route>
      </Routes>
    </Router>
    </Provider>
  );
}

export default App;