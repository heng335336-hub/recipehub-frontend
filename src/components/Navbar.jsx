import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await signOut(auth);
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          Recipe<span className="brand-mark">Hub</span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          ☰
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/recipes" onClick={() => setOpen(false)}>
            Recipes
          </NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>
            About
          </NavLink>
          <NavLink to="/faq" onClick={() => setOpen(false)}>
            FAQ
          </NavLink>
          <NavLink to="/contact" onClick={() => setOpen(false)}>
            Contact
          </NavLink>
          {currentUser && (
            <NavLink to="/add-recipe" onClick={() => setOpen(false)}>
              Add Recipe
            </NavLink>
          )}

          {currentUser ? (
            <>
              <NavLink to="/profile" onClick={() => setOpen(false)}>
                Profile{profile?.username ? ` (${profile.username})` : ""}
              </NavLink>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="nav-actions">
              <Link to="/login" className="btn btn-secondary" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
