import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;

    const db = client.db("it-app");

    await db.command({ ping: 1 });

    res.status(200).json({
      success: true,
      message: "MongoDB connected successfully!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "MongoDB connection failed",
    });
  }
}