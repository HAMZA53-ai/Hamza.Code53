import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-3 bg-slate-200 dark:bg-slate-700 rounded-full">
      <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-teal-500 dark:border-teal-400"></div>
    </div>
  );
};

export default Spinner;