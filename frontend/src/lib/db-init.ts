import { connectDB } from "./db";

/**
 * DATABASE INITIALIZATION & INDEXING STRATEGY
 * 
 * Ensures all critical collections have the necessary indexes 
 * to maintain high performance and prevent full collection scans.
 */
export async function initializeDatabase() {
  try {
    const db = await connectDB();
    console.log("🚀 Initializing Database Indexes...");

    // 1. Users Collection
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    
    // 2. Projects Collection
    await db.collection("projects").createIndex({ ownerId: 1 });
    await db.collection("projects").createIndex({ members: 1 });
    await db.collection("projects").createIndex({ createdAt: -1 });

    // 3. Tasks Collection
    await db.collection("tasks").createIndex({ projectId: 1 });
    await db.collection("tasks").createIndex({ assigneeId: 1 });
    await db.collection("tasks").createIndex({ assigneeIds: 1 }); // Multi-member support
    await db.collection("tasks").createIndex({ status: 1 });
    await db.collection("tasks").createIndex({ createdAt: -1 });

    // 4. Roles Collection
    await db.collection("roles").createIndex({ name: 1 }, { unique: true });

    console.log("✅ Database Indexes Synchronized.");
  } catch (error) {
    console.error("❌ Database Initialization Failed:", error);
  }
}

// Automatically run in production startup if needed
if (process.env.NODE_ENV === "production") {
  initializeDatabase();
}
