import { Check, Camera } from 'lucide-react';

export default function GridCell({ cell, onClick }) {
  const { status, emoji, name, photoData } = cell;

  if (status === 'approved') {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-green-500 shadow-sm">
        <img src={photoData} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-green-600 bg-opacity-10" />
        <div className="absolute top-1.5 right-1.5 bg-green-500 rounded-full p-0.5 shadow">
          <Check size={13} className="text-white" strokeWidth={3} />
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent pt-4 pb-1 px-1">
          <p className="text-white text-xs text-center truncate leading-tight">{name}</p>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <button
        onClick={onClick}
        className="relative aspect-square rounded-2xl overflow-hidden border-2 border-yellow-400 shadow-sm w-full active:scale-95 transition-transform"
      >
        <img src={photoData} alt={name} className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/20">
          <div className="bg-yellow-400/90 rounded-full p-1.5">
            <Camera size={14} className="text-white" />
          </div>
          <span className="text-white text-xs font-bold drop-shadow">重拍</span>
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent pt-4 pb-1 px-1">
          <p className="text-white text-xs text-center truncate leading-tight">{name}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1.5 bg-white hover:border-green-400 hover:bg-green-50 active:scale-95 transition-all group"
    >
      <span className="text-3xl leading-none">{emoji}</span>
      <span className="text-xs text-gray-600 text-center px-1 leading-tight line-clamp-2">{name}</span>
      <Camera size={12} className="text-gray-300 group-hover:text-green-400 transition-colors" />
    </button>
  );
}
