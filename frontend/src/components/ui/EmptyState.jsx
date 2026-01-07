// Componente EmptyState reutilizable - Tema Corporativo
import Button from './Button';

export default function EmptyState({
    icon,
    title,
    description,
    action,
    actionLabel
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {icon && (
                <div className="text-5xl mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md text-sm">
                {description}
            </p>
            {action && actionLabel && (
                <Button onClick={action} variant="primary">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
