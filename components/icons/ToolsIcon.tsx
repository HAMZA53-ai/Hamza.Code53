import React from 'react';

const ToolsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.5a.75.75 0 0 1 .75.75V5.25a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 5.636a.75.75 0 0 1 1.06 0l2.122 2.121a.75.75 0 0 1-1.061 1.06l-2.121-2.12a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-2.121 2.122a.75.75 0 0 1-1.06-1.061l2.12-2.121a.75.75 0 0 1 1.061 0ZM2.25 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Zm18 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H21a.75.75 0 0 1-.75-.75Z" />
    </svg>
);

export default ToolsIcon;
