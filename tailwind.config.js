/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'media', // 시스템 설정에 따라 다크모드 적용
  theme: {
    extend: {
      colors: {
        // .design 폴더의 파란색 계열 색상 시스템
        primary: {
          start: '#87ceeb',
          end: '#4682b4',
          hover: {
            start: '#7bb8d9',
            end: '#3d6b9a'
          }
        },
        secondary: {
          start: '#f0f8ff',
          end: '#b0e0e6'
        },
        // 다크모드 색상 - .design 폴더의 기존 색감 활용
        dark: {
          bg: '#1c1c1e',
          card: '#23232a',
          text: '#f4f4f5',
          point: '#0a84ff',
          border: '#6b7280',
          // 추가 다크모드 색상
          'bg-secondary': '#2c2c34',
          'text-secondary': '#a5b4fc',
          'text-muted': '#e5e7eb',
          'border-light': '#6b7280',
          'shadow': 'rgba(0,0,0,0.5)',
          'overlay': 'rgba(0,0,0,0.3)'
        }
      },
      // 그라데이션 설정
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'secondary-gradient': 'linear-gradient(135deg, var(--tw-gradient-stops))'
      },
      // 그림자 설정
      boxShadow: {
        'light': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'dark': '0 8px 24px rgba(0, 0, 0, 0.5)'
      },
      // 반응형 브레이크포인트
      screens: {
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '768px'
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
};
