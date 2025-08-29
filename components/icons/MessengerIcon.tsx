import React from 'react';

const MessengerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 0 1-1.59 0l-3.72-3.72c-1.133-.093-1.98-1.057-1.98-2.193v-4.286c0-.97.616-1.813 1.5-2.097m6.75-3.686-3.75-3.75a1.125 1.125 0 0 0-1.59 0L9 4.825M15 11.25l-3.75 3.75a1.125 1.125 0 0 1-1.59 0L6 11.25" />
    </svg>
);

export default MessengerIcon;
