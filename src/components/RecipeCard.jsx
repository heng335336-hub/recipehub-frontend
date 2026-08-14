import { Link } from "react-router-dom";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='#f1ead9'/><text x='50%' y='50%' font-family='sans-serif' font-size='16' fill='#b7862c' text-anchor='middle' dominant-baseline='middle'>No image</text></svg>`
  );

// Simple recipe card: image, title, short description, cooking time, category.
export default function RecipeCard({ recipe }) {
  const { id, title, description, imageUrl, category, cookingTime } = recipe;

  return (
    <Link to={`/recipes/${id}`} className="recipe-card">
      <div className="recipe-card-media">
        <img src={imageUrl || PLACEHOLDER_IMG} alt={title} loading="lazy" />
        {category && <span className="recipe-card-category">{category}</span>}
        {cookingTime != null && (
          <span className="recipe-card-time">⏱ {cookingTime} min</span>
        )}
      </div>

      <div className="recipe-card-body">
        <h3>{title}</h3>
        {description && <p className="recipe-card-desc">{description}</p>}
      </div>
    </Link>
  );
}
