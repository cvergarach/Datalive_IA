// Componente LoadingSpinner reutilizable - Tema Corporativo
export default function LoadingSpinner({ size = 'md', text = '' }) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 ${sizes[size]}`}></div>
            {text && <p className="text-gray-600 text-sm">{text}</p>}
        </div>
    );
}
