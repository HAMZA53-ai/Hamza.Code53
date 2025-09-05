import React from 'react';

const ApiBanner: React.FC = () => {
  return (
    <div className="bg-red-900/80 text-red-200 text-center text-sm p-2 border-b border-red-500/50 backdrop-blur-sm flex-shrink-0">
      <strong>وضع التكوين:</strong> مفتاح API غير متوفر. قد لا تعمل ميزات الذكاء الاصطناعي بشكل صحيح.
    </div>
  );
};

export default ApiBanner;
