// src/pages/messages/ChatPage.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Paperclip, Send, CheckCheck, ChevronLeft, X } from "lucide-react"; 
import dayjs from "dayjs";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL;

const SUPPORTED_FILES = "JPEG, PNG, GIF, WEBP, PDF, DOC, DOCX, XLS, XLSX, TXT";

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

export default function ChatPage({ currentUser: propUser }) {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(propUser);
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [typing, setTyping] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const scrollRef = useRef();
  const socketRef = useRef();
  const token = localStorage.getItem("token");

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
  }, []);

  // Fetch current user
  useEffect(() => {
    if (propUser) return setCurrentUser(propUser);
    const userId = getCurrentUserId();
    if (userId) {
      axios.get(`${API_URL}/api/auth/users/${userId}/public`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setCurrentUser(res.data))
        .catch(err => console.error(err));
    }
  }, [propUser, token]);

  // Fetch conversation & messages
  const fetchConversation = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversation(data);
    } catch (err) { console.error(err); }
  }, [conversationId, token]);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(Array.isArray(data) ? data : data.messages || []);
      scrollToBottom();
    } catch (err) { console.error(err); }
  }, [conversationId, scrollToBottom, token]);

  useEffect(() => {
    if (currentUser) { fetchConversation(); fetchMessages(); }
  }, [currentUser, fetchConversation, fetchMessages]);

  // Socket logic
  useEffect(() => {
    if (!currentUser?._id || !conversationId) return;

    const socket = io("http://localhost:5000");
    socketRef.current = socket;
    socket.emit("join", currentUser._id);

    const handleNewMessage = (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages(prev => [...prev, msg]); scrollToBottom();
        if (msg.receiver === currentUser._id) {
          axios.patch(`${API_URL}/api/messages/${msg._id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } })
               .catch(console.error);
        }
      }
    };

    const handleTyping = ({ conversationId: cId, userId }) => {
      if (cId === conversationId && userId !== currentUser._id) setTyping(true);
    };
    const handleStopTyping = ({ conversationId: cId, userId }) => {
      if (cId === conversationId && userId !== currentUser._id) setTyping(false);
    };
    const handleMessagesSeen = ({ conversationId: cId, seenAt }) => {
      if (cId === conversationId) {
        setMessages(prev => prev.map(msg => (msg.sender === currentUser._id && msg.status !== 'seen') 
          ? { ...msg, status: 'seen', read: true, readAt: seenAt } : msg));
      }
    };
    const handleMessageEdited = (editedMsg) => {
      if (editedMsg.conversationId === conversationId) {
        setMessages(prev => prev.map(msg => msg._id === editedMsg._id ? { ...msg, text: editedMsg.text, isEdited: true } : msg));
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("message:edited", handleMessageEdited);

    axios.patch(`${API_URL}/api/conversations/${conversationId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } }).catch(console.error);

    return () => {
      socket.emit("leave", currentUser._id);
      socket.off("message:new", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("message:edited", handleMessageEdited);
      socket.disconnect();
    };
  }, [conversationId, currentUser?._id, scrollToBottom, token]);

  const sendMessage = async () => {
    if (!messageText && attachments.length === 0) return;
    const otherUser = conversation?.participants?.find(p => p._id !== currentUser._id);
    try {
      const formData = new FormData();
      formData.append("conversationId", conversationId);
      formData.append("text", messageText);
      formData.append("receiverId", otherUser?._id);
      attachments.forEach(file => formData.append("attachments", file));
      await axios.post(`${API_URL}/api/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
      });
      setMessageText(""); setAttachments([]); scrollToBottom();
    } catch (err) { console.error(err); }
  };

  const handleAttach = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = [
      'image/jpeg','image/png','image/gif','image/webp',
      'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain',
    ];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    if (validFiles.length < files.length) alert("Some files were not added. Only supported types: " + SUPPORTED_FILES);
    setAttachments(prev => [...prev, ...validFiles]);
    e.target.value = null;
  };

  if (!currentUser) return <p className="text-center p-8">Loading chat...</p>;

  const otherUser = conversation?.participants?.find(p => String(p._id) !== String(currentUser._id));
  const chatTitle = otherUser ? otherUser.firstName || otherUser.name || "Conversation" : "Conversation";
  const chatProfile = otherUser?.profileImage ? `${API_URL}${otherUser.profileImage}` : "/default.jpg";

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center p-4 border-b sticky top-0 bg-white z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="mr-3 text-gray-600 hover:text-blue-600 p-1">
          <ChevronLeft className="w-6 h-6"/>
        </button>
        <img src={chatProfile} alt="Profile" className="w-10 h-10 rounded-full mr-3 object-cover"/>
        <div className="flex flex-col">
          <h2 className="font-semibold text-lg text-gray-800">{chatTitle}</h2>
          {typing && <div className="flex space-x-1">
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
          </div>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => {
          const senderId = msg.sender?._id || msg.sender;
          const isMe = String(senderId) === String(currentUser._id);
          const isLastMessage = index === messages.length - 1;
          const isSeen = isMe && (msg.status === 'seen' || msg.read);
          return (
            <div key={msg._id || index} ref={isLastMessage ? scrollRef : null} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] p-3 rounded-2xl shadow cursor-pointer 
                ${isMe 
                  ? "bg-gradient-to-r from-blue-600 to-blue-200 text-black" 
                  : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900"}`}>
                {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                {msg.attachments?.map((att, idx) => (
                  <div key={idx} className="mt-2">
                    {att.type === "image" && (
                      <img 
                        src={`${API_URL}${att.url}`} 
                        alt={att.fileName} 
                        className="w-40 h-40 object-cover rounded hover:scale-105 transition cursor-pointer"
                        onClick={() => setPreviewImage(`${API_URL}${att.url}`)}
                      />
                    )}
                    {att.type === "file" && (
                      <a href={`${API_URL}${att.url}`} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">{att.fileName}</a>
                    )}
                  </div>
                ))}
                <div className="flex items-center justify-end text-xs text-gray-500 mt-1 space-x-1">
                  <span>{dayjs(msg.createdAt).format("HH:mm")}</span>
                  {isMe && <span className={isSeen ? "text-blue-500" : "text-gray-400"}><CheckCheck size={14} /></span>}
                  {isMe && msg.status === 'sending' && <span className="text-yellow-500">...</span>}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} style={{ height: '0px' }}></div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <button className="absolute top-5 right-5 text-white" onClick={() => setPreviewImage(null)}><X size={24}/></button>
          <img src={previewImage} alt="Preview" className="max-h-[90%] max-w-[90%] object-contain rounded shadow-lg"/>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-2 border-t bg-gray-100 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="relative bg-white p-1 rounded border text-xs flex items-center justify-between space-x-1">
              <span>{file.name}</span>
              <button className="text-red-500 font-bold ml-2" onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}>X</button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center p-3 border-t bg-white shadow-inner">
        <label className="p-2 cursor-pointer text-gray-500 hover:text-blue-500 relative group">
          <Paperclip className="w-6 h-6"/>
          <span className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Supported files: {SUPPORTED_FILES}
          </span>
          <input type="file" multiple className="hidden" onChange={handleAttach}
            accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/plain"/>
        </label>
        <input type="text" placeholder="Type a message"
          className="flex-1 border rounded-full px-4 py-2 mx-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()}/>
        <button onClick={sendMessage} disabled={!messageText && attachments.length === 0}
          className="p-3 bg-blue-700 rounded-full text-white hover:bg-blue-900 disabled:opacity-50 transition duration-150">
          <Send size={20}/>
        </button>
      </div>
    </div>
  );
}
