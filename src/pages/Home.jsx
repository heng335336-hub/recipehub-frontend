import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import RecipeCard from "../components/RecipeCard";
import { CATEGORIES } from "../constants";
import { Link } from "react-router-dom";

export default function Home() {
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadRecipes() {
      try {
        const q = query(
          collection(db, "recipes"),
          orderBy("createdAt", "desc"),
          limit(8)
        );
        const snap = await getDocs(q);
        setRecentRecipes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        setError("Couldn't load recipes right now. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    }
    loadRecipes();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/recipes${searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : ""}`);
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <div className="hero-eyebrow">Cook something today</div>
            <h1>Recipes worth sharing.</h1>
            <p className="lead">
              Browse home-cooked recipes from real people, save your
              favorites, and publish your own — RecipeHub is a simple place
              to find what's for dinner.
            </p>

            <form className="search-bar" onSubmit={handleSearch} style={{ marginTop: "1.5rem" }}>
              <input
                type="text"
                placeholder="Search recipes, e.g. fried rice"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search recipes"
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </form>

            <div className="hero-cta">
              <Link to= "/recipes" className="btn btn-secondary">
                Browse all recipes
              </Link>
            </div>
          </div>

          <div className="hero-stamp">
            <div className="stamp">
              <div className="stamp-inner">
                <span className="stamp-num">{recentRecipes.length || "–"}</span>
                <span className="stamp-label">Recipes&nbsp;shared</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: "2.5rem" }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">Browse</div>
            <h2>Categories</h2>
          </div>
        </div>
        <div className="category-row">
          {CATEGORIES.map((c) => (
            <Link
                key={c}
                className="category-chip"
                to={`/recipes?category=${encodeURIComponent(c)}`}
              >
                {c}
              </Link>
          ))}
        </div>
      </section>

      <section className="container" style={{ marginTop: "3rem" }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">Fresh off the stove.</div>
            <h2>Recently added</h2>
          </div>
          <Link to="/recipes">See all recipes →</Link>
        </div>

        {loading && (
          <div className="state-block">
            <div className="spinner" />
            <p>Loading recipes…</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-block">
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && recentRecipes.length === 0 && (
          <div className="state-block">
            <h3>No recipes yet</h3>
            <p>Be the first to publish one!</p>
          </div>
        )}

        {!loading && !error && recentRecipes.length > 0 && (
          <div className="recipe-grid">
            {recentRecipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
