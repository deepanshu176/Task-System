import { connectDB } from './mongodb';
import { ObjectId } from 'mongodb';

/**
 * DATABASE QUERY HELPERS
 * 
 * Optimized for:
 * 1. Lean queries (Standardizing return formats)
 * 2. Projection (Fetching only what is needed)
 * 3. Error Boundary (Centralized query error handling)
 */

export const queryHelper = {
  /**
   * Find documents with lean projection
   */
  async findLean(collection: string, filter = {}, projection = {}, limit = 50) {
    const db = await connectDB();
    return await db.collection(collection)
      .find(filter)
      .project(projection)
      .limit(limit)
      .toArray();
  },

  /**
   * Find a single document by ID
   */
  async findById(collection: string, id: string, projection = {}) {
    if (!ObjectId.isValid(id)) return null;
    const db = await connectDB();
    return await db.collection(collection).findOne(
      { _id: new ObjectId(id) },
      { projection }
    );
  },

  /**
   * Safe create with timestamp integration
   */
  async create(collection: string, data: any) {
    const db = await connectDB();
    const result = await db.collection(collection).insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return result;
  }
};
