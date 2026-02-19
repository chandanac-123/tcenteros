const ProfileCard = ({ color, bgcolor, label, count }) => {
  return (
    <div
      className={`flex flex-col p-2 ${bgcolor} border-4 ${color} rounded-lg justify-center`}
    >
      <span className=" text-grey font-medium">{label}</span>
      <span className="text-textblack font-semibold text-xl">{count}</span>
    </div>
  )
}
export default ProfileCard
