import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { foodAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatBirr } from '../../utils/currency';

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    if (!id) return;
    foodAPI.get(id).then((res) => setFood(res.data)).catch(() => setFood(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!food) return <div className="text-center py-12">Food not found.</div>;

  return (
    <div className="max-w-3xl">
      <button type="button" className="btn-outline mb-6" onClick={() => navigate(-1)}>
        Back
      </button>
      <div className="card">
        {food.image_url && (
          <img src={food.image_url} alt={food.name} className="w-full h-56 object-cover rounded-lg mb-5" loading="lazy" />
        )}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">{food.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{food.category_name} · {food.lounge_name}</p>
          </div>
          <div className="text-primary font-bold text-2xl whitespace-nowrap">{formatBirr(food.price)}</div>
        </div>

        {food.description && <p className="text-gray-600 mt-4">{food.description}</p>}

        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-gray-500">{food.prep_time_minutes} min prep</span>
          <button type="button" onClick={() => addItem(food)} className="btn-primary">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}
