export default function SetupScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #052e16 100%)' }}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⚙️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">需要 Firebase 設定</h1>
          <p className="text-gray-500 text-sm">請先建立 Firebase 專案並設定環境變數</p>
        </div>

        <ol className="space-y-4 text-sm text-gray-700">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">1</span>
            <span>前往 <strong>console.firebase.google.com</strong> 建立新專案</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">2</span>
            <span>啟用 <strong>Authentication → Anonymous</strong> 登入方式</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">3</span>
            <span>建立 <strong>Cloud Firestore</strong> 資料庫，部署 <code className="bg-gray-100 px-1 rounded">firestore.rules</code></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">4</span>
            <span>複製 <code className="bg-gray-100 px-1 rounded">.env.example</code> 為 <code className="bg-gray-100 px-1 rounded">.env</code> 並填入 Firebase 設定</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">5</span>
            <span>重新啟動開發伺服器 <code className="bg-gray-100 px-1 rounded">npm run dev</code></span>
          </li>
        </ol>
      </div>
    </div>
  );
}
