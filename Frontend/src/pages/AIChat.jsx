import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getUserThreads, getThreadMessages, deleteThread } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    FiSend, FiMessageSquare, FiPlus, FiTrash2, FiCpu, FiUser, FiZap, FiMenu, FiPaperclip, FiX
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SUGGESTED_PROMPTS = [
    "How does sleep affect my health?",
    "Explain this medical report",
    "How should I monitor my condition?",
    "Suggest a diet for high blood pressure",
    "When should I see a doctor?",
    "Summarize my symptoms",
    "What are the symptoms of diabetes?",
    "How do I know if I’m allergic to this medicine?"
];

const AIChat = () => {
    const { user } = useAuth();
    const [threads, setThreads] = useState([]);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // --- Effects ---
    useEffect(() => {
        loadThreads();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- API Interactions ---
    const loadThreads = async () => {
        try {
            const res = await getUserThreads();
            setThreads(res.data || []);
        } catch (err) {
            console.error("Failed to load threads", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const openThread = async (threadId) => {
        setLoading(true);
        setActiveThreadId(threadId);
        setMobileMenuOpen(false);
        try {
            const res = await getThreadMessages(threadId);
            setMessages(res.data || []);
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        setActiveThreadId(null);
        setMessages([]);
        setMobileMenuOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleDeleteThread = async (e, threadId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this conversation?")) return;

        try {
            await deleteThread(threadId);
            setThreads(prev => prev.filter(t => t._id !== threadId));
            if (activeThreadId === threadId) {
                startNewChat();
            }
        } catch (err) {
            console.error("Failed to delete thread", err);
        }
    };

    // --- File Handling ---
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size too large. Please upload files under 5MB.");
                return;
            }
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                setPreviewUrl(URL.createObjectURL(file));
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() && !selectedFile) return;

        const currentMsg = inputMessage;
        const currentFile = selectedFile;
        const currentPreview = previewUrl;

        setInputMessage('');
        clearFile();

        const tempMsg = {
            role: 'user',
            content: currentMsg,
            image: currentPreview
        };

        const tempMessages = [...messages, tempMsg];
        setMessages(tempMessages);
        setLoading(true);

        try {
            let base64File = null;
            let mimeType = null;

            if (currentFile) {
                base64File = await convertToBase64(currentFile);
                mimeType = currentFile.type;
            }

            const res = await sendChatMessage(currentMsg, activeThreadId, base64File, mimeType);

            // Update messages with real response
            setMessages([...tempMessages, { role: 'assistant', content: res.reply }]);

            if (!activeThreadId && res.threadId) {
                setActiveThreadId(res.threadId);
                loadThreads();
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handlePromptClick = (promptText) => {
        setInputMessage(promptText);
        const inputEl = document.querySelector('input[type="text"]');
        if (inputEl) inputEl.focus();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- Styles ---
    const styles = {
        container: {
            display: 'flex',
            height: 'calc(100vh - 150px)',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            position: 'relative'
        },
        sidebar: {
            width: '280px',
            backgroundColor: '#f8fafc',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease',
            zIndex: 10
        },
        main: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            position: 'relative'
        },
        // Sidebar Elements
        sidebarHeader: { padding: '20px', borderBottom: '1px solid #e2e8f0' },
        newChatBtn: {
            width: '100%', padding: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0',
            borderRadius: '8px', color: '#1e293b', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        },
        threadList: { flex: 1, overflowY: 'auto', padding: '10px' },
        threadItem: (isActive) => ({
            padding: '12px', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer',
            backgroundColor: isActive ? '#eff6ff' : 'transparent',
            color: isActive ? '#2563eb' : '#475569',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '0.9rem', transition: 'background 0.2s'
        }),

        // Chat Area Elements
        chatHeader: {
            padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        },
        chatWindow: {
            flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
        },
        messageRow: (role) => ({
            display: 'flex', gap: '15px',
            justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '800px', margin: '0 auto', width: '100%'
        }),
        avatar: (role) => ({
            width: '36px', height: '36px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            backgroundColor: role === 'user' ? '#3b82f6' : '#10b981',
            color: 'white'
        }),
        bubble: (role) => ({
            padding: '16px 20px', borderRadius: '12px',
            backgroundColor: role === 'user' ? '#eff6ff' : '#f8fafc',
            color: '#1e293b', lineHeight: '1.6', fontSize: '0.95rem',
            borderTopLeftRadius: role === 'assistant' ? '2px' : '12px',
            borderTopRightRadius: role === 'user' ? '2px' : '12px',
            maxWidth: '80%',
            position: 'relative'
        }),

        // Suggestions
        promptsContainer: {
            maxWidth: '800px', margin: '0 auto 10px auto', width: '100%',
            display: 'flex', gap: '10px', overflowX: 'auto', padding: '0 24px',
            scrollbarWidth: 'none'
        },
        promptChip: {
            padding: '8px 16px', borderRadius: '20px', backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.85rem',
            whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s'
        },

        // Input Area
        inputContainer: {
            padding: '24px', borderTop: '1px solid #f1f5f9',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
        },
        inputWrapper: {
            width: '100%', maxWidth: '800px', position: 'relative',
            display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: 'white', borderRadius: '12px',
            border: '1px solid #cbd5e1', padding: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        },
        inputField: {
            flex: 1, padding: '12px', border: 'none', outline: 'none',
            fontSize: '1rem', color: '#1e293b'
        },
        sendBtn: {
            padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600',
            opacity: (!inputMessage.trim() && !selectedFile) || loading ? 0.6 : 1
        },
        iconBtn: {
            padding: '10px', color: '#64748b', background: 'none', border: 'none',
            cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center',
            transition: 'background 0.2s'
        },

        filePreviewBadge: {
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1',
            borderRadius: '8px', fontSize: '0.85rem', marginRight: '5px'
        },

        emptyState: {
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: '#64748b'
        }
    };

    return (
        <div style={styles.container}>
            {/* Mobile Menu Toggle */}
            <div className="mobile-only" style={{ position: 'absolute', top: 15, left: 15, zIndex: 100 }}>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'white', border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}>
                    <FiMenu />
                </button>
            </div>

            {/* Sidebar */}
            <div style={styles.sidebar} className={mobileMenuOpen ? 'sidebar-open' : 'sidebar-closed'}>
                <div style={styles.sidebarHeader}>
                    <button onClick={startNewChat} style={styles.newChatBtn}>
                        <FiPlus size={18} /> New Chat
                    </button>
                </div>
                <div style={styles.threadList}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
                        History
                    </div>
                    {historyLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Loading...</div>
                    ) : threads.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.85rem', color: '#cbd5e1' }}>No history yet</div>
                    ) : (
                        threads.map(thread => (
                            <div
                                key={thread._id}
                                onClick={() => openThread(thread._id)}
                                style={styles.threadItem(activeThreadId === thread._id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                    <FiMessageSquare size={16} />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                                        {thread.title}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteThread(e, thread._id)}
                                    className="delete-btn"
                                    style={{ background: 'none', border: 'none', color: 'inherit', opacity: 0.6, cursor: 'pointer' }}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={styles.main}>
                <div style={styles.chatHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#10b981' }}>
                            <FiCpu size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>AlgoMed Assistant</h3>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Powered by Gemini AI</span>
                        </div>
                    </div>
                </div>

                <div style={styles.chatWindow}>
                    {messages.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                                <FiZap size={40} color="#64748b" />
                            </div>
                            <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>How can I help you today?</h2>
                            <p style={{ maxWidth: '400px', textAlign: 'center', color: '#64748b', lineHeight: '1.5' }}>
                                Upload a medical report for analysis or ask general health questions.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} style={styles.messageRow(msg.role)}>
                                {msg.role === 'assistant' && (
                                    <div style={styles.avatar(msg.role)}><FiCpu /></div>
                                )}
                                <div style={styles.bubble(msg.role)}>
                                    {msg.image && (
                                        <div style={{ marginBottom: '10px' }}>
                                            <img src={msg.image} alt="Upload" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                    )}
                                    <div className="markdown-content">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                                {msg.role === 'user' && (
                                    <div style={styles.avatar(msg.role)}><FiUser /></div>
                                )}
                            </div>
                        ))
                    )}
                    {loading && (
                        <div style={styles.messageRow('assistant')}>
                            <div style={styles.avatar('assistant')}><FiCpu /></div>
                            <div style={{ ...styles.bubble('assistant'), fontStyle: 'italic', color: '#94a3b8' }}>
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {messages.length === 0 && (
                    <div style={styles.promptsContainer}>
                        {SUGGESTED_PROMPTS.map((prompt, i) => (
                            <button key={i} onClick={() => handlePromptClick(prompt)} style={styles.promptChip}>
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}

                <div style={styles.inputContainer}>
                    <form onSubmit={handleSendMessage} style={styles.inputWrapper}>
                        {/* File Upload Button */}
                        <button type="button" onClick={() => fileInputRef.current.click()} style={styles.iconBtn} title="Upload Medical Report">
                            <FiPaperclip size={20} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                            accept="image/*"
                        />

                        {/* File Preview inside Input */}
                        {selectedFile && (
                            <div style={styles.filePreviewBadge}>
                                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {selectedFile.name}
                                </span>
                                <button type="button" onClick={clearFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', display: 'flex' }}>
                                    <FiX />
                                </button>
                            </div>
                        )}

                        <input
                            type="text"
                            placeholder={selectedFile ? "Ask a question about this file..." : "Type your health question..."}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            style={styles.inputField}
                        />
                        <button type="submit" style={styles.sendBtn} disabled={(!inputMessage.trim() && !selectedFile) || loading}>
                            <FiSend /> Send
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .sidebar-closed { position: absolute; left: -280px; height: 100%; }
                    .sidebar-open { position: absolute; left: 0; height: 100%; box-shadow: 5px 0 15px rgba(0,0,0,0.1); }
                }
                @media (min-width: 769px) {
                    .mobile-only { display: none; }
                }
                .delete-btn:hover { color: #ef4444 !important; opacity: 1 !important; }
            `}</style>
        </div>
    );
};

export default AIChat;