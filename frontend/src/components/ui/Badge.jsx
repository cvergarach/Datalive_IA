// Componente Badge reutilizable
export default function Badge({
    children,
    variant = 'default',
    size = 'md'
}) {
    const variants = {
        default: 'bg-gray-500/20 text-gray-300',
        primary: 'bg-purple-500/20 text-purple-300',
        success: 'bg-green-500/20 text-green-300',
        warning: 'bg-yellow-500/20 text-yellow-300',
        danger: 'bg-red-500/20 text-red-300',
        info: 'bg-blue-500/20 text-blue-300'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base'
    };

    return (
        <span className={`
            inline-flex items-center font-medium rounded-full
            ${variants[variant]}
            ${sizes[size]}
        `}>
            {children}
        </span>
    );
}
