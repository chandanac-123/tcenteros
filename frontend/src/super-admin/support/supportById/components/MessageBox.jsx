import React, { useEffect, useRef, useState } from "react";
import { Plus, Send, User, X } from "lucide-react";
import { Button } from "@pages/components/ui/button";
import { useParams } from "react-router-dom";
import {
  useAssignTicketMutation,
  useCloseSupportTicket,
  useSendSupportMessage,
  useSupportTicketById,
} from "@api-queries/super-admin/support/Query";
import { Spinner } from "@pages/components/ui/spinner";

const MessageBox = () => {
  const { id } = useParams();
  const fileRef = useRef(null);
  const chatRef = useRef(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { data, isLoading, error } = useSupportTicketById(id);
  const { mutate: sendMessage, isPending } = useSendSupportMessage();
  const { mutate: closeTicket, isClosePending } = useCloseSupportTicket();
  const { mutate, isPendings } = useAssignTicketMutation();

  const formatCustomDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
  };

  const handleSend = () => {
    if (!message && !file) return;

    const formData = new FormData();
    formData.append("id", id);
    formData.append("message", message);

    if (file) {
      formData.append("image", file);
    }

    for (let pair of formData.entries()) {
    }

    //  API call
    sendMessage(
      { id, data: formData },
      {
        onSuccess: () => {
          setMessage("");
          setFile(null);
          setPreview(null);

          if (fileRef?.current) {
            fileRef.current.value = "";
          }
        },
      },
    );
  };

  const handleAssign = (ticketId, centerAdmin_id) => {
    if (!ticketId || !centerAdmin_id) {
      return;
    }


    mutate({
      ticket_id: ticketId, // make sure this exists
      centeradmin_id: centerAdmin_id,
    });
  };

  const messages = data?.messages || [];


  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    // small delay ensures DOM is fully painted
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center ">
        <Spinner />
      </div>
    );
  }
  if (error)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p> No Tickets</p>
      </div>
    );
  return (
    <div className="w-full h-full flex flex-col bg-[#FFFFFF] rounded-xl shadow-md overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-[#BFB7B7]">
        <div className="flex items-center gap-3">
          {data.image_url ? (
            <img
              loading="lazy"
              className="w-10 h-10 rounded-full bg-[#D5FFE6] flex items-center justify-center"
              src={data.image_url}
              alt="userPic"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#D5FFE6] flex items-center justify-center">
              <User size={24} color="#246C32" />
            </div>
          )}

          <div>
            <p className="text-[#000000] font-semibold">{data.member_name}</p>
            <p className="text-[#7F7F7F] text-xs">{data.center_name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {data.status?.toLowerCase() === "closed" ? null : (
            <Button
              onClick={() => closeTicket({ id })}
              disabled={isClosePending}
              size="addbutton"
              className="bg-[#246C32]"
            >
              {isClosePending ? "Closing..." : "Close Ticket"}
            </Button>
          )}

          {data.status?.toLowerCase() === "assigned" ||
          data.status?.toLowerCase() === "closed" ? null : (
            <Button
              onClick={() => handleAssign(data.id, data.centeradmin_id)}
              disabled={isPending}
              size="addbutton"
              className=" bg-[#2A62D8]"
            >
              Assign Admin
            </Button>
          )}
        </div>
      </div>

      {/* CHAT BODY */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto  p-4 flex flex-col gap-4 "
      >
        <div className="flex flex-col justify-start gap-3  mb-1">
          <div>{data?.description}</div>
          {data?.image_url && (
            <img
              src={data?.image_url}
              alt="ticket"
              className="max-w-[250px] rounded-lg border bg-white"
            />
          )}
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender_role === "superadmin"; // or change logic if needed

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col max-w-[70%]">
                <div
                  className={`p-3 rounded-xl text-[14px] ${
                    isUser
                      ? "bg-[#2A62D8] text-white"
                      : "bg-[#FFFFFF] border border-[#BFB7B7] text-[#000000]"
                  }`}
                >
                  {/* text */}

                  {/* image */}
                  {msg.image_url && (
                    <img
                      src={msg.image_url}
                      alt="attachment"
                      loading="lazy"
                      className="mt-2 max-w-[250px] rounded-lg border bg-white"
                    />
                  )}
                  {msg.message && <p>{msg.message}</p>}
                </div>

                <span className="text-[10px] text-[#7F7F7F] mt-1">
                  {formatCustomDateTime(msg.created_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {preview && (
        <div className="p-2">
          <div className="relative w-24 h-24">
            <img
              src={preview}
              alt="preview"
              loading="lazy"
              className="w-full h-full object-cover rounded-lg border border-[#BFB7B7] "
            />

            {/* Close button */}
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="absolute -top-2 -right-2 bg-black text-white p-1 rounded-full shadow-md hover:bg-red-500 transition"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}
      {/* INPUT */}
      {data.status == "closed" ? (
        <div className="p-3">
          <div className=" text-[#CF8600] rounded-full p-1  flex items-center justify-center">
            <p className="font-poppins text-sm border-b border-[#F7F1BB] italic ">
              This ticket was closed
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-[#BFB7B7] flex gap-3 items-center">
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            id="fileUpload"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              setFile(selectedFile);

              if (selectedFile) {
                setPreview(URL.createObjectURL(selectedFile));
              }
            }}
          />

          {/* Plus button to trigger file input */}
          <label
            htmlFor="fileUpload"
            className="p-3 rounded-lg border border-[#BFB7B7] cursor-pointer flex items-center justify-center"
          >
            <Plus size={18} />
          </label>

          {/* Text input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            className="flex-1 p-3 rounded-lg border border-[#BFB7B7] text-sm outline-none"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            className="px-4 py-2 flex items-center gap-2 bg-[#2A62D8] text-white rounded-lg"
          >
            <Send size={16} />
            {isPending ? "Sending" : "Send"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageBox;
