import React, { useEffect, useRef, useState } from "react";
import { Send, Image as ImageIcon } from "lucide-react";
import { useFormik } from "formik";
import {
  useTicketByIdQuery,
  useSendMessageMutation,
} from "@api-queries/center-admin/notifictaions/Query";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

const Chat = ({ ticketId }) => {
  const bottomRef = useRef();
  const fileInputRef = useRef();
  const [selectedImage, setSelectedImage] = useState(null);
  const { data } = useTicketByIdQuery(ticketId);
  const { mutateAsync: sendMessageMutation, isPending } =
    useSendMessageMutation();

  const messages = data?.messages || [];
  const isClosed = data?.status === "closed";

  const formik = useFormik({
    initialValues: {
      message: "",
    },
    onSubmit: async (values) => {
      if (!values.message && !selectedImage) return;
      try {
        const formData = new FormData();
        if (values.message) formData.append("message", values.message);
        if (selectedImage) formData.append("image", selectedImage);
        await sendMessageMutation({
          id: ticketId,
          data: formData,
        });
        setSelectedImage(null);
        formik.resetForm();
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div className="flex flex-col bg-primary/10 rounded-lg overflow-hidden h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
        {messages.map((msg) => {
          const isRight = msg.sender_role === "centeradmin";
          const isLeft =
            msg.sender_role === "superadmin" || msg.sender_role === "member";

          return (
            <div
              key={msg.id}
              className={`flex ${isRight ? "justify-end" : "justify-start"}`}
            >
              {/* Avatar Left */}
              {isLeft && (
                <img
                  loading="lazy"
                  src="https://i.pravatar.cc/40"
                  alt=""
                  className="w-8 h-8 rounded-full mr-2 "
                />
              )}

              <div className="max-w-[70%]">
                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm ${
                    isRight
                      ? "bg-gradient-to-r from-primary to-secondary text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {msg.message && <p>{msg.message}</p>}

                  {/* Show Image */}
                  {msg.image_url && (
                    <Zoom>
                      <img
                        loading="lazy"
                        src={msg.image_url}
                        alt="attachment"
                        className="mt-2 rounded-lg max-h-48"
                      />
                    </Zoom>
                  )}
                </div>

                {/* Time */}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>

              {/* Avatar Right */}
              {isRight && (
                <img
                  loading="lazy"
                  src="https://i.pravatar.cc/41"
                  alt=""
                  className="w-8 h-8 rounded-full ml-2"
                />
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Chat Input */}
      <form
        onSubmit={formik.handleSubmit}
        className="p-3 bg-primary flex items-center gap-2"
      >
        {/* Input Container */}
        <div className="flex items-center bg-white rounded-full px-3 py-1 flex-1 gap-2">
          {/* Image Preview */}
          {selectedImage && (
            <div className="relative flex items-center">
              <img
                loading="lazy"
                src={URL.createObjectURL(selectedImage)}
                alt="preview"
                className="h-16 w-16 object-cover ml-4 rounded-md"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1"
              >
                ✕
              </button>
            </div>
          )}
          {/* Text Input */}
          <input
            type="text"
            name="message"
            placeholder="Write here..."
            value={formik.values.message}
            onChange={formik.handleChange}
            disabled={isClosed}
            className="flex-1 outline-none text-sm"
          />
        </div>
        {/* Upload Button */}
        <button
          type="button"
          disabled={isClosed}
          onClick={() => fileInputRef.current.click()}
          className="bg-white p-2 rounded-full"
        >
          <ImageIcon size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedImage(file);
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isPending || isClosed}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
