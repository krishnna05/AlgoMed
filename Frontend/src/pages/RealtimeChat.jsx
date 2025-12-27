import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SidebarChat from "../components/chat/SidebarChat";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../context/AuthContext";
import { FaComments } from "react-icons/fa";

const RealtimeChat = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        if (location.state && location.state.selectedUser) {
            console.log("Auto-opening chat with:", location.state.selectedUser.name);
            setSelectedUser(location.state.selectedUser);
        }
    }, [location.state]); 

    return (
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-110px)] text-sm">

            <div className={`w-full md:w-[320px] md:flex-shrink-0 bg-white border-r border-gray-100 
                ${selectedUser ? 'hidden md:flex flex-col' : 'flex flex-col'}`}
            >
                <SidebarChat
                    currentUser={user}
                    onSelectUser={(u) => setSelectedUser(u)}
                    selectedUser={selectedUser}
                    mobileView={true}
                />
            </div>

            <div className={`flex-1 bg-gray-50/50 flex flex-col relative
                ${!selectedUser ? 'hidden md:flex' : 'flex'}`}
            >
                {selectedUser ? (
                    <ChatWindow
                        currentUser={user}
                        otherUser={selectedUser}
                        onBack={() => setSelectedUser(null)}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 transform rotate-3">
                            <FaComments className="text-4xl text-blue-500 opacity-80" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Your Messages</h3>
                        <p className="max-w-xs text-gray-500 leading-relaxed">
                            Select a conversation from the sidebar to start chatting.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RealtimeChat;