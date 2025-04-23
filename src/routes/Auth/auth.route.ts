import { Router } from "express";
import { Login } from "../../controllers/Auth/RegisterController";
import User from "../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";


const authRouter = Router();

// Regular user login
authRouter.post('/login', Login);

// Admin login endpoint
authRouter.post('/admin-login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
    return; // Use return without the response object
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
    return;
  }
  
  // Check if user is an admin
  if (user.role !== 'admin') {
    res.status(403).json({
      success: false, 
      message: 'Access denied. Admin privileges required.'
    });
    return;
  }
  
  // Generate token
  const token = jwt.sign(
    { 
      _id: user._id,
      email: user.email,
      role: user.role
    }, 
    process.env.JWT_SECRET || "GAPtLWo8YJGYMre1CTXMa7tdcny9ED84h2qA/e/v+nw=",
    { expiresIn: '24h' }
  );
  
  res.status(200).json({
    success: true,
    message: 'Admin login successful',
    data: {
      token,
      user: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        verified: user.verified
      }
    }
  });
}));

export default authRouter;
