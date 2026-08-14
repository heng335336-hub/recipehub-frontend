import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";

export default function Profile() {
  const { currentUser, profile } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function loadMyRecipes() {
      if (!currentUser) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "recipes"),
          where("authorId", "==", currentUser.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort newest first on the client, so we don't need a composite index.
        list.sort((a, b) => {
          const at = a.createdAt?.seconds || 0;
          const bt = b.createdAt?.seconds || 0;
          return bt - at;
        });
        setRecipes(list);
      } catch (err) {
        console.error(err);
        setError("Couldn't load your recipes right now.");
      } finally {
        setLoading(false);
      }
    }
    loadMyRecipes();
  }, [currentUser]);

  async function handleDelete(recipe) {
    const confirmed = window.confirm(`Delete "${recipe.title}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(recipe.id);
    try {
      await deleteDoc(doc(db, "recipes", recipe.id));
      setRecipes((list) => list.filter((r) => r.id !== recipe.id));
    } catch (err) {
      console.error(err);
      alert("Couldn't delete this recipe. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const initials = (profile?.username || currentUser?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h2 style={{ margin: 0 }}>{profile?.username || "My Profile"}</h2>
            <p style={{ margin: 0, color: "var(--color-ink-soft)" }}>
              {profile?.email || currentUser?.email}
            </p>
          </div>
        </div>

        <div className="section-heading">
          <div>
            <div className="eyebrow">Your kitchen</div>
            <h2>My Recipes</h2>
          </div>
          <Link to="/add-recipe" className="btn btn-primary">
            + Add Recipe
          </Link>
        </div>

        {loading && (
          <div className="state-block">
            <div className="spinner" />
            <p>Loading your recipes…</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-block">
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && recipes.length === 0 && (
          <div className="state-block">
            <h3>You haven't added any recipes yet</h3>
            <p>Share your first recipe with the RecipeHub community.</p>
            <Link to="/add-recipe" className="btn btn-primary">
              Add your first recipe
            </Link>
          </div>
        )}

        {!loading && !error && recipes.length > 0 && (
          <div className="recipe-grid">
            {recipes.map((r) => (
              <div key={r.id} style={{ position: "relative" }}>
                <RecipeCard recipe={r} />
                <button
                  className="btn btn-danger"
                  style={{
                    marginTop: "0.6rem",
                    width: "100%",
                  }}
                  onClick={() => handleDelete(r)}
                  disabled={deletingId === r.id}
                >
                  {deletingId === r.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
