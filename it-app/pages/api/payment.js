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

    if (!process.env.XENDIT_SECRET_KEY) {
      return res.status(500).json({
        message: "XENDIT_SECRET_KEY is not configured",
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

    // Cek apakah payment untuk checkout ini sudah ada
    let payment = await paymentCollection.findOne({
      checkoutId: checkout._id,
    });

    // Kalau belum ada, buat payment baru
    if (!payment) {
      const newPayment = {
        checkoutId: checkout._id,
        amount: checkout.total,
        status: "PENDING",
        createdAt: new Date(),
      };

      const result = await paymentCollection.insertOne(newPayment);

      payment = {
        ...newPayment,
        _id: result.insertedId,
      };
    }

    // Kalau sudah punya Xendit payment link,
    // jangan buat session baru
    if (payment.paymentLinkUrl) {
      return res.status(200).json({
        success: true,
        paymentId: payment._id,
        amount: payment.amount,
        status: payment.status,
        paymentLinkUrl: payment.paymentLinkUrl,
      });
    }

    // Buat item untuk Xendit
    const items = checkout.items.map((item) => ({
        reference_id: item.productId,
        name: item.name,
        type: "PHYSICAL_PRODUCT",
        category: item.category || "Food",
        quantity: item.quantity,
        net_unit_amount: item.price,
        currency: "IDR",
    }));

    const appUrl = process.env.APP_URL;

    if (!appUrl) {
    return res.status(500).json({
        message: "APP_URL is not configured",
    });
    }

    // Buat Payment Session Xendit
    const xenditResponse = await fetch(
      "https://api.xendit.co/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          // Basic Auth:
          // username = Secret API Key
          // password = kosong
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.XENDIT_SECRET_KEY}:`
            ).toString("base64"),
        },
        body: JSON.stringify({
        reference_id: checkoutId,
        session_type: "PAY",
        mode: "PAYMENT_LINK",
        amount: checkout.total,
        currency: "IDR",
        country: "ID",
        locale: "id",
        description: `Payment for checkout ${checkoutId}`,

        success_return_url: `${appUrl}/payment/success?checkoutId=${checkoutId}`,
        cancel_return_url: `${appUrl}/payment/cancel?checkoutId=${checkoutId}`,

        items: items,
        }),
      }
    );

    const xenditData = await xenditResponse.json();

    console.log("Xendit response:", xenditData);

    if (!xenditResponse.ok) {
      return res.status(xenditResponse.status).json({
        success: false,
        message: "Failed to create Xendit payment",
        error: xenditData,
      });
    }

    // Simpan informasi Xendit ke MongoDB
    await paymentCollection.updateOne(
      {
        _id: payment._id,
      },
      {
        $set: {
          xenditSessionId: xenditData.payment_session_id,
          paymentLinkUrl: xenditData.payment_link_url,
          xenditStatus: xenditData.status,
          updatedAt: new Date(),
        },
      }
    );

    return res.status(201).json({
      success: true,
      paymentId: payment._id,
      amount: payment.amount,
      status: payment.status,
      xenditSessionId: xenditData.payment_session_id,
      paymentLinkUrl: xenditData.payment_link_url,
    });
  } catch (error) {
    console.error("Payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}