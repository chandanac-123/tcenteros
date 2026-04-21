import CustomeModal from '@common/components/CustomeModal'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import React, { useRef, useState } from 'react'
import { Camera } from 'lucide-react'

const AdminProfileModal = ({ open, setOpen }) => {
    const fileRef = useRef(null)
    const [image, setImage] = useState(
        "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
    )

    const handleImageClick = () => {
        fileRef.current.click()
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const imageUrl = URL.createObjectURL(file)
            setImage(imageUrl)
        }
    }

    return (
        <CustomeModal
            className='lg:w-[600px]'
            open={open}
            onOpenChange={setOpen}
        >
            <h1>My Profile</h1>

            {/* Profile Image */}
            <div className="flex items-center justify-center">
                <div className="relative">
                    <img
                        src={image}
                        alt='User'
                        className='w-32 h-32 rounded-full border-2 border-bordergreylight'
                    />

                    {/* Camera Icon */}
                    <button
                        className='absolute -right-2 bottom-0 bg-primary w-8 h-8 rounded-full flex justify-center items-center shadow-md'
                    >
                        <Camera size={16} className='text-white' />
                    </button>

                    {/* Hidden File Input */}
                    <input
                        type="file"
                        ref={fileRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
                <Input label='Full Name' name="full_name" />
                <Input label='Email' name="email" />
                <Input label='Phone' name="phone" />
                <Input label='WhatsApp Number' name="whatsapp" />
            </div>

            {/* Submit */}
            <div className="w-full flex items-center justify-end mt-6">
                <Button size="addbutton">
                    Submit
                </Button>
            </div>
        </CustomeModal>
    )
}

export default AdminProfileModal