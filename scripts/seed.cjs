/**
 * RecipeHub seed script
 * -----------------------------------------------------------------------
 * Generates 500+ varied sample recipes and writes them straight into
 * your Firestore "recipes" collection, using the Firebase ADMIN SDK
 * (not the app's client SDK) - this bypasses security rules so it can
 * do a large bulk write quickly and reliably.
 *
 * SETUP (one time):
 *
 * 1. In this project folder, install the admin SDK:
 *      npm install firebase-admin
 *
 * 2. Get a service account key:
 *      Firebase Console -> gear icon -> Project settings
 *      -> Service accounts tab -> "Generate new private key"
 *      This downloads a JSON file. Rename it to `serviceAccountKey.json`
 *      and place it in this same `scripts/` folder.
 *
 *      IMPORTANT: this file grants full admin access to your Firebase
 *      project. Never commit it to a public repo. Add this line to your
 *      .gitignore:
 *          scripts/serviceAccountKey.json
 *
 * 3. Set AUTHOR_UID below to your own user ID, so the seeded recipes
 *    show up under "My Recipes" in your Profile page and can be deleted
 *    from the app like any other recipe you own.
 *      Firebase Console -> Authentication -> Users tab -> copy the
 *      value in the "User UID" column for your account.
 *
 * RUN IT:
 *      node scripts/seed.js
 *
 * It's safe to run more than once, but running it twice will add a
 * second full batch of recipes (duplicates) - it doesn't check for
 * existing ones.
 * -----------------------------------------------------------------------
 */

const admin = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const path = require("path");

// ---------------------------------------------------------------------
// 1. CONFIGURE THIS
// ---------------------------------------------------------------------
const AUTHOR_UID = "0rjPhgzOnoSClPuzyAPnkdGppuM2";
const AUTHOR_NAME = "RecipeHub Team";

if (AUTHOR_UID === "PASTE_YOUR_FIREBASE_AUTH_UID_HERE") {
  console.error(
    "\n❌ Please open scripts/seed.js and set AUTHOR_UID to your real Firebase Auth UID first.\n" +
      "   (Firebase Console -> Authentication -> Users -> copy the User UID column)\n"
  );
  process.exit(1);
}

const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const db = getFirestore();

// ---------------------------------------------------------------------
// 2. HELPERS
// ---------------------------------------------------------------------
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildIngredients(pool, count) {
  const chosen = shuffle(pool).slice(0, count);
  const quantities = [
    "1 cup", "2 cups", "1/2 cup", "1/4 cup", "3 tbsp", "2 tbsp", "1 tbsp",
    "1 tsp", "2 tsp", "1/2 tsp", "3", "2", "1", "200g", "300g", "100g",
    "500ml", "250ml", "a pinch of", "to taste",
  ];
  return chosen.map((item) => `${pick(quantities)} ${item}`);
}

const INSTRUCTION_TEMPLATES = [
  "Gather and prepare all your ingredients for the {title}.",
  "Preheat your oven or pan as needed before you start cooking.",
  "Combine the main ingredients together in a bowl or pot.",
  "Cook over medium heat, stirring occasionally, until everything is well combined.",
  "Season to taste and adjust the flavor as needed.",
  "Let it cook, bake, or chill for the recommended time.",
  "Check for doneness, then remove from heat.",
  "Plate the {title} and garnish if desired.",
  "Let it rest for a few minutes before serving.",
  "Serve warm and enjoy your {title}!",
];

function buildInstructions(title, stepCount) {
  const steps = shuffle(INSTRUCTION_TEMPLATES).slice(0, stepCount);
  // Always end on a "serve" step for a natural finish.
  const last = "Serve warm and enjoy your {title}!";
  const withoutLast = steps.filter((s) => s !== last);
  const finalSteps = [...withoutLast, last];
  return finalSteps.map((s) => s.replace(/{title}/g, title.toLowerCase()));
}

