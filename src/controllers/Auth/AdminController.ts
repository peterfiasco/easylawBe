import { Response, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from "../../utils/response";
import User from "../../models/User";

export const AdminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return errorResponse(res, "Email and password are required", {}, 400);
    }
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      return errorResponse(res, "Invalid credentials", {}, 401);
    }
    
    // Check if user is an admin
    if (user.role !== 'admin') {
      return errorResponse(res, "Access denied. Admin privileges required.", {}, 403);
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", {}, 401);
    }
    
    // Create token with admin role explicitly set
    const token = jwt.sign(
      { 
        _id: user._id, 
        email: user.email, 
        role: 'admin' // Explicitly set role to admin
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "3h" }
    );
    
    return successResponse(res, 'Admin login successful', { token, user }, 200);
  } catch (error: any) {
    console.error("Admin Login Error:", error);
    return errorResponse(res, "Internal Server Error", { error: error.message }, 500);
  }
};

export const AdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the user from middleware - will only reach here if admin middleware passed
    const user = (req as any).user;
    
    // Fetch full user data from DB if needed
    const adminUser = await User.findById(user._id || user.user_id).select('-password');
    
    if (!adminUser) {
      return errorResponse(res, "Admin not found", {}, 404);
    }
    
    return successResponse(res, "Admin profile retrieved", { user: adminUser }, 200);
  } catch (error: any) {
    console.error("Admin Profile Error:", error);
    return errorResponse(res, "Internal Server Error", { error: error.message }, 500);
  }
};
