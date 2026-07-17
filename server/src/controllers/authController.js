import Usermodel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Session from "../models/sessionModel.js";
import Student from "../models/studentModel.js";
import Teacher from "../models/teacherModel.js";
import Institution from "../models/instituteModel.js";
import { sendEmail } from "../services/emailServices.js";
import Otpmodel from "../models/otpModel.js";
import { generateOtp, getOtpHtml, newloginAlert } from "../utils/utils.js";
function getTokenSecrets() {
    return {
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || process.env.jwt_secret,
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || process.env.jwt_secret
    };
}

export async function register(req, res) {
    try {
        const { accessTokenSecret, refreshTokenSecret } = getTokenSecrets();

        if (!accessTokenSecret || !refreshTokenSecret) {
            return res.status(500).json({ message: 'Token secrets are not configured in environment variables' });
        }

        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }
        const normalizedEmail = email.toLowerCase();

        const existingUser = await Usermodel.findOne({
            $or: [{ email: normalizedEmail }, { username }]
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Usermodel({ username, email: normalizedEmail, password: hashedPassword, role: req.body.role });
        await newUser.save();
        const otp = generateOtp();
        const otpHtml = getOtpHtml(otp);
        const hashedOtp = await bcrypt.hash(otp, 10);
        const otpEntry = new Otpmodel({
            email: normalizedEmail,
            userId: newUser._id,
            otp: hashedOtp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        await otpEntry.save();
        await sendEmail(email, 'Your OTP Code', `Your OTP code is: ${otp}`, otpHtml);
        res.status(201).json({ message: 'User registered successfully', user: { username: newUser.username, email: newUser.email, verified: newUser.verified } });

    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
}

export async function login(req, res) {
    try {
        const { accessTokenSecret, refreshTokenSecret } = getTokenSecrets();

        if (!accessTokenSecret || !refreshTokenSecret) {
            return res.status(500).json({
                message: "Token secrets are not configured."
            });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.toLowerCase();

        // Find User
        const user = await Usermodel.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        // Email Verification Check
        if (!user.verified) {
            return res.status(403).json({
                message: "Please verify your email before logging in."
            });
        }

        // Password Check
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password."
            });
        }

        // Generate Refresh Token
        const refreshtoken = jwt.sign(
            {
                userId: user._id
            },
            refreshTokenSecret,
            {
                expiresIn: "7d"
            }
        );

        // Save Refresh Token Cookie
        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("refreshtoken", refreshtoken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Store Session
        const refreshtokenhash = await bcrypt.hash(refreshtoken, 10);

        const session = await Session.create({
            userId: user._id,
            refreshTokenhash: refreshtokenhash,
            ip: req.ip,
            userAgent: req.get("User-Agent")
        });

        // Generate Access Token
        const accesstoken = jwt.sign(
            {
                userId: user._id,
                sessionId: session._id
            },
            accessTokenSecret,
            {
                expiresIn: "15m"
            }
        );

        // Login Alert
        const alertHtml = newloginAlert(user.email);

        await sendEmail(
            user.email,
            "Just checking—was this you?",
            "Your account was accessed from a new device.",
            alertHtml
        );

        // Check Profile Completion
        let profileCompleted = false;

        switch (user.role) {

            case "Student":
                profileCompleted = !!await Student.findOne({
                    userId: user._id
                });
                break;

            case "Teacher":
                profileCompleted = !!await Teacher.findOne({
                    userId: user._id
                });
                break;

            case "Institution":
                profileCompleted = !!await Institution.findOne({
                    userId: user._id
                });
                break;

            default:
                profileCompleted = false;
        }

        return res.status(200).json({
            message: "Logged in successfully.",

            accesstoken,

            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                verified: user.verified,
                profileCompleted
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Error logging in.",
            error: error.message
        });

    }
}

export async function getMe(req, res) {
    try {
        const { accessTokenSecret } = getTokenSecrets();

        if (!accessTokenSecret) {
            return res.status(500).json({ message: 'Access token secret is not configured in environment variables' });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }
        const decoded = jwt.verify(token, accessTokenSecret);
        const user = await Usermodel.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
}

export async function refreshToken(req, res) {
    try {
        const { accessTokenSecret, refreshTokenSecret } = getTokenSecrets();

        if (!accessTokenSecret || !refreshTokenSecret) {
            return res.status(500).json({ message: 'Token secrets are not configured in environment variables' });
        }

        const refreshToken = req.cookies.refreshtoken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token missing' });
        }
        const decoded = jwt.verify(refreshToken, refreshTokenSecret);
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        const session = await Session.findOne({ userId: decoded.userId, revoked: false }).sort({ createdAt: -1 });
        if (!session) {
            return res.status(401).json({ message: 'No active session found for this user' });
        }
        const user = await Usermodel.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newAccessToken = jwt.sign({ userId: user._id }, accessTokenSecret, { expiresIn: '15m' });
        const newrefreshToken = jwt.sign({ userId: user._id }, refreshTokenSecret, { expiresIn: '7d' });
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('refreshtoken', newrefreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        const newrefreshTokenHash = await bcrypt.hash(newrefreshToken, 10);
        session.refreshTokenhash = newrefreshTokenHash;
        await session.save();
        res.status(200).json({ message: 'Token refreshed successfully', accesstoken: newAccessToken });
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        res.status(500).json({ message: 'Error refreshing token', error: error.message });
    }
}

export async function logout(req, res) {
    try {
        const { refreshTokenSecret } = getTokenSecrets();
        if (!refreshTokenSecret) {
            return res.status(500).json({ message: 'Refresh token secret is not configured in environment variables' });
        }

        const refreshToken = req.cookies.refreshtoken;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token missing' });
        }

        const decoded = jwt.verify(refreshToken, refreshTokenSecret);

        const activeSessions = await Session.find({ userId: decoded.userId, revoked: false }).sort({ createdAt: -1 });
        for (const session of activeSessions) {
            const isTokenMatch = await bcrypt.compare(refreshToken, session.refreshTokenhash);
            if (isTokenMatch) {
                session.revoked = true;
                await session.save();
                break;
            }
        }

        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('refreshtoken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax'
        });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }

        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
}

export async function logoutAll(req, res) {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Authenticated user not found' });
        }

        await Session.updateMany({ userId, revoked: false }, { revoked: true });
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('refreshtoken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax'
        });
        res.status(200).json({ message: 'Logged out from all sessions successfully' });
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid or expired access token' });
        }
        res.status(500).json({ message: 'Error logging out from all sessions', error: error.message });
    }
}

