import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/FLAMES_dark.jpg')",
      },
      fontFamily: {
        body: ['IBM Plex Sans']
      },
      screens: {
         'xs': '465px',
      }
    },
  },
  plugins: [],
}
export default config
