# RecipeHub (Frontend)

A small, student-project recipe sharing site: React + Vite on the frontend,
Firebase (Authentication, Firestore, Storage) as the entire backend. No
Java, no Spring Boot, no MySQL, no Node.js server — Firebase is the backend.

## 1. Install dependencies

```bash
cd recipehub-frontend
npm install
```

## 2. Create your Firebase project (do this once)

1. Go to https://console.firebase.google.com and create a new project.
2. **Authentication** → Build → Authentication → Get Started → enable the
   **Email/Password** sign-in method.
3. **Firestore** → Build → Firestore Database → Create database → start in
   test mode for local development.
4. **Storage** → Build → Storage → Get Started → start in test mode.
5. Project settings (gear icon) → General → "Your apps" → click `</>` to
   register a Web app → copy the `firebaseConfig` object it shows you.

## 3. Add your Firebase keys

Open `src/firebase/firebaseConfig.js` and paste your real values into the
`firebaseConfig` object (instructions and an optional `.env`-based approach
are documented inline in that file).

## 4. Lock down security rules (before you share this publicly)

Test mode leaves your database and storage open to anyone. Once you're
past local development:

- Paste the contents of `firestore.rules` into **Firestore Database → Rules**
  in the Firebase console.
- Paste the contents of `storage.rules` into **Storage → Rules**.

These rules already match the app's requirements:

- Anyone can read recipes; only logged-in users can create one; only the
  recipe's author can edit/delete it.
- Anyone can read user profiles; a user can only write their own profile.
- Anyone can view recipe images; only logged-in users can upload (max 5MB,
  images only).

## 5. Run it

```bash
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Project structure

```
src/
├── components/       Navbar, RecipeCard, RecipeForm
├── pages/            Home, Recipes, RecipeDetails, Login, Register,
│                      AddRecipe, Profile
├── firebase/          firebaseConfig.js  (your keys go here)
├── context/           AuthContext.jsx  (tracks logged-in user + profile)
├── constants.js        recipe categories
├── App.jsx
└── main.jsx
```

## Firestore data shape

```
users/{uid}
  username, email, createdAt

recipes/{recipeId}
  title, description, imageUrl, category, cookingTime, servings,
  ingredients: [string], instructions: [string],
  authorId, authorName, createdAt
```

No separate collections for ingredients/instructions — they're stored as
arrays directly on the recipe document, per the project spec.

## Seeding sample recipes

`scripts/seed.js` generates 500+ varied sample recipes (Bakery, Soup,
Candy, Dessert, and general recipes spread across the other categories)
and writes them to your Firestore in one go. See the comment block at the
top of that file for the one-time setup (installing `firebase-admin`,
downloading a service account key, and setting your own UID as the
author), then run:

```bash
node scripts/seed.js
```

