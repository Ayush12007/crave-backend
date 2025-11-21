import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';
import connectDB from './config/db.js';

dotenv.config();

// -------------------------------------------
//  IMAGE MAPPING (Correct Image → Ingredient → Category)
// -------------------------------------------

const imageMap = {
  Paneer: {
    Snacks: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&w=800&q=80"
  },
  Chicken: {
    Snacks: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1546833999-b9f5816029bd?auto=format&fit=crop&w=800&q=80"
  },
  Mutton: {
    Snacks: "https://images.unsplash.com/photo-1606491956689-2ea03950a5ee?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80"
  },
  Fish: {
    Snacks: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80"
  },

  // ADDED MISSING INGREDIENTS
  Aloo: {
    Snacks: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80"
  },
  Mushroom: {
    Snacks: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&w=800&q=80"
  },
  Corn: {
    Snacks: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80"
  },
  Gobi: {
    Snacks: "https://images.unsplash.com/photo-1606491956689-2ea03950a5ee?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80"
  },
  Prawn: {
    Snacks: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80"
  },
  Egg: {
    Snacks: "https://images.unsplash.com/photo-1546833999-b9f5816029bd?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80"
  },

  Veg: {
    Soups: "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=800&q=80",
    Snacks: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80",
    "Main Dish": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80"
  },

  Drinks: {
    Base: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80"
  },
  Desserts: {
    Base: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80"
  },
  Breads: {
    Base: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80"
  },

  // CATEGORY BASE FALLBACKS (ADDED)
  Snacks: {
    Base: "https://images.unsplash.com/photo-1606491956689-2ea03950a5ee?auto=format&fit=crop&w=800&q=80"
  },
  "Main Dish": {
    Base: "https://images.unsplash.com/photo-1546833999-b9f5816029bd?auto=format&fit=crop&w=800&q=80"
  },
  Soups: {
    Base: "https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&w=800&q=80"
  }
};


const defaultImage =
  "https://images.unsplash.com/photo-1546833999-b9f5816029bd?auto=format&fit=crop&w=800&q=80";

// -------------------------------------------
//  CATEGORY + NAME GENERATION RULES
// -------------------------------------------

const categories = [
  { id: 'Snacks', bases: ['Samosa', 'Tikka', 'Kebab', 'Pakora', 'Roll', 'Chaap', 'Manchurian', '65', 'Fry'] },
  { id: 'Soups', bases: ['Shorba', 'Soup', 'Broth', 'Rasam'] },
  { id: 'Main Dish', bases: ['Butter Masala', 'Curry', 'Vindaloo', 'Korma', 'Biryani', 'Handi', 'Kadai', 'Lababdar', 'Do Pyaza', 'Rogan Josh'] },
  { id: 'Breads', bases: ['Naan', 'Roti', 'Paratha', 'Kulcha'] },
  { id: 'Desserts', bases: ['Halwa', 'Jamun', 'Rasmalai', 'Kulfi', 'Ladoo', 'Mysore Pak'] },
  { id: 'Drinks', bases: ['Lassi', 'Chai', 'Soda', 'Shake', 'Cooler', 'Mojito'] }
];

const adjectives = ['Spicy', 'Creamy', 'Royal', 'Hyderabadi', 'Amritsari', 'Tandoori', 'Crispy', 'Butter', 'Malai', 'Afghan', 'Achari', 'Special', 'Classic'];
const ingredients = ['Paneer', 'Chicken', 'Mutton', 'Aloo', 'Mushroom', 'Corn', 'Gobi', 'Fish', 'Prawn', 'Veg', 'Egg'];

// -------------------------------------------
// IMAGE RESOLVER
// -------------------------------------------

const getCorrectImage = (category, ingredient) => {
  if (imageMap[ingredient] && imageMap[ingredient][category]) {
    return imageMap[ingredient][category];
  }

  if (imageMap[category] && imageMap[category].Base) {
    return imageMap[category].Base;
  }

  if (imageMap[ingredient] && imageMap[ingredient].Snacks) {
    return imageMap[ingredient].Snacks;
  }

  return defaultImage;
};

// -------------------------------------------
// HELPERS
// -------------------------------------------

const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getPrice = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

// -------------------------------------------
// GENERATE ITEMS WITH CORRECT IMAGES
// -------------------------------------------

const generateItems = () => {
  const items = [];

  categories.forEach(cat => {
    const count = 34;

    for (let i = 0; i < count; i++) {
      let name = "";
      let ingredient = "";
      let flavor = "";
      let price = 0;

      if (cat.id === "Snacks") {
        ingredient = getRand(ingredients);
        name = `${getRand(adjectives)} ${ingredient} ${getRand(cat.bases)}`;
        price = getPrice(120, 350);
      }

      if (cat.id === "Soups") {
        ingredient = "Veg";
        flavor = getRand(["Tomato", "Manchow", "Sweet Corn", "Hot & Sour", "Lemon Coriander"]);
        name = `${getRand(adjectives)} ${flavor} ${getRand(cat.bases)}`;
        price = getPrice(120, 350);
      }

      if (cat.id === "Main Dish") {
        ingredient = getRand(ingredients);
        name = `${getRand(adjectives)} ${ingredient} ${getRand(cat.bases)}`;
        price = getPrice(280, 650);
      }

      if (cat.id === "Breads") {
        ingredient = "Breads";
        flavor = getRand(["Garlic", "Butter", "Cheese", "Chilli"]);
        name = `${flavor} ${getRand(cat.bases)}`;
        price = getPrice(40, 120);
      }

      if (cat.id === "Desserts") {
        ingredient = "Desserts";
        flavor = getRand(["Mango", "Chocolate", "Kesar", "Rose"]);
        name = `${flavor} ${getRand(cat.bases)}`;
        price = getPrice(90, 250);
      }

      if (cat.id === "Drinks") {
        ingredient = "Drinks";
        flavor = getRand(["Mint", "Sweet", "Mango", "Rose", "Masala"]);
        name = `${flavor} ${getRand(cat.bases)}`;
        price = getPrice(90, 250);
      }

      const selectedImage = getCorrectImage(cat.id, ingredient);

      items.push({
        name,
        description: `Authentic ${name} prepared with fresh ingredients.`,
        price,
        category: cat.id,
        image: selectedImage,
        isAvailable: Math.random() > 0.1,
        stock: getPrice(20, 100),
        variants: [
          { name: "Standard", additionalPrice: 0 },
          { name: "Large", additionalPrice: Math.floor(price * 0.3) },
          { name: "Premium Ghee", additionalPrice: 50 }
        ]
      });
    }
  });

  return items;
};

// -------------------------------------------
// IMPORT DATA
// -------------------------------------------

const importData = async () => {
  try {
    console.log("Connecting to DB...");
    await connectDB();

    console.log("Clearing old menu...");
    await MenuItem.deleteMany();

    console.log("Generating items...");
    const menuItems = generateItems();

    console.log("Inserting new items...");
    await MenuItem.insertMany(menuItems);

    console.log(`SUCCESS! Seeded ${menuItems.length} menu items.`);
    process.exit();
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1);
  }
};



importData();
