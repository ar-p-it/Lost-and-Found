import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Feed from "./pages/Feed.jsx";
import Hub from "./pages/Hub.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import AppLayout from "./layout/AppLayout.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="map-bg" aria-hidden>
        <div className="map-lines" />
      </div>
      <Routes>
        <Route index element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Feed />} />
          <Route path="feed" element={<Feed />} />
          <Route path="h/:slug" element={<Hub />} />
          <Route path="post/:id" element={<PostDetail />} />
          <Route path="create" element={<CreatePost />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
