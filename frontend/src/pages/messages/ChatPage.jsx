// src/pages/messages/ChatPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../../utils/socket";
import axios from "axios";

export default function ChatPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages
  useEffect(() => {
    async function fetchMessages() {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `/api/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data);
      scrollToBottom();
    }
    if (conversationId) fetchMessages();
  }, [conversationId]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.emit("join", userId);

    socket.on("message:new", (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    });

    socket.on("typing", ({ conversationId: cId, from }) => {
      if (cId === conversationId && from !== userId) {
        setTypingUsers((prev) =>
          prev.includes(from) ? prev : [...prev, from]
        );
      }
    });

    socket.on("stopTyping", ({ conversationId: cId, from }) => {
      if (cId === conversationId) {
        setTypingUsers((prev) => prev.filter((id) => id !== from));
      }
    });

    socket.on("message:seen", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, status: "seen" } : m
        )
      );
    });

    return () => {
      socket.off("message:new");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("message:seen");
    };
  }, [conversationId, userId]);

  // Handle typing events
  const handleTyping = () => {
    if (!conversationId) return;
    socket.emit("typing", { conversationId, from: userId });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId, from: userId });
    }, 1500);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  // Remove an attachment before sending
  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    if (replyTo) formData.append("replyTo", replyTo._id);
    if (text.trim()) formData.append("text", text.trim());
    attachments.forEach((file) =>
      formData.append("attachments", file)
    );

    const res = await axios.post("/api/messages", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setMessages((prev) => [...prev, res.data]);
    setText("");
    setAttachments([]);
    setReplyTo(null);
    scrollToBottom();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.sender === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-2xl max-w-xs ${
                msg.sender === userId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.replyTo && (
                <div className="text-xs italic opacity-70 border-l-2 border-gray-400 pl-2 mb-1">
                  Replying to: {msg.replyTo.text}
                </div>
              )}
              {msg.text && <p>{msg.text}</p>}
              {msg.attachments?.map((file, i) => (
                <a
                  key={i}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm underline mt-1"
                >
                  {file.fileName || "Attachment"}
                </a>
              ))}
              <div className="text-[10px] text-right opacity-70 mt-1">
                {msg.status === "seen" ? "✓✓ Seen" : "✓ Sent"}
              </div>
            </div>
          </div>
        ))}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic">
            Someone is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-100 flex items-center justify-between">
          <span className="text-sm">
            Replying to:{" "}
            <span className="font-medium">{replyTo.text}</span>
          </span>
          <button
            className="text-xs text-red-500"
            onClick={() => setReplyTo(null)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={sendMessage}
        className="p-3 bg-white border-t flex items-center gap-2"
      >
        <label className="cursor-pointer px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200">
          📎
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <input
          type="text"
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleTyping}
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Send
        </button>
      </form>

      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-gray-50 border-t">
          {attachments.map((file, i) => (
            <div
              key={i}
              className="relative border rounded p-2 text-xs bg-white"
            >
              {file.name}
              <button
                type="button"
                className="absolute top-0 right-0 text-red-500"
                onClick={() => removeAttachment(i)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
