import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-3 bg-transparent">
      <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-[var(--neon-cyan)]"></div>
    </div>
  );
};

export default Spinner;