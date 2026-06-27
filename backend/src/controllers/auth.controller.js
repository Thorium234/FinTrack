import { registerUser, loginUser } from "../services/auth.service.js";
import { sendError, sendSuccess } from "../utils/response.js";
// 1. REGISTER CONTROLLER
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "All fields are required");
    }

    // Call the service to do the heavy lifting
    const result = await registerUser({ name, email, password });

    return sendSuccess(res, 201, "User created successfully", result);

  } catch (error) {
    // If the service threw a controlled error, use its status code
    const statusCode = error.statusCode || 500;
    return sendError(res, statusCode, error.message || "Internal server error");
  }
}

// 2. LOGIN CONTROLLER
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    // Call the service to authenticate credentials
    const user = await loginUser(email, password);

    return sendSuccess(res, 200, "Login successful", user);


  } catch (error) {
    const statusCode = error.statusCode || 500;
    return sendError(res, statusCode, error.message || "Internal server error");
  }
}

/*export async function profile(
  req,
  res
) {
  res.status(200).json({
    success: true,
    user: req.user
  });
}
*/
// 3. PROFILE CONTROLLER (Protected)
export async function profile(req, res) {
  try {
    // req.user was populated by your authenticate middleware!
    return sendSuccess(res, 200, "Profile retrieved successfully", {
      user: req.user
    });
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Internal server error");
  }
}
