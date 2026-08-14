import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import RecipeCard from "../components/RecipeCard";
import { CATEGORIES } from "../constants";

export default function Recipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchTerm = searchParams.get("q") || "";
  const activeCategory = searchParams.get("category") || "";

  useEffect(() => {
    async function loadRecipes() {
      setLoading(true);
      try {
        const q = query(collection(db, "recipes"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setRecipes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        setError("Couldn't load recipes right now. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    }
    loadRecipes();
  }, []);

  const filteredRecipes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return recipes.filter((r) => {
      const matchesCategory = activeCategory ? r.category === activeCategory : true;
      const matchesTerm = term
        ? (r.title || "").toLowerCase().includes(term) ||
          (r.description || "").toLowerCase().includes(term)
        : true;
      return matchesCategory && matchesTerm;
    });
  }, [recipes, searchTerm, activeCategory]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Discover</div>
            <h2>All Recipes</h2>
          </div>
        </div>

        <div className="toolbar">
          <form
            className="search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              updateParam("q", e.target.elements.search.value);
            }}
          >
            <input
              name="search"
              type="text"
              placeholder="Search recipes…"
              defaultValue={searchTerm}
              aria-label="Search recipes"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>

        <div className="category-row" style={{ marginBottom: "2rem" }}>
          <button
            className={`category-chip ${activeCategory === "" ? "active" : ""}`}
            onClick={() => updateParam("category", "")}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`category-chip ${activeCategory === c ? "active" : ""}`}
              onClick={() => updateParam("category", c)}
            >
              {c}
            </button>
          ))}
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

        {!loading && !error && filteredRecipes.length === 0 && (
          <div className="state-block">
            <h3>No recipes found</h3>
            <p>Try a different search term or category.</p>
          </div>
        )}

        {!loading && !error && filteredRecipes.length > 0 && (
          <div className="recipe-grid">
            {filteredRecipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
