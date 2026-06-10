import { useChangeLeadStatus } from '@api-queries/partner/lead-managements/Query';
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input';
import React, { useEffect, useState } from 'react'

const ChangeStatusModal = ({ open, setOpen, onSubmit, data }) => {
    const [selectedStatus, setSelectedStatus] = useState(null);
    const { mutate: changeStatus, isPending } = useChangeLeadStatus();
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        if (data) {
            setSelectedStatus(data?.lead_status?.toLowerCase());
        }
    }, [data]);

    const styles = [
        { label: "new", bg: "bg-[#D5FFE7]", text: "text-[#03881C]", border: "border-[#03881C]" },
        { label: "contacted", bg: "bg-[#FFFED5]", text: "text-[#885503]", border: "border-[#885503]" },
        { label: "interested", bg: "bg-[#a5dcf0]", text: "text-[#083963]", border: "border-[#083963]" },
        { label: "demo_done", bg: "bg-[#E5D3F5]", text: "text-[#561290]", border: "border-[#561290]" },
        { label: "closed", bg: "bg-[#FFD7D5]", text: "text-[#880303]", border: "border-[#880303]" }
    ]

    const statusFlow = {
        new: ["new", "contacted", "interested", "demo_done", "closed"],
        contacted: ["contacted", "interested", "demo_done", "closed"],
        interested: ["interested", "demo_done", "closed"],
        demo_done: ["demo_done", "closed"],
        closed: ["closed"],
    };

    const currentStatus = data?.lead_status?.toLowerCase();
    const filteredStyles = styles.filter((item) =>
        statusFlow[currentStatus]?.includes(item.label)
    );

    const handleSubmit = () => {
        if (!selectedStatus) {
            alert("Please select a status");
            return;
        }
        changeStatus(
            {
                id: data?.id,
                data: {
                    lead_status: selectedStatus, // ✅ FIXED
                    remarks: remarks,
                },
            },
            {
                onSuccess: () => {
                    setOpen(false);
                },
                onError: (err) => {
                }
            }
        );
    };

    return (
        <CustomeModal open={open} onOpenChange={setOpen} className='min-w-[600px]' header="Change Status">
            <div className="flex flex-col gap-5">

                <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                    {filteredStyles.map((item) => {
                        const isSelected = selectedStatus === item.label;

                        return (
                            <div
                                key={item.label}
                                onClick={() => setSelectedStatus(item.label)}
                                className={`cursor-pointer rounded-full text-sm py-2 capitalize text-center border transition-all duration-200 transform
                            ${item.bg} ${item.text} 
                            ${isSelected ? `border-2 ${item.border} scale-110` : "border-transparent"}`}
                            >
                                {item.label}
                            </div>
                        );
                    })}
                </div>

                <div className="">
                    <Input
                        label='Add Remark For the Lead'
                        name="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Enter Your Remark"
                    />
                </div>

                <div className="w-full flex items-center justify-end gap-4">

                    <Button
                        size="addbutton"
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>

        </CustomeModal>
    )
}

export default ChangeStatusModal