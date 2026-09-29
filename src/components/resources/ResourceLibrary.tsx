import React, { useState } from 'react';
import { FileText, Download, Search, Filter, BookOpen, Video, Presentation, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ResourceItem } from '../../types';

export const ResourceLibrary: React.FC = () => {
  const { resources, goBack, previousTabName } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const handleDownload = (resId: string, title: string) => {
    setDownloadedId(resId);
    setTimeout(() => {
      setDownloadedId((prev) => (prev === resId ? null : prev));
    }, 2500);
  };

  const filteredResources = resources.filter((r) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.trainerName.toLowerCase().includes(q) ||
        (r.courseTitle && r.courseTitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getFormatBadge = (type: string) => {
    if (type === 'pdf') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (type === 'ppt') return 'bg-orange-50 text-orange-700 border-orange-200';
    if (type === 'video') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => goBack()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors mb-2.5 group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back {previousTabName ? `to ${previousTabName}` : 'to previous'}</span>
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Open Knowledge Base
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Learning Resources & Trainer Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Curated presentation slide decks, statistical handbooks, SQL optimization sheets, and procedural guidelines published by accredited faculty.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-500">
          {resources.length} Verified Documents Available
        </span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, topics, or faculty..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['all', 'pdf', 'ppt', 'video', 'material'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => setTypeFilter(fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors ${
                typeFilter === fmt
                  ? 'bg-blue-700 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getFormatBadge(
                    res.type
                  )}`}
                >
                  {res.type}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{res.fileSize}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{res.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">{res.description}</p>

              {res.courseTitle && (
                <p className="text-[11px] text-blue-700 bg-blue-50/60 p-2 rounded mt-3 truncate font-medium">
                  Associated Track: {res.courseTitle}
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-900">{res.trainerName}</p>
                <p className="text-[10px] text-slate-400">Uploaded {res.uploadedAt}</p>
              </div>

              <button
                onClick={() => handleDownload(res.id, res.title)}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  downloadedId === res.id
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadedId === res.id ? 'Saved ✓' : 'Download'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
