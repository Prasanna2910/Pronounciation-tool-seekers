import User from "../model/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
    );
};

const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        if(email=="mohanavamsi14@gmail.com"){
            newUser.role="admin"
        }
        else{
            newUser.role="user"
        }

        const savedUser = await newUser.save();
        const token = generateToken(savedUser);

        res.status(201).json({
            message: "User signed up successfully",
            token: token,
            user: savedUser
        });
    } catch (err) {
        res.status(400).json({
            message: "Error signing up user",
            error: err.message
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
             return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: user
        });
    } catch (err) {
        res.status(500).json({
            message: "Error retrieving user",
            error: err.message
        });
    }
};

const checkUser = async (req, res) => {
    const { email } = req.body;
    try {
        const check = await User.findOne({ email });
        if (check) {
            res.status(200).json({ message: "User exists" });
        } else {
            res.json({ message: "User does not exist" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error checking user", error: err.message });
    }
};

const googleAuth = async (req, res) => {
    const { email, name } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            const token = generateToken(user);
            return res.status(200).json({
                message: "Login successful",
                token: token,
                user: user
            });
        }
        
        user = await User.create({ email, name });
        const token = generateToken(user);
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: user
        });
    } catch (err) {
         res.status(500).json({ message: "Error with Google Auth", error: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: "admin" } }).select("-password");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

export default { signup, login, checkUser, googleAuth, getProfile, getAllUsers };
