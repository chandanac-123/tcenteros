import logo from "@assets/header-icons/logo_in_auth.svg";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "/landing" },
  { label: "Centers", href: "#" },
  { label: "Blogs", href: "#" },
  { label: "Resellers", href: "#" },
];

///centers-list  /blog /partners-list
const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href) => location.pathname === href;

  const handleNavigate = (href) => {
    console.log("href: ", href);
    navigate(href);
    setOpen(false); // close mobile menu
  };

  return (
    <header className="relative flex items-center justify-between px-4 sm:px-10 py-4">
      {/* Logo */}
      <img
        src={logo}
        alt="Logo"
        loading="lazy"
        className="w-28 sm:w-32 h-auto "
      />

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-6 text-grey font-roboto text-md">
        {navLinks.map(({ label, href }) => (
          <button
            key={label}
            onClick={() => handleNavigate(href)}
            className={`hover:text-onboard_primary ${
              isActive(href) ? "text-onboard_primary font-medium" : ""
            }`}
          >
            {label}
          </button>
        ))}

        <button
          onClick={() => navigate("/login")}
          className="bg-onboard_primary flex items-center gap-2 text-textwhite px-4 py-1 rounded-lg"
        >
          Login <ArrowRight className="w-4 h-4 text-textwhite" />
        </button>
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden z-50"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center gap-4 py-6 md:hidden z-50">
            {navLinks.map(({ label, href }) => (
              <button
                key={label}
                onClick={() => handleNavigate(href)}
                className={`text-grey ${
                  isActive(href) ? "text-onboard_primary font-medium" : ""
                }`}
              >
                {label}
              </button>
            ))}

            <button
              onClick={() => {
                navigate("/login");
                setOpen(false);
              }}
              className="bg-onboard_primary flex items-center gap-2 text-textwhite px-4 py-2 rounded-lg"
            >
              Login <ArrowRight className="w-4 h-4 text-textwhite" />
            </button>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
