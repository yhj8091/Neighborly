import jwt from "jsonwebtoken";

export function getUserFromToken(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET이 설정되지 않았습니다.");
    }

    const decoded = jwt.verify(token, secret);

    return decoded;
  } catch (error) {
    return null;
  }
}