export async function verifyEmail(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const normalizedEmail = email.toLowerCase();

        const otpEntry = await Otpmodel.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
        if (!otpEntry) {
            return res.status(400).json({ message: 'OTP not found for this email' });
        }
        if (otpEntry.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }
        const isOtpValid = await bcrypt.compare(otp, otpEntry.otp);
        if (!isOtpValid) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        const user = await Usermodel
            .findByIdAndUpdate(
                otpEntry.userId,
                { $set: { verified: true, varified: true } },
                { new: true }
            )
            .select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await Otpmodel.deleteMany({ email: normalizedEmail });
        res.status(200).json({ message: 'Email verified successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying email', error: error.message });
    }
}

export async function completeProfile(req, res) {
    try {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        if (req.user.profileCompleted) {
            return res.status(400).json({
                message: "Profile already completed."
            });
        }

        switch (req.user.role) {

            case "Student":
                return await createStudentProfile(req, res);

            case "Teacher":
                return await createTeacherProfile(req, res);

            case "Institution":
                return await createInstitutionProfile(req, res);

            default:
                return res.status(400).json({
                    message: "Invalid role."
                });
        }

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Error completing profile.",
            error: error.message
        });

    }
}

export async function createStudentProfile(req, res) {

    try {

        const existing = await Student.findOne({
            userId: req.user._id
        });

        if (existing) {
            return res.status(400).json({
                message: "Student profile already exists."
            });
        }

        const student = await Student.create({
            userId: req.user._id,
            phone: req.body.phone,
            college: req.body.college,
            semester: req.body.semester,
            bio: req.body.bio,
            profileImage: req.body.profileImage
        });

        req.user.profileCompleted = true;
        await req.user.save();

        return res.status(201).json({
            message: "Student profile created successfully.",
            student
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to create student profile.",
            error: error.message
        });

    }
}

export async function createTeacherProfile(req, res) {

    try {

        const existing = await Teacher.findOne({
            userId: req.user._id
        });

        if (existing) {
            return res.status(400).json({
                message: "Teacher profile already exists."
            });
        }

        const teacher = await Teacher.create({
            userId: req.user._id,
            FullName: req.body.FullName,
            phone: req.body.phone,
            qualification: req.body.qualification,
            specialization: req.body.specialization,
            experience: req.body.experience,
            bio: req.body.bio,
            profileImage: req.body.profileImage
        });

        req.user.profileCompleted = true;
        await req.user.save();

        return res.status(201).json({
            message: "Teacher profile created successfully.",
            teacher
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to create teacher profile.",
            error: error.message
        });

    }
}

export async function createInstitutionProfile(req, res) {

    try {

        const existing = await Institution.findOne({
            userId: req.user._id
        });

        if (existing) {
            return res.status(400).json({
                message: "Institution profile already exists."
            });
        }

        const institution = await Institution.create({
            userId: req.user._id,
            instituteName: req.body.instituteName,
            phone: req.body.phone,
            website: req.body.website,
            address: req.body.address,
            description: req.body.description,
            logo: req.body.logo
        });

        req.user.profileCompleted = true;
        await req.user.save();

        return res.status(201).json({
            message: "Institution profile created successfully.",
            institution
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Failed to create institution profile.",
            error: error.message
        });

    }
}
