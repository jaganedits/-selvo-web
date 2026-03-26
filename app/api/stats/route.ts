import { NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase/admin";

export const revalidate = 3600; // cache for 1 hour

export async function GET() {
  try {
    const [usersSnap, authList] = await Promise.all([
      adminFirestore().collection("users").get(),
      adminAuth().listUsers(1000),
    ]);

    const users = usersSnap.docs.map((d) => d.data());
    const totalUsers = authList.users.length;
    const connectedUsers = users.filter((u) => !!u.firebaseConfig).length;

    // Count total budgets and transactions across all connected users
    let totalBudgets = 0;
    let totalTransactions = 0;

    for (const user of usersSnap.docs) {
      const data = user.data();
      if (data.firebaseConfig) {
        // Count budget month keys
        if (data.budgetMonthKeys?.length) {
          totalBudgets += data.budgetMonthKeys.length;
        }
      }
    }

    // Collect profile photos (only Google users with photos)
    const avatars: string[] = [];
    for (const authUser of authList.users) {
      if (authUser.photoURL && avatars.length < 8) {
        avatars.push(authUser.photoURL);
      }
    }

    return NextResponse.json({
      totalUsers,
      connectedUsers,
      totalBudgets,
      totalTransactions,
      avatars,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { totalUsers: 0, connectedUsers: 0, totalBudgets: 0, totalTransactions: 0, avatars: [] },
      { status: 200 }
    );
  }
}
