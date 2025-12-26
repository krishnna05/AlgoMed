import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getUserThreads, getThreadMessages, deleteThread } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    FiSend, FiMessageSquare, FiPlus, FiTrash2, FiCpu, FiUser, FiMenu, FiPaperclip, FiX, FiActivity, FiSearch, FiShield
} from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Suggestion Cards Data
const SUGGESTED_CARDS = [
    { icon: <FiActivity />, text: "How does sleep affect health?", category: "Wellness" },
    { icon: <FiSearch />, text: "Explain this medical report", category: "Analysis" },
    { icon: <FiShield />, text: "Suggest a diet for high BP", category: "Diet" },
];

const AIChat = () => {
    const { user } = useAuth();
    
    // --- State Management ---
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
        setTimeout(() => {
            const inputEl = document.querySelector('input[type="text"]');
            if(inputEl) inputEl.focus();
        }, 100);
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

    // --- Message Sending ---
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    const getGreetingTitle = () => {
        const role = user?.role?.toLowerCase(); 
        if (role === 'patient') return 'Patient';
        return 'Doctor'; 
    };

    // --- Theme & Styles ---
    const theme = {
        primary: '#2563eb', 
        bg: '#ffffff', 
        sidebarBg: '#f8fafc', 
        textMain: '#0f172a', 
        textSec: '#64748b', 
        border: '#e2e8f0', 
        userBubble: '#eff6ff', 
        aiBubble: '#ffffff',
    };

    const styles = {
        container: {
            display: 'flex',
            width: '100%', 
            height: 'calc(100vh - 110px)', 
            backgroundColor: theme.bg,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            overflow: 'hidden', 
            position: 'relative',
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
            border: `1px solid ${theme.border}`,
        },
        sidebar: {
            width: '260px', 
            backgroundColor: theme.sidebarBg,
            borderRight: `1px solid ${theme.border}`,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease-in-out',
            zIndex: 30, 
            flexShrink: 0,
            height: '100%'
        },
        sidebarHeader: { 
            padding: '16px', 
            flexShrink: 0 
        },
        newChatBtn: {
            width: '100%', 
            padding: '10px', 
            backgroundColor: theme.primary, 
            border: 'none',
            borderRadius: '8px', 
            color: 'white', 
            fontWeight: '600', 
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px', 
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
        },
        threadList: { 
            flex: 1, 
            overflowY: 'auto', 
            padding: '0 10px 10px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px' 
        },
        historyTitle: {
            fontSize: '0.7rem', 
            fontWeight: '700', 
            color: '#94a3b8', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            padding: '0 8px',
            marginBottom: '8px',
            marginTop: '8px'
        },
        threadItem: (isActive) => ({
            padding: '8px 10px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            backgroundColor: isActive ? '#e2e8f0' : 'transparent', 
            color: isActive ? theme.textMain : theme.textSec,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '0.85rem',
            fontWeight: isActive ? '600' : '400',
        }),
        main: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.bg,
            position: 'relative',
            height: '100%', 
            overflow: 'hidden' 
        },
        chatHeader: {
            padding: '0 20px', 
            borderBottom: `1px solid ${theme.border}`,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            flexShrink: 0, 
            zIndex: 10,
            height: '50px', 
        },
        chatWindow: {
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            maxWidth: '1000px', 
            width: '100%',
            margin: '0 auto',
            scrollBehavior: 'smooth',
        },
        messageRow: (role) => ({
            display: 'flex', 
            gap: '10px',
            justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
            width: '100%',
            animation: 'fadeIn 0.3s ease-in-out'
        }),
        avatar: (role) => ({
            width: '28px', height: '28px', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            backgroundColor: role === 'user' ? theme.primary : '#10b981', 
            color: 'white', 
            fontSize: '12px',
        }),
        bubble: (role) => ({
            padding: '10px 14px', 
            borderRadius: '12px',
            backgroundColor: role === 'user' ? theme.userBubble : '#f1f5f9', 
            color: theme.textMain, 
            lineHeight: '1.45', 
            fontSize: '0.9rem', 
            borderTopLeftRadius: role === 'assistant' ? '2px' : '12px',
            borderTopRightRadius: role === 'user' ? '2px' : '12px',
            maxWidth: '85%',
        }),
        emptyState: {
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: theme.textSec,
            padding: '10px' 
        },
        suggestionGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            width: '100%',
            maxWidth: '700px',
            marginTop: '16px',
            marginBottom: '10px'
        },
        suggestionCard: {
            padding: '10px 12px',
            backgroundColor: '#ffffff',
            border: `1px solid ${theme.border}`,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            textAlign: 'left',
            color: theme.textMain,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        },
        inputContainer: {
            padding: '10px 16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            backgroundColor: theme.bg,
            flexShrink: 0, 
            zIndex: 10,
            borderTop: `1px solid ${theme.border}`
        },
        inputWrapper: {
            width: '100%', 
            maxWidth: '900px', 
            position: 'relative',
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: 'white', 
            borderRadius: '10px', 
            border: `1px solid ${theme.border}`, 
            padding: '4px 8px 4px 10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
        },
        inputField: {
            flex: 1, 
            padding: '8px 0', 
            border: 'none', 
            outline: 'none',
            fontSize: '0.9rem', 
            color: theme.textMain,
            margin: 0,
            background: 'transparent',
            minWidth: 0 
        },
        sendBtn: {
            width: '32px', 
            height: '32px',
            backgroundColor: (!inputMessage.trim() && !selectedFile) || loading ? '#f1f5f9' : theme.primary,
            color: (!inputMessage.trim() && !selectedFile) || loading ? '#94a3b8' : 'white',
            border: 'none', 
            borderRadius: '8px', 
            cursor: (!inputMessage.trim() && !selectedFile) || loading ? 'default' : 'pointer',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            transition: 'all 0.2s ease',
            flexShrink: 0, 
        },
        iconBtn: {
            padding: '6px', 
            color: theme.textSec, 
            background: '#f8fafc', 
            border: 'none',
            cursor: 'pointer', 
            borderRadius: '6px', 
            display: 'flex', 
            alignItems: 'center',
            flexShrink: 0
        },
        filePreviewBadge: {
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '2px 8px', backgroundColor: '#e0f2fe', color: '#0369a1',
            borderRadius: '4px', fontSize: '0.7rem', marginRight: '4px',
            border: '1px solid #bae6fd'
        },
    };

    return (
        <div className="app-container" style={styles.container}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
                
                .suggestion-card:hover { 
                    transform: translateY(-2px); 
                    box-shadow: 0 4px 6px -2px rgba(0,0,0,0.1) !important; 
                    border-color: #93c5fd !important;
                }

                .mobile-toggle-btn {
                    display: none;
                    background: none;
                    border: none;
                    padding: 8px;
                    margin-right: 8px;
                    cursor: pointer;
                    color: #334155;
                }

                @media (max-width: 768px) {
                    .app-container { flexDirection: column; height: 100% !important; border: none !important; border-radius: 0 !important; }
                    .sidebar-closed { position: absolute; left: -100%; height: 100%; width: 250px !important; }
                    .sidebar-open { position: absolute; left: 0; height: 100%; width: 250px !important; box-shadow: 10px 0 100px rgba(0,0,0,0.3); }
                    .mobile-toggle-btn { display: flex !important; }
                    .chat-window { padding-bottom: 80px !important; }
                    .suggestion-grid { grid-template-columns: 1fr 1fr !important; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Sidebar */}
            <div style={styles.sidebar} className={mobileMenuOpen ? 'sidebar-open' : 'sidebar-closed'}>
                <div style={styles.sidebarHeader}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                         <h3 style={{margin:0, fontSize:'0.9rem', color: theme.textMain}}>History</h3>
                         <button onClick={() => setMobileMenuOpen(false)} style={{background:'none', border:'none', cursor:'pointer'}} className="mobile-toggle-btn">
                             <FiX size={18} />
                         </button>
                    </div>
                    <button onClick={startNewChat} className="new-chat-btn" style={styles.newChatBtn}>
                        <FiPlus size={16} /> New Chat
                    </button>
                </div>
                <div style={styles.threadList}>
                    <div style={styles.historyTitle}>Recent</div>
                    {historyLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.8rem' }}>Loading...</div>
                    ) : threads.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                            No conversations
                        </div>
                    ) : (
                        threads.map(thread => (
                            <div
                                key={thread._id}
                                onClick={() => openThread(thread._id)}
                                className="thread-item"
                                style={styles.threadItem(activeThreadId === thread._id)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    <FiMessageSquare size={12} style={{ flexShrink: 0 }} />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                        {thread.title}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteThread(e, thread._id)}
                                    className="delete-btn"
                                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                                >
                                    <FiTrash2 size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={styles.main} onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}>
                {/* Header */}
                <div style={styles.chatHeader} className="chat-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                            className="mobile-toggle-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMobileMenuOpen(!mobileMenuOpen);
                            }}
                        >
                            <FiMenu size={20} />
                        </button>

                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#e0f2fe', color: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiActivity size={16} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '0.9rem', color: theme.textMain, fontWeight: '700' }}>AlgoMed AI</h3>
                        </div>
                    </div>
                </div>

                {/* Chat Window */}
                <div style={styles.chatWindow} className="chat-window">
                    {messages.length === 0 ? (
                        <div style={styles.emptyState} className="empty-state">
                            <h2 className="greeting-title" style={{ margin: '0 0 8px 0', color: theme.textMain, fontSize: '1.5rem', fontWeight: '800' }}>
                                Hello, {getGreetingTitle()}
                            </h2>

                            <p className="greeting-text" style={{ maxWidth: '450px', textAlign: 'center', color: theme.textSec, lineHeight: '1.4', fontSize: '0.9rem', marginBottom: '20px' }}>
                                I can analyze reports or check symptoms. How can I help?
                            </p>

                            <div className="suggestion-grid" style={styles.suggestionGrid}>
                                {SUGGESTED_CARDS.map((item, i) => (
                                    <div 
                                        key={i} 
                                        className="suggestion-card" 
                                        style={styles.suggestionCard}
                                        onClick={() => handlePromptClick(item.text)}
                                    >
                                        <div style={{ color: theme.primary, fontSize: '1rem', marginBottom: '2px' }}>{item.icon}</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.text}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.category}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} style={styles.messageRow(msg.role)}>
                                {msg.role === 'assistant' && (
                                    <div style={styles.avatar(msg.role)}><FiCpu size={14}/></div>
                                )}
                                <div style={styles.bubble(msg.role)}>
                                    {msg.image && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <img src={msg.image} alt="Upload" style={{ maxWidth: '100%', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                                        </div>
                                    )}
                                    <div className="markdown-content">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                                {msg.role === 'user' && (
                                    <div style={styles.avatar(msg.role)}><FiUser size={14} /></div>
                                )}
                            </div>
                        ))
                    )}
                    {loading && (
                        <div style={styles.messageRow('assistant')}>
                            <div style={styles.avatar('assistant')}><FiCpu size={14}/></div>
                            <div style={{ ...styles.bubble('assistant'), fontStyle: 'italic', color: theme.textSec, padding: '8px 12px' }}>
                                <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite', fontSize: '0.85rem' }}>Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div style={styles.inputContainer} className="input-container">
                    <form onSubmit={handleSendMessage} style={styles.inputWrapper}>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="icon-btn" style={styles.iconBtn} title="Upload Report">
                            <FiPaperclip size={16} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                            accept="image/*"
                        />

                        {selectedFile && (
                            <div style={styles.filePreviewBadge}>
                                <span style={{ maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {selectedFile.name}
                                </span>
                                <button type="button" onClick={clearFile} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0369a1', display: 'flex' }}>
                                    <FiX size={12} />
                                </button>
                            </div>
                        )}

                        {/* Text Input */}
                        <input
                            type="text"
                            placeholder={selectedFile ? "Ask about this file..." : "Type your question..."}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            style={styles.inputField}
                        />
                        
                        {/* Send Button */}
                        <button type="submit" style={styles.sendBtn} disabled={(!inputMessage.trim() && !selectedFile) || loading}>
                            <FiSend size={14} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIChat;