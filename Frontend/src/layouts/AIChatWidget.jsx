import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getUserThreads, getThreadMessages, deleteThread } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMessageSquare, FiX, FiMaximize2, FiMinimize2, FiArrowLeft, FiSend, FiTrash2, FiPlus } from 'react-icons/fi';

const AIChatWidget = () => {
    const { user } = useAuth();
    
    // --- STATE MANAGEMENT ---
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [view, setView] = useState('list');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [threads, setThreads] = useState([]);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // 1. Handle Window Resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 2. Load threads when opened
    useEffect(() => {
        if (isOpen && user) {
            loadThreads();
            if (isMobile) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen, user, isMobile]);

    // 3. Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, view]);

    const loadThreads = async () => {
        try {
            const res = await getUserThreads();
            setThreads(res.data || []);
        } catch (err) {
            console.error("Failed to load threads", err);
        }
    };

    const openThread = async (threadId) => {
        setLoading(true);
        try {
            const res = await getThreadMessages(threadId);
            setMessages(res.data || []);
            setActiveThreadId(threadId);
            setView('chat');
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        setActiveThreadId(null);
        setMessages([{ role: 'assistant', content: `Hello ${user?.name || 'there'}! I'm your AlgoMed AI assistant. How can I help you today?` }]);
        setView('chat');
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const currentMsg = inputMessage;
        setInputMessage('');

        const newMessages = [...messages, { role: 'user', content: currentMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await sendChatMessage(currentMsg, activeThreadId);
            setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
            if (!activeThreadId && res.threadId) {
                setActiveThreadId(res.threadId);
                loadThreads();
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteThread = async (e, threadId) => {
        e.stopPropagation();
        if (window.confirm("Delete this conversation?")) {
            try {
                await deleteThread(threadId);
                loadThreads();
                if (activeThreadId === threadId) {
                    setView('list');
                    setActiveThreadId(null);
                }
            } catch (err) {
                console.error("Failed to delete thread", err);
            }
        }
    };

    if (!user) return null;

    // --- RESPONSIVE STYLES ---
    const styles = {
        widgetContainer: {
            position: 'fixed', 
            bottom: '20px', 
            right: '20px', 
            zIndex: 1000,
            fontFamily: 'Inter, system-ui, sans-serif'
        },
        toggleBtn: {
            width: '48px', height: '48px', borderRadius: '50%',
            backgroundColor: '#2563eb', color: 'white', border: 'none',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)', cursor: 'pointer',
            display: isOpen && isMobile ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', transition: 'transform 0.2s'
        },
        window: {
            position: isMobile ? 'fixed' : 'absolute',
            top: isMobile ? 0 : 'auto',
            left: isMobile ? 0 : 'auto',
            bottom: isMobile ? 0 : '70px',
            right: isMobile ? 0 : '0',
            width: isMobile ? '100%' : (isExpanded ? '360px' : '300px'),
            height: isMobile ? '100%' : (isExpanded ? '550px' : '420px'),
            backgroundColor: 'white',
            borderRadius: isMobile ? '0' : '12px',
            boxShadow: isMobile ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            border: isMobile ? 'none' : '1px solid #e2e8f0',
            fontSize: '0.9rem',
            zIndex: 1001
        },
        header: {
            padding: '12px 16px',
            backgroundColor: '#2563eb', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid #1d4ed8',
            flexShrink: 0
        },
        headerTitle: { fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' },
        iconBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px', opacity: 0.9 },
        
        content: { 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px', 
            backgroundColor: '#f8fafc',
            overscrollBehavior: 'contain'
        },
        
        newChatBtn: {
            width: '100%', padding: '12px', marginBottom: '16px',
            backgroundColor: '#eff6ff', border: '1px dashed #bfdbfe', borderRadius: '8px',
            color: '#2563eb', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        },
        threadItem: {
            padding: '12px', marginBottom: '8px', backgroundColor: 'white',
            borderRadius: '8px', border: '1px solid #f1f5f9', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '0.9rem', transition: 'background 0.2s'
        },
        
        messageRow: (role) => ({
            display: 'flex', justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
        }),
        bubble: (role) => ({
            maxWidth: '85%', padding: '10px 14px', borderRadius: '12px',
            backgroundColor: role === 'user' ? '#2563eb' : 'white',
            color: role === 'user' ? 'white' : '#1e293b',
            boxShadow: role === 'assistant' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            border: role === 'assistant' ? '1px solid #e2e8f0' : 'none',
            fontSize: '0.9rem', lineHeight: '1.5', wordWrap: 'break-word'
        }),
        
        inputArea: {
            padding: '12px', borderTop: '1px solid #f1f5f9', backgroundColor: 'white',
            display: 'flex', gap: '8px', alignItems: 'center',
            paddingBottom: isMobile ? '20px' : '12px'
        },
        input: {
            flex: 1, padding: '10px 14px', borderRadius: '24px', border: '1px solid #cbd5e1',
            outline: 'none', fontSize: '1rem',
            backgroundColor: '#f8fafc'
        },
        sendBtn: {
            padding: '10px', width: '40px', height: '40px', borderRadius: '50%', border: 'none',
            backgroundColor: '#2563eb', color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: (loading || !inputMessage.trim()) ? 0.6 : 1,
            flexShrink: 0
        }
    };

    return (
        <div style={styles.widgetContainer}>
            {isOpen && (
                <div style={styles.window}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.headerTitle}>
                            {view === 'chat' && (
                                <button onClick={() => setView('list')} style={{...styles.iconBtn, marginRight: '4px'}}>
                                    <FiArrowLeft size={20} />
                                </button>
                            )}
                            <FiMessageSquare size={20} />
                            <span>AlgoMed AI</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {!isMobile && (
                                <button onClick={() => setIsExpanded(!isExpanded)} style={styles.iconBtn} title={isExpanded ? "Collapse" : "Expand"}>
                                    {isExpanded ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} style={styles.iconBtn} title="Close">
                                <FiX size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={styles.content}>
                        {view === 'list' ? (
                            <>
                                <button onClick={startNewChat} style={styles.newChatBtn}>
                                    <FiPlus size={18} /> New Conversation
                                </button>
                                
                                <h4 style={{ margin: '0 0 12px 4px', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent</h4>
                                
                                {threads.length === 0 && <p style={{ fontSize: '0.85rem', color: '#cbd5e1', textAlign: 'center', marginTop: '30px' }}>No chat history.</p>}

                                {threads.map(thread => (
                                    <div key={thread._id} onClick={() => openThread(thread._id)} style={styles.threadItem}>
                                        <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                                            {thread.title || "Untitled Chat"}
                                        </div>
                                        <button 
                                            onClick={(e) => handleDeleteThread(e, thread._id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', display: 'flex' }}
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {messages.map((msg, idx) => (
                                    <div key={idx} style={styles.messageRow(msg.role)}>
                                        <div style={styles.bubble(msg.role)}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div style={{ alignSelf: 'flex-start', marginLeft: '4px', marginTop: '4px', color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                        AI is thinking...
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {view === 'chat' && (
                        <form onSubmit={handleSendMessage} style={styles.inputArea}>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask a health question..."
                                style={styles.input}
                            />
                            <button type="submit" disabled={loading || !inputMessage.trim()} style={styles.sendBtn}>
                                <FiSend size={18} />
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button onClick={() => setIsOpen(!isOpen)} style={styles.toggleBtn}>
                {isOpen && !isMobile ? <FiX size={24} /> : <FiMessageSquare size={24} />}
            </button>
        </div>
    );
};

export default AIChatWidget;