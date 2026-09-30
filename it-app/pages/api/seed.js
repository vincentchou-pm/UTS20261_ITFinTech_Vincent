import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("it-app");

    const productsCollection = db.collection("products");

    const products = [
      {
        name: "Chicken Teriyaki",
        description: "Japanese-style chicken rice with teriyaki sauce",
        price: 35000,
        category: "Food",
        image: "",
        stock: 20,
      },
      {
        name: "Beef Burger",
        description: "Juicy beef burger with fresh vegetables",
        price: 40000,
        category: "Food",
        image: "",
        stock: 15,
      },
      {
        name: "Spaghetti Carbonara",
        description: "Creamy spaghetti carbonara with cheese",
        price: 38000,
        category: "Food",
        image: "",
        stock: 18,
      },
      {
        name: "Iced Coffee",
        description: "Fresh iced coffee with milk",
        price: 18000,
        category: "Drink",
        image: "",
        stock: 30,
      },
      {
        name: "Matcha Latte",
        description: "Smooth Japanese matcha latte",
        price: 22000,
        category: "Drink",
        image: "",
        stock: 25,
      },
      {
        name: "Lemon Tea",
        description: "Refreshing iced lemon tea",
        price: 15000,
        category: "Drink",
        image: "",
        stock: 30,
      },
    ];

    // Hapus data products lama
    await productsCollection.deleteMany({});

    // Masukkan data baru
    const result = await productsCollection.insertMany(products);

    return res.status(201).json({
      success: true,
      message: "Products seeded successfully!",
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to seed products",
    });
  }
}