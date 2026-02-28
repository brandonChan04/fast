import admin from "firebase-admin";

function getAdmin() {
  if (admin.apps.length) return admin.app();

  const creds = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  return admin.initializeApp({
    credential: admin.credential.cert(creds),
  });
}

export default async function handler(req, res) {
  try {
    getAdmin();
    const db = admin.firestore();

    if (req.method === "GET") {
      const snapshot = await db.doc("stats/primary").get();
      const data = snapshot.exists ? snapshot.data() : {};
      const lastUpdated = data?.lastUpdated?.toDate
        ? data.lastUpdated.toDate().toISOString()
        : null;

      return res.status(200).json({
        todayOver20: Number(data?.todayOver20 ?? 0),
        weekOver20: Number(data?.weekOver20 ?? 0),
        allTimeOver20: Number(data?.allTimeOver20 ?? 0),
        lastUpdated,
      });
    }

    if (req.method === "POST") {
      // simple shared secret so only your phone can write
      const token = req.headers["x-speed-token"];
      if (!process.env.SPEED_WRITE_TOKEN || token !== process.env.SPEED_WRITE_TOKEN) {
        return res.status(401).json({ error: "unauthorized" });
      }

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
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}