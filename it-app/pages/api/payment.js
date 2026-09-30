import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const { checkoutId } = req.body;

    if (!checkoutId) {
      return res.status(400).json({
        message: "checkoutId is required",
      });
    }

    const client = await clientPromise;
    const db = client.db("it-app");

    const checkoutCollection = db.collection("checkouts");
    const paymentCollection = db.collection("payments");

    // Cari checkout
    const checkout = await checkoutCollection.findOne({
      _id: new ObjectId(checkoutId),
    });

    if (!checkout) {
      return res.status(404).json({
        message: "Checkout not found",
      });
    }

    // Buat payment
    const payment = {
      checkoutId: checkout._id,
      amount: checkout.total,
      status: "PENDING",
      createdAt: new Date(),
    };

    const result = await paymentCollection.insertOne(payment);

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      paymentId: result.insertedId,
      amount: checkout.total,
      status: "PENDING",
    });
  } catch (error) {
    console.error("Payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}