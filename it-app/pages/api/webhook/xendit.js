import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    // =========================
    // VERIFY XENDIT WEBHOOK
    // =========================

    const callbackToken = req.headers["x-callback-token"];

    if (
      !process.env.XENDIT_WEBHOOK_TOKEN ||
      callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN
    ) {
      console.error("Invalid Xendit webhook token");

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("===== XENDIT WEBHOOK RECEIVED =====");
    console.log("Webhook body:", req.body);

    const { event, data } = req.body;

    // =========================
    // PAYMENT SESSION COMPLETED
    // =========================

    if (event === "payment_session.completed") {
      const checkoutId = data.reference_id;
      const paymentSessionId = data.id;

      console.log("Checkout ID:", checkoutId);
      console.log("Payment Session ID:", paymentSessionId);
      console.log("Status:", data.status);

      if (!checkoutId) {
        return res.status(400).json({
          success: false,
          message: "reference_id is missing",
        });
      }

      if (!ObjectId.isValid(checkoutId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid checkout ID",
        });
      }

      if (data.status !== "COMPLETED") {
        return res.status(200).json({
          success: true,
          message: "Payment is not completed",
        });
      }

      const client = await clientPromise;
      const db = client.db("it-app");

      const checkoutCollection = db.collection("checkouts");
      const paymentCollection = db.collection("payments");

      const checkout = await checkoutCollection.findOne({
        _id: new ObjectId(checkoutId),
      });

      if (!checkout) {
        console.error("Checkout not found:", checkoutId);

        return res.status(404).json({
          success: false,
          message: "Checkout not found",
        });
      }

      // Update payment
      await paymentCollection.updateOne(
        {
          checkoutId: checkout._id,
        },
        {
          $set: {
            status: "LUNAS",
            xenditStatus: data.status,
            xenditPaymentSessionId: paymentSessionId,
            paidAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      // Update checkout
      await checkoutCollection.updateOne(
        {
          _id: checkout._id,
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