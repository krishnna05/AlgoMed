const ChatLog = require('../models/ChatLog'); 
const getOpenAIAPIResponse = require('../utils/openai'); 

const processAIChat = async (req, res, next) => {
    try {
        const { message, threadId } = req.body;

        if (!message) {
            res.status(400);
            throw new Error("Message is required");
        }

        let chatLog;

        // 1. If threadId provided, try to find existing thread for this user
        if (threadId) {
            chatLog = await ChatLog.findOne({ _id: threadId, userId: req.user.id });
        }

        // 2. If no thread found or provided, create a new one
        if (!chatLog) {
            chatLog = await ChatLog.create({
                userId: req.user.id,
                title: message.substring(0, 30) + "...", // Generate a simple title
                messages: []
            });
        }

        // 3. Add User Message to History
        chatLog.messages.push({ role: "user", content: message });

        // 4. Get Response from OpenAI
        const aiReply = await getOpenAIAPIResponse(message);

        // 5. Add AI Message to History
        chatLog.messages.push({ role: "assistant", content: aiReply });
        
        // Update timestamp
        chatLog.updatedAt = Date.now();
        
        await chatLog.save();

        res.status(200).json({
            success: true,
            reply: aiReply,
            threadId: chatLog._id,
            updatedChat: chatLog
        });

    } catch (error) {
        next(error);
    }
};

const getUserThreads = async (req, res, next) => {
    try {
        const threads = await ChatLog.find({ userId: req.user.id })
            .sort({ updatedAt: -1 })
            .select('title updatedAt'); // Only fetch necessary fields

        res.status(200).json({
            success: true,
            count: threads.length,
            data: threads
        });
    } catch (error) {
        next(error);
    }
};

const getThreadMessages = async (req, res, next) => {
    try {
        const { threadId } = req.params;
        const chatLog = await ChatLog.findOne({ _id: threadId, userId: req.user.id });

        if (!chatLog) {
            res.status(404);
            throw new Error("Chat thread not found");
        }

        res.status(200).json({
            success: true,
            data: chatLog.messages
        });
    } catch (error) {
        next(error);
    }
};

const deleteThread = async (req, res, next) => {
    try {
        const { threadId } = req.params;
        const chatLog = await ChatLog.findOneAndDelete({ _id: threadId, userId: req.user.id });

        if (!chatLog) {
            res.status(404);
            throw new Error("Chat thread not found");
        }

        res.status(200).json({
            success: true,
            message: "Thread deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    processAIChat,
    getUserThreads,
    getThreadMessages,
    deleteThread
};