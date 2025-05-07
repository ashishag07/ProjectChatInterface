"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { MoreHorizontal, Smile, MessageCircle, Send } from "lucide-react";

import { useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "away" | "busy" | "offline";
  isTyping?: boolean;
  statusMessage?: string;
  lastLogin: Date | undefined;
};

type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  reactions: {
    [key: string]: string[]; // emoji -> array of user IDs
  };
};

const initialUsers: User[] = [
  {
    id: "1",
    name: "Iron Man",
    avatar:
      "https://cdn.britannica.com/49/182849-050-4C7FE34F/scene-Iron-Man.jpg",
    status: "online",
    lastLogin: new Date(Date.now() - 360000),
  },
  {
    id: "2",
    name: "Captain America",
    avatar:
      "https://cdn.britannica.com/30/182830-050-96F2ED76/Chris-Evans-title-character-Joe-Johnston-Captain.jpg",
    status: "busy",
    statusMessage: "In a meeting",
    lastLogin: new Date(Date.now() - 360000),
  },
  {
    id: "3",
    name: "The Hulk",
    avatar:
      "https://queenstudios.shop/cdn/shop/files/2.Hulk1-3StatueAdvengersPost_620x.png?v=1711017244",
    status: "away",
    statusMessage: "brb",
    lastLogin: new Date(Date.now() - 360000),
  },
  {
    id: "4",
    name: "Thor",
    avatar:
      "https://cdn.britannica.com/73/182873-050-E1C686F4/Chris-Hemsworth-Thor-Thor-The-Dark-World.jpg",
    status: "online",
    lastLogin: new Date(Date.now() - 360000),
  },
  {
    id: "5",
    name: "Hawk Eye",
    avatar:
      "https://www.hollywoodreporter.com/wp-content/uploads/2021/07/MCDAVEN_EC081-H-2021.jpg?w=1296&h=730&crop=1",
    status: "offline",
    lastLogin: new Date(Date.now() - 360000),
  },
];

const initialMessages: Message[] = [
  {
    id: "1",
    senderId: "2",
    text: "Hey everyone! How's it going?",
    timestamp: new Date(Date.now() - 360000),
    reactions: { "👍": ["1", "4"], "❤️": ["3"] },
  },
  {
    id: "2",
    senderId: "1",
    text: "Just finished that project we were working on!",
    timestamp: new Date(Date.now() - 240000),
    reactions: { "🎉": ["2", "3", "4"] },
  },
  {
    id: "3",
    senderId: "4",
    text: "Great job! I'll review it this afternoon.",
    timestamp: new Date(Date.now() - 180000),
    reactions: {},
  },
  {
    id: "4",
    senderId: "3",
    text: "Can someone help me with the API documentation?",
    timestamp: new Date(Date.now() - 60000),
    reactions: {},
  },
];

// Status message options
const statusOptions = [
  "Available",
  "Away",
  "Busy",
  "brb",
  "In a meeting",
  "At lunch",
];
// Emoji options for reactions
const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🎉", "👏", "🔥"];

