import React, { useState } from "react";

const designations = [
  { id: 1, name: "Trainer" },
  { id: 2, name: "Sales & Marketing" },
  { id: 3, name: "Performance Analyst" },
];

const permissionsData = {
  1: ["Dashboard", "Subscription", "Centers", "Analytics"],
  2: ["Dashboard", "Partners", "Revenue & Billing"],
  3: ["Analytics", "Support", "Platform Settings"],
};

const PermissionTabs = () => {
  const [selectedDesignation, setSelectedDesignation] = useState(
    designations[0].id
  );

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-white rounded-xl shadow-md overflow-hidden">
      
      {/* LEFT - DESIGNATION LIST */}
      <div className="md:w-1/4 w-full border-r border-gray-200">
        {designations.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedDesignation(item.id)}
            className={`cursor-pointer px-4 py-3 text-sm font-medium transition 
              ${
                selectedDesignation === item.id
                  ? "bg-blue-50 text-blue-700 border-r-4 border-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            {item.name}
          </div>
        ))}
      </div>

      {/* RIGHT - PERMISSION LIST */}
      <div className="md:w-3/4 w-full p-4">
        <h2 className="text-lg font-semibold mb-4">Permissions</h2>

        <div className="flex flex-col gap-3">
          {permissionsData[selectedDesignation]?.map((perm, index) => (
            <div
              key={index}
              className="flex justify-between items-center px-4 py-3 border rounded-lg"
            >
              <span className="font-medium text-gray-700">{perm}</span>

              {/* Toggle (dummy UI) */}
              <div className="w-10 h-5 bg-gray-300 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PermissionTabs;