import React from "react";
import {
  ArrowRight,
  BarChart3,
  CircleCheck,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import partnerlanding from "@partner/onboarding/assets/partner-landing.svg";
import partnerbg from "@partner/onboarding/assets/partner-bg.png";
import instant from "@partner/onboarding/assets/instant.svg";
import resurring from "@partner/onboarding/assets/recurring.svg";
import unlimited from "@partner/onboarding/assets/unlimited.svg";
import logo from "@assets/header-icons/logo.svg";
import { Button } from "@pages/components/ui/button";
import revenu1 from "@partner/onboarding/assets/revenue1.svg";
import revenu2 from "@partner/onboarding/assets/revenue2.svg";
import revenu3 from "@partner/onboarding/assets/revenue3.svg";
import revenu4 from "@partner/onboarding/assets/revenue4.svg";
import stream1 from "@partner/onboarding/assets/incomestream1.svg";
import stream2 from "@partner/onboarding/assets/incomestream2.svg";
import stream3 from "@partner/onboarding/assets/incomestream3.svg";
import quoteimg from "@partner/onboarding/assets/quote.svg";
import step1 from "@partner/onboarding/assets/step1.svg";
import step2 from "@partner/onboarding/assets/step2.svg";
import step3 from "@partner/onboarding/assets/step3.svg";
import step4 from "@partner/onboarding/assets/step4.svg";
import whatyouget1 from "@partner/onboarding/assets/whatyouget1.svg";
import whatyouget2 from "@partner/onboarding/assets/whatyouget2.svg";
import whatyouget3 from "@partner/onboarding/assets/whatyouget3.svg";
import whatyouget4 from "@partner/onboarding/assets/whatyouget4.svg";
import whatyouget5 from "@partner/onboarding/assets/whatyouget5.svg";
import whatyouget6 from "@partner/onboarding/assets/whatyouget6.svg";
import growthimage from "@partner/onboarding/assets/growthimg.svg";
import { useNavigate } from "react-router-dom";

const PartnerLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: ShieldCheck,
      title: "Proven SaaS Platform",
      desc: "Built and battle-tested across hundreds of real clients.",
    },
    {
      icon: TrendingUp,
      title: "Growing Industry Demand",
      desc: "Training & fitness software is booming. Your timing is perfect.",
    },
    {
      icon: BarChart3,
      title: "Scalable & Future-Ready",
      desc: "A model that compounds — the more you build, the more you earn.",
    },
  ];

  const growthValue = [
    {
      value: 555,
      title: "Active Clients on Platform",
    },
    {
      value: 8,
      title: "Partner Resellers",
    },
    {
      value: 520,
      title: "Earning Ceiling",
    },
  ];
  return (
    <div className="font-sans">
      <section
        className="text-white py-4 px-6 md:px-16 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${partnerbg})`,
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <img src={logo} alt="Logo" className="w-28 md:w-32 object-contain" />

          <Button
            onClick={() => navigate("/partner-onboard")}
            size="addbutton"
            className="bg-white hover:bg-white/80 text-onboard_primary font-medium flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            Join Now <ArrowRight size={16} />
          </Button>
        </div>

        {/* HERO CONTENT */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center">
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
              <Button
                onClick={() => navigate("/partner-onboard")}
                className="bg-onboard_primary hover:bg-onboard_primary/80 text-textwhite flex items-center gap-2 px-5 py-3 rounded-lg"
              >
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
              className="max-w-lg object-contain"
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
        className="text-white px-6 md:px-20 py-6 gap-4 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${partnerbg})`,
        }}
      >
        <div className="flex flex-col gap-5">
          <div className="justify-center items-center flex flex-col ">
            <div className="inline-block bg-onboard_primary/5 text-onboard_primary text-sm px-4 py-1 rounded-full mb-6">
              How You Earn
            </div>

            <h2 className="text-3xl md:text-5xl font-semibold mb-4">
              Three Powerful Income Streams
            </h2>

            <p className="text-gray-300 text-base md:text-lg">
              Every stream works together to build income that grows while you
              sleep.
            </p>
          </div>

          <div className="flex justify-center mt-8">
            <div className="flex flex-wrap justify-center gap-8">
              <img src={stream1} alt="Card 1" className=" object-contain " />
              <img src={stream2} alt="Card 2" className=" object-contain" />
              <img src={stream3} alt="Card 3" className=" object-contain" />
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <img src={quoteimg} alt="qquoteimg" />
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-8 px-4 md:px-8">
        <div className="justify-center items-center flex flex-col ">
          <div className="inline-block bg-onboard_primary/10 text-onboard_primary text-sm px-4 py-1 rounded-full">
            How It Works
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold mb-4">
            Simple. Proven. Profitable.
          </h2>

          <p className="text-textgrey text-base md:text-lg">
            Four straightforward steps from zero to earning.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mt-10 text-left">
          <img src={step1} alt="Card 1" className=" object-contain" />
          <img src={step2} alt="Card 2" className=" object-contain" />
          <img src={step3} alt="Card 3" className=" object-contain" />
          <img src={step4} alt="Card 4" className=" object-contain" />
        </div>
      </section>

      <section className="bg-gray-100 py-8 px-4 md:px-8">
        <div className="justify-center items-center flex flex-col">
          <div className="inline-block bg-onboard_primary/10 text-onboard_primary text-sm px-4 py-1 rounded-full">
            Who Can Join
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold mb-4">
            If You Can Connect People,
          </h2>

          <p className="text-textgrey text-base md:text-lg">You Can Earn.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-10 py-16 px-6 md:px-16 bg-gray-100">
          {/* LEFT SIDE */}
          <div className="flex-1">
            <h2 className="text-2xl md:text-2xl font-semibold leading-snug">
              <span className="text-blue-600">
                No experience required. No technical background needed.
              </span>{" "}
              <span className="text-gray-700">
                Just a network and the willingness to grow.
              </span>
            </h2>

            {/* CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
              {[
                "Freelancer",
                "Digital Marketers",
                "Consultants",
                "Fitness Professionals",
                "Entrepreneurs",
                "Anyone have Network",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {/* placeholder icon */}
                    <div className="w-6 h-6 bg-blue-500 rounded" />
                  </div>
                  <p className="font-medium text-gray-800">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1">
            <div className="bg-gradient-to-br from-[#1a005c] to-[#3b0a91] text-white p-6 rounded-2xl shadow-lg">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6">
                <span className="bg-white/10 text-yellow-300 text-sm px-4 py-1 rounded-full">
                  Earning Potential
                </span>
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  📈
                </div>
              </div>

              {/* PROGRESS ITEMS */}
              {[
                {
                  title: "10 Clients",
                  desc: "Monthly Recurring Income",
                  width: "30%",
                  color: "bg-purple-400",
                },
                {
                  title: "50 Clients",
                  desc: "Strong Passive Income",
                  width: "70%",
                  color: "bg-cyan-400",
                },
                {
                  title: "+100 Clients",
                  desc: "Full-Time Business Income",
                  width: "100%",
                  color: "bg-green-400",
                },
              ].map((item, i) => (
                <div key={i} className="mb-6 last:mb-0">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{item.title}</span>
                    <span className="text-gray-300">{item.desc}</span>
                  </div>

                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-8 px-4 md:px-8">
        <div className="justify-center items-center flex flex-col">
          <div className="inline-block bg-onboard_primary/10 text-onboard_primary text-sm px-4 py-1 rounded-full">
            What you Get
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold mb-4">
            Everything You Need to Succeed
          </h2>

          <p className="text-textgrey text-base md:text-lg">
            We arm you with every tool, resource, and support system from day
            one.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 mt-10 text-left">
          <img src={whatyouget1} alt="Card 1" className=" object-contain" />
          <img src={whatyouget2} alt="Card 2" className=" object-contain" />
          <img src={whatyouget3} alt="Card 3" className=" object-contain" />
          <img src={whatyouget4} alt="Card 4" className=" object-contain" />
          <img src={whatyouget5} alt="Card 5" className=" object-contain" />
          <img src={whatyouget6} alt="Card 6" className=" object-contain" />
        </div>

        <div className="px-6 md:px-16 py-10 bg-gray-100">
          <div className="max-w-6xl mx-auto bg-textwhite rounded-3xl shadow-lg py-10 px-6 md:px-10">
            <div className="grid md:grid-cols-3 gap-10 text-center">
              {features.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex flex-col items-center">
                    {/* ICON */}
                    <div className="w-14 h-14 bg-onboard_primary rounded-xl flex items-center justify-center mb-4">
                      <Icon className="text-white" strokeWidth={2.75} />
                    </div>

                    {/* TITLE */}
                    <h3 className="font-semibold text-textblack mb-2">
                      {item.title}
                    </h3>

                    {/* DESC */}
                    <p className="text-gray-600 text-sm max-w-xs">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <section
        className="text-white py-4 px-6 md:px-16 relative overflow-hidden bg-cover bg-center min-h-[90vh]"
        style={{
          backgroundImage: `url(${partnerbg})`,
        }}
      >
        {/* HERO CONTENT */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center h-full">
          {/* LEFT */}
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Start Building Your{" "}
              <span className="bg-gradient-to-r from-[#1AA0FF] to-[#FF00D4] bg-clip-text text-transparent">
                Passive Income
              </span>{" "}
              Today
            </h1>
            <div className="text-[#DBE7FF] text-base gap-4  leading-relaxed">
              <span className="flex items-center gap-2">
                <CircleCheck className="text-onboard_primary"/>
                Join now and start earning from your first client
              </span>
              <span className="flex items-center gap-2">
                <CircleCheck className="text-onboard_primary"/>
                Build a long-term income stream with zero limits
              </span>
              <span className="flex items-center gap-2">
                <CircleCheck className="text-onboard_primary"/>
                Your clients' renewals pay you — forever
              </span>
            </div>

            <div>
              <Button
                onClick={() => navigate("/partner-onboard")}
                className="bg-onboard_primary hover:bg-onboard_primary/80 text-textwhite flex items-center gap-2 px-5 py-3 rounded-lg"
              >
                Become a Partner today <ArrowRight size={18} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm mt-2">
              <p>No limits.</p>
              <p>No targets.</p>
              <p>Pure earning potential.</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center md:justify-end">
            <img
              src={growthimage}
              alt="Partner Landing"
              className="max-w-lg object-contain"
            />
          </div>
        </div>

        {/* 🔥 OVERLAY CONTENT */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
          <div className="flex flex-col items-center text-center gap-4  backdrop-blur-md rounded-2xl py-6 px-4">
            <div className="text-sm text-gray-300">
              One-time onboarding · ₹2,500 setup fee · Lifetime earning
              potential
            </div>

            <div className="grid grid-cols-3 justify-center">
              {growthValue?.map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-2xl md:text-3xl font-bold text-white">
                    {item.value}
                  </span>
                  <span className="text-sm text-gray-300 text-center">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-400">
              © 2026 Tcenteros. All rights reserved.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerLanding;
