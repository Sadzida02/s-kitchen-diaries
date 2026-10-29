export type Category = "sweet" | "salty";

export type Recipe = {
  slug: string;
  title: string;
  category: Category;
  image: string;
  alt: string;
  note: string;
  featured?: boolean;
};

// Draft copy: edit the notes and titles freely. Cuisine and light/indulgent
// tags are intentionally left out until you confirm them for each dish.
export const recipes: Recipe[] = [
  {
    slug: "chocolate-dates",
    title: "Chocolate dates with pistachio",
    category: "sweet",
    image: "/images/sweet-dates.jpg",
    alt: "Dark chocolate dates topped with chopped pistachios and dried petals",
    note: "Dark chocolate, a crunch of pistachio, and a little romance on the plate.",
    featured: true,
  },
  {
    slug: "mini-pavlovas",
    title: "Mini pavlovas",
    category: "sweet",
    image: "/images/sweet-mini-pavlova.jpg",
    alt: "Mini pavlovas piped with cream and decorated with red and dark berries",
    note: "Crisp outside, soft inside, and dressed up with berries.",
    featured: true,
  },
  {
    slug: "cinnamon-rolls",
    title: "Cinnamon rolls",
    category: "sweet",
    image: "/images/sweet-cinnamon-rolls.jpg",
    alt: "A tray of cinnamon rolls with white icing and sea salt",
    note: "Soft, spiced, and gone before the coffee cools.",
    featured: true,
  },
  {
    slug: "umm-ali",
    title: "Umm Ali",
    category: "sweet",
    image: "/images/sweet-umm-ali.jpg",
    alt: "Baked Umm Ali with golden top and dark berries",
    note: "A warm, comforting bake with a golden, crispy top.",
  },
  {
    slug: "strawberry-glass",
    title: "Strawberry dessert in glass",
    category: "sweet",
    image: "/images/sweet-strawberry-glass.jpg",
    alt: "Strawberry dessert served in glasses on a yellow table with tulips",
    note: "Layers of cream and strawberry, served the way I like to share them.",
  },
  {
    slug: "muffins",
    title: "Muffins",
    category: "sweet",
    image: "/images/sweet-muffins.jpg",
    alt: "Cupcakes topped with cream and sugar flowers on a white plate",
    note: "Easy to make, easy to share, and always a little colourful.",
  },
  {
    slug: "fruit-pastries",
    title: "Fruit pastries",
    category: "sweet",
    image: "/images/sweet-fruit-pastries.jpg",
    alt: "Fruit pastries arranged on a plate beside a decorative bottle",
    note: "Light, fruity, and made for an afternoon table.",
  },
  {
    slug: "medenjak",
    title: "Medenjak",
    category: "sweet",
    image: "/images/sweet-medenjak.jpg",
    alt: "Chocolate cake sliced into wedges and topped with chopped nuts",
    note: "A rich, nutty treat for family gatherings.",
  },
  {
    slug: "halva",
    title: "Halva",
    category: "sweet",
    image: "/images/sweet-halva.jpg",
    alt: "A dark chocolate treat in a small dish beside pastel flowers",
    note: "Nutty, sweet, and a classic at the end of the table.",
  },
  {
    slug: "cookies",
    title: "Cookies",
    category: "sweet",
    image: "/images/sweet-cookies.jpg",
    alt: "Round cookies with sesame and seeds on a patterned tablecloth",
    note: "Small batches, big smiles.",
  },
  {
    slug: "homemade-pizza",
    title: "Homemade pizza",
    category: "salty",
    image: "/images/salty-pizza.jpg",
    alt: "Homemade pizza with melted cheese, tomato, and fresh toppings",
    note: "Thin, bubbly, and loaded with whatever is in the fridge.",
    featured: true,
  },
  {
    slug: "poke-bowl",
    title: "Poke bowl",
    category: "salty",
    image: "/images/salty-poke-bowl.jpg",
    alt: "Two poke bowls with fresh vegetables, seasoning, and sauce",
    note: "Fresh, colourful, and easy to make at home.",
    featured: true,
  },
  {
    slug: "grilled-meat-platter",
    title: "Grilled meat platter",
    category: "salty",
    image: "/images/salty-grilled-meat.jpg",
    alt: "A platter of grilled meat, roasted vegetables, and salads",
    note: "A table full of grilled meat, salads, and sauces.",
  },
  {
    slug: "steak-plate",
    title: "Steak plate",
    category: "salty",
    image: "/images/salty-steak.jpg",
    alt: "Seared steak on a white plate with golden rice and a fork and knife",
    note: "A simple, hearty plate with a golden side.",
  },
  {
    slug: "kiflice",
    title: "Kiflice",
    category: "salty",
    image: "/images/salty-kiflice.jpg",
    alt: "Golden kiflice rolls on a plate with a crumb-soft texture",
    note: "Soft, golden rolls from my own kitchen.",
  },
  {
    slug: "kiflice-in-tepsija",
    title: "Kiflice in tepsija",
    category: "salty",
    image: "/images/salty-kiflice-tepsija.jpg",
    alt: "A tray of baked kiflice topped with sesame seeds",
    note: "Baked in one big tray, shared by everyone.",
  },
  {
    slug: "iftar-table",
    title: "Iftar table",
    category: "salty",
    image: "/images/salty-iftar.jpg",
    alt: "A colourful iftar table with dishes, bread, and drinks",
    note: "A full table of food, made for breaking the fast together.",
  },
];

export const featuredRecipes = recipes.filter((recipe) => recipe.featured);
