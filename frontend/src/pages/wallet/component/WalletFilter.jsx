import React from "react"
import CustomeModal from "@common/components/CustomeModal"
import { Button } from "@pages/components/ui/button"

const WalletFilter = ({
    openFilter,
    setOpenFilter,
    filter,
    setFilter,
    onApply,
}) => {
    return (
        <CustomeModal open={openFilter} onOpenChange={setOpenFilter}>
            <div className="p-6 rounded-2xl">

                {/* TYPE */}
                <h3 className="text-md font-medium mb-3">Type</h3>
                <div className="flex gap-3 mb-6">
                    {["Credit", "Debit"].map((type) => {
                        const value = type.toLowerCase()

                        return (
                            <button
                                key={value}
                                onClick={() =>
                                    setFilter(prev => ({
                                        ...prev,
                                        type: prev.type === value ? "" : value
                                    }))
                                }
                                className={`px-5 py-2 rounded-xl font-medium transition
          ${filter.type === value
                                        ? "bg-blue-100 text-blue-600 ring-2 ring-blue-400"
                                        : "bg-gray-100 text-gray-800"}`}
                            >
                                {type}
                            </button>
                        )
                    })}
                </div>

                {/* CATEGORY */}
                <h3 className="text-md font-medium mb-3">Category</h3>
                <div className="flex gap-3 flex-wrap mb-6">
                    {["Network In", "Network Out"].map((cat) => {
                        const value = cat.toLowerCase().replace(/\s+/g, "-")
                        return (
                            <button
                                key={value}
                                onClick={() =>
                                    setFilter(prev => ({
                                        ...prev,
                                        transaction_type: prev.transaction_type === value ? "" : value
                                    }))
                                }
                                className={`px-5 py-2 rounded-xl font-medium transition
          ${filter.transaction_type === value
                                        ? "bg-blue-100 text-blue-600 ring-2 ring-blue-400"
                                        : "bg-gray-100 text-gray-800"}`}
                            >
                                {cat}
                            </button>
                        )
                    })}
                </div>

                {/* STATUS */}
                <h3 className="text-md font-medium mb-3">Status</h3>
                <div className="flex gap-3 flex-wrap mb-8">
                    {["Pending", "Completed", "Reserved"].map((status) => {
                        const value = status.toLowerCase()

                        return (
                            <button
                                key={value}
                                onClick={() =>
                                    setFilter(prev => ({
                                        ...prev,
                                        status: prev.status === value ? "" : value
                                    }))
                                }
                                className={`px-5 py-2 rounded-xl font-medium transition
          ${filter.status === value
                                        ? "bg-blue-100 text-blue-600 ring-2 ring-blue-400"
                                        : "bg-gray-100 text-gray-800"}`}
                            >
                                {status}
                            </button>
                        )
                    })}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-3">

                    <Button
                        onClick={() =>
                            setFilter({ type: "", transaction_type: "", status: "" })
                        }
                        variant="outline_secondary"
                        className="px-5"
                    >
                        Clear
                    </Button>

                    <Button
                        onClick={() => {
                            onApply()
                            setOpenFilter(false)
                        }}
                        variant="outline_primary"
                        className="px-5"
                    >
                        Apply
                    </Button>

                </div>
            </div>
        </CustomeModal>
    )
}

export default WalletFilter