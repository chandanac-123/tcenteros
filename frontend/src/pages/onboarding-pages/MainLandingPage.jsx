import partnerbg from "@partner/onboarding/assets/partner-bg.png";
import logo from "@assets/header-icons/logo.svg";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CircleCheck, Star } from "lucide-react";
import { Button } from "@pages/components/ui/button";
import mainlanging from "./assets/main-img.svg";

const MainLandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className=" font-urbanist">
      <section
        className="flex flex-col gap-10 text-white py-4 px-6 md:px-16 relative overflow-hidden bg-cover bg-center"
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

          <div className="w-3/5">   
            <img src={mainlanging} alt="Main Landing" className="w-[963px] h-[821px]" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainLandingPage;
