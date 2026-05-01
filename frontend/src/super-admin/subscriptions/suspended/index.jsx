import ContentLayout from '@common/MasterLayout/ContentLayout'
import { Ban } from 'lucide-react'
import React from 'react'
import SuspendedCenterTable from './SuspendedCenterTable'

const SuspendedCenters = () => {
    return (
        <ContentLayout>
            <div className="flex items-center justify-between p-4">
                <div className="flex  gap-4">
                    <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
                        <Ban size={30} className="text-danger" />
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                        <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                            Suspended Centers
                        </p>
                        <p className="text-[#393636] font-inter text-[14px] font-medium">
                           List of suspended centers.
                        </p>
                    </div>
                </div>
            </div>

            <SuspendedCenterTable/>

        </ContentLayout>
    )
}

export default SuspendedCenters
