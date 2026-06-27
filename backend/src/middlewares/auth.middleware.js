import { verifyToken } from "../utils/jwt.js";

export async function authenticate(
  req,
  res,
  next
) {
  try {
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Access denied"
      });
    }

    const token =
      authHeader.split(" ")[1];

    const decoded =
      verifyToken(token);

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
}
