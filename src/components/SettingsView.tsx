// src/components/SettingsView.tsx
import React, { useState, useRef } from 'react';
import { useVocab } from '../context/VocabContext';
import { 
  Settings, 
  User, 
  Volume2, 
  RotateCcw, 
  ShieldAlert, 
  Check, 
  Download, 
  Upload, 
  FileText, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { playGermanAudio, playChimeSound } from '../utils/audio';

const AVATARS = ['🧑‍🎓', '🇩🇪', '🦉', '🦊', '🚀', '⚡', '🌟', '🎯'];

const SAMPLE_SENTENCES = [
  'Guten Tag! Deutsch lernen macht großen Spaß.',
  'Wie geht es Ihnen? Ich lerne Deutsch mit WunderDeutsch.',
  'Übung macht den Meister! Täglich 15 Minuten wiederholen.'
];

export const SettingsView: React.FC = () => {
  const { 
    userProfile, 
    vocabulary, 
    sets,
    updateUserProfile,
    resetSRSProgress,
    restoreDefaultData,
    exportDataAsJson,
    importDataFromJson
  } = useVocab();

  const [name, setName] = useState(userProfile.name);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [dailyGoal, setDailyGoal] = useState(userProfile.dailyGoal);
  const [speechSpeed, setSpeechSpeed] = useState(userProfile.speechRate || 0.9);
  const [selectedSampleIdx, setSelectedSampleIdx] = useState(0);

  // Toast / Status state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal / Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isDangerous?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: '',
    onConfirm: () => {}
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || 'Người học',
      avatar,
      dailyGoal,
      speechRate: speechSpeed
    });
    playChimeSound('correct');
    showToast('Đã lưu thông tin hồ sơ thành công!');
  };

  const handleTestAudio = () => {
    playGermanAudio(SAMPLE_SENTENCES[selectedSampleIdx], speechSpeed);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    try {
      const jsonContent = exportDataAsJson();
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `wunderdeutsch_backup_${today}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      playChimeSound('correct');
      showToast('Đã tải xuống file sao lưu dữ liệu JSON thành công!');
    } catch {
      showToast('Không thể xuất file dữ liệu!', 'error');
    }
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        showToast('File không có nội dung!', 'error');
        return;
      }
      const success = importDataFromJson(content);
      if (success) {
        showToast('Đã nhập và khôi phục dữ liệu từ file JSON thành công!');
      } else {
        showToast('File JSON không hợp lệ hoặc sai định dạng dữ liệu WunderDeutsch!', 'error');
      }
    };
    reader.onerror = () => {
      showToast('Lỗi khi đọc file!', 'error');
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openConfirmDialog = (
    title: string, 
    description: string, 
    confirmLabel: string, 
    onConfirm: () => void,
    isDangerous = false
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      confirmLabel,
      onConfirm,
      isDangerous
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-mobile-nav">
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-bold animate-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" />
          Cài đặt & Quản lý dữ liệu
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Tùy chỉnh hồ sơ cá nhân, tốc độ phát âm tiếng Đức, sao lưu và khôi phục dữ liệu học tập.
        </p>
      </div>

      {/* 1. Profile Form */}
      <div className="notion-card p-5 sm:p-6">
        <h2 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-1.5">
          <User className="w-4 h-4 text-blue-600" />
          Hồ sơ người học
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Chọn Avatar đại diện
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    avatar === av 
                      ? 'bg-blue-50 border-2 border-blue-600 scale-105' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tên hiển thị
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 font-semibold text-gray-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mục tiêu từ ôn luyện / ngày
              </label>
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 font-semibold text-gray-900"
              >
                <option value={10}>10 từ / ngày (Thư giãn)</option>
                <option value={20}>20 từ / ngày (Tiêu chuẩn)</option>
                <option value={30}>30 từ / ngày (Tăng tốc)</option>
                <option value={50}>50 từ / ngày (Siêu tốc)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all min-h-[40px] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Lưu hồ sơ
            </button>
          </div>
        </form>
      </div>

      {/* 2. Audio & Pronunciation Settings */}
      <div className="notion-card p-5 sm:p-6">
        <h2 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-purple-600" />
          Âm thanh & Tốc độ phát âm tiếng Đức (Web Speech API)
        </h2>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
              <span>Tốc độ đọc giọng bản xứ Đức (de-DE):</span>
              <span className="text-blue-600 font-extrabold">{speechSpeed}x</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.75, 0.9, 1.0, 1.15].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => {
                    setSpeechSpeed(rate);
                    updateUserProfile({ speechRate: rate });
                    playGermanAudio("Deutsch sprechen", rate);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all min-h-[40px] flex items-center justify-center ${
                    speechSpeed === rate 
                      ? 'bg-blue-50 text-blue-700 border-blue-500 ring-1 ring-blue-500/20' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {rate}x {rate === 0.75 ? '(Chậm)' : rate === 0.9 ? '(Chuẩn)' : rate === 1.0 ? '(Tự nhiên)' : '(Nhanh)'}
                </button>
              ))}
            </div>
          </div>

          {/* Sample sentences selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Chọn câu mẫu để nghe thử giọng đọc:
            </label>
            <div className="space-y-1.5">
              {SAMPLE_SENTENCES.map((sentence, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedSampleIdx(idx)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    selectedSampleIdx === idx 
                      ? 'bg-purple-50/70 border-purple-300 text-purple-900 font-semibold' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100/80'
                  }`}
                >
                  <span className="italic">"{sentence}"</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSampleIdx(idx);
                      playGermanAudio(sentence, speechSpeed);
                    }}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-purple-600 transition-colors"
                    title="Phát câu này"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleTestAudio}
              className="w-full px-3 py-2.5 bg-blue-50 hover:bg-blue-100/70 rounded-xl text-xs font-bold text-blue-700 border border-blue-200 transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
            >
              <Volume2 className="w-4 h-4" />
              Nghe thử câu đã chọn ({speechSpeed}x)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Backup & Restore Data (Export / Import JSON) */}
      <div className="notion-card p-5 sm:p-6">
        <h2 className="text-sm font-extrabold text-gray-900 mb-1 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-600" />
          Sao lưu & Đồng bộ dữ liệu (JSON)
        </h2>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Tải xuống toàn bộ dữ liệu từ vựng (bao gồm các bộ từ cá nhân, tiến trình SRS, thống kê XP) để lưu trữ an toàn hoặc chuyển sang thiết bị khác.
        </p>

        <input 
          ref={fileInputRef}
          type="file" 
          accept=".json,application/json" 
          onChange={handleFileChange} 
          className="hidden" 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[42px] shadow-xs active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Xuất file sao lưu (JSON)
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[42px] shadow-xs active:scale-95"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            Nhập file sao lưu (JSON)
          </button>
        </div>

        <div className="mt-3 text-[11px] text-gray-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Hiện có {vocabulary.length} từ vựng và {sets.length} bộ bài học đang được lưu trên trình duyệt của bạn.</span>
        </div>
      </div>

      {/* 4. Danger Zone & Factory Reset */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-rose-200">
        <h2 className="text-sm font-extrabold text-rose-800 mb-1 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          Quản trị & Đặt lại dữ liệu gốc
        </h2>
        <p className="text-xs text-rose-700/80 mb-4 leading-relaxed">
          Tùy chọn đặt lại chu kỳ ghi nhớ để học lại từ đầu hoặc khôi phục danh sách 412 từ vựng chuẩn từ file giáo trình tài liệu.pdf.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              openConfirmDialog(
                'Khôi phục 412 từ vựng gốc từ tài liệu.pdf?',
                'Thao tác này sẽ nạp lại toàn bộ 412 từ vựng chuẩn được phân chia theo Einheit 1, Einheit 2, Einheit 3 và Station 1. Dữ liệu bộ từ mẫu sẽ được đặt lại nguyên bản.',
                'Xác nhận khôi phục 412 từ',
                () => {
                  restoreDefaultData();
                  showToast('Đã khôi phục 412 từ vựng gốc từ tài liệu.pdf thành công!');
                }
              );
            }}
            className="px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
            Khôi phục 412 từ gốc (tài liệu.pdf)
          </button>

          <button
            type="button"
            onClick={() => {
              openConfirmDialog(
                'Đặt lại tiến độ ghi nhớ SRS về Hộp 0?',
                'Tất cả các từ sẽ được chuyển về trạng thái Từ mới (Hộp 0) để bạn bắt đầu chu kỳ ôn tập lại từ đầu. Danh sách từ và các bộ từ vẫn được giữ nguyên vẹn.',
                'Đặt lại về Hộp 0',
                () => {
                  resetSRSProgress();
                  showToast('Đã đặt lại tiến độ SRS về Hộp 0!');
                },
                true
              );
            }}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[42px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Đặt lại tiến độ SRS về Hộp 0
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xl"
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${confirmDialog.isDangerous ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900">
                {confirmDialog.title}
              </h3>
            </div>

            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors min-h-[38px]"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors min-h-[38px] ${
                  confirmDialog.isDangerous 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
