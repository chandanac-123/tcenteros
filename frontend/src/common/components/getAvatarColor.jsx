const avatarColors = [
  "bg-profile_bg_blue",
  "bg-profile_bg_green",
  "bg-profile_bg_brown",
  "bg-profile_bg_pink",
  "bg-primary_light",
  "bg-plan_green",
  "bg-plan_blue",
  "bg-plan_purple",
];

const textColors = [
  "text-blue",
  "text-partner_green",
  "text-grey",
  "text-danger",
  "text-textwhite",
  "text-textwhite",
  "text-textwhite",
  "text-textwhite",
];

export const getAvatarStyles = (name = "") => {
  const index =
    name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    avatarColors.length;

  return {
    bg: avatarColors[index],
    text: textColors[index],
  };
};

const CustomAvatar = ({
  src,
  name = "",
  size = "w-16 h-16",
  className = "",
}) => {
  
  const firstLetter = name
    ?.split(" ")
    ?.slice(0, 2)
    ?.map((word) => word[0])
    ?.join("")
    ?.toUpperCase() || "?";

  const { bg, text } = getAvatarStyles(name);

  return src ? (
    <img
      src={src}
      alt={name}
      className={`${size} rounded-full object-cover border shadow-[0px_5px_15px_rgba(0,0,0,0.10)] ${className}`}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ) : (
    <div
      className={`
        ${size}
        rounded-full
        flex
        items-center
        justify-center
        font-semibold
        border
        shadow-[0px_5px_15px_rgba(0,0,0,0.10)]
        ${bg}
        ${text}
        ${className}
      `}
    >
      {firstLetter}
    </div>
  );
};

export default CustomAvatar;