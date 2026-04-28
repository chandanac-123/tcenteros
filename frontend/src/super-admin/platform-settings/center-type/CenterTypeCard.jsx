import React from "react";
import { Button } from "@pages/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

const CenterTypeCard = ({ image, title, onDelete }) => {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border bg-white shadow-sm w-full max-w-md">
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="w-28 h-20 object-cover rounded-xl"
      />

      {/* Content */}
      <div className="flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-sm">{title}</h3>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            size="mini"
            className="bg-red hover:bg-red rounded-md text-white"
            onClick={onDelete}
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CenterTypeCard;
