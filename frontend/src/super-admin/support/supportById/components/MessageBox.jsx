import React from "react";
import { Send, User } from "lucide-react";
import { Button } from "@pages/components/ui/button";

const MessageBox = () => {
  const messages = [
    {
      id: 1,
      text: "Why is the equipment always broken?",
      time: "10:38 AM",
      sender: "user",
    },
    {
      id: 2,
      text: "Understood! Our team is on it. We'll investigate and update soon.",
      time: "10:38 AM",
      sender: "admin",
    },
    {
      id: 3,
      text: "Is there a specific machine malfunctioning more frequently?",
      time: "10:40 AM",
      sender: "admin",
    },
    {
      id: 4,
      text: "Yes, the conveyor belt fails every other day.",
      time: "10:41 AM",
      sender: "user",
    },
    {
      id: 5,
      text: "We’ll prioritize inspection and schedule maintenance.",
      time: "10:43 AM",
      sender: "admin",
    },
    {
      id: 6,
      text: "Could we also get a report on the last three repairs?",
      time: "10:45 AM",
      sender: "user",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#FFFFFF] rounded-xl shadow-md">

      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-[#BFB7B7]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D5FFE6] flex items-center justify-center">
            <User size={18} color="#246C32" />
          </div>

          <div>
            <p className="text-[#000000] font-semibold">Marcus Rashford</p>
            <p className="text-[#7F7F7F] text-xs">Golds Fitness</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size='addbutton' className=" bg-[#246C32]">
            Close Ticket
          </Button>
          <Button size='addbutton' className=" bg-[#2A62D8]">
            Assign Admin
          </Button>
        </div>
      </div>

      {/* CHAT BODY */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex flex-col max-w-[70%]">

              <div
                className={`p-3 rounded-xl text-[14px] ${
                  msg.sender === "user"
                    ? "bg-[#2A62D8] text-white"
                    : "bg-[#FFFFFF] border border-[#BFB7B7] text-[#000000]"
                }`}
              >
                {msg.text}
              </div>

              <span className="text-[10px] text-[#7F7F7F] mt-1">
                {msg.time}
              </span>
            </div>
          </div>
        ))}

      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-[#BFB7B7] flex gap-3">
        <input
          type="text"
          placeholder="Enter your message..."
          className="flex-1 p-3 rounded-lg border border-[#BFB7B7] text-sm outline-none"
        />

        <button className="px-4 flex items-center gap-2 bg-[#2A62D8] text-white rounded-lg">
          <Send size={16} />
          Send
        </button>
      </div>

    </div>
  );
};

export default MessageBox;