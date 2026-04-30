import React from 'react'
import featuredImage from '@assets/dummy/defaultFeatureImage.png'
import { ChevronsRight } from 'lucide-react'

const FeaturedBlog = () => {
    return (
        <div className="w-full flex items-center justify-center py-6">
            <div className="w-[80%] min-h-full 2xl:min-h-[400px] rounded-xl bg-center bg-cover bg-no-repeat relative overflow-hidden"
                style={{ backgroundImage: `url(${featuredImage})` }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Content */}
                <div className="relative z-10 py-4 px-10 text-white w-full h-[400px] flex flex-col justify-around ">
                    <div>
                        <p className="border border-white w-fit p-2 rounded-md font-poppins">Featured Blog</p>
                    </div>
                    <div className="pt-4">
                        <h2 className='text-[#FFF700] font-roboto text-[32px] font-semibold leading-[137.546%]'>5 Best Exercises for Back Pain</h2>
                        <p className='text-white font-poppins text-[20px] font-medium leading-[140%]'>By Saran kumar | 12 feb 2026 | 8 Mins Read</p>
                    </div>
                    <div className="w-[60%] h-[15%] overflow-y-auto">
                        <p className='text-white font-poppins text-[18px] font-normal leading-[140%]'>
                            Top 5 essential compound movement for strengthen your back and reduce back pain , The work workout benifits for your body posture....</p>
                    </div>
                    <div className="">
                        <button className='flex items-center justify-center gap-1 bg-white text-[#8B24E2] rounded-md p-2'>
                            <p className='text-[#8B24E2] font-poppins text-[14px] font-medium leading-normal'>  Read more</p> <ChevronsRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default FeaturedBlog
