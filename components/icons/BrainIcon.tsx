
import React from 'react';

const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.75A2.25 2.25 0 0 0 12 15v.75a2.25 2.25 0 0 0 2.25-2.25M9.5 12.75v-1.5a2.25 2.25 0 0 1 2.25-2.25V9A2.25 2.25 0 0 1 12 6.75v-1.5a2.25 2.25 0 0 1 2.25-2.25V3A2.25 2.25 0 0 1 12 .75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 12.75c0 .414.336.75.75.75h3.5c.414 0 .75-.336.75-.75V6.75a2.25 2.25 0 0 0-2.25-2.25H16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 12.75A2.25 2.25 0 0 1 12 15v.75a2.25 2.25 0 0 1-2.25-2.25M14.25 12.75v-1.5a2.25 2.25 0 0 0-2.25-2.25V9A2.25 2.25 0 0 0 12 6.75v-1.5a2.25 2.25 0 0 0-2.25-2.25V3A2.25 2.25 0 0 0 12 .75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75c0 .414-.336.75-.75.75h-3.5C5.086 13.5 4.75 13.164 4.75 12.75V6.75a2.25 2.25 0 0 1 2.25-2.25H7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
    </svg>
);

export default BrainIcon;