import { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import { 
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, Timestamp, setDoc, increment 
} from "firebase/firestore";
import { uploadChatFile } from "../../services/api";
import { 
  FaPaperclip, FaPaperPlane, FaArrowLeft, FaCircle, FaTrash, FaLock 
} from "react-icons/fa";

const now = Date.now();
const DEMO_MESSAGES = [
    { id: "1", text: "Hello Doctor, are you available for a quick query?", senderId: "other", createdAt: Timestamp.fromMillis(now - 100000000) },
    { id: "2", text: "Good morning. Yes, I am here. How can I help you today?", senderId: "me", createdAt: Timestamp.fromMillis(now - 99000000) },
    { id: "3", text: "I've been having a mild headache for the past 2 days.", senderId: "other", createdAt: Timestamp.fromMillis(now - 98000000) },
    { id: "4", text: "It usually starts in the afternoon and gets worse by evening.", senderId: "other", createdAt: Timestamp.fromMillis(now - 97000000) },
    { id: "5", text: "I see. Do you have any fever or nausea associated with it?", senderId: "me", createdAt: Timestamp.fromMillis(now - 96000000) },
    { id: "6", text: "No fever, but I do feel a bit nauseous after looking at screens for too long.", senderId: "other", createdAt: Timestamp.fromMillis(now - 95000000) },
    { id: "7", text: "That sounds like it could be related to eye strain or a tension headache.", senderId: "me", createdAt: Timestamp.fromMillis(now - 94000000) },
    { id: "8", text: "Have you checked your blood pressure recently?", senderId: "me", createdAt: Timestamp.fromMillis(now - 93000000) },
    { id: "9", text: "Yes, I checked it yesterday. It was 130/85.", senderId: "other", createdAt: Timestamp.fromMillis(now - 92000000) },
    { id: "10", text: "That is slightly elevated but nothing to panic about yet.", senderId: "me", createdAt: Timestamp.fromMillis(now - 91000000) },
    { id: "11", text: "Are you taking any medication currently?", senderId: "me", createdAt: Timestamp.fromMillis(now - 90000000) },
    { id: "12", text: "Just some multivitamins. No specific medication.", senderId: "other", createdAt: Timestamp.fromMillis(now - 89000000) },
    { id: "13", text: "Okay. I would recommend you try to reduce your screen time for the next few days.", senderId: "me", createdAt: Timestamp.fromMillis(now - 88000000) },
    { id: "14", text: "Also, stay hydrated. Dehydration often triggers these headaches.", senderId: "me", createdAt: Timestamp.fromMillis(now - 87000000) },
    { id: "15", text: "I will do that, Doctor. Should I take a painkiller if it gets bad?", senderId: "other", createdAt: Timestamp.fromMillis(now - 86000000) },
    { id: "16", text: "You can take a Paracetamol 650mg after food, but strictly only if the pain is unbearable.", senderId: "me", createdAt: Timestamp.fromMillis(now - 85000000) },
    { id: "17", text: "Understood. I also have a blood report from last month. Should I share it?", senderId: "other", createdAt: Timestamp.fromMillis(now - 80000000) },
    { id: "18", text: "Yes, please upload it here. It will help me understand your general health better.", senderId: "me", createdAt: Timestamp.fromMillis(now - 79000000) },
    { id: "19", text: "Sure, attaching it now...", senderId: "other", createdAt: Timestamp.fromMillis(now - 78000000) },
    { id: "20", text: "📄 Blood_Work_Report_Nov.pdf", senderId: "other", createdAt: Timestamp.fromMillis(now - 77000000) },
    { id: "21", text: "Thanks. I'm taking a look.", senderId: "me", createdAt: Timestamp.fromMillis(now - 76000000) },
    { id: "22", text: "Your Hemoglobin is a bit low (11.5). This might contribute to the fatigue and headaches.", senderId: "me", createdAt: Timestamp.fromMillis(now - 70000000) },
    { id: "23", text: "I'm adding an Iron supplement to your prescription.", senderId: "me", createdAt: Timestamp.fromMillis(now - 69000000) },
    { id: "24", text: "Okay Doctor, thank you so much for the detailed advice!", senderId: "other", createdAt: Timestamp.fromMillis(now - 60000000) },
    { id: "25", text: "You're welcome. Take care and let me know if it persists after 3 days.", senderId: "me", createdAt: Timestamp.now() },
];

const ChatWindow = ({ currentUser, otherUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef();

  const isDemo = otherUser?.email?.endsWith("@demo.com");
  const currentUserId = String(currentUser._id);
  const otherUserId = String(otherUser._id);
  const chatId = [currentUserId, otherUserId].sort().join("_");

  useEffect(() => {
    if (isDemo || !chatId) return;

    const markAsRead = async () => {
        try {
            const chatRef = doc(db, "chats", chatId);
            await setDoc(chatRef, {
                unreadCounts: {
                    [currentUserId]: 0 
                }
            }, { merge: true });
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };
    
    if (messages.length > 0) {
        markAsRead();
    }
  }, [chatId, messages.length, currentUserId, isDemo]);


  useEffect(() => {
    if (isDemo) {
        const formattedDemoMessages = DEMO_MESSAGES.map(m => ({
            ...m,
            senderId: m.senderId === "me" ? currentUserId : otherUserId
        }));
        setMessages(formattedDemoMessages);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "auto" }), 50);
        return;
    }

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [chatId, isDemo, currentUserId, otherUserId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (isDemo) return;
    if ((!newMessage.trim() && !file) || uploading) return;

    setUploading(true);
    try {
      let fileData = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await uploadChatFile(formData);
        fileData = {
          url: uploadRes.url,
          type: uploadRes.type,
          name: uploadRes.originalName
        };
      }

      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: newMessage,
        senderId: currentUserId,
        senderName: currentUser.name,
        file: fileData,
        createdAt: serverTimestamp(),
      });

      // UPDATE PARENT
      await setDoc(doc(db, "chats", chatId), {
        participants: [currentUserId, otherUserId],
        participantDetails: [
            { _id: currentUserId, name: currentUser.name, email: currentUser.email, role: currentUser.role },
            { _id: otherUserId, name: otherUser.name, email: otherUser.email, role: otherUser.role || "User" }
        ],
        lastMessage: newMessage || "Attachment sent",
        lastUpdated: serverTimestamp(),
        unreadCounts: {
            [otherUserId]: increment(1) 
        }
      }, { merge: true });

      setNewMessage("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (isDemo) { alert("Disabled in Demo"); return; }
    if (!window.confirm("Delete message?")) return;
    try { await deleteDoc(doc(db, "chats", chatId, "messages", messageId)); } 
    catch (e) { console.error(e); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center">
            <button onClick={onBack} className="mr-2 md:hidden p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <FaArrowLeft size={14} />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shadow-sm">
            {otherUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-2.5">
            <h3 className="font-bold text-gray-800 text-xs md:text-sm leading-tight">{otherUser.name}</h3>
            <div className="flex items-center gap-1">
                <FaCircle size={5} className={`text-emerald-500 ${isDemo ? "opacity-50" : ""}`} />
                <span className="text-[9px] text-gray-500 font-medium">
                    {isDemo ? "Demo Account" : "Online"}
                </span>
            </div>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50 custom-scrollbar">
        {messages.length === 0 && !isDemo && (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                <p className="text-xs">No messages yet. Start the conversation!</p>
             </div>
        )}
        
        {messages.map((msg) => {
          const isMe = String(msg.senderId) === currentUserId;
          return (
            <div key={msg.id} className={`flex w-full group ${isMe ? "justify-end" : "justify-start"}`}>
              {isMe && (
                <button onClick={() => handleDelete(msg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-300 hover:text-red-500 self-center mr-1"><FaTrash size={10} /></button>
              )}
              <div className={`max-w-[85%] md:max-w-[75%] rounded-lg px-3 py-1.5 shadow-sm border text-xs md:text-sm ${isMe ? "bg-blue-50 text-blue-900 border-blue-100 rounded-br-none" : "bg-green-50 text-green-900 border-green-100 rounded-bl-none"}`}>
                {msg.text && <p className="leading-snug whitespace-pre-wrap">{msg.text}</p>}
                <span className={`text-[9px] mt-0.5 block text-right font-medium opacity-60 ${isMe ? "text-blue-800" : "text-green-800"}`}>
                   {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-2 bg-white border-t border-gray-100 relative">
        {isDemo ? (
            <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg p-2 text-gray-400 border border-gray-200/50">
                <FaLock size={10} /><span className="text-[10px] font-medium"> Read-only (Demo)</span>
            </div>
        ) : (
            <form onSubmit={handleSend} className="flex items-end gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
                    <label className="cursor-pointer text-gray-400 hover:text-blue-600"><FaPaperclip size={14} /><input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept="image/*,application/pdf"/></label>
                    <input type="text" className="flex-1 bg-transparent border-none focus:ring-0 text-xs md:text-sm text-gray-800 h-full py-1" placeholder="Type..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} autoComplete="off"/>
                </div>
                <button type="submit" disabled={!newMessage && !file} className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${(!newMessage && !file) ? "bg-gray-200" : "bg-blue-600 hover:scale-105"}`}>
                    {uploading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaPaperPlane size={12} />}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;