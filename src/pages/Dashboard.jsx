import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane, FaSmile, FaComments, FaRobot, FaSignOutAlt, FaPalette, FaFont } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [input, setInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [activeView, setActiveView] = useState("ai");
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showThemeOptions, setShowThemeOptions] = useState(false);
    const [themeColor, setThemeColor] = useState("#3b82f6"); 
    const [fontSize, setFontSize] = useState("medium");
    const navigate = useNavigate();

    // Available theme colors
    const themeColors = [
        { name: "Blue", value: "#3b82f6" },
        { name: "Green", value: "#10b981" },
        { name: "Purple", value: "#8b5cf6" },
        { name: "Red", value: "#ef4444" },
        { name: "Pink", value: "#ec4899" },
        { name: "Indigo", value: "#6366f1" },
    ];

    // Font size options
    const fontSizes = [
        { name: "Small", value: "small" },
        { name: "Medium", value: "medium" },
        { name: "Large", value: "large" },
    ];

    useEffect(() => {
        // Load user preferences from localStorage
        const savedThemeColor = localStorage.getItem("themeColor") || "#3b82f6";
        const savedFontSize = localStorage.getItem("fontSize") || "medium";

        setThemeColor(savedThemeColor);
        setFontSize(savedFontSize);

        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/");

            try {
                const res = await fetch("http://localhost:5000/api/user/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch user");

                setUser(data);
                await fetchChatHistory();
                await fetchConversations();
            } catch (error) {
                console.error(error.message);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        const fetchChatHistory = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/chat/history", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const data = await res.json();
                setMessages(data.messages || []);
            } catch (err) {
                console.error("Failed to fetch chat history", err);
            }
        };

        const fetchConversations = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/chat/conversations", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const data = await res.json();
                setConversations(data.conversations || []);
            } catch (err) {
                console.error("Failed to fetch conversations", err);
            }
        };

        fetchProfile();
    }, [navigate]);

    useEffect(() => {
        localStorage.setItem("themeColor", themeColor);
    }, [themeColor]);

    useEffect(() => {
        localStorage.setItem("fontSize", fontSize);
    }, [fontSize]);

    const saveMessage = async (sender, text) => {
        try {
            await fetch("http://localhost:5000/api/chat/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ sender, text }),
            });
        } catch (err) {
            console.error("Failed to save message:", err);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input, time: new Date().toISOString() };
        setMessages((prev) => [...prev, userMessage]);
        saveMessage("user", input);
        setInput("");
        setIsSending(true);

        setMessages((prev) => [...prev, { sender: "bot", text: "Typing..." }]);

        try {
            const res = await fetch("http://localhost:5000/api/ai/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ prompt: userMessage.text }),
            });

            const data = await res.json();

            const botMessage = {
                sender: "bot",
                text: data.answer,
                time: new Date().toISOString(),
            };

            setMessages((prev) => [...prev.slice(0, -1), botMessage]);
            saveMessage("bot", data.answer);
        } catch (err) {
            console.error("Error fetching response:", err);
            setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: "Sorry, something went wrong." }]);
        } finally {
            setIsSending(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const formatTime = (iso) => {
        const date = new Date(iso);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getInitials = (name) => name?.split(".")[0][0].toUpperCase() || "U";

    const getFontSizeClass = () => {
        switch (fontSize) {
            case "small": return "text-sm";
            case "large": return "text-lg";
            default: return "text-base";
        }
    };

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 0);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeView]);

    useEffect(() => {
        scrollToBottom();
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className={`h-screen bg-gray-100 ${getFontSizeClass()} overflow-hidden`}>
            <div className="h-screen flex">
                {/* Sidebar - View Selector */}
                <div className="w-64 bg-white rounded-l-xl shadow-md overflow-hidden flex flex-col">
                    <div className="flex-1">
                        <div
                            className={`p-4 flex items-center gap-3 cursor-pointer ${activeView === 'ai' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            onClick={() => setActiveView('ai')}
                        >
                            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                                <FaRobot className="text-lg" />
                            </div>
                            <div>
                                <h3 className="font-medium">AI Assistant</h3>
                                <p className="text-xs opacity-70">Chat with AI</p>
                            </div>
                        </div>

                        <div
                            className={`p-4 flex items-center gap-3 cursor-pointer ${activeView === 'conversations' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            onClick={() => setActiveView('conversations')}
                        >
                            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                                <FaComments className="text-lg" />
                            </div>
                            <div>
                                <h3 className="font-medium">Conversations</h3>
                                <p className="text-xs opacity-70">View past chats</p>
                            </div>
                        </div>
                    </div>

                    {/* User Profile at Bottom */}
                    {user && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {user.image ? (
                                        <img
                                            src={`http://localhost:5000/${user.image}`}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                                            {getInitials(user.username)}
                                        </div>
                                    )}
                                    <div>
                                        <h3
                                            className="font-medium truncate max-w-[130px]"
                                            title={user.username}
                                        >
                                            {user.username}
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                                    title="Logout"
                                >
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white rounded-r-xl shadow-md flex flex-col overflow-hidden">
                    {activeView === 'ai' ? (
                        /* AI Chat Interface */
                        <>
                            {/* Chat Header */}
                            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                                        <FaRobot className="text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">AI Assistant</h3>
                                        <p className="text-xs opacity-70">Always available</p>
                                    </div>
                                </div>
                                {showThemeOptions && (
                                    <div className="absolute right-4 top-16 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                                        <div className="mb-3">
                                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                                <FaPalette /> Theme Color
                                            </h4>
                                            <div className="flex gap-2 flex-wrap">
                                                {themeColors.map((color) => (
                                                    <button
                                                        key={color.value}
                                                        onClick={() => setThemeColor(color.value)}
                                                        className="w-6 h-6 rounded-full"
                                                        style={{ backgroundColor: color.value }}
                                                        title={color.name}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium mb-2 flex items-center gap-2">
                                                <FaFont /> Font Size
                                            </h4>
                                            <div className="flex gap-2">
                                                {fontSizes.map((size) => (
                                                    <button
                                                        key={size.value}
                                                        onClick={() => setFontSize(size.value)}
                                                        className={`px-2 py-1 rounded ${fontSize === size.value ? 'bg-blue-100' : 'bg-gray-100'}`}
                                                    >
                                                        {size.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Messages */}
                            <div
                                className="flex-1 overflow-y-auto p-4 space-y-3"
                                style={{
                                    scrollbarWidth: 'thin',
                                    msOverflowStyle: 'none',
                                    scrollbarColor: `${themeColor} transparent`
                                }}
                            >
                                <style>{`
                                    ::-webkit-scrollbar {
                                        width: 6px;
                                    }
                                    ::-webkit-scrollbar-track {
                                        background: transparent;
                                    }
                                    ::-webkit-scrollbar-thumb {
                                        background-color: ${themeColor};
                                        border-radius: 3px;
                                    }
                                `}</style>
                                {messages.map((msg, index) => {
                                    const isSelf = msg.sender === "user";
                                    const alignment = isSelf ? "justify-end" : "justify-start";
                                    const bubbleStyle = isSelf
                                        ? `text-white`
                                        : "bg-gray-200 text-gray-800";

                                    return (
                                        <div key={index} className={`flex ${alignment}`}>
                                            <div
                                                className={`px-4 py-2 rounded-xl ${bubbleStyle} max-w-[75%]`}
                                                style={isSelf ? { backgroundColor: themeColor } : {}}
                                            >
                                                <p>{msg.text}</p>
                                                <div className={`text-[10px] ${isSelf ? "text-gray-200" : "text-gray-400"} text-right mt-1`}>
                                                    {formatTime(msg.time || new Date())}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Section */}
                            <div className="border-t border-gray-200 px-4 py-3 bg-white flex items-center gap-3">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="text-gray-600 hover:text-yellow-500"
                                >
                                    <FaSmile className="text-2xl" />
                                </button>

                                <input
                                    type="text"
                                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2"
                                    style={{ focusRingColor: themeColor }}
                                    placeholder="Ask the AI anything..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                />

                                <button
                                    className="text-white p-2 rounded-full"
                                    style={{ backgroundColor: themeColor }}
                                    onClick={handleSendMessage}
                                    disabled={isSending}
                                >
                                    <FaPaperPlane className="text-lg" />
                                </button>

                                {showEmojiPicker && (
                                    <div className="absolute bottom-20 right-4 z-50">
                                        <EmojiPicker
                                            onEmojiClick={(emojiData) => {
                                                setInput(prev => prev + emojiData.emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                            theme="light"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Conversations View (Read-only) */
                        <>
                            <div className="border-b border-gray-200 p-4">
                                <h2 className="text-xl font-semibold">Your Conversations</h2>
                                <p className="text-sm opacity-70">View-only mode</p>
                            </div>

                            <div
                                className="flex-1 overflow-y-auto p-4 space-y-4"
                                style={{
                                    scrollbarWidth: 'thin',
                                    msOverflowStyle: 'none',
                                    scrollbarColor: `${themeColor} transparent`
                                }}
                            >
                                <style>{`
                                    ::-webkit-scrollbar {
                                        width: 6px;
                                    }
                                    ::-webkit-scrollbar-track {
                                        background: transparent;
                                    }
                                    ::-webkit-scrollbar-thumb {
                                        background-color: ${themeColor};
                                        border-radius: 3px;
                                    }
                                `}</style>
                                {conversations.length === 0 ? (
                                    <div className="text-center py-8 opacity-70">
                                        No conversations found
                                    </div>
                                ) : (
                                    conversations.map((conv) => (
                                        <div
                                            key={conv.otherUser._id}
                                            className={`p-4 cursor-pointer rounded-lg bg-white border ${selectedConversation?._id === conv._id ? `border-[${themeColor}]` : "border-gray-200"}`}
                                            onClick={() => setSelectedConversation(conv)}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold`}>
                                                    {conv.otherUser.image ? (
                                                        <img
                                                            src={`http://localhost:5000/${conv.otherUser.image.replace(/\\/g, '/')}`}
                                                            alt={conv.otherUser.username}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        getInitials(conv.otherUser.username)
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{conv.otherUser.username}</h3>
                                                    <p className="text-xs opacity-70">{conv.otherUser.phone}</p>
                                                </div>
                                            </div>

                                            <div className="text-sm mb-2 text-gray-600">
                                                Last message: {conv.lastMessage.text}
                                            </div>

                                            <div className="text-xs opacity-50">
                                                {formatTime(conv.lastMessage.timestamp)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {selectedConversation && (
                                <div className="border-t border-gray-200 bg-gray-50 p-4">
                                    <h3 className="font-medium mb-2">Conversation with {selectedConversation.otherUser.username}</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {selectedConversation.messages.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={`p-2 rounded ${msg.sentByMe
                                                    ? "bg-blue-100"
                                                    : "bg-gray-100"} 
                                                ${msg.sentByMe ? "text-blue-800" : "text-gray-800"}`}
                                            >
                                                <div className="text-sm">{msg.text}</div>
                                                <div className={`text-xs mt-1 ${msg.sentByMe ? "text-blue-600" : "text-gray-500"}`}>
                                                    {formatTime(msg.timestamp)} • {msg.sentByMe ? 'You' : selectedConversation.otherUser.username}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;