export default function Home() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isChatSelected, setIsChatSelected] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<User>();
  const [currentUserId, setCurrentUserId] = useState("1");
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Simulate a user typing
  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      if (Math.random() > 0.7) {
        const randomUserIndex = Math.floor(Math.random() * users.length);
        if (users[randomUserIndex].id !== currentUserId) {
          const updatedUsers = [...users];
          updatedUsers[randomUserIndex] = {
            ...updatedUsers[randomUserIndex],
            isTyping: true,
          };
          setUsers(updatedUsers);

          // Stop typing after a few seconds
          setTimeout(() => {
            const stopTypingUsers = [...updatedUsers];
            stopTypingUsers[randomUserIndex] = {
              ...stopTypingUsers[randomUserIndex],
              isTyping: false,
            };
            setUsers(stopTypingUsers);
          }, 3000);
        }
      }
    }, 5000);

    return () => clearTimeout(typingTimeout);
  }, [users, currentUserId]);

  // Find current user
  const currentUser =
    users.find((user) => user.id === currentUserId) || users[0];

  const handleSelectChat = (user: User) => {
    setIsChatSelected(true);
    setSelectedFriend(user);
  };

  const handleChatClick = () => {
    setIsChatSelected(false);
    setSelectedFriend(undefined);
  };

  // Update user status
  const handleStatusChange = (
    status: "online" | "away" | "busy",
    message?: string
  ) => {
    const updatedUsers = users.map((user) => {
      if (user.id === currentUserId) {
        return {
          ...user,
          status,
          statusMessage: message,
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    setShowStatusPicker(false);
  };

  // Add reaction to a message
  const handleAddReaction = (messageId: string, emoji: string) => {
    const updatedMessages = messages.map((msg) => {
      if (msg.id === messageId) {
        const updatedReactions = { ...msg.reactions };

        // If reaction exists and user already reacted, remove the reaction
        if (
          updatedReactions[emoji] &&
          updatedReactions[emoji].includes(currentUserId)
        ) {
          updatedReactions[emoji] = updatedReactions[emoji].filter(
            (id) => id !== currentUserId
          );
          if (updatedReactions[emoji].length === 0) {
            delete updatedReactions[emoji];
          }
        } else {
          // Add new reaction
          updatedReactions[emoji] = [
            ...(updatedReactions[emoji] || []),
            currentUserId,
          ];
        }

        return { ...msg, reactions: updatedReactions };
      }
      return msg;
    });

    setMessages(updatedMessages);
    setShowEmojiPicker(null);
  };

  // Send a message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      text: newMessage,
      timestamp: new Date(),
      reactions: {},
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <main className="flex h-screen bg-gray-100 text-gray-800">
      {/* sidebar icons */}

      <div className="flex items-center p-2 text-gray-800 flex-col w-12 bg-gray-100">
        <MessageCircle size={16} strokeWidth={1.5} onClick={handleChatClick} />
      </div>
      {/* -------------------------------------------------------------------------------------- */}
      <div
        className={`${
          isChatSelected ? "hidden" : "flex"
        } flex-col bg-white min-w-64 shrink w-full sm:flex sm:w-1/3 border-r border-gray-200`}
      >
        <div className="p-8 flex items-center">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
            <span
              className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                currentUser.status === "online"
                  ? "bg-green-500"
                  : currentUser.status === "away"
                  ? "bg-yellow-500"
                  : currentUser.status === "busy"
                  ? "bg-red-500"
                  : "bg-gray-400"
              }`}
            ></span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{currentUser.name}</p>
            <div
              className="text-xs text-gray-500 cursor-pointer flex items-center"
              onClick={() => setShowStatusPicker(!showStatusPicker)}
            >
              {currentUser.statusMessage || currentUser.status}
              <MoreHorizontal className="h-3 w-3 ml-1" />
            </div>

            {/* Status picker dropdown */}
            {showStatusPicker && (
              <div className="absolute mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 py-1">
                <div className="p-2 text-xs font-semibold text-gray-500">
                  Set Status
                </div>
                <div className="border-t border-gray-100">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleStatusChange("online", "Available")}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Available
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleStatusChange("away", "Away")}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                    Away
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleStatusChange("busy", "Do not disturb")}
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                    Do not disturb
                  </button>
                </div>
                <div className="border-t border-gray-100 pt-1">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() =>
                        handleStatusChange(
                          status === "Available"
                            ? "online"
                            : status === "Away"
                            ? "away"
                            : "busy",
                          status
                        )
                      }
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-2 text-md font-semibold text-black">
          ONLINE USERS
          <div className="space-y-1">
            {users
              .filter((user) => user.id !== currentUserId)
              .sort((a, b) => {
                // Online users first, then away, then busy, then offline
                const statusOrder = { online: 0, away: 1, busy: 2, offline: 3 };
                return statusOrder[a.status] - statusOrder[b.status];
              })
              .map((user) => (
                <div
                  key={user.id}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectChat(user)}
                >
                  <div className="relative">
                    <img src={user.avatar} className="w-8 h-8 rounded-full" />
                    <span
                      className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-1 ring-white ${
                        user.status === "online"
                          ? "bg-green-500"
                          : user.status === "away"
                          ? "bg-yellow-500"
                          : user.status === "busy"
                          ? "bg-red-500"
                          : "bg-gray-400"
                      }`}
                    ></span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.status}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {isChatSelected && (
        <div
          className={`${
            isChatSelected ? "shrink w-full" : "hidden"
          } sm:flex sm:flex-col sm:w-full bg-white`}
        >
          {/* active chat */}
          <div className="flex items-center px-4 py-10 h-16 w-full border-b border-gray-200">
            <div className="relative">
              <img
                src={selectedFriend?.avatar}
                className="w-12 h-12 rounded-full"
              />
              <span
                className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-1 ring-white ${
                  selectedFriend?.status === "online"
                    ? "bg-green-500"
                    : selectedFriend?.status === "away"
                    ? "bg-yellow-500"
                    : selectedFriend?.status === "busy"
                    ? "bg-red-500"
                    : "bg-gray-400"
                }`}
              ></span>
            </div>
            <div className="ml-3">
              <p className="text-md font-medium">{selectedFriend?.name}</p>
              <p className="text-xs text-gray-500">
                last seen today at 5:45 PM
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg, idx) => {
                const sender = users.find((u) => u.id === msg.senderId);
                const isOwnMessage = msg.senderId === currentUserId;

                return (
                  <div
                    key={idx}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md ${
                        isOwnMessage ? "order-2" : "order-1"
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="flex items-center">
                          <img
                            src={sender?.avatar || "/api/placeholder/24/24"}
                            alt={sender?.name}
                            className="h-6 w-6 rounded-full"
                          />
                          <span className="ml-2 text-sm font-medium">
                            {sender?.name}
                          </span>
                        </div>
                      )}
                      <div className="mt-1 relative">
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwnMessage
                              ? "bg-blue-500 text-white"
                              : "bg-white border border-gray-200"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <div className="text-xs opacity-70 text-right mt-1">
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                        {/* Message reactions */}
                        {Object.keys(msg.reactions).length > 0 && (
                          <div className="flex -space-x-1 mt-1">
                            {Object.entries(msg.reactions).map(
                              ([emoji, users]) => (
                                <div
                                  key={emoji}
                                  className="flex items-center bg-white rounded-full px-2 py-1 border border-gray-200 text-xs shadow-sm"
                                  title={`${users.length} reaction${
                                    users.length !== 1 ? "s" : ""
                                  }`}
                                >
                                  <span className="mr-1">{emoji}</span>
                                  <span className="text-gray-500">
                                    {users.length}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {/* Reaction button */}
                        <button
                          className="absolute bottom-0 -left-10 p-1 rounded-full hover:bg-gray-100"
                          onClick={() =>
                            setShowEmojiPicker(
                              showEmojiPicker === msg.id ? null : msg.id
                            )
                          }
                        >
                          <Smile className="h-4 w-4 text-gray-500" />
                        </button>

                        {/* Emoji picker */}
                        {showEmojiPicker === msg.id && (
                          <div className="absolute bottom-8 -left-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
                            <div className="flex flex-wrap gap-1">
                              {emojiOptions.map((emoji) => (
                                <button
                                  key={emoji}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  onClick={() =>
                                    handleAddReaction(msg.id, emoji)
                                  }
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Typing indicators */}
          <div className="bg-gray-50 px-4 h-6">
            {users
              .filter((u) => u.isTyping && u.id !== currentUserId)
              .map((user) => (
                <div key={user.id} className="text-xs text-gray-500">
                  {user.name} is typing...
                </div>
              ))}
          </div>
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleSendMessage}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

//   return (
//     <div className="flex h-screen bg-gray-100 text-gray-800">
//       {/* Sidebar */}
//       <div className="w-64 flex flex-col bg-white border-r border-gray-200">
//         {/* Current user */}
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="relative">
//                 <img
//                   src="https://images8.alphacoders.com/403/403973.jpg"
//                   alt="avtar"
//                   className="w-10 h-10 rounded-full"
//                 />
//                 <span
//                   className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${"bg-green-500"}`}
//                 ></span>
//               </div>

//               <div className="ml-3">
//                 <p className="text-sm font-medium">Natasha Romanoff</p>
//                 <div className="text-xs text-gray-500 cursor-pointer flex items-center">
//                   Available
//                   <MoreHorizontal className="h-3 w-3 ml-1" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Online users */}
//         <div className="flex-1 overflow-y-auto">
//           <div className="px-4 py-2 text-xs font-semibold text-gray-500">
//             ONLINE USERS
//           </div>

//           <div className="space-y-1">
//             {initialUsers
//               .sort((a, b) => {
//                 // Online users first, then away, then busy, then offline
//                 const statusOrder = { online: 0, away: 1, busy: 2, offline: 3 };
//                 return statusOrder[a.status] - statusOrder[b.status];
//               })
//               .map((user) => (
//                 <div
//                   key={user.id}
//                   className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
//                 >
//                   <div className="relative">
//                     <img
//                       src={user.avatar}
//                       alt={user.name}
//                       className="w-8 h-8 rounded-full"
//                     />
//                     <span
//                       className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-1 ring-white ${
//                         user.status === "online"
//                           ? "bg-green-500"
//                           : user.status === "away"
//                           ? "bg-yellow-500"
//                           : user.status === "busy"
//                           ? "bg-red-500"
//                           : "bg-gray-400"
//                       }`}
//                     ></span>
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm font-medium">{user.name}</p>
//                     {user.isTyping ? (
//                       <p className="text-xs text-blue-500">typing...</p>
//                     ) : user.statusMessage ? (
//                       <p className="text-xs text-gray-500">
//                         {user.statusMessage}
//                       </p>
//                     ) : (
//                       <p className="text-xs text-gray-500">{user.status}</p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//           </div>
//         </div>
//       </div>

//       {/* Chat area */}
//       <div className="flex-1 flex flex-col">
//         {/* Chat header */}
//         <div className="bg-white border-b border-gray-200 p-4 flex items-center">
//           <MessageSquare className="h-5 w-5 text-gray-500" />
//           <h2 className="ml-2 text-lg font-medium">Group Chat</h2>
//           <span className="ml-2 px-2 py-1 bg-gray-100 text-xs rounded-full">
//             {initialUsers.filter((u) => u.status === "online").length} online
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }
