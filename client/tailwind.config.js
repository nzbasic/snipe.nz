module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        light: "#263238",
        dark: "#192227",
        keyword: "#F12C7D",
        function: "#26ABF4",
        declaration: "#6BE02F",
        variable: "#FD971F",
        text: "#E6DB74",
        bracket: "#C7CA00",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
