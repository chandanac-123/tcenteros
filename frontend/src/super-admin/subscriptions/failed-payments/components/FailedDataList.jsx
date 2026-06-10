import { useFailedSubscriptionsQuery, useSuspendSubscriptionMutation } from '@api-queries/super-admin/subcriptions/Query';
import DeleteModal from '@common/components/CustomeDelete';
import { Button } from '@pages/components/ui/button';
import { Spinner } from '@pages/components/ui/spinner';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import React, { useState } from 'react'

const FailedDataList = () => {
    const [page, setPage] = useState(1);
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState(null);
    const page_size = 6;
    const { data, isLoading, error } = useFailedSubscriptionsQuery({
        page,
        page_size,
    });
    const { mutate: suspendCenter, isPending } = useSuspendSubscriptionMutation();

    const handleSuspend = () => {
        if (!selectedCenter) return;

        suspendCenter(selectedCenter.center_id, {
            onSuccess: () => {
                setSuspendOpen(false);
                setSelectedCenter(null);
            },
        });
    };

    if (isLoading) return <p className='flex items-center justify-center'><Spinner /></p>;
    if (error) return <p>Error loading data</p>;

    const totalPages = Math.ceil((data?.total || 0) / page_size);

    return (
        <div>
            {data?.inactive_centers?.length === 0 && <span className="flex justify-center text-textgrey">No Data Available</span>}
            <div className="flex flex-col gap-6 px-8">
                {data?.inactive_centers?.map((item) => (
                    <div
                        key={item.center_id}
                        className="w-full bg-white rounded-xl border shadow-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-"
                    >
                        {/* Left Section */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                <span className="text-white text-xl font-bold capitalize">
                                    {item.center_name?.[0]}
                                </span>
                            </div>

                            <div className="flex flex-col">
                                <span className="font-semibold text-textgrey">
                                    {item.center_name}
                                </span>

                                <span className="text-sm text-textgrey">
                                    {item.contact_person_name}
                                </span>
                            </div>
                        </div>

                        {/* Middle Section */}
                        <div className="flex flex-col gap-1 text-sm text-textgrey">
                            <span>
                                Email:{" "}
                                <span className="font-medium text-textblack">
                                    {item.center_email}
                                </span>
                            </span>

                            <span>
                                Phone:{" "}
                                <span className="font-medium text-gray-800">
                                    {item.center_phone}
                                </span>
                            </span>
                        </div>

                        {/* Right Section */}
                        <div className="flex flex-col gap-1 text-sm text-textgrey">
                            {/* Add more fields if available */}
                            <span>
                                Center ID:{" "}
                                <span className="font-medium text-textblack text-xs">
                                    {item.center_id}
                                </span>
                            </span>
                        </div>

                        {/* Button */}
                        <div className="flex justify-end sm:justify-center">
                            <Button
                                variant="danger"
                                size="addbutton"
                                onClick={() => {
                                    setSelectedCenter(item);
                                    setSuspendOpen(true);
                                }}
                            >
                                Suspend Center
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center items-center gap-4 py-6">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                >
                    <ChevronsLeft />
                </Button>

                <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                </span>

                <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                >
                    <ChevronsRight />
                </Button>
            </div>


            <DeleteModal
                open={suspendOpen}
                setOpen={setSuspendOpen}
                data={selectedCenter}
                suspend={true}
                onConfirm={handleSuspend}
                header={`Are you sure you want to suspend this subscription of ${selectedCenter?.center_name}?`}
                description={`This Subscription will be removed from your listing the center will lost the full access as per the subscription This action cannot be undone.?`}
            />
        </div>
    )
}

export default FailedDataList
