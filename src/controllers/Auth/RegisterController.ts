import { Response, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from "../../utils/response";
import { LoginUser, RegisterUser } from "../../types/User";
import { LoginSchema, RegisterSchema } from "./AuthValidator";
import User from "../../models/User";

export const Register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      first_name,
      last_name,
      email,
      company_name,
      phone_number,
      website,
      business_type,
      address,
      password,
      confirm_password,
    }: RegisterUser = req.body;
    const { error } = RegisterSchema.validate(req.body);
    if (error)
      return errorResponse(
        res,
        `Validation error: ${error.details[0].message}`,
        { error: error.details[0].message },
        400
      );

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(
        res,
        "Account already exists. Please log in.",
        {},
        400
      );
    }
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    // In the Register function, modify the newUser creation:

// Create new user with conditional fields
const newUser = new User({
  first_name,
  last_name,
  email,
  phone_number,
  password: hashedPassword,
  // Only add these fields if they exist in the request
  ...(company_name && { company_name }),
  ...(website && { website }),
  ...(business_type && { business_type }),
  ...(address && { address })
});


    await newUser.save();
    return successResponse(
      res,
      "User registered successfully",
      { user: newUser },
      201
    );
  } catch (error: any) {
    console.error("Register Error:", error);
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};

export const Login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginUser = req.body;
    const { error } = LoginSchema.validate(req.body);
    if (error)
      return errorResponse(
        res,
        `Validation error: ${error.details[0].message}`,
        { error: error.details[0].message },
        400
      );
    // Check if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(
        res,
        "Invalid account, Please create an account",
        {},
        401
      );
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid password, Please try again", {}, 401);
    }

    const token = jwt.sign(
      { user_id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "3h" } // Token valid for 7 days
    );
    return successResponse(res, 'Login successful', { token, user }, 200);
  } catch (error: any) {
    // console.error("Register Error:", error);
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};