// ---------------------------------------------------------------------
// 3. INGREDIENT POOLS (per food group)
// ---------------------------------------------------------------------
const BAKERY_INGREDIENTS = [
  "all-purpose flour", "bread flour", "whole wheat flour", "yeast",
  "warm water", "milk", "butter", "eggs", "sugar", "brown sugar", "salt",
  "baking powder", "baking soda", "vanilla extract", "cinnamon",
  "vegetable oil", "olive oil", "honey", "cream cheese", "buttermilk",
  "sour cream", "cornmeal", "oats", "chopped walnuts", "raisins",
];

const SOUP_INGREDIENTS = [
  "chicken broth", "vegetable broth", "beef broth", "onion", "garlic",
  "carrots", "celery", "potatoes", "diced tomatoes", "tomato paste",
  "bay leaves", "black pepper", "salt", "olive oil", "butter", "cream",
  "coconut milk", "noodles", "rice", "lentils", "beans", "corn kernels",
  "mushrooms", "spinach", "fresh herbs", "ginger", "soy sauce",
  "chili flakes", "lime juice",
];

const CANDY_INGREDIENTS = [
  "granulated sugar", "brown sugar", "corn syrup", "butter", "heavy cream",
  "sweetened condensed milk", "chocolate chips", "cocoa powder", "vanilla extract",
  "salt", "peanuts", "almonds", "coconut flakes", "food coloring",
  "gelatin", "peppermint extract", "honey", "marshmallows", "pretzels",
];

const DESSERT_INGREDIENTS = [
  "flour", "sugar", "butter", "eggs", "vanilla extract", "cocoa powder",
  "chocolate", "cream cheese", "heavy cream", "milk", "baking powder",
  "baking soda", "salt", "lemon juice", "lemon zest", "strawberries",
  "blueberries", "bananas", "apples", "cinnamon", "nutmeg", "gelatin",
  "mascarpone cheese", "espresso", "graham cracker crumbs", "coconut milk",
];

const GENERAL_INGREDIENTS = [
  "rice", "noodles", "pasta", "chicken breast", "ground beef", "shrimp",
  "tofu", "eggs", "onion", "garlic", "ginger", "bell pepper", "carrots",
  "broccoli", "soy sauce", "olive oil", "sesame oil", "salt", "black pepper",
  "chili powder", "cumin", "paprika", "tomatoes", "cheese", "lettuce",
  "tortillas", "bread", "potatoes", "green onions", "lime juice",
  "coconut milk", "curry powder", "yogurt", "cilantro", "parsley",
];

// ---------------------------------------------------------------------
// 4. DISH NAME BASES + MODIFIERS (combined to generate unique titles)
// ---------------------------------------------------------------------
const MODIFIERS = [
  "Classic", "Homestyle", "Rustic", "Golden", "Crispy", "Fluffy", "Rich",
  "Silky", "Tangy", "Sweet", "Savory", "Zesty", "Smoky", "Creamy",
  "Buttery", "Spicy", "Honey", "Garlic", "Lemon", "Chocolate", "Vanilla",
  "Coconut", "Ginger", "Maple", "Cinnamon", "Caramel", "Herb-Crusted",
  "Roasted", "Grilled", "Baked", "Braised", "Old-Fashioned", "Southern-Style",
  "Quick", "Easy", "Family-Style", "Weeknight", "Traditional", "Modern",
];

const BAKERY_BASES = [
  "Sourdough Bread", "Baguette", "Croissant", "Cinnamon Roll",
  "Blueberry Muffin", "Banana Bread", "Dinner Rolls", "Focaccia", "Bagel",
  "Brioche", "Ciabatta", "Pretzel", "Naan", "Pita Bread", "Cornbread",
  "Scone", "Danish Pastry", "Pound Cake", "Coffee Cake", "Zucchini Bread",
  "Pumpkin Bread", "Multigrain Loaf", "Rye Bread", "Garlic Bread",
  "Cheese Bread", "Milk Bread", "Potato Bread", "Whole Wheat Bread",
  "Flatbread", "Breadsticks", "Hot Cross Buns", "Monkey Bread",
  "Cloud Bread", "English Muffin", "Soda Bread", "Challah", "Panettone",
  "Stollen", "Babka", "Kolache",
];

