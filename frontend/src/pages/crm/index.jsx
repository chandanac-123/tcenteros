import CustomeVerticalSelect from "@common/components/CustomeVerticalSelect";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { crm_tabs } from "@constants/crmTabs";
import { Button } from "@pages/components/ui/button";
import Members from "./member";
import MemberView from "./member/MemberView";
import MemberAdd from "./member/MemberAdd";
import { Download, SquarePen } from "lucide-react";
import { useCrmStore } from "@store/tabStore";
import VisitorAdd from "./visitor/VisitorAdd";
import Visitors from "./visitor";
import Guest from "./guest";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Leads from "./leads";
import { useLeadExcelQuery } from "@api-queries/center-admin/crm/Query";

const CRM = () => {
  const fileInputRef = useRef(null);
  const { mutateAsync: exportExcel, isPending } = useLeadExcelQuery();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryTab = queryParams.get("tab"); // 'members', 'leads', 'guests', etc.

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await exportExcel(formData);
      // Assuming API returns array
    } catch (error) {
    }
  };

  // Map query param to your crm_tabs id
  const tabMapping = {
    members: 1,
    leads: 2, // make sure this matches your crm_tabs id for leads
    guests: 3,
    visitors: 4,
  };
  const initialTab = tabMapping[queryTab] || 1; // default to Members tab
  useEffect(() => {
    setCrmSelectedTab(initialTab);
  }, [initialTab]);

  const {
    selectedTab: crmSelectedTab,
    setSelectedTab: setCrmSelectedTab,
    memberView,
    setMemberView,
    visitorView,
    setVisitorView,
    setGuestView,
    selectedMemberId,
    setSelectedMemberId,
    setSelectedTab,
    clearSelectedIds,
    resetCrmState,
  } = useCrmStore();

  // useEffect(() => {
  //   resetCrmState()
  // }, [])

  const selectedCrmCategory = crm_tabs.find((c) => c.id === crmSelectedTab);

  return (
    <ContentLayout>
      <div className="flex justify-between">
        <span className="text-xl font-semibold text-textblack">
          Customer Relationship Management
        </span>
        <div>
          {crmSelectedTab === 4 && visitorView === "list" && (
            <Button
              size="addbutton"
              onClick={() => {
                setVisitorView("add");
                setSelectedTab(4);
              }}
            >
              + Add Visitor
            </Button>
          )}
          {crmSelectedTab === 2 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <Button
                size="addbutton"
                onClick={() => fileInputRef.current?.click()}
                disabled={isPending}
              >
                <Download />
                {isPending ? "Uploading..." : "Import Excel"}
              </Button>
            </>
          )}

          {crmSelectedTab === 1 && memberView === "view" && (
            <Button size="addbutton" onClick={() => setMemberView("edit")}>
              <SquarePen />
              Edit
            </Button>
          )}
        </div>
      </div>

      <CustomeVerticalSelect
        options={crm_tabs}
        selected={crmSelectedTab}
        onSelect={(id) => {
          setCrmSelectedTab(id);
          setMemberView("list");
          setVisitorView("list");
          setGuestView("list");
          clearSelectedIds();
        }}
        heading={
          crmSelectedTab === 1
            ? memberView === "add"
              ? "Add Member"
              : memberView === "view"
                ? "Member Details"
                : memberView === "edit"
                  ? "Edit Member"
                  : "Members"
            : crmSelectedTab === 4
              ? visitorView === "add"
                ? "Add Visitor"
                : "Visitors"
              : crmSelectedTab === 3
                ? "Guests"
                : selectedCrmCategory?.heading
        }
      >
        {crmSelectedTab === 1 ? (
          memberView === "add" ? (
            <MemberAdd goBack={() => setMemberView("list")} />
          ) : memberView === "view" ? (
            <MemberView
              memberId={selectedMemberId}
              goBack={() => setMemberView("list")}
            />
          ) : memberView === "edit" ? (
            <MemberAdd
              memberId={selectedMemberId}
              isEdit
              goBack={() => setMemberView("list")}
            />
          ) : (
            <Members
              onView={(id) => {
                setSelectedMemberId(id);
                setMemberView("view");
              }}
              onEdit={(id) => {
                setSelectedMemberId(id);
                setMemberView("edit");
              }}
            />
          )
        ) : crmSelectedTab === 4 ? (
          visitorView === "add" ? (
            <VisitorAdd goBack={() => setVisitorView("list")} />
          ) : (
            <Visitors />
          )
        ) : crmSelectedTab === 3 ? (
          <Guest />
        ) : crmSelectedTab === 2 ? (
          <Leads  />
        ) : (
          selectedCrmCategory?.component_view
        )}
      </CustomeVerticalSelect>
    </ContentLayout>
  );
};

export default CRM;
