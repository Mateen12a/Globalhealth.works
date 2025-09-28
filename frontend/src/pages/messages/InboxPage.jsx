// src/pages/messages/InboxPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { socket } from "../../utils/socket";

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // Fetch inbox + unread count
  const fetchInbox = async () => {
    const token = localStorage.getItem("token");
    try {
      const [inboxRes, unreadRes] = await Promise.all([
        axios.get("/api/messages/inbox", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/messages/unread/count", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setConversations(inboxRes.data);
      setUnreadCount(unreadRes.data.count);
    } catch (err) {
      console.error("Inbox fetch failed", err);
    }
  };

  useEffect(() => {
    fetchInbox();

    if (!socket) return;

    // Refresh on new message
    socket.on("message:new", () => fetchInbox());
    socket.on("message:seen", () => fetchInbox());

    return () => {
      socket.off("message:new");
      socket.off("message:seen");
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Inbox</h2>
        {unreadCount > 0 && (
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const other =
            conv.participants.find((p) => p._id !== userId) || {};
          const lastMsg = conv.lastMessage || {};
          return (
            <div
              key={conv._id}
              onClick={() => navigate(`/chat/${conv._id}`)}
              className={`p-4 flex items-center justify-between border-b hover:bg-gray-100 cursor-pointer ${
                conv.muted ? "opacity-60" : ""
              }`}
            >
              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-white">
                  {other.name?.[0] || "U"}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {other.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                    {lastMsg.text ||
                      (lastMsg.attachments?.length > 0
                        ? "📎 Attachment"
                        : "No messages yet")}
                  </p>
                </div>
              </div>

              {/* Right section */}
              <div className="text-right">
                {conv.unreadCount > 0 && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
                {conv.pinned && (
                  <div className="text-xs text-yellow-500 mt-1">📌</div>
                )}
              </div>
            </div>
          );
        })}

        {conversations.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
}
