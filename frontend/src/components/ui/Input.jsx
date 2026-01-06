// Componente Input reutilizable
export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    disabled = false,
    required = false,
    className = '',
    icon = null
}) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`
                        w-full px-4 py-2.5 rounded-lg
                        bg-white/5 border border-white/10
                        text-white placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200
                        ${icon ? 'pl-10' : ''}
                        ${error ? 'border-red-500 focus:ring-red-500' : ''}
                    `}
                />
            </div>
            {error && (
                <span className="text-sm text-red-500">{error}</span>
            )}
        </div>
    );
}
