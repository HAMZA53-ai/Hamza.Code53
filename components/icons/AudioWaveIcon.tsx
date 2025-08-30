import React from 'react';

const AudioWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h8.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25V3.75m0 13.5A2.25 2.25 0 0 1 9.75 15V7.5A2.25 2.25 0 0 1 12 5.25v12Zm0 0A2.25 2.25 0 0 0 14.25 15V7.5A2.25 2.25 0 0 0 12 5.25v12Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a7.5 7.5 0 0 1 15 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12a3.75 3.75 0 0 1 7.5 0" />
    </svg>
);

export default AudioWaveIcon;
