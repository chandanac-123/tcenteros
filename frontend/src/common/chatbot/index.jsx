import { useEffect } from "react";

export default function ChatBot() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://crmaibot.com/widget.js";
        script.setAttribute(
            "data-bot-id",
            "cmqhkgovb011ux8nm7pipgytp"
        );

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return null;
}