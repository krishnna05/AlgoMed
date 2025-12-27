import { useEffect, useState } from "react";
import { getAllDoctors, getMyAppointments } from "../../services/api";
import { db } from "../../firebase"; 
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { FaSearch } from "react-icons/fa";

// DEMO DATA
const DEMO_CONTACTS = [
  { _id: "demo_1", name: "Aryan Kapoor", role: "Patient", email: "aryan@demo.com" },
  { _id: "demo_2", name: "Sara Chauhan", role: "Patient", email: "sara@demo.com" },
  { _id: "demo_3", name: "Anita Roy", role: "Patient", email: "anita@demo.com" },
  { _id: "demo_4", name: "Anupam Dubey", role: "Patient", email: "anupam@demo.com" },
];

const ChatSidebar = ({ currentUser, onSelectUser, selectedUser, mobileView }) => {
  const [baseContacts, setBaseContacts] = useState([]); 
  const [dbContacts, setDbContacts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isDemoLogin = currentUser?.email === "doctor@algomed.com"; 
  const currentUserId = String(currentUser._id); 

  useEffect(() => {
    const fetchBaseContacts = async () => {
      try {
        setLoading(true);
        let data = [];
        
        if (isDemoLogin) {
            data = [...DEMO_CONTACTS]; 
        } 
        
        if (currentUser.role === "patient" && !isDemoLogin) {
            const response = await getAllDoctors();
            data = response.data || [];
        } else if (currentUser.role === "doctor" && !isDemoLogin) {
            const response = await getMyAppointments();
            const uniquePatients = [];
            const map = new Map();
            if (response.data) {
                response.data.forEach(appt => {
                    if (appt.patientId && !map.has(appt.patientId._id)) {
                        map.set(appt.patientId._id, true);
                        uniquePatients.push({
                            _id: appt.patientId._id,
                            name: appt.patientId.name,
                            email: appt.patientId.email,
                            role: "Patient"
                        });
                    }
                });
            }
            data = uniquePatients;
        }
        setBaseContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseContacts();
  }, [currentUser, isDemoLogin]);

  useEffect(() => {
    const q = query(
        collection(db, "chats"), 
        where("participants", "array-contains", currentUserId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const chats = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            
            let otherParticipant = data.participantDetails?.find(p => String(p._id) !== currentUserId);
            
            if (!otherParticipant && data.participants) {
                const otherId = data.participants.find(id => String(id) !== currentUserId);
                if (otherId) {
                    otherParticipant = {
                        _id: otherId,
                        name: "Unknown User", 
                        email: "",
                        role: "User"
                    };
                }
            }

            if (otherParticipant) {
                const myUnreadCount = data.unreadCounts?.[currentUserId] || 0;
                chats.push({
                    _id: otherParticipant._id,
                    name: otherParticipant.name || "Unknown User",
                    email: otherParticipant.email,
                    role: otherParticipant.role || "User",
                    lastMessage: data.lastMessage, 
                    lastUpdated: data.lastUpdated,
                    unreadCount: myUnreadCount
                });
            }
        });
        setDbContacts(chats);
    });

    return () => unsubscribe();
  }, [currentUserId]); 

  const mergedMap = new Map();

  baseContacts.forEach(c => {
      mergedMap.set(String(c._id), { ...c, unreadCount: 0 }); 
  });

  dbContacts.forEach(dbC => {
      const id = String(dbC._id);
      const existing = mergedMap.get(id);

      if (existing) {
          mergedMap.set(id, {
              ...existing, 
              lastMessage: dbC.lastMessage,
              lastUpdated: dbC.lastUpdated,
              unreadCount: dbC.unreadCount 
          });
      } else {
          mergedMap.set(id, dbC);
      }
  });

  let finalContacts = Array.from(mergedMap.values());

  finalContacts.sort((a, b) => {
      const timeA = a.lastUpdated?.seconds || 0; 
      const timeB = b.lastUpdated?.seconds || 0;
      return timeB - timeA; 
  });

  if (selectedUser && !mergedMap.has(String(selectedUser._id))) {
      finalContacts.unshift(selectedUser);
  }
  const filteredContacts = finalContacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-50 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 tracking-tight">Inbox</h2>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                {filteredContacts.length} Chats
            </span>
        </div>
        <div className="relative group">
          <input type="text" placeholder="Search..." className="w-full pl-8 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-sm outline-none focus:bg-white focus:ring-1 focus:ring-blue-200" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-6 text-center text-xs text-gray-400">Loading...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400">No contacts found</div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filteredContacts.map((contact) => (
            <div key={contact._id} onClick={() => onSelectUser(contact)} className={`flex items-start p-2.5 mx-2 rounded-md cursor-pointer border border-transparent ${selectedUser?._id === contact._id ? "bg-blue-50 border-blue-100 shadow-sm" : "hover:bg-gray-50"}`}>
              <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm relative ${selectedUser?._id === contact._id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                {contact.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <h3 className={`text-sm font-semibold truncate ${selectedUser?._id === contact._id ? "text-blue-900" : "text-gray-800"}`}>{contact.name}</h3>
                    
                    {/* Unread Badge */}
                    {contact.unreadCount > 0 && selectedUser?._id !== contact._id && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                            {contact.unreadCount}
                        </span>
                    )}
                </div>
                <p className={`text-xs truncate mt-0.5 ${selectedUser?._id === contact._id ? "text-blue-600/80" : "text-gray-500"}`}>
                    {contact.lastMessage ? `"${contact.lastMessage.substring(0, 20)}..."` : (contact.role || "User")}
                </p>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;