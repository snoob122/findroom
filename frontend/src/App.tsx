import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import MapView from './pages/MapView';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import RoommateFinder from './pages/RoommateFinder';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import CreateBlog from './pages/CreateBlog';
import Profile from './pages/Profile';
import SavedListings from './pages/SavedListings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listings/:id" element={<ListingDetail />} />
                <Route path="/map" element={<MapView />} />
                <Route path="/roommate-finder" element={<RoommateFinder />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/create-listing" element={
                  <ProtectedRoute landlordOnly>
                    <CreateListing />
                  </ProtectedRoute>
                } />
                <Route path="/edit-listing/:id" element={
                  <ProtectedRoute landlordOnly>
                    <EditListing />
                  </ProtectedRoute>
                } />
                <Route path="/create-blog" element={
                  <ProtectedRoute>
                    <CreateBlog />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/saved" element={
                  <ProtectedRoute>
                    <SavedListings />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

