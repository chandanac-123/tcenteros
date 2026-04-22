import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input';
import React, { useEffect, useState } from 'react'

const ChangeStatusModal = ({ open, setOpen, onSubmit, data }) => {
    const [selectedStatus, setSelectedStatus] = useState(null);


    useEffect(() => {
        if (data) {
            setSelectedStatus(data.toLowerCase());
        }
    }, [data]);
    const styles = [
        { label: "contacted", bg: "bg-[#FFFED5]", text: "text-[#885503]", border: "border-[#885503]" },
        { label: "new", bg: "bg-[#D5FFE7]", text: "text-[#03881C]", border: "border-[#03881C]" },
        { label: "demo", bg: "bg-[#E5D3F5]", text: "text-[#561290]", border: "border-[#561290]" },
        { label: "lost", bg: "bg-[#FFD7D5]", text: "text-[#880303]", border: "border-[#880303]" }
    ]


    const handleSubmit = () => {
        if (!selectedStatus) return

        onSubmit?.(selectedStatus)
        setOpen(false)
    }

    return (
        <CustomeModal open={open} onOpenChange={setOpen} className='w-[500px]' header="Change Status">
            <div className="flex flex-col gap-5">
              
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {styles.map((item) => {
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
                        placeholder="Enter Your Remark"
                    />
                </div>

                <div className="w-full flex items-center justify-end gap-4">
              
                    <Button
                        size="addbutton"
                        className=" mt-4"
                        onClick={()=>setOpen(false)}
                        // disabled={!selectedStatus}
                    >
                        Save
                    </Button>
                </div>
            </div>

        </CustomeModal>
    )
}

export default ChangeStatusModal