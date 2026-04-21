import { useUpdatePlatformFeature } from '@api-queries/super-admin/platform-feature/Query'
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import { Textarea } from '@pages/components/ui/textarea'
import React, { useEffect, useState } from 'react'

const UpdateplatformFeature = ({ open, setOpen, data }) => {
    console.log("Data", data);
    const { mutate, isPending } = useUpdatePlatformFeature();
    const [form, setForm] = useState({
        feature_name: "",
        description: "",
        base_price: "",
    });

    useEffect(() => {
        if (data) {
            setForm({
                feature_name: data.feature_name || "",
                description: data.description || "",
                base_price: data.base_price || "",
            });
        }
    }, [data]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdate = () => {
        mutate(
            {
                id: data.feature_id,
                data: {
                    ...form,
                    base_price: Number(form.base_price),
                },
            },
            {
                onSuccess: () => {
                    setOpen(false);
                },
            }
        );
    };


    return (
        <div>
            <CustomeModal className='min-w-[650px]' open={open} onOpenChange={setOpen}>
                <div className="bg-[#F0DEFF] rounded-md px-5 py-3">

                    <h2 className="text-black font-roboto text-[21px] font-medium leading-[140%]">Update Platform Features </h2>
                </div>
                <div className="flex flex-col gap-5 py-3">
                    <Input
                        label='Feature Name'
                        name="feature_name"
                        value={form.feature_name}
                        onChange={handleChange}
                    />

                    <Textarea
                        label='Feature Description'
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                    />

                    <Input
                        label='Set Feature Price'
                        name="base_price"
                        type="number"
                        value={form.base_price}
                        onChange={handleChange}
                    />
                </div>


                <div className="flex items-center justify-end py-3">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline_secondary"
                            size="addbutton"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="addbutton"
                            onClick={handleUpdate}
                            disabled={isPending}
                        >
                            {isPending ? "Updating..." : "Update Feature"}
                        </Button>
                    </div>
                </div>
            </CustomeModal>
        </div>
    )
}

export default UpdateplatformFeature
