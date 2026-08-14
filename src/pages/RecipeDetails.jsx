import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='450'><rect width='100%' height='100%' fill='#f1ead9'/><text x='50%' y='50%' font-family='sans-serif' font-size='20' fill='#b7862c' text-anchor='middle' dominant-baseline='middle'>No image</text></svg>`
  );

export default function RecipeDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadRecipe() {
      setLoading(true);
      setError("");
      try {
        const snap = await getDoc(doc(db, "recipes", id));
        if (snap.exists()) {
          setRecipe({ id: snap.id, ...snap.data() });
        } else {
          setError("This recipe doesn't exist or was removed.");
        }
      } catch (err) {
        console.error(err);
        setError("Couldn't load this recipe right now.");
      } finally {
        setLoading(false);
      }
    }
    loadRecipe();
  }, [id]);

  async function handleDelete() {
    if (!recipe) return;
    const confirmed = window.confirm(
      "Delete this recipe? This cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "recipes", recipe.id));
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Couldn't delete this recipe. Please try again.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page container">
        <div className="state-block">
          <div className="spinner" />
          <p>Loading recipe…</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="page container">
        <div className="state-block">
          <h3>Recipe not found</h3>
          <p>{error}</p>
          <Link to="/recipes" className="btn btn-secondary">
            Back to recipes
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.uid === recipe.authorId;

  return (
    <div className="page">
      <div className="container">
        <div className="recipe-detail-hero">
          <img src={recipe.imageUrl || PLACEHOLDER_IMG} alt={recipe.title} />

          <div>
            {recipe.category && (
              <span className="category-chip active">{recipe.category}</span>
            )}
            <h1 style={{ marginTop: "0.75rem" }}>{recipe.title}</h1>
            <p>{recipe.description}</p>

            <div className="recipe-detail-meta">
              <div className="meta-pill">
                <span className="meta-value">⏱ {recipe.cookingTime}</span>
                <span className="meta-label">Minutes</span>
              </div>
              <div className="meta-pill">
                <span className="meta-value">👥 {recipe.servings}</span>
                <span className="meta-label">Servings</span>
              </div>
            </div>

            <p className="author-line">
              By <strong>{recipe.authorName || "Unknown"}</strong>
            </p>

            {isOwner && (
              <div className="detail-actions">
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete Recipe"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="recipe-body-grid">
          <div>
            <h3>Ingredients</h3>
            <ul className="ingredient-list">
              {(recipe.ingredients || []).map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Instructions</h3>
            <ol className="instruction-list">
              {(recipe.instructions || []).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
