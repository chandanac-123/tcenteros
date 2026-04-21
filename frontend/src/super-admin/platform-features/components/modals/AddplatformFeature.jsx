import { useCreatePlatformFeature } from '@api-queries/super-admin/platform-feature/Query'
import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import { Textarea } from '@pages/components/ui/textarea'
import React, { useState } from 'react'

const AddplatformFeature = ({ open, setOpen }) => {
    const { mutate, isPending } = useCreatePlatformFeature();
    const [form, setForm] = useState({
        feature_name: "",
        description: "",
        base_price: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = () => {
        if (!form.feature_name || !form.base_price) {
            alert("Feature name and price are required");
            return;
        }

        mutate(
            {
                ...form,
                base_price: Number(form.base_price),
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setForm({
                        feature_name: "",
                        description: "",
                        base_price: "",
                    });
                },
            }
        );
    };


    return (
        <div>
            <CustomeModal className='min-w-[650px]' open={open} onOpenChange={setOpen}>
                <div className="bg-[#F0DEFF] rounded-md px-5 py-3">

                    <h2 className="text-black font-roboto text-[21px] font-medium leading-[140%]">Add New Platform Features </h2>
                </div>
                <div className="flex flex-col gap-5 py-3">
                    <Input
                        label='Feature Name'
                        name="feature_name"
                        value={form.feature_name}
                        onChange={handleChange}
                        placeholder="Enter the Feature Name"
                    />

                    <Textarea
                        label='Feature Description'
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Add the Feature Description"
                    />

                    <Input
                        label='Set Feature Price'
                        name="base_price"
                        type="number"
                        value={form.base_price}
                        onChange={handleChange}
                        placeholder="Enter the Feature Price"
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
                            onClick={handleSubmit}
                            disabled={isPending}
                        >
                            {isPending ? "Creating..." : "Create Feature"}
                        </Button>
                    </div>
                </div>
            </CustomeModal>
        </div>
    )
}

export default AddplatformFeature
