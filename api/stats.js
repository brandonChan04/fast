import admin from "firebase-admin";

function getAdmin() {
  if (admin.apps.length) return admin.app();

  const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  return admin.initializeApp({
    credential: admin.credential.cert(creds),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  // simple shared secret so only your phone can write
  const token = req.headers["x-speed-token"];
  if (!process.env.SPEED_WRITE_TOKEN || token !== process.env.SPEED_WRITE_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    getAdmin();
    const db = admin.firestore();

    const { todayOver20, weekOver20, allTimeOver20 } = req.body || {};

    await db.doc("stats/primary").set(
      {
        todayOver20: Number(todayOver20 ?? 0),
        weekOver20: Number(weekOver20 ?? 0),
        allTimeOver20: Number(allTimeOver20 ?? 0),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}