import React, { useState, useEffect } from 'react';
import * as creationsService from '../services/creationsService';
import { Creation, CreationType } from '../types';
import { formatTimestamp } from '../utils/dateFormatter';
import ImageIcon from './icons/ImageIcon';
import VideoIcon from './icons/VideoIcon';
import WebsiteIcon from './icons/WebsiteIcon';
// FIX: Import BookIcon to display for book creations.
import BookIcon from './icons/BookIcon';
import ImageModal from './ImageModal';
import ExternalLinkIcon from './icons/ExternalLinkIcon';

type FilterType = 'All' | CreationType;

const Creations: React.FC = () => {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [filter, setFilter] = useState<FilterType>('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const allCreations = creationsService.getCreations();
    setCreations(allCreations);
  }, []);

  const CreationIcon = ({ type }: { type: Creation['type'] }) => {
    switch (type) {
      case 'Image': return <ImageIcon className="w-6 h-6 text-purple-500 dark:text-purple-400" />;
      case 'Video': return <VideoIcon className="w-6 h-6 text-blue-500 dark:text-blue-400" />;
      case 'Website': return <WebsiteIcon className="w-6 h-6 text-green-500 dark:text-green-400" />;
      // FIX: Add a case to show the BookIcon for book creations.
      case 'Book': return <BookIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />;
      default: return null;
    }
  };

  const renderCreationContent = (creation: Creation) => {
    if (creation.status === 'failed') {
      return <p className="text-red-600 dark:text-red-400 text-sm mt-2">فشل: {creation.error}</p>;
    }
    if (creation.status === 'pending') {
      return (
        <div className="flex items-center gap-2 mt-2 text-blue-500 dark:text-blue-400">
            <div className="w-3 h-3 border-2 border-dashed rounded-full animate-spin border-current"></div>
            <span className='text-sm'>قيد التنفيذ...</span>
        </div>
      );
    }
    switch (creation.type) {
        case 'Image':
            return (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(creation.data as string[]).map((src, i) => (
                         <div key={i} className="relative group">
                            <img 
                                src={src} 
                                className="rounded-md object-cover aspect-square cursor-pointer hover:opacity-80 transition-opacity" 
                                alt={`Generated image ${i}`} 
                                onClick={() => setSelectedImage(src)}
                            />
                            <a
                                href={src}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-1 right-1 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/60 transition-opacity backdrop-blur-sm"
                                title="معاينة خارجية"
                            >
                                <ExternalLinkIcon className="w-4 h-4" />
                            </a>
                        </div>
                    ))}
                </div>
            );
        case 'Video':
            return (
                <div className="mt-2 space-y-2">
                    <video controls src={creation.data} className="rounded-md w-full max-w-md" />
                    <a href={creation.data} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-500 transition-colors">
                        <ExternalLinkIcon className="w-4 h-4" />
                        معاينة خارجية
                    </a>
                </div>
            );
        case 'Website':
            return (
                 <a href={URL.createObjectURL(new Blob([creation.data], { type: 'text/html' }))} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors">
                    <ExternalLinkIcon className="w-5 h-5" />
                    معاينة الموقع
                </a>
            );
        case 'Book':
            return (
                <div className="mt-2 flex items-center gap-2">
                    <a href={creation.data} download={`${creation.prompt.substring(0, 20).replace(/\s+/g, '_')}.pdf`} className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">
                        تحميل الكتاب (PDF)
                    </a>
                    <a href={creation.data} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors">
                        <ExternalLinkIcon className="w-4 h-4" />
                        معاينة (PDF)
                    </a>
                </div>
            );
        default:
            return null;
    }
  }

  const filteredCreations = filter === 'All' ? creations : creations.filter(c => c.type === filter);

  const TabButton = ({ type, label, count }: { type: FilterType, label: string, count: number }) => (
     <button
        onClick={() => setFilter(type)}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          filter === type ? 'border-b-2 border-indigo-500 dark:border-indigo-400 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        {label} ({count})
      </button>
  );

  return (
    <>
    {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 text-center">المنشآت</h2>
        <div className="mt-4 flex justify-center border-b border-slate-300 dark:border-slate-700">
          <TabButton type="All" label="الكل" count={creations.length} />
          <TabButton type="Image" label="صور" count={creations.filter(c => c.type === 'Image').length} />
          <TabButton type="Video" label="فيديو" count={creations.filter(c => c.type === 'Video').length} />
          <TabButton type="Website" label="مواقع" count={creations.filter(c => c.type === 'Website').length} />
          {/* FIX: Add a tab to filter for book creations. */}
          <TabButton type="Book" label="كتب" count={creations.filter(c => c.type === 'Book').length} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
            {filteredCreations.length === 0 ? (
                <div className="text-center text-slate-500 pt-16">
                    <p>لا توجد منشآت في هذا القسم بعد.</p>
                </div>
            ) : (
                filteredCreations.map(creation => (
                    <div key={creation.id} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                                <CreationIcon type={creation.type} />
                                <div>
                                    <h3 className="font-semibold">{creation.type}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs md:max-w-md" title={creation.prompt}>{creation.prompt}</p>
                                </div>
                           </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-xs text-slate-400 dark:text-slate-500">{formatTimestamp(creation.timestamp)}</p>
                            </div>
                        </div>
                        {renderCreationContent(creation)}
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Creations;