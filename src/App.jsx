import { Link, Navigate, Route, HashRouter as Router, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import EmailVerificationBanner from "./components/EmailVerificationBanner";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetails from "./pages/RecipeDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddRecipe from "./pages/AddRecipe";
import Profile from "./pages/Profile";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";

// Redirects guests to /login, remembering where they were headed.
function RequireAuth({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recipes" element={<Recipes />} />
      <Route path="/recipes/:id" element={<RecipeDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/add-recipe"
        element={
          <RequireAuth>
            <AddRecipe />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <EmailVerificationBanner />
        <AppRoutes />
        <footer className="site-footer">
          <div className="container footer-inner">
            <span>© {new Date().getFullYear()} RecipeHub — a student project</span>
            <nav className="footer-links">
              <Link to="/about">About</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact</Link>
            </nav>
            <span>Built with React, Vite &amp; Firebase</span>
          </div>
        </footer>
      </AuthProvider>
    </Router>
  );
}
