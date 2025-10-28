import { type Request, type Response } from 'express';
import { generateToken } from '../lib/utils';
import User from '../models/User';
import bcrypt from 'bcryptjs';

export const signup = async (req: Request, res: Response) => {
  // Signup logic here
  try {

    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Rest of the signup logic
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // check if email valid: regex

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ fullName: fullName.trim(), email: email.toLowerCase().trim(), password: hashedPassword });
    if (!newUser) {
      return res.status(400).json({ message: 'Failed to create user' });
    }
    else {
      await newUser.save();
      generateToken(newUser._id.toString(), res);
      res.status(201).json({ _id: newUser._id, fullName: newUser.fullName, email: newUser.email, profilePic: newUser.profilePic });
    }

  }

  catch (error) {
    console.error("err: ",error);
    res.status(500).json({ message: 'Internal server error' });
  }

};

