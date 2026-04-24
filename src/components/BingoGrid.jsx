import { useRef, useState } from 'react';
import { compressImage, compressThumbnail } from '../utils/imageCompression';
import GridCell from './GridCell';

export default function BingoGrid({ grid, bingoLines, onPhotoTaken }) {
  const fileInputRef = useRef(null);
  const pendingIndexRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleCellClick = (index) => {
    if (grid[index].status !== 'empty' || uploading) return;
    pendingIndexRef.current = index;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || pendingIndexRef.current === null) return;

    setUploading(true);
    try {
      const [activityPhoto, thumbnailPhoto] = await Promise.all([
        compressImage(file),
        compressThumbnail(file),
      ]);
      await onPhotoTaken(pendingIndexRef.current, thumbnailPhoto, activityPhoto);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('圖片處理失敗，請重試');
    } finally {
      setUploading(false);
      pendingIndexRef.current = null;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-gray-800 text-base">尋找以下物品 🕵️</h2>
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          已連線：{bingoLines}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {grid.map((cell, index) => (
          <GridCell
            key={`${cell.id}-${index}`}
            cell={cell}
            onClick={() => handleCellClick(index)}
          />
        ))}
      </div>

      {uploading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-green-700 text-sm">
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          上傳中，請稍候...
        </div>
      )}

      {!uploading && (
        <p className="text-gray-400 text-xs text-center mt-4 leading-relaxed">
          點擊空白格子開啟相機拍照。<br />
          拍完需等待隊友投票通過，才會變綠色勾勾！
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
