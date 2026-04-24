import React from 'react'
import appleStock from '@assets/inventory-icons/hugeicons_apple-stocks.svg'
import management from '@assets/inventory-icons/lsicon_management-stockout-outline.svg'
import rootStock from '@assets/inventory-icons/token_rootstock.svg'
import saleTag from '@assets/inventory-icons/hugeicons_sale-tag-02.svg'
import root_stocks from '@assets/inventory-icons/token_rootstocks.svg'
import { formatIndianCurrency } from '@utils/helper'

const StatusDisplaycard = ({ data }) => {
   const cards = [
    {
      title: "Total Products",
      value: data?.total_products || 0,
      icon: management,
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
    },
    {
      title: "Total Stock Quantity",
      value: `${data?.total_stock_quantity || 0} Units`,
      icon: appleStock,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Stock Value",
      value: ` ₹ ${formatIndianCurrency(data?.total_stock_value) || 0}`,
      icon: saleTag,
      iconBg: "bg-lime-100",
      iconColor: "text-lime-600",
    },
    {
      title: "Low Stock Items",
      value: data?.low_stock_items || 0,
      icon: rootStock,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Today Sales",
      value: `₹ ${formatIndianCurrency(data?.today_sales?.amount) || 0}`,
      icon: root_stocks,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
    }
  ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className={` rounded-2xl px-4 py-6 flex items-center gap-4 shadow-md 
                     hover:shadow-lg transition-all duration-200 
                     bg-white`}
                    >
                        <div
                            className={`${card.iconBg} ${card.iconColor} p-3 rounded-xl`}
                        >
                            <img
                            loading="lazy"
                                src={card.icon}
                                alt={card.title}
                                className="w-8 h-8"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">{card.title}</p>
                            <h2 className="text-xl font-semibold text-gray-800 whitespace-nowrap">
                                {card.value}
                            </h2>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default StatusDisplaycard
