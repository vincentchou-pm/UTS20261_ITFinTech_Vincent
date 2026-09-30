import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    console.log("===== XENDIT WEBHOOK RECEIVED =====");
    console.log("Webhook body:", req.body);

    const { event, data } = req.body;

    // Kita hanya proses payment session yang berhasil
    if (event === "payment_session.completed") {
      const checkoutId = data.reference_id;
      const paymentSessionId = data.payment_session_id;
      const paymentId = data.payment_id;

      console.log("Checkout ID:", checkoutId);
      console.log("Payment Session ID:", paymentSessionId);
      console.log("Payment ID:", paymentId);

      const client = await clientPromise;
      const db = client.db("it-app");

      const checkoutCollection = db.collection("checkouts");
      const paymentCollection = db.collection("payments");

      // Update payment
      await paymentCollection.updateOne(
        {
          checkoutId: new ObjectId(checkoutId),
        },
        {
          $set: {
            status: "LUNAS",
            xenditStatus: "COMPLETED",
            xenditPaymentSessionId: paymentSessionId,
            xenditPaymentId: paymentId,
            paidAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      // Update checkout
      await checkoutCollection.updateOne(
        {
          _id: new ObjectId(checkoutId),
        },
        {
          $set: {
            status: "LUNAS",
            updatedAt: new Date(),
          },
        }
      );

      console.log("Payment successfully marked as LUNAS");

      return res.status(200).json({
        success: true,
        message: "Payment updated successfully",
      });
    }

    // Kalau event bukan completed
    console.log("Unhandled Xendit event:", event);

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
}