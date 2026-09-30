import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const { checkoutId } = req.query;

    if (!checkoutId || !ObjectId.isValid(checkoutId)) {
      return res.status(400).json({
        message: "Invalid checkoutId",
      });
    }

    const client = await clientPromise;
    const db = client.db("it-app");

    const payment = await db.collection("payments").findOne({
      checkoutId: new ObjectId(checkoutId),
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paidAt || null,
    });
  } catch (error) {
    console.error("Payment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}