import partnerbg from "@partner/onboarding/assets/partner-bg.png";
import logo from "@assets/header-icons/logo.svg";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CircleCheck,
  Star,
  Smartphone,
  BarChart3,
  Users,
  ShieldCheck,
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
} from "lucide-react";
import { Button } from "@pages/components/ui/button";
import mainlanging from "./assets/main-img.svg";
import unique_advantage from "./assets/unique-advantage.svg";

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
      icon: Users,
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
      icon: Signal ,
      title: "Lead Management Dashboard",
      description:
        "Track, manage, and convert every inquiry in one powerful view.",
      color: "#D49114",
    },
    {
      icon: Calendar ,
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

  return (
    <div className=" font-urbanist">
      <section
        className="flex flex-col gap-12 text-white py-4 px-6 md:px-16 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${partnerbg})`,
        }}
      >
        <div>
          <div className="flex items-center justify-between w-full">
            <img
              src={logo}
              alt="Logo"
              className="w-28 md:w-32 object-contain"
            />

            <div className="flex gap-3">
              <Button
                variant="outline_secondary"
                onClick={() => navigate("/")}
                size="addbutton"
                className="bg-transparent text-textwhite hover:bg-textwhite/10 border-textwhite font-medium flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                Book Demo
              </Button>
              <Button
                onClick={() => navigate("/")}
                size="addbutton"
                className="bg-onboard_primary hover:bg-onboard_primary/80 text-textwhite font-medium flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                Join Now <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-textwhite/10 rounded-3xl px-4 py-2 w-fit">
          <Star />
          <span className="text-[#FFDD88]">
            THE GROWTH ENGINE FOR TRAINING BUSINESSES
          </span>
        </div>

        <div className="flex justify-between">
          <div className="w-2/5 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mt-3">
                Your Own App.
              </h2>
              <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-[#1AA0FF] to-[#ff02d5] bg-clip-text text-transparent">
                Your Own Leads.
              </h2>
              <h2 className="text-2xl md:text-4xl font-bold ">
                Your Own Network.
              </h2>
            </div>

            <div className="flex text-lg text-[#FFD36C]">
              Launch your branded platform to manage, grow, and connect your
              training business — all in one place.
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <CircleCheck />
                Generate leads directly into your system
              </div>
              <div className="flex gap-2">
                <CircleCheck />
                Build your own branded app (even on your domain)
              </div>
              <div className="flex gap-2">
                <CircleCheck />
                Stay connected with a powerful network of training centers
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline_secondary"
                onClick={() => navigate("/")}
                size="addbutton"
                className="bg-transparent text-textwhite hover:bg-textwhite/10 border-textwhite font-medium flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                Book a Demo
              </Button>
              <Button
                onClick={() => navigate("/")}
                size="addbutton"
                className="bg-onboard_primary hover:bg-onboard_primary/80 text-textwhite font-medium flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                Get Started <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <div className="w-3/5 flex justify-end absolute right-12 top-8 h-full pointer-events-none">
            <img
              src={mainlanging}
              alt="Main Landing"
              className="w-full max-w-[700px] h-auto  object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 w-full justify-center mt-4">
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
      </section>

      <section className="bg-gray-100 py-16 px-6 md:px-16">
        <div className="text-center flex flex-col items-center gap-6">
          <div className="text-onboard_primary text-lg w-fit rounded-full justify-center flex border border-onboard_primary py-2 px-4 font-semibold">
            THIS IS YOUR DIFFERENTIATOR
          </div>
          {
            <h2 className="text-2xl md:text-4xl font-semibold mt-3">
              Not Just Software.
              <span className="text-onboard_primary">
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

      <section
        className="flex flex-col gap-12 text-white py-4 px-6 md:px-16 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${partnerbg})`,
        }}
      >
        <div className="text-center flex flex-col items-center gap-6">
          <div className="text-textwhite text-lg w-fit rounded-full justify-center items-center flex border border-textwhite py-2 px-4 font-semibold">
            UNIQUE ADVANTAGE
          </div>
          <h2 className="text-2xl md:text-4xl font-semibold mt-3">
            A Connected Fitness &
            <span className="bg-gradient-to-r from-[#ab7bef] to-[#FF00D4] bg-clip-text text-transparent">
               Training Ecosystem
            </span>
          </h2>
        </div>

        <div className="flex justify-between">
          <div className="w-2/5 flex flex-col gap-6">
            <div className="flex text-lg text-[#FFD36C]">
              " When A client is traveling to another city..."
            </div>

            <div className="flex flex-col gap-6 pl-20">
              <div className="flex gap-2">
                <span className="bg-onboard_primary p-1.5 justify-center items-center flex rounded-lg">
                  <Smartphone size={20} />
                </span>
                They open your app
              </div>
              <div className="flex gap-2">
                <span className="bg-onboard_primary p-1.5 justify-center items-center flex rounded-lg">
                  <MapPin size={20} />
                </span>
                Find a partner center nearby
              </div>
              <div className="flex gap-2">
                <span className="bg-onboard_primary p-1.5 justify-center items-center flex rounded-lg">
                  <BicepsFlexed size={20} />
                </span>
                Continue their workout seamlessly
              </div>
              <div className="flex gap-2">
                <span className="bg-onboard_primary p-1.5 justify-center items-center flex rounded-lg">
                  <CirclePile size={20} />
                </span>
                You keep the client & expand reach
              </div>
            </div>

            <div className="flex flex-col gap-6 w-full mt-6">
              <div className="inline-flex w-fit px-5 py-3 bg-white/90 rounded-lg shadow-sm">
                <span className="text-lg font-semibold bg-gradient-to-r from-[#078ae7] to-[#ff02ee] bg-clip-text text-transparent">
                  You don’t lose the client.
                </span>
              </div>

              <div className="inline-flex w-fit px-5 py-3 bg-white/90 rounded-lg shadow-sm self-center">
                <span className="text-lg font-semibold bg-gradient-to-r from-[#078ae7] to-[#ff02ee] bg-clip-text text-transparent">
                  You expand your reach.
                </span>
              </div>
            </div>
          </div>

          <div className="w-3/5 flex justify-end  items-end pointer-events-none">
            <img
              src={unique_advantage}
              alt="Main Landing"
              className="w-full max-w-[700px] h-auto  object-contain"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-16 px-6 md:px-16">
        <div className="text-center flex flex-col items-center gap-6">
          <div className="text-onboard_primary text-lg w-fit rounded-full justify-center flex border border-onboard_primary py-2 px-4 font-semibold">
            FEATURES THAT DRIVE BUSINESS
          </div>
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
                <h3 className="text-lg font-semibold text-gray-900 text-start">{item?.title}</h3>

                {/* Description */}
                <p className="mt-2 text-sm text-gray-600 leading-relaxed text-start">
                  {item?.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainLandingPage;
