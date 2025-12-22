import {
  Utensils,
  Laptop,
  TrendingUp,
  Banknote,
  Car,
  Home,
  Lightbulb,
  Heart,
  BookOpen,
  Gamepad2,
  Shirt,
  PiggyBank,
  Wallet,
  DollarSign,
  Briefcase,
} from 'lucide-react';

// Mapeo de emojis a componentes de lucide-react
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Iconos de Ingresos
  '💼': Briefcase,      // Salario
  '💻': Laptop,         // Freelance
  '📈': TrendingUp,     // Inversiones
  '💵': Banknote,       // Otros Ingresos

  // Iconos de Gastos
  '🍔': Utensils,       // Alimentación
  '🚗': Car,            // Transporte
  '🏠': Home,           // Vivienda
  '💡': Lightbulb,      // Servicios
  '🏥': Heart,          // Salud
  '📚': BookOpen,       // Educación
  '🎮': Gamepad2,       // Entretenimiento
  '👕': Shirt,          // Ropa
  '🏦': PiggyBank,      // Ahorro
  '💸': Wallet,         // Otros Gastos

  // Icono por defecto
  '💰': DollarSign,     // Default
};

interface CategoryIconProps {
  emoji: string;
  className?: string;
}

export default function CategoryIcon({ emoji, className = "w-6 h-6" }: CategoryIconProps) {
  // Obtener el componente correspondiente al emoji, o usar DollarSign como fallback
  const IconComponent = iconMap[emoji] || DollarSign;

  return <IconComponent className={className} />;
}
