import ContentLayout from "@common/MasterLayout/ContentLayout";
import { CircleArrowDown, UserRoundCog } from "lucide-react";
import CenterTable from "./components/CenterTable";
import { Button } from "@pages/components/ui/button";
import { useState } from "react";
import { useSubscriptionsQuery } from "@api-queries/super-admin/subcriptions/Query";

const Centers = () => {
  const [tableParams, setTableParams] = useState({ page: 1 });
  const { data, isLoading, isError } = useSubscriptionsQuery(tableParams);
  return (
    <ContentLayout>
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <UserRoundCog size={30} className="text-onboard_primary" />
          </div>
          <div className="flex flex-col justify-center gap-3">
            <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Center Managment
            </p>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              View and manage all platform centers
            </p>
          </div>
        </div>
        <div className="pe-5">
          <Button size="addbutton" onClick={() => setOpen(true)}>
            <CircleArrowDown />
            Export Report
          </Button>
        </div>
      </div>

      <div>
        <CenterTable
          data={data}
          tableParams={tableParams}
          setTableParams={setTableParams}
          isLoading={isLoading}
        />
      </div>
    </ContentLayout>
  );
};

export default Centers;
