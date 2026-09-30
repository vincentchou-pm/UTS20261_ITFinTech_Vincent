import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("it-app");

    const productsCollection = db.collection("products");

    if (req.method === "GET") {
      const products = await productsCollection.find({}).toArray();

      return res.status(200).json(products);
    }

    if (req.method === "POST") {
      const product = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: req.body.image || "",
        stock: req.body.stock,
      };

      const result = await productsCollection.insertOne(product);

      return res.status(201).json({
        message: "Product created successfully",
        productId: result.insertedId,
      });
    }

    return res.status(405).json({
      message: "Method not allowed",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}