const SOUP_BASES = [
  "Chicken Noodle Soup", "Tomato Soup", "Vegetable Soup", "Miso Soup",
  "Pumpkin Soup", "Lentil Soup", "Minestrone", "Clam Chowder",
  "Corn Chowder", "Beef Stew Soup", "Mushroom Soup", "Broccoli Cheddar Soup",
  "French Onion Soup", "Egg Drop Soup", "Hot and Sour Soup", "Wonton Soup",
  "Pho", "Ramen", "Tortilla Soup", "Split Pea Soup", "Black Bean Soup",
  "Potato Leek Soup", "Butternut Squash Soup", "Carrot Ginger Soup",
  "Cabbage Soup", "Chicken Tortilla Soup", "Seafood Chowder", "Gazpacho",
  "Beef Pho", "Curry Soup",
];

const CANDY_BASES = [
  "Fudge", "Caramel Candy", "Peanut Brittle", "Chocolate Truffle", "Toffee",
  "Gummy Bears", "Lollipop", "Peppermint Bark", "Rock Candy", "Marshmallow",
  "Chocolate Bark", "Coconut Candy", "Nougat", "Praline", "Taffy",
  "Butterscotch", "Candy Apple", "Mint Candy", "Honeycomb Candy",
  "Chocolate Covered Pretzel",
];

const DESSERT_BASES = [
  "Chocolate Cake", "Cheesecake", "Tiramisu", "Apple Pie", "Ice Cream",
  "Brownies", "Panna Cotta", "Creme Brulee", "Pavlova", "Mousse", "Trifle",
  "Cupcake", "Donut", "Waffle", "Pancake", "Rice Pudding", "Bread Pudding",
  "Fruit Tart", "Macarons", "Eclair", "Cannoli", "Baklava", "Churros",
  "Sorbet", "Parfait", "Sundae", "Custard", "Shortcake", "Meringue",
  "Cobbler", "Crumble", "Gelato", "Souffle", "Mochi", "Layer Cake",
  "Bundt Cake", "Cake Pop", "Whoopie Pie", "Pudding Cake", "Chiffon Cake",
];

const GENERAL_BASES = [
  "Fried Rice", "Stir Fry", "Grilled Chicken", "Pasta", "Pizza", "Tacos",
  "Burrito", "Sandwich", "Salad", "Curry", "Noodles", "Dumplings",
  "Sushi Roll", "Burger", "Omelette", "Pancakes", "Quiche", "Casserole",
  "Meatballs", "Kebab", "Fajitas", "Stuffed Peppers", "Shepherd's Pie",
  "Lasagna", "Risotto", "Paella", "Ratatouille", "Spring Rolls",
  "Fried Chicken", "Grilled Fish", "Roast Beef", "Pork Chops",
  "Shrimp Scampi", "Chicken Wings", "BBQ Ribs", "Chili", "Enchiladas",
  "Quesadilla", "Falafel", "Hummus Plate", "Grain Bowl", "Poke Bowl",
  "Smoothie", "Fruit Salad", "Iced Tea", "Lemonade", "Milkshake",
  "Hot Chocolate", "Iced Coffee", "Mocktail",
];

// ---------------------------------------------------------------------
// 5. GENERATOR
// ---------------------------------------------------------------------
function generateRecipes({
  bases,
  category,
  targetCount,
  cookingTimeRange,
  servingsRange,
  ingredientPool,
}) {
  const usedTitles = new Set();
  const recipes = [];
  let attempts = 0;
  const maxAttempts = targetCount * 20;

  while (recipes.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const base = pick(bases);
    const useModifier = Math.random() < 0.75;
    const title = useModifier ? `${pick(MODIFIERS)} ${base}` : base;

    if (usedTitles.has(title)) continue;
    usedTitles.add(title);

    const ingredientCount = randInt(4, 8);
    const stepCount = randInt(4, 6);

    recipes.push({
      title,
      description: `A ${title.toLowerCase()} recipe worth adding to your rotation - simple to make and full of flavor.`,
      category,
      cookingTime: randInt(cookingTimeRange[0], cookingTimeRange[1]),
      servings: randInt(servingsRange[0], servingsRange[1]),
      ingredients: buildIngredients(ingredientPool, ingredientCount),
      instructions: buildInstructions(title, stepCount),
      imageUrl: "",
      authorId: AUTHOR_UID,
      authorName: AUTHOR_NAME,
    });
  }

  return recipes;
}

