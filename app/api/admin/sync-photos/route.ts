import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  // Verify the request has an auth token
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth().verifyIdToken(token);

    // Check if the user is an admin
    const userDoc = await adminFirestore().doc(`users/${decoded.uid}`).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // List all Firebase Auth users and sync their photoURL to Firestore
    const listResult = await adminAuth().listUsers(1000);
    const batch = adminFirestore().batch();
    let updated = 0;

    for (const authUser of listResult.users) {
      if (authUser.photoURL) {
        const docRef = adminFirestore().doc(`users/${authUser.uid}`);
        batch.set(docRef, { photoURL: authUser.photoURL }, { merge: true });
        updated++;
      }
    }

    await batch.commit();

    return NextResponse.json({ success: true, updated, total: listResult.users.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
