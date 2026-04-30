import React from "react";
import { ArrowRight } from "lucide-react";
import partnerlanding from "@partner/onboarding/assets/partner-landing.png";
import partnerbg from "@partner/onboarding/assets/partner-bg.png";
import instant from "@partner/onboarding/assets/instant.png";
import resurring from "@partner/onboarding/assets/recurring.png";
import unlimited from "@partner/onboarding/assets/unlimited.png";
import logo from "@assets/header-icons/logo.svg";
import { Button } from "@pages/components/ui/button";
import revenu1 from "@partner/onboarding/assets/revenue1.png";
import revenu2 from "@partner/onboarding/assets/revenue2.png";
import revenu3 from "@partner/onboarding/assets/revenue3.png";
import revenu4 from "@partner/onboarding/assets/revenue4.png";


const PartnerLanding = () => {
  return (
    <div className="font-sans">
      {/* HERO */}
      <section
        className="text-white px-6 md:px-20 py-6  relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${partnerbg})`,
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <img src={logo} alt="Logo" className="w-28 md:w-32 object-contain" />

          <Button
            size="addbutton"
            className="bg-white text-onboard_primary font-medium flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            Join Now <ArrowRight size={16} />
          </Button>
        </div>

        {/* HERO CONTENT */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10 mt-5">
          {/* LEFT */}
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Build Your{" "}
              <span className="bg-gradient-to-r from-[#1AA0FF] to-[#FF00D4] bg-clip-text text-transparent">
                Recurring
              </span>{" "}
              <span className="bg-gradient-to-r from-[#8daec6] to-[#1AA0FF] bg-clip-text text-transparent">
                Income
              </span>{" "}
              Business with Us
            </h1>

            <p className="text-[#DBE7FF] text-base md:text-lg  font-semibold leading-relaxed">
              Earn from every sale. <br />
              Earn from every renewal. <br />
              Earn as long as your clients stay.
            </p>

            <div>
              <Button className="bg-onboard_primary  text-textwhite flex items-center gap-2 px-5 py-3 rounded-lg">
                Become a Partner today <ArrowRight size={18} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm  mt-2">
              <p>No limits.</p>
              <p>No targets.</p>
              <p>Pure earning potential.</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center md:justify-end ">
            <img
              src={partnerlanding}
              alt="Partner Landing"
              className=" max-w-lg object-contain"
            />
          </div>
        </div>

        {/* CARDS */}
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-8">
            <img src={instant} alt="Card 1" className=" object-contain" />
            <img src={resurring} alt="Card 2" className=" object-contain" />
            <img src={unlimited} alt="Card 3" className=" object-contain" />
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className="bg-gray-100 py-16 px-6 md:px-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-onboard_primary text-2xl font-semibold">
            WHY THIS OPPORTUNITY?
          </div>

          {
            /* FEATURES */ <h2 className="text-2xl md:text-4xl font-semibold mt-3">
              Turn Your Network into a{" "}
              <span className="bg-gradient-to-r from-[#981d84] to-[#FF00D4] bg-clip-text text-transparent">
                Revenue Machine
              </span>
            </h2>
          }
          <div className="grid md:grid-cols-2 gap-6 mt-10 text-left">
           <img src={revenu1} alt="Card 1" className=" object-contain" />
            <img src={revenu2} alt="Card 2" className=" object-contain" />
            <img src={revenu3} alt="Card 3" className=" object-contain" />
            <img src={revenu4} alt="Card 4" className=" object-contain" />
          </div>
        </div>
      </section>
         <section
        className="text-white px-6 md:px-20 py-6  relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${partnerbg})`,
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <img src={logo} alt="Logo" className="w-28 md:w-32 object-contain" />

          <Button
            size="addbutton"
            className="bg-white text-onboard_primary font-medium flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            Join Now <ArrowRight size={16} />
          </Button>
        </div>

        {/* HERO CONTENT */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-10 mt-5">
          {/* LEFT */}
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Build Your{" "}
              <span className="bg-gradient-to-r from-[#1AA0FF] to-[#FF00D4] bg-clip-text text-transparent">
                Recurring
              </span>{" "}
              <span className="bg-gradient-to-r from-[#8daec6] to-[#1AA0FF] bg-clip-text text-transparent">
                Income
              </span>{" "}
              Business with Us
            </h1>

            <p className="text-[#DBE7FF] text-base md:text-lg  font-semibold leading-relaxed">
              Earn from every sale. <br />
              Earn from every renewal. <br />
              Earn as long as your clients stay.
            </p>

            <div>
              <Button className="bg-onboard_primary  text-textwhite flex items-center gap-2 px-5 py-3 rounded-lg">
                Become a Partner today <ArrowRight size={18} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm  mt-2">
              <p>No limits.</p>
              <p>No targets.</p>
              <p>Pure earning potential.</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center md:justify-end ">
            <img
              src={partnerlanding}
              alt="Partner Landing"
              className=" max-w-lg object-contain"
            />
          </div>
        </div>

        {/* CARDS */}
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-8">
            <img src={instant} alt="Card 1" className=" object-contain" />
            <img src={resurring} alt="Card 2" className=" object-contain" />
            <img src={unlimited} alt="Card 3" className=" object-contain" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerLanding;
