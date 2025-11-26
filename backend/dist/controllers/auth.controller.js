"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const utils_1 = require("../lib/utils");
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const signup = async (req, res) => {
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
        const user = await User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const newUser = new User_1.default({ fullName: fullName.trim(), email: email.toLowerCase().trim(), password: hashedPassword });
        if (!newUser) {
            return res.status(400).json({ message: 'Failed to create user' });
        }
        else {
            await newUser.save();
            (0, utils_1.generateToken)(newUser._id.toString(), res);
            res.status(201).json({ _id: newUser._id, fullName: newUser.fullName, email: newUser.email, profilePic: newUser.profilePic });
        }
    }
    catch (error) {
        console.error("err: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.signup = signup;
