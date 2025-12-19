import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SearchProviders from './pages/SearchProviders';
import ProviderProfile from './pages/ProviderProfile';
import CreateBooking from './pages/CreateBooking';
import MyBookings from './pages/MyBookings';
import MyReviews, { CreateReview } from './pages/Reviews';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('auth_token');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <SearchProviders />
            </PrivateRoute>
          }
        />
        <Route
          path="/provider/:id"
          element={
            <PrivateRoute>
              <ProviderProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/book/:id"
          element={
            <PrivateRoute>
              <CreateBooking />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <PrivateRoute>
              <MyReviews />
            </PrivateRoute>
          }
        />
        <Route
          path="/review/:bookingId"
          element={
            <PrivateRoute>
              <CreateReview />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
