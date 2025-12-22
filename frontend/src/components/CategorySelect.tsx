import { forwardRef } from 'react';
import CategoryIcon from './icons/CategoryIcon';

interface Category {
  id: number;
  name: string;
  type: string;
  color: string;
  icon: string;
}

interface CategorySelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  categories: Category[];
  value: number | string;
  selectedType?: 'ingreso' | 'gasto' | 'all';
  error?: string;
}

const CategorySelect = forwardRef<HTMLSelectElement, CategorySelectProps>(
  ({ categories, value, onChange, selectedType = 'all', error, className = '', name, id, ...rest }, ref) => {
    // Filtrar categorías por tipo si se especifica
    const filteredCategories = selectedType === 'all'
      ? categories
      : categories.filter(cat => cat.type === selectedType);

    // Encontrar la categoría seleccionada para mostrar su icono
    const selectedCategory = value ? categories.find(cat => cat.id === Number(value)) : null;

    return (
      <div>
        <div className="relative">
          {/* Select nativo (funcionalidad) */}
          <select
            ref={ref}
            id={id}
            name={name}
            value={value || ''}
            onChange={onChange}
            className={`w-full px-4 py-3 pl-12 pr-10 rounded-lg glass border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-white ${className}`}
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            }}
            {...rest}
          >
            <option value="">Selecciona una categoría</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Icono de la categoría seleccionada */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {selectedCategory ? (
              <CategoryIcon emoji={selectedCategory.icon} className="w-5 h-5 text-white" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/20 border border-white/10" />
            )}
          </div>

          {/* Flecha del select */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <p className="text-red-400 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

CategorySelect.displayName = 'CategorySelect';

export default CategorySelect;
