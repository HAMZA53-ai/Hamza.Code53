import React from 'react';

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.5c0-.621.504-1.125 1.125-1.125H7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 1.5v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V1.5A1.125 1.125 0 0 1 5.25 0h9.75A1.125 1.125 0 0 1 15 1.5Z" />
    </svg>
);

export default CopyIcon;