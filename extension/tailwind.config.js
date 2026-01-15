/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.tsx", "./contents/**/*.tsx", "./components/**/*.tsx"],
    theme: {
        extend: {
            colors: {
                cream: "#f5eedc",
                terracotta: "#b05a36",
                surface: "#ffffff",
            },
        },
    },
    plugins: [],
}
