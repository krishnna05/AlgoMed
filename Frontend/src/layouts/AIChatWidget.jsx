import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getUserThreads, getThreadMessages, deleteThread } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AIChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [view, setView] = useState('list');

    const [threads, setThreads] = useState([]);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // Fetch threads when widget opens
    useEffect(() => {
        if (isOpen && user) {
            loadThreads();
        }
    }, [isOpen, user]);

    // Scroll to bottom of chat
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

        // Optimistic UI update
        const newMessages = [...messages, { role: 'user', content: currentMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            // Send to API
            const res = await sendChatMessage(currentMsg, activeThreadId);

            // Update state with AI response
            setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);

            if (!activeThreadId && res.threadId) {
                setActiveThreadId(res.threadId);
                loadThreads();
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error processing your request." }]);
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

    // --- Styles ---
    const widgetStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        fontFamily: 'Inter, system-ui, sans-serif'
    };

    const buttonStyle = {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        transition: 'transform 0.2s'
    };

    const windowStyle = {
        position: 'absolute',
        bottom: '80px',
        right: '0',
        width: isExpanded ? '400px' : '350px',
        height: isExpanded ? '600px' : '500px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #eee'
    };

    const headerStyle = {
        padding: '15px',
        backgroundColor: '#007bff',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px'
    };

    const contentStyle = {
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        backgroundColor: '#f8f9fa'
    };

    const inputAreaStyle = {
        padding: '15px',
        borderTop: '1px solid #eee',
        backgroundColor: 'white',
        display: 'flex',
        gap: '10px'
    };

    return (
        <div style={widgetStyle}>
            {isOpen && (
                <div style={windowStyle}>
                    {/* Header */}
                    <div style={headerStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {view === 'chat' && (
                                <button
                                    onClick={() => setView('list')}
                                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                                >
                                    ←
                                </button>
                            )}
                            <span style={{ fontWeight: '600' }}>AlgoMed AI</span>
                        </div>
                        <div>
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginRight: '10px' }}
                            >
                                {isExpanded ? '↙' : '↗'}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div style={contentStyle}>
                        {view === 'list' ? (
                            <div>
                                <button
                                    onClick={startNewChat}
                                    style={{
                                        width: '100%', padding: '12px', marginBottom: '15px',
                                        backgroundColor: '#e9ecef', border: 'none', borderRadius: '8px',
                                        color: '#007bff', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    + New Conversation
                                </button>

                                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#6c757d' }}>Recent Chats</h4>

                                {threads.length === 0 && <p style={{ fontSize: '0.8rem', color: '#adb5bd', textAlign: 'center' }}>No history yet.</p>}

                                {threads.map(thread => (
                                    <div
                                        key={thread._id}
                                        onClick={() => openThread(thread._id)}
                                        style={{
                                            padding: '12px', marginBottom: '8px', backgroundColor: 'white',
                                            borderRadius: '8px', border: '1px solid #eee', cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>
                                            {thread.title}
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteThread(e, thread._id)}
                                            style={{ border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer', marginLeft: '10px' }}
                                        >
                                            🗑
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                            maxWidth: '80%',
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            backgroundColor: msg.role === 'user' ? '#007bff' : 'white',
                                            color: msg.role === 'user' ? 'white' : '#333',
                                            boxShadow: msg.role === 'assistant' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                                            border: msg.role === 'assistant' ? '1px solid #eee' : 'none',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.4'
                                        }}
                                    >
                                        {msg.content}
                                    </div>
                                ))}
                                {loading && (
                                    <div style={{ alignSelf: 'flex-start', padding: '10px', color: '#6c757d', fontStyle: 'italic', fontSize: '0.8rem' }}>
                                        AI is typing...
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Footer Input (Only in Chat View) */}
                    {view === 'chat' && (
                        <form onSubmit={handleSendMessage} style={inputAreaStyle}>
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Ask about your health..."
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ced4da', outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={loading || !inputMessage.trim()}
                                style={{
                                    padding: '10px 15px', borderRadius: '20px', border: 'none',
                                    backgroundColor: '#007bff', color: 'white', cursor: 'pointer',
                                    opacity: (loading || !inputMessage.trim()) ? 0.6 : 1
                                }}
                            >
                                Send
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={buttonStyle}
            >
                {isOpen ? '×' : '💬'}
            </button>
        </div>
    );
};

export default AIChatWidget;