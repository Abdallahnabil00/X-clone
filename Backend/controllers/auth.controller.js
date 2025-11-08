import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../libs/utils/genearteToken.js";

export const signup = async (req, res) => {
  try {
    const { username, fullName, password, email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ error: "Invalid email format" });
    }

    const findexistingUser = await User.findOne({ username });
    if (findexistingUser) {
        res.status(400).json({ error: "Username already exists" });
    }

    const findexistingEmail = await User.findOne({ email });
    if (findexistingEmail) {
        res.status(400).json({ error: "Email already exists" });
    }

      if (password.length < 6) {
          res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      fullName,
      password: hashedPassword,
      email,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        coverPicture: newUser.coverPicture,
        followers: newUser.followers,
        following: newUser.following,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in :", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
 try {
  const {username, password} = req.body;
  const checkUser = await User.findOne({ username });
  const checkPassword = await bcrypt.compare(password, checkUser?.password || "");

  if (!checkUser || !checkPassword) {
    res.status(500).json({ error: "Invalid username or password" });
  }

  

  generateTokenAndSetCookie(checkUser._id, res);

  res.status(200).json({
    _id: checkUser._id,
    username: checkUser.username,
    fullName: checkUser.fullName,
    email: checkUser.email,
    profilePicture: checkUser.profilePicture,
    coverPicture: checkUser.coverPicture,
    followers: checkUser.followers,
    following: checkUser.following,
  });



 }catch(error) {
    console.error("Error in :", error);
    res.status(500).json({ error: "Internal server error" });
  

 }
 
};

export const logout = (req, res) => {
try{
      res.cookie("jwt", "", {maxAge:0})
    res.status(200).json({ message: "Logged out successfully" });
    
  
}catch(error) {
    console.error("Error in logout:", error);
    res.status(500).json({ error: "Internal server error" });
  }

};


export const getMe = async (req, res) => {

try {
  const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user) 

}catch(error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  
}