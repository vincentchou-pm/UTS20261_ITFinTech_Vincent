import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const { items, total } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    if (!total) {
      return res.status(400).json({
        message: "Total is required",
      });
    }

    const client = await clientPromise;
    const db = client.db("it-app");

    const checkoutCollection = db.collection("checkouts");

    const checkout = {
      items: items,
      total: total,
      status: "PENDING",
      createdAt: new Date(),
    };

    const result = await checkoutCollection.insertOne(checkout);

    return res.status(201).json({
      success: true,
      message: "Checkout created successfully",
      checkoutId: result.insertedId,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}