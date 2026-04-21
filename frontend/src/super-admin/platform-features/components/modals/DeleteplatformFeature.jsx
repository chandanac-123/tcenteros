import { useDeletePlatformFeature } from '@api-queries/super-admin/platform-feature/Query';
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import React from 'react'

const DeleteplatformFeature = ({ open, setOpen, data }) => {
    const { mutate, isPending } = useDeletePlatformFeature();

    console.log("Data", data);


    const handleDelete = () => {
        mutate(data.feature_id, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    return (
        <div>
            <CustomeModal className='max-w-[600px]' open={open} onOpenChange={setOpen}>

                {/* Title */}
                <h2 className="text-black text-lg sm:text-xl md:text-2xl font-medium font-roboto leading-snug text-center sm:text-left">
                    Are you sure you want to delete this feature?
                </h2>

                {/* Description */}
                <p className="text-zinc-800 text-sm sm:text-base font-normal font-inter leading-6 text-center sm:text-left">
                    <span className='font-semibold'>"{data?.feature_name}" </span>This platform feature will be removed from your listing. The platform will
                    lose full access to this feature. This action cannot be undone.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
                    <Button
                        variant="outline_secondary"
                        size="addbutton"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        size="addbutton"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>

                </div>
            </CustomeModal>
        </div>
    )
}

export default DeleteplatformFeature
