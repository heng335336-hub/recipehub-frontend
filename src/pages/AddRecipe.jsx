import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import RecipeForm from "../components/RecipeForm";
import { uploadImageToCloudinary } from "../utils/uploadImage";

export default function AddRecipe() {
  const { currentUser, profile } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateRecipe(data) {
    if (!currentUser) return;
    setError("");
    setSubmitting(true);

    try {
      let imageUrl = "";

      if (data.imageFile) {
        imageUrl = await uploadImageToCloudinary(data.imageFile);
      }

      await addDoc(collection(db, "recipes"), {
        title: data.title.trim(),
        description: data.description.trim(),
        imageUrl,
        category: data.category,
        cookingTime: data.cookingTime,
        servings: data.servings,
        ingredients: data.ingredients,
        instructions: data.instructions,
        authorId: currentUser.uid,
        authorName: profile?.username || currentUser.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });

      navigate("/recipes");
    } catch (err) {
      console.error(err);
      setError("Couldn't publish this recipe. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Share your dish</div>
            <h2>Add Recipe</h2>
          </div>
        </div>

        {error && (
          <div
            className="form-alert"
            style={{ maxWidth: "720px", margin: "0 auto 1.25rem" }}
          >
            {error}
          </div>
        )}

        <RecipeForm onSubmit={handleCreateRecipe} submitting={submitting} />
      </div>
    </div>
  );
}
