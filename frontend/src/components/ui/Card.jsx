// Componente Card reutilizable - Tema Corporativo
export default function Card({
    children,
    className = '',
    hover = false,
    onClick = null
}) {
    const baseStyles = 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm';
    const hoverStyles = hover ? 'hover:shadow-md hover:border-gray-300 transition-all cursor-pointer' : '';
    const clickableStyles = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
