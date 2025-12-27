const admin = require('../config/firebase');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const getFirebaseToken = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const userEmail = req.user.email;
        const userRole = req.user.role;

        const additionalClaims = {
            email: userEmail,
            role: userRole
        };

        const customToken = await admin.auth().createCustomToken(userId, additionalClaims);

        res.status(200).json({
            success: true,
            token: customToken
        });
    } catch (error) {
        console.error("Error creating custom token:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate chat token" 
        });
    }
};

const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "algomed_chat_files", 
                        resource_type: "auto" 
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        const result = await streamUpload(req);

        res.status(200).json({
            success: true,
            url: result.secure_url,
            type: result.resource_type,
            originalName: req.file.originalname
        });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "File upload failed" 
        });
    }
};

module.exports = {
    getFirebaseToken,
    uploadFile
};