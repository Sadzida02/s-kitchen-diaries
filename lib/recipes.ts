export type Category = "sweet" | "salty";
export type Tag =
  | "breakfast"
  | "lunch"
  | "healthy"
  | "bosnian"
  | "turkish"
  | "arabic"
  | "traditional"
  | "desserts"
  | "asian"
  | "guilty";
export type FilterSlug = Category | Tag;

export type Recipe = {
  slug: string;
  title: string;
  category: Category;
  tags?: Tag[];
  image: string;
  alt: string;
  note: string;
  featured?: boolean;
};

// Draft copy: edit the notes and titles freely. The `tags` are my best guess
// from the dish names, so correct them as you like (a recipe can have several).
export const recipes: Recipe[] = [
  {
    slug: "chocolate-dates",
    title: "Chocolate dates with pistachio",
    category: "sweet",
    tags: ["arabic", "desserts", "guilty"],
    image: "/images/sweet-dates.jpg",
    alt: "Dark chocolate dates topped with chopped pistachios and dried petals",
    note: "Dark chocolate, a crunch of pistachio, and a little romance on the plate.",
    featured: true,
  },
  {
    slug: "mini-pavlovas",
    title: "Mini pavlovas",
    category: "sweet",
    tags: ["desserts"],
    image: "/images/sweet-mini-pavlova.jpg",
    alt: "Mini pavlovas piped with cream and decorated with red and dark berries",
    note: "Crisp outside, soft inside, and dressed up with berries.",
    featured: true,
  },
  {
    slug: "cinnamon-rolls",
    title: "Cinnamon rolls",
    category: "sweet",
    tags: ["breakfast", "guilty"],
    image: "/images/sweet-cinnamon-rolls.jpg",
    alt: "A tray of cinnamon rolls with white icing and sea salt",
    note: "Soft, spiced, and gone before the coffee cools.",
    featured: true,
  },
  {
    slug: "umm-ali",
    title: "Umm Ali",
    category: "sweet",
    tags: ["arabic", "desserts", "traditional"],
    image: "/images/sweet-umm-ali.jpg",
    alt: "Baked Umm Ali with golden top and dark berries",
    note: "A warm, comforting bake with a golden, crispy top.",
  },
  {
    slug: "strawberry-glass",
    title: "Strawberry dessert in glass",
    category: "sweet",
    tags: ["desserts"],
    image: "/images/sweet-strawberry-glass.jpg",
    alt: "Strawberry dessert served in glasses on a yellow table with tulips",
    note: "Layers of cream and strawberry, served the way I like to share them.",
  },
  {
    slug: "muffins",
    title: "Muffins",
    category: "sweet",
    tags: ["breakfast", "guilty"],
    image: "/images/sweet-muffins.jpg",
    alt: "Cupcakes topped with cream and sugar flowers on a white plate",
    note: "Easy to make, easy to share, and always a little colourful.",
  },
  {
    slug: "fruit-pastries",
    title: "Fruit pastries",
    category: "sweet",
    tags: ["breakfast", "healthy", "desserts"],
    image: "/images/sweet-fruit-pastries.jpg",
    alt: "Fruit pastries arranged on a plate beside a decorative bottle",
    note: "Light, fruity, and made for an afternoon table.",
  },
  {
    slug: "medenjak",
    title: "Medenjak",
    category: "sweet",
    tags: ["bosnian", "traditional", "desserts"],
    image: "/images/sweet-medenjak.jpg",
    alt: "Chocolate cake sliced into wedges and topped with chopped nuts",
    note: "A rich, nutty treat for family gatherings.",
  },
  {
    slug: "halva",
    title: "Halva",
    category: "sweet",
    tags: ["turkish", "traditional", "desserts"],
    image: "/images/sweet-halva.jpg",
    alt: "A dark chocolate treat in a small dish beside pastel flowers",
    note: "Nutty, sweet, and a classic at the end of the table.",
  },
  {
    slug: "cookies",
    title: "Cookies",
    category: "sweet",
    tags: ["guilty", "desserts"],
    image: "/images/sweet-cookies.jpg",
    alt: "Round cookies with sesame and seeds on a patterned tablecloth",
    note: "Small batches, big smiles.",
  },
  {
    slug: "homemade-pizza",
    title: "Homemade pizza",
    category: "salty",
    tags: ["lunch", "guilty"],
    image: "/images/salty-pizza.jpg",
    alt: "Homemade pizza with melted cheese, tomato, and fresh toppings",
    note: "Thin, bubbly, and loaded with whatever is in the fridge.",
    featured: true,
  },
  {
    slug: "poke-bowl",
    title: "Poke bowl",
    category: "salty",
    tags: ["lunch", "healthy", "asian"],
    image: "/images/salty-poke-bowl.jpg",
    alt: "Two poke bowls with fresh vegetables, seasoning, and sauce",
    note: "Fresh, colourful, and easy to make at home.",
    featured: true,
  },
  {
    slug: "grilled-meat-platter",
    title: "Grilled meat platter",
    category: "salty",
    tags: ["lunch", "bosnian", "traditional"],
    image: "/images/salty-grilled-meat.jpg",
    alt: "A platter of grilled meat, roasted vegetables, and salads",
    note: "A table full of grilled meat, salads, and sauces.",
  },
  {
    slug: "steak-plate",
    title: "Steak plate",
    category: "salty",
    tags: ["lunch"],
    image: "/images/salty-steak.jpg",
    alt: "Seared steak on a white plate with golden rice and a fork and knife",
    note: "A simple, hearty plate with a golden side.",
  },
  {
    slug: "kiflice",
    title: "Kiflice",
    category: "salty",
    tags: ["breakfast", "bosnian", "traditional"],
    image: "/images/salty-kiflice.jpg",
    alt: "Golden kiflice rolls on a plate with a crumb-soft texture",
    note: "Soft, golden rolls from my own kitchen.",
  },
  {
    slug: "kiflice-in-tepsija",
    title: "Kiflice in tepsija",
    category: "salty",
    tags: ["breakfast", "bosnian", "traditional"],
    image: "/images/salty-kiflice-tepsija.jpg",
    alt: "A tray of baked kiflice topped with sesame seeds",
    note: "Baked in one big tray, shared by everyone.",
  },
  {
    slug: "iftar-table",
    title: "Iftar table",
    category: "salty",
    tags: ["bosnian", "traditional"],
    image: "/images/salty-iftar.jpg",
    alt: "A colourful iftar table with dishes, bread, and drinks",
    note: "A full table of food, made for breaking the fast together.",
  },
];

