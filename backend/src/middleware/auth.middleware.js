import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.jwt;

    // If no token is found, send an Unauthorized response
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the ID in the decoded token
    const user = await User.findById(decoded.userId).select("-password");

    // If no user is found, send a Not Found response
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request object for use in route handlers
    req.user = user;

    // Proceed to the next middleware
    next();
  } catch (error) {
    // Log the error and send a generic response
    console.error("Error in protectRoute middleware:", error);
    // Check for specific JWT errors (e.g., token expired)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again." });
    }
    res.status(500).json({ message: "Internal server error while protecting the route" });
  }
};
