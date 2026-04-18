import { Switch } from "@pages/components/ui/switch";

const SettingToggleCard = ({
  title,
  description,
  checked,
  onChange,
}) => {
  return (
    <div className="flex border rounded-md p-4 flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="font-medium">{title}</span>
          <span className="text-xs text-grey">{description}</span>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
    </div>
  );
};

export default SettingToggleCard;