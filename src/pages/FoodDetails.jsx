import { useParams } from 'react-router-dom'

function FoodDetails() {
  const { id } = useParams()
  return (
    <div style={{ padding: 16 }}>
      <h2>Food Details</h2>
      <p>Food ID: {id}</p>
      <p>এখানে নির্দিষ্ট food-এর ডিটেইলস আর Request system আসবে।</p>
    </div>
  )
}

export default FoodDetails
