import { type Request, type Response } from "express";
import { generateToken } from "../lib/utils";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers";
import { ENV } from "../lib/env";
import cloudinary from "../lib/cloudinary";

export const signup = async (req: Request, res: Response) => {
  // Signup logic here
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Rest of the signup logic
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // check if email valid: regex

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });
    if (!newUser) {
      return res.status(400).json({ message: "Failed to create user" });
    } else {
      await newUser.save();
      generateToken(newUser._id.toString(), res);
      await sendWelcomeEmail(
        newUser.fullName,
        newUser.email,
        ENV.CLIENT_URL || ""
      );
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    }
  } catch (error) {
    console.error("err: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id.toString(), res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("err: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { profilePic } = req.body;
    if (!profilePic) {
      return res.status(400).json({ message: "No profile picture provided" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    if (!uploadResponse) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update Profile: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
