const defaultTheme = require('tailwindcss/defaultTheme')
function getColorWithOpacity(color) {
    return ({ opacityValue }) => {
        if (opacityValue === undefined) {
            return `rgb(var(${color}))`;
        }
        return `rgba(var(${color}), ${opacityValue})`;
    }
}
module.exports = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    // darkMode: false,
    theme: {
        extend: {
            colors: {
                head: getColorWithOpacity('--color-head'),
                button: getColorWithOpacity('--color-button'),
                content: getColorWithOpacity('--color-content'),
                theme: getColorWithOpacity('--color-theme'),
                primary: getColorWithOpacity('--color-primary'),
                'theme-500': getColorWithOpacity('--color-theme')({ opacityValue: 0.5 }),
            },
            width: {
                'over-scroll': 'calc(100% + 17px)',
                'less-scroll': 'calc(100% - 17px)',
                'over-more': 'calc(100% + 25px)'
            },
            minHeight: {
                'screan-64': 'calc(100vh - 64px)'
            },
            height: {
                'screan-64': 'calc(100vh - 64px)'
            },
            zIndex: { max: 9999 }
        },
        fontFamily: {
            'pf-bold': 'PingFang SC-Bold, PingFang SC',
            'pf-med': 'PingFang SC-Medium, PingFang SC'
        },
        screens: {
            '2xl': '1550px',
            '3xl': '1710px',
            ...defaultTheme.screens,
        }
    },
    variants: {
        extend: {},
    },
    // corePlugins: {
    //     // 去除默认基础样式，h1-h6等标签
    //     preflight: false,
    // },
    plugins: [],
}