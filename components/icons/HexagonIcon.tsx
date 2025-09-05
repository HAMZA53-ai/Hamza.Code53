import React from 'react';

const HexagonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    {...props}
  >
    <path d="M12 2.598l8.66 5v10l-8.66 5-8.66-5v-10l8.66-5zM9.5 9.5l2.5 2.5 2.5-2.5M12 12v5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default HexagonIcon;
