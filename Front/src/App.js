import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.js'
import Login from './pages/Login.js'
import Signup from './pages/Signup.js'
import Feed from './pages/Feed.js'
import Hub from './pages/Hub.js'
import CreatePost from './pages/CreatePost.js'
import PostDetail from './pages/PostDetail.js'
import AppLayout from './layout/AppLayout.js'
import { AuthProvider, useAuth } from './context/AuthContext.js'

function ProtectedRoute({ children }){
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace/>
}

export default function App(){
  return (
    <AuthProvider>
      <div className="map-bg" aria-hidden>
        <div className="map-lines" />
      </div>
      <Routes>
        <Route index element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Feed />} />
          <Route path="feed" element={<Feed />} />
          <Route path="h/:slug" element={<Hub />} />
          <Route path="post/:id" element={<PostDetail />} />
          <Route path="create" element={<CreatePost />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
