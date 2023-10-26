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
        'hero-pattern': "url('/ALL_dark.jpg')",
      },
      fontFamily: {
        body: ['IBM Plex Sans']
      },
      screens: {
         'xs': '465px',
      },
      boxShadow: {
        'inner-sym': 'inset 0px 0px 5px 0px #f59e0b',
      },
      dropShadow: {
        'text': '2px 2px 2px #f59e0b',
      },
    },
  },
  plugins: [],
}
export default config
