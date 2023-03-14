/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["app/routes/**/*.tsx", "app/components/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        mygreen: "#B2EB54",
        myorange: "#FBD242",
      },
    },
  },
  plugins: [],
};
