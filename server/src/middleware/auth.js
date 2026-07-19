import jwt from "jsonwebtoken";
import Usermodel from "../models/userModel.js";

export async function requireAuth(req, res, next) {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authorization header missing or invalid"
            });
        }

        const token = authHeader.split(" ")[1];

        const accessTokenSecret =
            process.env.ACCESS_TOKEN_SECRET || process.env.jwt_secret;

        if (!accessTokenSecret) {
            return res.status(500).json({
                message: "Access token secret is not configured."
            });
        }

        const decoded = jwt.verify(token, accessTokenSecret);

        // Fetch the latest user from database
        const user = await Usermodel.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // Attach the full user document
        req.user = user;

        // Optional: attach session id if you need it later
        req.sessionId = decoded.sessionId;

        next();

    } catch (error) {

        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired access token."
            });
        }

        return res.status(500).json({
            message: "Failed to authenticate request.",
            error: error.message
        });

    }
}


export const isInstitution=async(req,res,next)=>{
  try {
    if(req.user.role==='Institution') return next();
    else{
      return res.status(403).json({message:"Access denied"})
    }
  } catch (error) {
    return res.status(500).json({message:"Internal server error"})
  }
}