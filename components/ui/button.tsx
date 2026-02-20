import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'mythos' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    className = '',
    variant = 'primary',
    size = 'md',
    children,
    ...props
}, ref) => {

    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-[var(--color-mythos-green)] text-[var(--color-mythos-gold)] hover:bg-[var(--color-mythos-accent)] border border-[var(--color-mythos-gold-dim)]",
        secondary: "bg-[var(--color-mythos-black)] text-[var(--color-mythos-parchment)] hover:bg-[var(--color-mythos-dark-green)] border border-[var(--color-mythos-accent)]",
        ghost: "bg-transparent hover:bg-[var(--color-mythos-green)] hover:text-[var(--color-mythos-gold)] text-[var(--color-mythos-gold-dim)]",
        mythos: "bg-[var(--color-mythos-green)] text-[var(--color-mythos-gold)] hover:bg-[var(--color-mythos-accent)] border-2 border-[var(--color-mythos-gold)] font-[family-name:var(--font-heading)] uppercase tracking-widest shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_var(--color-mythos-gold-dim)]",
        outline: "border border-[var(--color-mythos-gold-dim)] bg-transparent text-[var(--color-mythos-parchment)] hover:bg-[var(--color-mythos-green)]"
    };

    const sizes = {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-lg",
        icon: "h-9 w-9"
    };

    return (
        <button
            ref={ref}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button };
