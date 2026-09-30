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
            image: "https://images.pexels.com/photos/13065185/pexels-photo-13065185.jpeg",
            stock: 20,
        },
        {
            name: "Beef Burger",
            description: "Juicy beef burger with fresh vegetables",
            price: 40000,
            category: "Food",
            image: "https://images.pexels.com/photos/15076700/pexels-photo-15076700.jpeg",
            stock: 15,
        },
        {
            name: "Spaghetti Carbonara",
            description: "Creamy spaghetti carbonara with cheese",
            price: 38000,
            category: "Food",
            image: "https://images.pexels.com/photos/37419505/pexels-photo-37419505.jpeg",
            stock: 18,
        },
        {
            name: "Iced Coffee",
            description: "Fresh iced coffee with milk",
            price: 18000,
            category: "Drink",
            image: "https://images.pexels.com/photos/13759884/pexels-photo-13759884.jpeg",
            stock: 30,
        },
        {
            name: "Matcha Latte",
            description: "Smooth Japanese matcha latte",
            price: 22000,
            category: "Drink",
            image: "https://images.pexels.com/photos/911810/pexels-photo-911810.jpeg",
            stock: 25,
        },
        {
            name: "Lemon Tea",
            description: "Refreshing iced lemon tea",
            price: 15000,
            category: "Drink",
            image: "https://images.pexels.com/photos/9303149/pexels-photo-9303149.jpeg",
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