export type CategoryInfo = {
  slug: FilterSlug;
  title: string;
  line: string;
  image: string;
  alt: string;
};

// Used for the circles on the home page and the filter bar on /recipes.
export const categories: CategoryInfo[] = [
  { slug: "sweet", title: "Sweet", line: "Something sweet for the end of the table.", image: "/images/sweet-cinnamon-rolls.jpg", alt: "A tray of cinnamon rolls with white icing" },
  { slug: "salty", title: "Savory", line: "Something savoury for the middle of it.", image: "/images/salty-pizza.jpg", alt: "Homemade pizza with fresh toppings" },
  { slug: "traditional", title: "Traditional", line: "Dishes from home and from the old recipe notebook.", image: "/images/salty-kiflice-tepsija.jpg", alt: "A tray of baked kiflice" },
  { slug: "lunch", title: "Lunch", line: "Plates worth sitting down for.", image: "/images/salty-steak.jpg", alt: "Seared steak with golden rice" },
  { slug: "healthy", title: "Healthy", line: "Fresh, light, and colourful.", image: "/images/sweet-strawberry-glass.jpg", alt: "Strawberry dessert in glasses with tulips" },
  { slug: "desserts", title: "Desserts", line: "Cakes, creams, and every little sweet bite.", image: "/images/sweet-mini-pavlova.jpg", alt: "Mini pavlovas topped with cream and berries" },
  { slug: "turkish", title: "Turkish", line: "A Turkish spoon in my kitchen.", image: "/images/sweet-halva.jpg", alt: "Halva in a small dish" },
  { slug: "asian", title: "Asian", line: "Fresh bowls and bold flavours.", image: "/images/salty-poke-bowl.jpg", alt: "Poke bowls with fresh vegetables" },
  { slug: "guilty", title: "Guilty pleasures", line: "Worth every single bite.", image: "/images/sweet-cookies.jpg", alt: "Round cookies with sesame and seeds" },
];

export function recipesFor(slug: string | undefined): Recipe[] {
  if (!slug) return recipes;
  return recipes.filter(
    (recipe) => recipe.category === slug || (recipe.tags as string[] | undefined)?.includes(slug),
  );
}

export const featuredRecipes = recipes.filter((recipe) => recipe.featured);
