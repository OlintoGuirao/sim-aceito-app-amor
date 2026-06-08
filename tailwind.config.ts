import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
			},
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'rgb(196 92 58 / var(--tw-border-opacity, 1))',
				input: 'rgb(196 92 58 / var(--tw-border-opacity, 1))',
				ring: 'rgb(91 123 95 / var(--tw-ring-opacity, 1))',
				background: 'rgb(196 92 58 / var(--tw-bg-opacity, 1))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'rgb(196 92 58 / var(--tw-bg-opacity, 1))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'rgb(196 92 58 / var(--tw-bg-opacity, 1))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'rgb(196 92 58 / var(--tw-bg-opacity, 1))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'rgb(196 92 58 / var(--tw-border-opacity, 1))',
					ring: 'rgb(91 123 95 / var(--tw-ring-opacity, 1))'
				},
				wedding: {
					primary: '#C45C3A',
					secondary: '#E8F0E6',
					accent: '#5B7B5F',
					marsala: '#C45C3A',
					terracotta: '#C45C3A',
					palha: '#F5F7F2',
					cream: '#FAF8F5',
					darkMarsala: '#9A3F2A',
					lightPalha: '#EEF2EB',
					gold: '#6B8E6B',
					olive: '#556B2F',
					pearl: '#F5F7F2'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'sparkle': {
					'0%, 100%': {
						opacity: '0.4',
						transform: 'scale(0.8)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.2)'
					}
				},
				'shimmer': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'sparkle': 'sparkle 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite linear'
			},
			fontFamily: {
				'script': ['Dancing Script', 'cursive'],
				'elegant': ['Playfair Display', 'serif'],
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
