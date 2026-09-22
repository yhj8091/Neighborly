import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/neighborhood_news";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI가 .env.local에 설정되어 있지 않습니다.");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// clientPromise for backwards compatibility with any native mongodb MongoClient consumers
export const clientPromise = (async () => {
  const mongooseInstance = await connectDB();
  return mongooseInstance.connection.getClient();
})();

export default connectDB;