import { Button } from "@pages/components/ui/button";
import Chat from "./Chat";
import { useState } from "react";
import { useAllTicketsQuery } from "@api-queries/center-admin/notifictaions/Query";
import CloseTicket from "./TicketClose";
import { Spinner } from "@pages/components/ui/spinner";
import { useAuthStore } from "@store/authStore";
import { useNavigate } from "react-router-dom";

const Tickets = () => {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.auth?.role);
  const isSuperAdmin = role === "superadmin";
  const [openChat, setOpenChat] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketClose, setTicketClose] = useState(false);
  const { data: tickets, isLoading } = useAllTicketsQuery();

  return (
    <div className="flex justify-between gap-4 h-[calc(100vh-220px)]">
      {/* ✅ Loading */}
      {isLoading && (
        <div className="flex justify-center w-full">
          <Spinner />
        </div>
      )}

      {/* ✅ Empty State */}
      {!isLoading && (!tickets || tickets.length === 0) && (
        <div className="flex justify-center w-full text-textgrey text-sm">
          No notifications found
        </div>
      )}

      {/* ✅ Tickets List */}
      {!isLoading && tickets && tickets.length > 0 && (
        <>
          <div className="flex-1">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-tab_bg rounded-lg p-3 mb-3"
              >
                <div className="flex flex-col w-full gap-2">
                  <div className="flex justify-between w-full">
                    <span className="text-md text-textblack font-semibold">
                      {ticket.subject}
                    </span>

                    <span className="text-xs text-textgrey">
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between w-full items-center">
                    <span className="text-xs text-textgrey">
                      {ticket.description}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        variant="outline_primary"
                        size="notificationbutton"
                        className="text-xs"
                        disabled={ticket?.status === "closed"}
                        onClick={() => {
                          setSelectedTicket(ticket.id);
                          setTicketClose(true);
                        }}
                      >
                        {ticket?.status === "closed" ? "Closed" : "Close"}
                      </Button>

                      <Button
                        size="notificationbutton"
                        className="text-xs"
                        onClick={() => {
                          isSuperAdmin
                            ? navigate(`/supportById/${ticket?.id}`)
                            : setSelectedTicket(ticket.id);
                          setOpenChat(true);
                        }}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <CloseTicket
              open={ticketClose}
              setOpen={setTicketClose}
              id={selectedTicket}
            />
          </div>

          {!isSuperAdmin && (
            <div className="flex-1">
              {selectedTicket && <Chat ticketId={selectedTicket} />}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tickets;
