import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js"
import usersRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import notificationRoutes from "./routes/notification.route.js"
import  connectMongoDB  from "./db/connectMongodb.js";
import {v2 as cloudinary} from "cloudinary"

const app = express()
dotenv.config()
app.use(cookieParser());
const port = process.env.PORT

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


app.use(express.json({limit: '5mb'}))
app.use(express.urlencoded({ extended: true }))

app.use("/api/auth", authRoutes)
app.use("/api/user", usersRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    connectMongoDB()
})