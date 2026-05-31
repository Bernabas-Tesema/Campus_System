import { useState, useEffect } from 'react';
import { foodAPI } from '../../services/api';
import { loungeAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { formatBirr } from '../../utils/currency';

export default function Menu() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lounges, setLounges] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lounge, setLounge] = useState('');
  const [mealTime, setMealTime] = useState('breakfast');
  const [selectedFood, setSelectedFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    Promise.all([
      foodAPI.list({
        search,
        category: category || undefined,
        lounge: lounge || undefined,
        meal_time: mealTime || undefined,
      }),
      foodAPI.categories(),
      loungeAPI.list(),
    ]).then(([foodsRes, catsRes, loungesRes]) => {
      setFoods(foodsRes.data.results || foodsRes.data);
      setCategories(catsRes.data.results || catsRes.data);
      setLounges(loungesRes.data.results || loungesRes.data);
    }).finally(() => setLoading(false));
  }, [search, category, lounge, mealTime]);

  if (loading) return <div className="text-center py-12">Loading menu...</div>;

  if (selectedFood) {
    return (
      <div className="max-w-3xl">
        <button type="button" className="btn-outline mb-6" onClick={() => setSelectedFood(null)}>
          Back to menu
        </button>
        <div className="card">
          {selectedFood.image_url && (
            <img
              src={selectedFood.image_url}
              alt={selectedFood.name}
              className="w-full h-56 object-cover rounded-lg mb-5"
              loading="lazy"
            />
          )}
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold">{selectedFood.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {selectedFood.category_name} · {selectedFood.lounge_name}
              </p>
            </div>
            <div className="text-primary font-bold text-2xl whitespace-nowrap">
              {formatBirr(selectedFood.price)}
            </div>
          </div>

          {selectedFood.description && (
            <p className="text-gray-600 mt-4">{selectedFood.description}</p>
          )}

          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-gray-500">
              {selectedFood.prep_time_minutes} min prep
            </span>
            <button type="button" onClick={() => addItem(selectedFood)} className="btn-primary">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Food Menu</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { key: 'breakfast', label: 'Breakfast' },
          { key: 'lunch', label: 'Lunch' },
          { key: 'dinner', label: 'Dinner' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            className={mealTime === t.key ? 'btn-primary' : 'btn-outline'}
            onClick={() => setMealTime(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <input
          className="input max-w-xs"
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-xs" value={lounge} onChange={(e) => setLounge(e.target.value)}>
          <option value="">All Lounges</option>
          {lounges.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <select className="input max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods.map((food) => (
          <div
            key={food.id}
            className="card hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedFood(food)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setSelectedFood(food);
            }}
          >
            {food.image_url && (
              <img
                src={food.image_url}
                alt={food.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
                loading="lazy"
              />
            )}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">{food.name}</h3>
                <p className="text-sm text-gray-500">{food.category_name} · {food.lounge_name}</p>
              </div>
              <span className="text-primary font-bold text-lg">{formatBirr(food.price)}</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{food.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">{food.prep_time_minutes} min prep</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addItem(food);
                }}
                className="btn-primary text-sm"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
      {foods.length === 0 && <p className="text-center text-gray-500 py-12">No foods found.</p>}
    </div>
  );
}
