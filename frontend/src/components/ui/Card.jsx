// Componente Card reutilizable
export default function Card({
    children,
    className = '',
    hover = false,
    onClick = null
}) {
    const baseStyles = 'glass rounded-2xl p-6';
    const hoverStyles = hover ? 'hover-lift cursor-pointer' : '';
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
