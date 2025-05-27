import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const res = await fetch("http://localhost:5000/api/user/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.message || "Failed to fetch user");

                setUser(data);
                await fetchChatHistory();
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
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await res.json();
                setMessages(data.messages || []);
            } catch (err) {
                console.error("Failed to fetch chat history", err);
            }
        };

        fetchProfile();
    }, [navigate]);

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

        const userMessage = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        saveMessage("user", input);
        setInput("");
        setIsSending(true);

        // Add temporary "typing..." message
        setMessages((prev) => [...prev, { sender: "bot", text: "Typing..." }]);

        try {
            const res = await fetch("http://localhost:5000/api/ai/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: userMessage.text }),
            });

            const data = await res.json();

            const botMessage = { sender: "bot", text: data.answer };
            setMessages((prev) => [
                ...prev.slice(0, -1),
                botMessage,
            ]);

            saveMessage("bot", data.answer);
        } catch (err) {
            console.error("Error fetching response:", err);
            setMessages((prev) => [
                ...prev.slice(0, -1),
                { sender: "bot", text: "Sorry, something went wrong." },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const handleEmojiClick = (emojiData) => {
        setInput((prev) => prev + emojiData.emoji);
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <>
            <Navbar user={user} />
            <div className="min-h-screen bg-gray-100 pt-24 px-4 sm:px-10 flex flex-col items-center">
                <div className="bg-white w-full max-w-3xl rounded-xl shadow-md flex flex-col h-[80vh] overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`px-4 py-2 rounded-xl max-w-[75%] ${msg.sender === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 text-gray-800"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Section */}
                    <div className="border-t px-4 py-3 bg-white flex items-center gap-3">
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                            <FaSmile className="text-2xl text-gray-600 hover:text-yellow-500" />
                        </button>

                        <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />

                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                            onClick={handleSendMessage}
                            disabled={isSending}
                        >
                            <FaPaperPlane className="text-lg" />
                        </button>
                    </div>

                    {showEmojiPicker && (
                        <div className="absolute bottom-20 left-4 z-50">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