// ---------------------------------------------------------------------
// 6. BUILD THE FULL RECIPE LIST
// ---------------------------------------------------------------------
const allRecipes = [
  ...generateRecipes({
    bases: BAKERY_BASES,
    category: "Bakery",
    targetCount: 115,
    cookingTimeRange: [20, 90],
    servingsRange: [4, 12],
    ingredientPool: BAKERY_INGREDIENTS,
  }),
  ...generateRecipes({
    bases: SOUP_BASES,
    category: "Soup",
    targetCount: 55,
    cookingTimeRange: [15, 60],
    servingsRange: [2, 6],
    ingredientPool: SOUP_INGREDIENTS,
  }),
  ...generateRecipes({
    bases: CANDY_BASES,
    category: "Candy",
    targetCount: 55,
    cookingTimeRange: [10, 45],
    servingsRange: [6, 20],
    ingredientPool: CANDY_INGREDIENTS,
  }),
  ...generateRecipes({
    bases: DESSERT_BASES,
    category: "Dessert",
    targetCount: 110,
    cookingTimeRange: [15, 75],
    servingsRange: [2, 10],
    ingredientPool: DESSERT_INGREDIENTS,
  }),
  ...generateRecipes({
    bases: GENERAL_BASES,
    category: "Breakfast",
    targetCount: 35,
    cookingTimeRange: [10, 40],
    servingsRange: [1, 4],
    ingredientPool: GENERAL_INGREDIENTS,
  }),
  ...generateRecipes({
    bases: GENERAL_BASES,
    category: "Lunch",
    targetCount: 35,
    cookingTimeRange: [15, 45],
    servingsRange: [1, 4],
    ingredientPool: GENERAL_INGREDIENTS,
  }),
  ...generateRecipes({
    bases: GENERAL_BASES,
    category: "Dinner",
    targetCount: 40,
    cookingTimeRange: [20, 60],
    servingsRange: [2, 6],
    ingredientPool: GENERAL_INGREDIENTS,
  }),
  ...generateRecipes({
    bases: GENERAL_BASES,
    category: "Snack",
    targetCount: 35,
    cookingTimeRange: [5, 25],
    servingsRange: [1, 4],
    ingredientPool: GENERAL_INGREDIENTS,
  }),
  ...generateRecipes({
    bases: GENERAL_BASES,
    category: "Drinks",
    targetCount: 25,
    cookingTimeRange: [3, 15],
    servingsRange: [1, 4],
    ingredientPool: GENERAL_INGREDIENTS,
  }),
  ...generateRecipes({
    bases: GENERAL_BASES,
    category: "Vegetarian",
    targetCount: 30,
    cookingTimeRange: [10, 45],
    servingsRange: [2, 4],
    ingredientPool: GENERAL_INGREDIENTS,
  }),
];

console.log(`Prepared ${allRecipes.length} recipes to write.`);

// ---------------------------------------------------------------------
// 7. WRITE TO FIRESTORE (batched, using bulkWriter for reliability)
// ---------------------------------------------------------------------
async function seed() {
  const bulkWriter = db.bulkWriter();
  let written = 0;

  bulkWriter.onWriteError((error) => {
    console.error("Write failed, retrying:", error.message);
    return error.failedAttempts < 3;
  });

  for (const recipe of allRecipes) {
    const docRef = db.collection("recipes").doc();
    bulkWriter.set(docRef, {
      ...recipe,
      createdAt: FieldValue.serverTimestamp(),
    });
    written++;
    if (written % 50 === 0) {
      console.log(`Queued ${written}/${allRecipes.length}...`);
    }
  }

  await bulkWriter.close();
  console.log(`\n✅ Done. Wrote ${allRecipes.length} recipes to Firestore.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
