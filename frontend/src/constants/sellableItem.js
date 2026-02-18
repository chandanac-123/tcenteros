import merchandise from '@assets/images/marchandise.svg'
import sellalltype from '@assets/images/sellalltype.svg'
import suppliments from '@assets/images/suppliments.svg'
import nothing_to_sell from '@assets/images/no-tracking.svg'

export const sellableItems = [
  {
    id: 'merchandise',
    label: 'Merchandise',
    sublabel: 'Gym Gears , T-shirts, mats, bottles, etc.',
    image: merchandise
  },
  {
    id: 'supplements',
    label: 'Supplements',
    sublabel: 'Protien, pre workout & multi-vitamines',
    image: suppliments
  },
  {
    id: 'sell-all',
    label: 'Sell all type products',
    sublabel: 'Sell all type products which related to the center.',
    image: sellalltype
  },
  {
    id: 'nothing-to-sell',
    label: 'No, nothing to sell',
    sublabel: 'No sellable inventories',
    image: nothing_to_sell
  }
]
