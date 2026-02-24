import ContentLayout from "@common/masterLayout/ContentLayout"
const employeeOrMember = [
  { id: 1, name: 'Overview' },
  { id: 2, name: 'Products' },
  { id: 2, name: 'Receive Stock' },
  { id: 2, name: 'Stock Activity' },
  { id: 2, name: 'POS' },
  { id: 2, name: 'Reports' }
]
const Inventories = () => {
  return (
    <ContentLayout>       
        <h1 className="text-2xl font-bold mb-4">Inventories</h1>
        {/* Inventories content goes here */}
    </ContentLayout>
  )
}   
export default Inventories