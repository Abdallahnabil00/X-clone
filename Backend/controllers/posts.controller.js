import User from "../models/user.model.js";
import post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from "cloudinary";


export const createPost = async (req, res) => {
    const userId = req.user._id;
    const {text} = req.body;
    let {img} = req.body;
    const user = await User.findById(userId);

    try {
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!text && !img) {
            return res.status(400).json({ message: "Post must have text or image" });
        }

        if (img) {
            const uploadResponse = await cloudinary.uploader.upload(img)
            img = uploadResponse.secure_url;
        }

        const newPost = new post({
            user: userId,
            text,
            img
        })

        await newPost.save();

        res.status(201).json({ message: "Post created successfully", post: newPost });

    }catch(error) {
        console.log("Error in creating post:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const deletePost = async (req, res) => {
    const {id} = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);

    try {
        if (!user) return res.status(404).json({ message: "User not found" });

        const postToDelete = await post.findById(id);
        if (!postToDelete) return res.status(404).json({ message: "Post not found" });

        if (postToDelete.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }

        if(postToDelete.img) {
            const publicId = postToDelete.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await post.findByIdAndDelete(id);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log("Error in deleting post:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const createComment = async (req, res) => {
    const {id} = req.params;
    const userId = req.user._id;
    const {text} = req.body;    

    try { 
        const postToComment = await post.findById(id);

        if (!postToComment) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (!text) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        const newComment = {
            user: userId,
            text
        };

        postToComment.comments.push(newComment);
        await postToComment.save();
        const updtedcomments = postToComment.comments;   

        res.status(201).json( updtedcomments );

    }catch(error) {
        console.log("Error in creating comment:", error);
        res.status(500).json({ message: "Server error" });
    }

}

export const likeUnlikePost = async (req, res) => {
    const {id} = req.params;
    const userId = req.user._id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const postToLike = await post.findById(id);
    if (!postToLike) return res.status(404).json({ message: "Post not found" });

    if (postToLike.likes.includes(userId)) {
        await post.updateOne({ _id: id }, { $pull: { likes: userId } });
        await User.updateOne({_id : userId}, { $pull: { likedPosts: id } });
        const updatedLikes = postToLike.likes.filter(id => id.toString() !== userId.toString());

        res.status(200).json(updatedLikes);
    } else {
        postToLike.likes.push(userId);
        await User.updateOne({_id : userId}, { $push: { likedPosts: id } });
        await postToLike.save();

        const notification = new Notification({
            from : userId,
            to : postToLike.user,
            type : "like",
        
        })
        await notification.save();

        const updatedLikes = postToLike.likes;

        res.status(200).json(updatedLikes);
    }

    
}

export const getAllPosts = async (req, res) => {
    try {
        const allPosts = await post.find().sort({ createdAt: -1 }).populate({
            path : "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        })

        if (allPosts.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(allPosts);

    }catch(error) {
        console.log("Error in getting all posts:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getLikedPosts = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const likedPosts = await post.find({ _id: { $in: user.likedPosts } }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });
        if (!likedPosts) {
            return res.status(404).json({ message: "No liked posts found" });
        }
        res.status(200).json(likedPosts);
    }catch (error) {
        console.log("Error in getting liked posts:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getFollowingPosts = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const feedPosts = await post.find({user : { $in: user.following }}).sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });

        if (!feedPosts) {
            return res.status(404).json({ message: "No following posts found" });
        }

        res.status(200).json(feedPosts);

    }catch(error) {
        console.log("Error in getting following posts:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getUserPost = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({username});

        if (!user) return res.status(404).json({ message: "User not found" });

        const userPosts = await post.find({user : user._id}).sort({ createdAt: -1 }).populate({
            path : "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(userPosts);
    }catch(error) {
        console.log("Error in getting user posts:", error);
        res.status(500).json({ message: "Server error" });
    }
}