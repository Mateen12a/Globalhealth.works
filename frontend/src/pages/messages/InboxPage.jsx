// src/pages/messages/InboxPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../../utils/socket";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { ChevronLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const getCurrentUserId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.id || decoded._id;
  } catch (err) {
    console.error("Token decode error:", err);
    return null;
  }
};

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const currentUserId = getCurrentUserId();

  const fetchInbox = useCallback(async () => {
    if (!currentUserId) return setIsLoading(false);

    const token = localStorage.getItem("token");
    setIsLoading(true);

    try {
      const [inboxRes, unreadRes] = await Promise.all([
        axios.get(`${API_URL}/api/messages/inbox`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/messages/unread/count`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setConversations(Array.isArray(inboxRes.data) ? inboxRes.data : []);
      setTotalUnreadCount(unreadRes.data.unreadCount || 0);

    } catch (err) {
      console.error("Inbox fetch failed", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchInbox();
    if (!socket || !currentUserId) return;

    socket.emit("join", currentUserId);
    const updateHandler = () => fetchInbox();

    socket.on("message:new", updateHandler);
    socket.on("conversationUpdate", updateHandler);
    socket.on("conversation:new", updateHandler);

    return () => {
      socket.off("message:new", updateHandler);
      socket.off("conversationUpdate", updateHandler);
      socket.off("conversation:new", updateHandler);
      socket.emit("leave", currentUserId);
    };
  }, [fetchInbox, currentUserId]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-full p-8 text-gray-500">Loading conversations...</div>
  );

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition">
          <ChevronLeft className="w-6 h-6 text-gray-700"/>
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Inbox</h2>
        {totalUnreadCount > 0 && (
          <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-medium">
            {totalUnreadCount} unread
          </span>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {conversations.length === 0 && (
          <div className="text-center text-gray-500 mt-10">No conversations yet. Start a new chat!</div>
        )}

        {conversations.map((conv) => {
          const other = conv.otherUser || {};
          const lastMsg = conv.lastMessage || {};
          const isUnread = conv.unreadCount > 0;
          const displayName = other.name || `${other.firstName || ""} ${other.lastName || ""}`.trim() || "Unknown User";

          return (
            <div
              key={conv.conversationId}
              onClick={() => navigate(`/chat/${conv.conversationId}`)}
              className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer ${
                isUnread ? "ring-1 ring-blue-300" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={other.profileImage ? `${API_URL}${other.profileImage}` : "/default.jpg"}
                  alt={displayName}
                  className="w-14 h-14 rounded-full object-cover bg-gray-200"
                />
                <div className="truncate">
                  <p className={`font-medium text-gray-800 truncate ${isUnread ? "font-bold" : ""}`}>
                    {displayName}
                  </p>
                  <p className={`text-sm truncate max-w-[220px] ${isUnread ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
                    {lastMsg.text || (lastMsg.attachments?.length > 0 ? "📎 Attachment" : "No messages yet")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                {lastMsg.createdAt && (
                  <span className="text-xs text-gray-400">
                    {dayjs(lastMsg.createdAt).format("HH:mm")}
                  </span>
                )}
                {isUnread && (
                  <span className="text-xs bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
