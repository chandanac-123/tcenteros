import { Button } from "@pages/components/ui/button";
import React, { useState } from "react";
import { useAllPendingNetworkQuery } from "@api-queries/center-admin/notifictaions/Query";
import ApproveModal from "@pages/network/ApproveModal";
import { Spinner } from "@pages/components/ui/spinner";

const NetworkNotifications = () => {
  const { data, isFetching } = useAllPendingNetworkQuery();
  const [open, setOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const requests = data?.requests || [];

  return (
    <div className="flex flex-col gap-3">
      {isFetching && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}

      {!isFetching && requests?.length == 0 && (
        <div className="flex justify-center text-textgrey text-sm">
          No notifications found
        </div>
      )}

      {!isFetching && requests?.length > 0 && (
        <>
          {requests.map((request) => (
            <div
              key={request.network_membership_id}
              className="flex border border-tab_bg rounded-lg p-3"
            >
              <div className="flex flex-col w-full gap-2">
                {/* Title */}
                <div className="flex justify-between items-center w-full">
                  <span className="text-md text-textblack font-semibold">
                    You have a network request from{" "}
                    <span className="text-primary font-semibold">
                      {request.home_center_name}
                    </span>
                  </span>

                  <span className="text-xs text-textgrey">
                    {new Date(request.created_at)?.toLocaleString()}
                  </span>
                </div>

                {/* Description */}
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs text-textgrey">
                    Raised by{" "}
                    <span className="font-medium text-textblack">
                      {request?.member_full_name}
                    </span>
                  </span>

                  <div className="flex gap-2">
                    {request?.network_status === "pending" && (
                      <Button
                        size="notificationbutton"
                        onClick={() => {
                          setSelectedRequest(request);
                          setOpen(true);
                        }}
                        className="text-xs bg-red_text hover:bg-red_text"
                      >
                        Approve Now
                      </Button>
                    )}

                    {request?.network_status === "approved" && (
                      <Button
                        size="notificationbutton"
                        className="text-xs cursor-not-allowed"
                      >
                        Approved
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* ✅ Single Modal (correct way) */}
          <ApproveModal open={open} setOpen={setOpen} data={selectedRequest} />
        </>
      )}
    </div>
  );
};

export default NetworkNotifications;
