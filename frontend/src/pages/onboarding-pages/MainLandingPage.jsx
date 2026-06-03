import logo from "@assets/header-icons/logo.svg";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CircleCheck,
  Star,
  Smartphone,
  Globe,
  Network,
  MapPin,
  BicepsFlexed,
  CirclePile,
  Signal,
  Calendar,
  Wallet,
  BellRing,
  Ribbon,
  Target,
  Zap,
  ActivityIcon,
} from "lucide-react";
import { Button } from "@pages/components/ui/button";
import mainlanging from "./assets/main-img.svg";
import unique_advantage from "./assets/unique-advantage.svg";
import leadfocus from "./assets/lead-focus.svg";
import network_power from "./assets/netwwork-power.svg";
import fitness from "./assets/fitness.svg";
import crossfit from "./assets/crossfit.svg";
import dance from "./assets/dance.svg";
import yoga from "./assets/yoga.svg";
import zumba from "./assets/zumba.svg";

const MainLandingPage = () => {
  const navigate = useNavigate();
  const growthValue = [
    {
      value: "500+",
      title: "Training Centers",
    },
    {
      value: "156+",
      title: "Leads Generated",
    },
    {
      value: "0%",
      title: "Client Retention",
    },
  ];

  const features = [
    {
      icon: Smartphone,
      title: "Your Own Branded App (Whitelisted)",
      description: "Your clients see your brand, not ours.",
      color: "#D49114",
      borderColor: "#D49114",
    },
    {
      icon: Globe,
      title: "Use Your Own Domain",
      description: "Fully customizable web presence.",
      color: "#09706A",
      borderColor: "#09706A",
    },
    {
      icon: Zap,
      title: "Built-in Lead Generation System",
      description: "Capture and manage leads directly.",
      color: "#AB3811",
      borderColor: "#AB3811",
    },
    {
      icon: Network,
      title: "Network of Training Centers",
      description: "Collaborate, cross-refer, and grow together.",
      color: "#7120B6",
      borderColor: "#7120B6",
    },
  ];

  const everything_you_need = [
    {
      icon: Signal,
      title: "Lead Management Dashboard",
      description:
        "Track, manage, and convert every inquiry in one powerful view.",
      color: "#D49114",
    },
    {
      icon: Calendar,
      title: "Booking & Scheduling",
      description:
        "Seamless booking system that works around your clients' lives.",
      color: "#B40A0A",
    },
    {
      icon: Wallet,
      title: "Subscription & Payment Tracking",
      description: "Never miss a payment with automated billing and renewals.",
      color: "#047856",
    },
    {
      icon: BellRing,
      title: "Marketing & Notifications",
      description: "Engage your members with smart, targeted communications.",
      color: "#0F357A",
    },
    {
      icon: MapPin,
      title: "Multi-location Support",
      description: "Manage all your branches from a single command center.",
      color: "#92B40A",
    },
    {
      icon: Ribbon,
      title: "Member Management",
      description: "Complete member profiles, progress tracking, and history.",
      color: "#490482",
    },
  ];

  const centerTypes = [
    { icon: fitness, title: "Fitness Centers" },
    { icon: yoga, title: "Yoga Studios" },
    { icon: crossfit, title: "CrossFit" },
    { icon: zumba, title: "Zumba Center" },
    { icon: dance, title: "Dance Studio" },
  ];

  return (
    <div className=" font-urbanist">
      <section className="flex flex-col gap-10 bg-gradient-to-b from-[#2c0149] via-[#210168] to-[#43007D] md:gap-12 text-white py-6 md:py-4 px-4 sm:px-6 md:px-16 relative overflow-hidden bg-cover bg-center">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
          <img
            src={logo}
            alt="Logo"
            className="w-24 md:w-32 object-contain"
            loading="lazy"
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
            {/* <Button
              variant="outline_secondary"
              onClick={() => navigate("/landing")}
              size="addbutton"
              className="w-full sm:w-auto bg-transparent text-textwhite hover:bg-textwhite/10 border-textwhite font-medium flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
            >
              Book Demo
            </Button> */}
            <Button
              onClick={() => navigate("/partner-landing")}
              size="addbutton"
              className="w-full sm:w-auto bg-onboard_primary hover:bg-onboard_primary/80 text-textwhite font-medium flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
            >
              Join as Reseller
              <ArrowRight size={16} />
            </Button>
            <Button
              onClick={() => navigate("/landing")}
              size="addbutton"
              className="w-full sm:w-auto bg-onboard_primary hover:bg-onboard_primary/80 text-textwhite font-medium flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
            >
              Join Now <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        {/* BADGE */}
        <div className="flex items-center gap-2 md:gap-3 bg-textwhite/10 rounded-3xl px-3 md:px-4 py-2 w-fit mx-auto md:mx-0">
          <Star size={16} />
          <span className="text-xs sm:text-sm md:text-base text-[#FFDD88] text-center md:text-left">
            THE GROWTH ENGINE FOR TRAINING BUSINESSES
          </span>
        </div>

        {/* MAIN */}
        <div className="flex flex-col md:flex-row md:justify-between gap-8 relative">
          {/* LEFT */}
          <div className="w-full md:w-2/5 flex flex-col gap-5 md:gap-10 text-center md:text-left">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold mt-2 md:mt-3">
                Your Own App.
              </h2>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#1AA0FF] to-[#ff02d5] bg-clip-text text-transparent">
                Your Own Leads.
              </h2>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold">
                Your Own Network.
              </h2>
            </div>

            <div className="text-sm sm:text-base md:text-lg text-[#FFD36C]">
              Launch your branded platform to manage, grow, and connect your
              training business — all in one place.
            </div>

            <div className="flex flex-col gap-2 text-sm md:text-base">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <CircleCheck size={18} />
                Generate leads directly into your system
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <CircleCheck size={18} />
                Build your own branded app (even on your domain)
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <CircleCheck size={18} />
                Stay connected with a powerful network of training centers
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {/* <Button
                variant="outline_secondary"
                onClick={() => navigate("/landing")}
                size="addbutton"
                className="w-full sm:w-auto bg-transparent text-textwhite hover:bg-textwhite/10 border-textwhite font-medium flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
              >
                Book a Demo
              </Button> */}
              <Button
                onClick={() => navigate("/landing")}
                size="addbutton"
                className="w-full sm:w-auto bg-onboard_primary hover:bg-onboard_primary/80 text-textwhite font-medium flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
              >
                Get Started <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          {/* IMAGE (FIXED) */}
          <div className="w-full md:w-3/5 flex justify-center md:justify-end items-center md:items-end relative md:absolute md:right-12 md:top-8 h-auto md:h-full pointer-events-none">
            <img
              src={mainlanging}
              alt="Main Landing"
              className="w-full max-w-sm sm:max-w-md md:max-w-[700px] h-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 w-full gap-4 mt-4">
          {growthValue?.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                {item.value}
              </span>
              <span className="text-xs sm:text-sm text-gray-300">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-10 px-6 md:px-16">
        <div className="text-center flex flex-col items-center gap-6">
          {
            <h2 className="text-2xl md:text-4xl font-semibold mt-3">
              Not Just Software.
              <span className="text-onboard_primary pl-1">
                A Complete Growth Engine.
              </span>
            </h2>
          }
          <span className="text-textblack font-medium text-lg">
            Most platforms help you manage. We help you grow.
          </span>

          <div className="grid md:grid-cols-4 gap-6 mt-10">
            {features?.map((feature, i) => (
              <div
                className="relative w-[260px] bg-white rounded-2xl p-6 text-center"
                style={{
                  border: `1px solid ${feature?.borderColor}`,
                  boxShadow: `0 6px 0 ${feature?.color}`,
                }}
              >
                {/* Icon Badge */}
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                  style={{ backgroundColor: feature?.color }}
                >
                  {feature?.icon && <feature.icon size={30} color="#fff" />}
                </div>

                {/* Content */}
                <h3 className="mt-6 font-semibold text-textblack text-lg">
                  {feature?.title}
                </h3>

                <p className="mt-3 text-sm text-textblack">
                  {feature?.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8 md:gap-12 bg-gradient-to-b from-[#2c0149] pt-8 via-[#210168] to-[#43007D] text-white  relative overflow-hidden bg-cover bg-center">
        <div className="text-center flex flex-col items-center gap-4 md:gap-6">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold mt-2 md:mt-3">
            A Connected Fitness &
            <span className="bg-gradient-to-r from-[#ab7bef] to-[#FF00D4] bg-clip-text text-transparent">
              {" "}
              Training Ecosystem
            </span>
          </h2>
        </div>

        {/* MAIN */}
        <div className="flex flex-col md:flex-row md:justify-between gap-8 md:gap-0">
          {/* LEFT */}
          <div className="w-full md:w-2/5 flex flex-col gap-6 px-4 sm:px-6 md:px-16">
            <div className="text-sm md:text-lg text-[#FFD36C] text-center md:text-left">
              " When A client is traveling to another city..."
            </div>

            {/* STEPS */}
            <div className="flex flex-col gap-4 md:gap-6 md:pl-20">
              <div className="flex items-start gap-3">
                <span className="bg-onboard_primary p-2 flex rounded-lg shrink-0">
                  <Smartphone size={18} />
                </span>
                <span className="text-sm md:text-base">They open your app</span>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-onboard_primary p-2 flex rounded-lg shrink-0">
                  <MapPin size={18} />
                </span>
                <span className="text-sm md:text-base">
                  Find a partner center nearby
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-onboard_primary p-2 flex rounded-lg shrink-0">
                  <BicepsFlexed size={18} />
                </span>
                <span className="text-sm md:text-base">
                  Continue their workout seamlessly
                </span>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-onboard_primary p-2 flex rounded-lg shrink-0">
                  <CirclePile size={18} />
                </span>
                <span className="text-sm md:text-base">
                  You keep the client & expand reach
                </span>
              </div>
            </div>

            {/* HIGHLIGHTS */}
            <div className="flex flex-col gap-4 md:gap-6 w-full mt-4 md:mt-6 items-center md:items-start">
              <div className="inline-flex w-fit px-4 md:px-5 py-2.5 md:py-3 bg-white/90 rounded-lg shadow-sm">
                <span className="text-sm md:text-lg font-semibold bg-gradient-to-r from-[#078ae7] to-[#ff02ee] bg-clip-text text-transparent">
                  You don’t lose the client.
                </span>
              </div>

              <div className="inline-flex w-fit px-4 md:px-5 py-2.5 md:py-3 bg-white/90 rounded-lg shadow-sm md:self-center">
                <span className="text-sm md:text-lg font-semibold bg-gradient-to-r from-[#078ae7] to-[#ff02ee] bg-clip-text text-transparent">
                  You expand your reach.
                </span>
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div className="w-full md:w-3/5 flex justify-end items-center md:items-end pointer-events-none">
            <img
              loading="lazy"
              src={unique_advantage}
              alt="Main Landing"
              className="w-full max-w-sm sm:max-w-md md:max-w-[700px] h-auto object-contain"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-10 px-6 md:px-16">
        <div className="text-center flex flex-col items-center gap-6">
          {
            <h2 className="text-2xl md:text-4xl font-semibold mt-3">
              Everything You Need to  
              <span className="text-onboard_primary"> Run & Scale</span>
            </h2>
          }

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {everything_you_need?.map((item, i) => (
              <div className="w-full max-w-md bg-white rounded-2xl py-6 px-10 shadow-md border border-gray-200">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: item?.color }}
                >
                  {item?.icon && <item.icon size={30} color="#fff" />}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 text-start">
                  {item?.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-gray-600 leading-relaxed text-start">
                  {item?.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-8 md:gap-12 bg-gradient-to-b from-[#2c0149] via-[#210168] to-[#43007D] text-white py-10 md:py-16 px-4 sm:px-6 md:px-16 relative overflow-hidden bg-cover bg-center">
        {/* TAG */}
        <div className="text-center flex flex-col items-center gap-4 md:gap-6"></div>

        {/* MAIN */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10 justify-center lg:items-stretch">
          {/* IMAGE (TOP ON MOBILE) */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <img
              src={leadfocus}
              alt="Main Landing"
              className="w-full max-w-sm sm:max-w-md md:max-w-lg h-auto lg:h-full object-contain"
              loading="lazy"
            />
          </div>

          {/* CONTENT */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold">
              Turn Visitors Into
              <span className="bg-gradient-to-r from-[#ab7bef] to-[#FF00D4] bg-clip-text text-transparent">
                {" "}
                Paying Clients
              </span>
            </h2>

            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex items-start gap-3 bg-textwhite/10 border border-textgrey rounded-lg p-4 md:p-6">
                <Target className="text-[#00CCFF] shrink-0 mt-1" size={20} />
                <span className="text-sm md:text-base">
                  Capture leads from your website/app
                </span>
              </div>

              <div className="flex items-start gap-3 bg-textwhite/10 border border-textgrey rounded-lg p-4 md:p-6">
                <ActivityIcon
                  className="text-[#00CCFF] shrink-0 mt-1"
                  size={20}
                />
                <span className="text-sm md:text-base">
                  Track every inquiry in real-time
                </span>
              </div>

              <div className="flex items-start gap-3 bg-textwhite/10 border border-textgrey rounded-lg p-4 md:p-6">
                <Zap className="text-[#00CCFF] shrink-0 mt-1" size={20} />
                <span className="text-sm md:text-base">
                  Convert faster with automated follow-ups
                </span>
              </div>

              <div className="flex flex-col gap-2 border bg-[#D46E14F0]/10 border-[#D46E14F0] rounded-lg p-4">
                <span className="text-[#D46E14F0] text-sm md:text-base font-medium">
                  No more missed opportunities.
                </span>
                <span className="text-sm md:text-base">
                  Every visitor is a potential client. Our system makes sure
                  none slip through the cracks.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-10 px-4 sm:px-6 md:px-16">
        <div className="text-center flex flex-col items-center gap-4 md:gap-6">
          {/* TITLE */}
          <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold mt-2 md:mt-3">
            Grow Beyond Your{" "}
            <span className="text-onboard_primary font-bold">
              Physical Location
            </span>
          </h2>

          {/* MAIN SECTION */}
          <div className="flex flex-col lg:flex-row gap-6 md:gap-10 mt-6 w-full max-w-7xl items-stretch">
            {/* LEFT */}
            <div className="w-full lg:w-3/5 flex">
              <div className="flex flex-col justify-between w-full h-full gap-6 md:gap-10 border border-gray-300 rounded-xl py-6 md:py-12 px-4 sm:px-6 md:px-10 lg:px-16">
                {/* ITEMS */}
                <div className="flex flex-col gap-6 md:gap-10">
                  <div className="flex gap-3 items-start md:items-center">
                    <span className="bg-onboard_primary p-2 flex rounded-lg shrink-0">
                      <Smartphone size={20} className="text-textwhite" />
                    </span>
                    <div className="flex flex-col text-start">
                      <span className="text-base md:text-lg font-bold">
                        Partner with other centers
                      </span>
                      <span className="text-sm md:text-base">
                        Join a growing network of premium training facilities
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start md:items-center">
                    <span className="bg-onboard_primary p-2 flex rounded-lg shrink-0">
                      <Smartphone size={20} className="text-textwhite" />
                    </span>
                    <div className="flex flex-col text-start">
                      <span className="text-base md:text-lg font-bold">
                        Refer clients across locations
                      </span>
                      <span className="text-sm md:text-base">
                        Keep your clients happy wherever they travel
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start md:items-center">
                    <span className="bg-onboard_primary p-2 flex rounded-lg shrink-0">
                      <Smartphone size={20} className="text-textwhite" />
                    </span>
                    <div className="flex flex-col text-start">
                      <span className="text-base md:text-lg font-bold">
                        Build a strong ecosystem
                      </span>
                      <span className="text-sm md:text-base">
                        Collective growth benefits everyone in the network
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT (IMAGE SAME HEIGHT) */}
            <div className="w-full lg:w-2/5 flex">
              <div className="w-full h-full sm:justify-center items-center flex">
                <img
                  loading="lazy"
                  src={network_power}
                  alt="Network Power"
                  className="w-80 h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOT TEXT */}
        <div className="text-onboard_primary text-lg sm:text-xl md:text-2xl text-center mt-6 md:mt-8 font-medium px-2">
          Your business is no longer limited by geography.
        </div>
      </section>

      <section className="flex flex-col gap-10 md:gap-12 bg-gradient-to-b from-[#2c0149] via-[#210168] to-[#43007D] text-white py-6 px-4 sm:px-6 md:px-16 relative overflow-hidden bg-cover bg-center">
        {/* HEADER */}
        <div className="text-center flex flex-col items-center gap-4 md:gap-6">
          <div className="text-textwhite text-sm md:text-lg w-fit rounded-full flex border border-textwhite py-1.5 md:py-2 px-3 md:px-4 font-medium">
            WHO IS THIS FOR?
          </div>

          <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold mt-2 md:mt-3">
            Built for Every
            <span className="bg-gradient-to-r from-[#1AA0FF] to-[#ff02d5] bg-clip-text text-transparent">
              {" "}
              Training Professional
            </span>
          </h2>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-4">
          {centerTypes?.map((center, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <img
                src={center?.icon}
                alt={center?.title}
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
                loading="lazy"
              />
              <span className="text-sm md:text-lg font-medium text-center">
                {center?.title}
              </span>
            </div>
          ))}
        </div>

        {/* MID CTA */}
        <div className="flex flex-col px-4 sm:px-6 md:px-16 bg-onboard_primary/10 py-4 md:py-6 justify-center text-center items-center border border-onboard_primary rounded-lg mt-4 md:mt-6 gap-2 md:gap-4 mx-auto max-w-xl">
          <span className="text-sm md:text-base">
            You don't just run a center anymore.
          </span>
          <span className="text-lg md:text-2xl font-semibold text-[#00CCFF]">
            You run a connected, scalable business.
          </span>
        </div>

        {/* CTA SECTION */}
        <div className="text-center flex flex-col items-center gap-6 md:gap-10">
          <h2 className="text-xl sm:text-2xl md:text-4xl max-w-5xl font-semibold mt-2 md:mt-3">
            Stop Depending on{" "}
            <span className="bg-gradient-to-r from-[#1AA0FF] to-[#ff02d5] bg-clip-text text-transparent">
              Third-Party Platforms
            </span>
          </h2>

          {/* FEATURES */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <CircleCheck size={18} />
              Build your own system.
            </div>
            <div className="flex items-center gap-2">
              <CircleCheck size={18} />
              Own your clients.
            </div>
            <div className="flex items-center gap-2">
              <CircleCheck size={18} />
              Grow your network.
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => navigate("/landing")}
              size="addbutton"
              className="w-full sm:w-auto bg-onboard_primary hover:bg-onboard_primary/80 text-textwhite font-medium flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
            >
              Starts Now <ArrowRight size={16} />
            </Button>

            <Button
              variant="outline_secondary"
              onClick={() => navigate("/landing")}
              size="addbutton"
              className="w-full sm:w-auto bg-transparent text-textwhite hover:bg-textwhite/10 border-textwhite font-medium flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
            >
              Get your own App
            </Button>
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl max-w-3xl md:max-w-5xl font-semibold mt-2 md:mt-3 px-2">
            “Why rent customers from marketplaces...
            <span className="text-[#00CCFF]"> when you can own them?”</span>
          </h2>
        </div>

        {/* COPYRIGHT */}
        <div className="text-textwhite text-xs md:text-sm text-center">
          © 2026 Tecenteros All rights reserved. Building the future of fitness
          businesses.
        </div>
      </section>
    </div>
  );
};

export default MainLandingPage;
