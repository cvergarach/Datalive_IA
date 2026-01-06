// Componente EmptyState reutilizable
import Button from './Button';

export default function EmptyState({
    icon,
    title,
    description,
    action,
    actionLabel
}) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {icon && (
                <div className="text-6xl mb-4 opacity-50">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-semibold text-white mb-2">
                {title}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
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
