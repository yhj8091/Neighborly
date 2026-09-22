import jwt from "jsonwebtoken";

const DEFAULT_SECRET =
  process.env.JWT_SECRET ||
  "neighborhood-news-secret-key-2026-random-9xK2mP7qL4";

export function getUserFromToken(request) {
  try {
    let token = request.cookies?.get?.("token")?.value;

    if (!token) {
      const authHeader = request.headers?.get?.("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, DEFAULT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, DEFAULT_SECRET, { expiresIn });
}