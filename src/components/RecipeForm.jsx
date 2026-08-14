import { useState } from "react";
import { CATEGORIES } from "../constants";

const emptyForm = {
  title: "",
  description: "",
  category: CATEGORIES[0],
  cookingTime: "",
  servings: "",
};

export default function RecipeForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function updateIngredient(index, value) {
    setIngredients((list) => list.map((v, i) => (i === index ? value : v)));
  }

  function addIngredient() {
    setIngredients((list) => [...list, ""]);
  }

  function removeIngredient(index) {
    setIngredients((list) => list.filter((_, i) => i !== index));
  }

  function updateInstruction(index, value) {
    setInstructions((list) => list.map((v, i) => (i === index ? value : v)));
  }

  function addInstruction() {
    setInstructions((list) => [...list, ""]);
  }

  function removeInstruction(index) {
    setInstructions((list) => list.filter((_, i) => i !== index));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "Recipe name is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.cookingTime || Number(form.cookingTime) <= 0)
      errs.cookingTime = "Enter a cooking time greater than 0.";
    if (!form.servings || Number(form.servings) <= 0)
      errs.servings = "Enter servings greater than 0.";

    const cleanIngredients = ingredients.map((i) => i.trim()).filter(Boolean);
    if (cleanIngredients.length === 0)
      errs.ingredients = "Add at least one ingredient.";

    const cleanInstructions = instructions.map((i) => i.trim()).filter(Boolean);
    if (cleanInstructions.length === 0)
      errs.instructions = "Add at least one instruction step.";

    setErrors(errs);
    return { valid: Object.keys(errs).length === 0, cleanIngredients, cleanInstructions };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { valid, cleanIngredients, cleanInstructions } = validate();
    if (!valid) return;

    await onSubmit({
      ...form,
      cookingTime: Number(form.cookingTime),
      servings: Number(form.servings),
      ingredients: cleanIngredients,
      instructions: cleanInstructions,
      imageFile,
    });
  }

  return (
    <form className="form-card wide" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">Recipe Name</label>
        <input
          id="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className={errors.title ? "invalid" : ""}
          placeholder="e.g. Fried Rice"
        />
        {errors.title && <div className="field-error">{errors.title}</div>}
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className={errors.description ? "invalid" : ""}
          placeholder="A short, tasty summary of the dish"
        />
        {errors.description && (
          <div className="field-error">{errors.description}</div>
        )}
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="cookingTime">Cooking Time (minutes)</label>
          <input
            id="cookingTime"
            type="number"
            min="1"
            value={form.cookingTime}
            onChange={(e) => updateField("cookingTime", e.target.value)}
            className={errors.cookingTime ? "invalid" : ""}
          />
          {errors.cookingTime && (
            <div className="field-error">{errors.cookingTime}</div>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="servings">Servings</label>
        <input
          id="servings"
          type="number"
          min="1"
          value={form.servings}
          onChange={(e) => updateField("servings", e.target.value)}
          className={errors.servings ? "invalid" : ""}
        />
        {errors.servings && <div className="field-error">{errors.servings}</div>}
      </div>

      <div className="field">
        <label htmlFor="image">Image</label>
        <div className="image-preview">
          {imagePreview ? (
            <img src={imagePreview} alt="Recipe preview" />
          ) : (
            "No image chosen"
          )}
        </div>
        <label className="file-input-label" htmlFor="image">
          Choose Image
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />
      </div>

      <div className="field">
        <label>Ingredients</label>
        {ingredients.map((value, index) => (
          <div className="repeat-row" key={index}>
            <input
              value={value}
              onChange={(e) => updateIngredient(index, e.target.value)}
              placeholder={`Ingredient ${index + 1}, e.g. 2 cups rice`}
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeIngredient(index)}
                aria-label="Remove ingredient"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-row-btn" onClick={addIngredient}>
          + Add Ingredient
        </button>
        {errors.ingredients && (
          <div className="field-error">{errors.ingredients}</div>
        )}
      </div>

      <div className="field">
        <label>Instructions</label>
        {instructions.map((value, index) => (
          <div className="repeat-row" key={index}>
            <span className="step-index">{index + 1}.</span>
            <textarea
              value={value}
              onChange={(e) => updateInstruction(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              rows={2}
            />
            {instructions.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeInstruction(index)}
                aria-label="Remove step"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-row-btn" onClick={addInstruction}>
          + Add Step
        </button>
        {errors.instructions && (
          <div className="field-error">{errors.instructions}</div>
        )}
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? "Publishing…" : "Publish Recipe"}
      </button>
    </form>
  );
}
