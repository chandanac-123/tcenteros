import React from "react";

const BlogCards = () => {
    const blogCards = [
        {
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8WrcWiCknhShYtsrFE2SkkmkiDqsDruCaXw&s",
            category: "Nutrition",
            readTime: "5 Mins read",
            title: "Post-Workout Meal Ideas",
            description:
                "Discover tasty and healthy recipes for every meal. Learn how to cook delicious meals with simple ingredients and easy-to-follow instructions.",
            author: "Sara Jacob",
            date: "12 Feb 2026",
        },
        {
            image: "https://thumbs.dreamstime.com/b/closeup-portrait-muscular-man-workout-barbell-gym-brutal-bodybuilder-athletic-six-pack-perfect-abs-shoulders-55122231.jpg",
            category: "Fitness",
            readTime: "10 Mins read",
            title: "Effective Training Techniques",
            description:
                "Improve your flexibility and recovery with these essential stretching routines. Perfect for athletes and beginners alike.",
            author: "Mike Thompson",
            date: "15 Feb 2026",
        },
        {
            image: "https://blog.medkart.in/wp-content/uploads/2023/08/14-Healthy-foods-for-healthy-diet.jpeg",
            category: "Wellness",
            readTime: "7 Mins read",
            title: "Mindfulness Practices for Life",
            description:
                "Explore simple mindfulness exercises that can be integrated into your daily routine to enhance mental clarity and reduce stress.",
            author: "Emily Chen",
            date: "20 Feb 2026",
        },
        {
            image: "https://www.yukio.in/blog/wp-content/uploads/2025/08/Yoga.jpg",
            category: "Fitness Equipment",
            readTime: "6 Mins read",
            title: "Choosing the Right Treadmill",
            description:
                "A guide to selecting the perfect treadmill for your home gym, space, and budget to meet your fitness needs.",
            author: "Alice Johnson",
            date: "28 Feb 2026",
        },
    ];

    return (
        <>
            <div className="w-full flex items-center justify-center">
                <div className="w-[80%] flex flex-col gap-5  ">
                    <div className="">
                        <h2 className="text-[#0C0B0C] font-roboto text-[24px] font-semibold leading-[137.546%]">Tecenteros Blogs</h2>
                    </div>
                    <div className=" grid grid-cols-3  sm:grid-cols-4 2xl:grid-cols-10 gap-4">
                        <button className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-black flex items-center justify-center gap-2">
                            <p className="text-black text-xs sm:text-sm font-medium leading-5 whitespace-nowrap">
                                All Category
                            </p>
                        </button>
                        <button className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-black flex items-center justify-center gap-2">
                            <p className="text-black text-xs sm:text-sm font-medium leading-5 whitespace-nowrap">
                                Workouts
                            </p>

                        </button>
                        <button className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-black flex items-center justify-center gap-2">
                            <p className="text-black text-xs sm:text-sm font-medium leading-5 whitespace-nowrap">
                                Nutrition
                            </p>

                        </button>
                        <button className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-black flex items-center justify-center gap-2">
                            <p className="text-black text-xs sm:text-sm font-medium leading-5 whitespace-nowrap">
                                Sleep
                            </p>

                        </button>
                        <button className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-black flex items-center justify-center gap-2">
                            <p className="text-black text-xs sm:text-sm font-medium leading-5 whitespace-nowrap">
                                Lifestyle
                            </p>

                        </button>
                        <button className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-black flex items-center justify-center gap-2">
                            <p className="text-black text-xs sm:text-sm font-medium leading-5 text-center break-words">
                                Fitness Equipment
                            </p>

                        </button>
                        <button className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-black flex items-center justify-center gap-2">
                            <p className="text-black text-xs sm:text-sm font-medium leading-5 whitespace-nowrap">
                                Health Tips
                            </p>

                        </button>
                        <button className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-black flex items-center justify-center gap-2">
                            <p className="text-black text-xs sm:text-sm font-medium leading-5 whitespace-nowrap">
                                Mental Health
                            </p>

                        </button>

                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-6 place-items-center ">
                        {blogCards.map((card, index) => (
                            <div
                                key={index}
                               className="w-full h-full p-4 bg-white rounded-2xl shadow-md border border-zinc-300 flex flex-col gap-4"
                            >
                                {/* Image */}
                                <img
                                    className="w-full aspect-[16/10] object-cover rounded-xl"
                                    src={card.image}
                                    alt={card.title}
                                />

                                {/* Tags */}
                                <div className="flex flex-wrap justify-between items-center gap-2">
                                    <div className="px-3 py-1 rounded-2xl border border-neutral-600 shadow-md">
                                        <div className="text-neutral-500 text-xs font-medium">
                                            {card.category}
                                        </div>
                                    </div>

                                    <div className="px-3 py-1 bg-white rounded-2xl shadow-lg">
                                        <div className="text-purple-600 text-xs font-medium">
                                            {card.readTime}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-stone-900 text-lg font-medium leading-snug">
                                        {card.title}
                                    </h2>

                                    <p className="text-zinc-700 text-sm leading-5">
                                        {card.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex flex-wrap justify-between items-center gap-2 text-sm font-semibold text-zinc-700">
                                        <span>{card.author}</span>
                                        <span>{card.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </>

    );
};

export default BlogCards;