// src/components/AIAssistantModal.tsx
import React, { useState } from 'react';
import { useVocab } from '../context/VocabContext';
import { VocabularyItem } from '../types';
import { 
  Bot, 
  X, 
  Volume2, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Check, 
  Copy
} from 'lucide-react';
import { playGermanAudio } from '../utils/audio';

export const AIAssistantModal: React.FC = () => {
  const { selectedWordForDetail, setSelectedWordForDetail } = useVocab();
  const [copiedSentence, setCopiedSentence] = useState<string | null>(null);

  if (!selectedWordForDetail) return null;

  const item = selectedWordForDetail;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSentence(text);
    setTimeout(() => setCopiedSentence(null), 2000);
  };

  const getGrammarInsights = (word: VocabularyItem) => {
    const isNoun = !!word.article;
    const isVerb = word.type === 'Verb' || word.type === 'Verb Phr.';
    const isKonj = word.type === 'Konj.';

    let declensionOrConjugation = '';
    let grammarRule = '';
    let extraExamples: { de: string; vi: string }[] = [];

    if (isNoun) {
      const art = word.article;
      declensionOrConjugation = `• Nominativ: ${art} ${word.german}\n• Akkusativ: ${art === 'der' ? 'den' : art} ${word.german}\n• Dativ: ${art === 'der' || art === 'das' ? 'dem' : 'der'} ${word.german}\n• Genitiv: ${art === 'die' ? 'der' : 'des'} ${word.german}${art !== 'die' ? 's' : ''}`;
      
      grammarRule = `Danh từ "${word.german}" mang mạo từ "${word.article}". Dạng số nhiều: "${word.plural || 'không biến đổi'}". Luôn viết hoa chữ cái đầu.`;

      extraExamples = [
        {
          de: `Ich habe ${art === 'der' ? 'einen' : art === 'das' ? 'ein' : 'eine'} ${word.german} gestern gekauft.`,
          vi: `Tôi đã mua một cái ${word.vietnamese} vào hôm qua.`
        },
        {
          de: `Können Sie mir bitte ${art === 'der' ? 'den' : art} ${word.german} zeigen?`,
          vi: `Bạn có thể chỉ cho tôi ${word.vietnamese} được không?`
        },
        {
          de: `Die Bedeutung von ${word.german} ist in diesem Fall sehr wichtig.`,
          vi: `Ý nghĩa của ${word.vietnamese} trong trường hợp này rất quan trọng.`
        }
      ];
    } else if (isVerb) {
      grammarRule = `Động từ "${word.german}". Khi chia ở ngôi "er/sie/es" hiện tại hoặc thì quá khứ Perfekt, cần chú ý trợ động từ haben/sein.`;
      
      if (word.german.includes('(sich an)')) {
        grammarRule += ` Đây là động từ phản thân đi với giới từ "an" + Akkusativ: "sich erinnern an + Akk".`;
      }

      extraExamples = [
        {
          de: `Wir möchten heute mehr über diese Sache ${word.german}.`,
          vi: `Chúng tôi muốn ${word.vietnamese} nhiều hơn về việc này hôm nay.`
        },
        {
          de: `Er hat mir gesagt, dass er das gerne ${word.german} will.`,
          vi: `Anh ấy đã nói với tôi rằng anh ấy rất muốn ${word.vietnamese} điều đó.`
        },
        {
          de: `Warum hast du gestern nicht ${word.german}?`,
          vi: `Tại sao hôm qua bạn lại không ${word.vietnamese}?`
        }
      ];
    } else if (isKonj) {
      grammarRule = word.german === 'weil' 
        ? `Liên từ "weil" (bởi vì) là liên từ phụ (Nebensatz), nó luôn đẩy động từ đã chia xuống CUỐI CÙNG của mệnh đề!`
        : `Liên từ so sánh hoặc liên kết câu "${word.german}". Chú ý trật tự từ (Satzstellung).`;

      extraExamples = [
        {
          de: `Ich lerne fleißig Deutsch, ${word.german} ich in Berlin arbeiten will.`,
          vi: `Tôi chăm chỉ học tiếng Đức ${word.vietnamese} tôi muốn làm việc tại Berlin.`
        },
        {
          de: `Sie ist glücklich, ${word.german} alles gut geklappt hat.`,
          vi: `Cô ấy rất hạnh phúc ${word.vietnamese} mọi thứ đã diễn ra thuận lợi.`
        },
        {
          de: `Wir bleiben zu Hause, ${word.german} das Wetter heute sehr schlecht ist.`,
          vi: `Chúng tôi ở nhà ${word.vietnamese} thời tiết hôm nay rất xấu.`
        }
      ];
    } else {
      grammarRule = `Từ loại "${word.type}": ${word.vietnamese}. Dùng để bổ nghĩa và tạo câu tự nhiên trong giao tiếp.`;
      extraExamples = [
        {
          de: `Das ist wirklich sehr ${word.german} für alle Beteiligten.`,
          vi: `Điều đó thật sự rất ${word.vietnamese} cho tất cả mọi người.`
        },
        {
          de: `Findest du das auch so ${word.german} wie ich?`,
          vi: `Bạn cũng thấy điều đó ${word.vietnamese} giống tôi chứ?`
        },
        {
          de: `In dieser Situation ist es besonders ${word.german}.`,
          vi: `Trong tình huống này, điều đó đặc biệt ${word.vietnamese}.`
        }
      ];
    }

    return { declensionOrConjugation, grammarRule, extraExamples };
  };

  const insights = getGrammarInsights(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 leading-tight">
                Trợ lý AI Ngữ pháp & Mở rộng
              </h3>
            </div>
          </div>

          <button
            onClick={() => setSelectedWordForDetail(null)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Main Word Summary Card */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                {item.article && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {item.article}
                  </span>
                )}
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  {item.german}
                </span>
                <span className="text-xs text-gray-400">({item.type})</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-700">
                Nghĩa: {item.vietnamese}
              </div>
              {item.plural && item.plural !== '*' && (
                <div className="text-xs text-purple-600 mt-0.5">
                  Số nhiều: {item.plural}
                </div>
              )}
            </div>

            <button
              onClick={() => playGermanAudio(item.german)}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs transition-all"
              title="Phát âm"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Original Beispielsatz */}
          {item.example && (
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Ví dụ trong tài liệu:
                </span>
                <button
                  onClick={() => playGermanAudio(item.example)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-800 italic font-medium">
                "{item.example}"
              </p>
            </div>
          )}

          {/* Grammar Analysis */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Giải thích ngữ pháp
            </h4>
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2">
              <p>{insights.grammarRule}</p>
              {insights.declensionOrConjugation && (
                <div className="mt-2 p-2.5 bg-white rounded-lg font-mono text-xs text-gray-600 whitespace-pre-line border border-gray-200">
                  {insights.declensionOrConjugation}
                </div>
              )}
            </div>
          </div>

          {/* AI Generated Extension Sentences */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              3 Câu ví dụ mở rộng ứng dụng
            </h4>

            <div className="space-y-2">
              {insights.extraExamples.map((ex, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-gray-200 flex items-start justify-between gap-2.5 group hover:border-gray-300 transition-colors"
                >
                  <div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-900">
                      {ex.de}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {ex.vi}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => playGermanAudio(ex.de)}
                      className="p-1 rounded-md text-gray-400 hover:text-blue-600 transition-colors"
                      title="Nghe câu"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopy(ex.de)}
                      className="p-1 rounded-md text-gray-400 hover:text-blue-600 transition-colors"
                      title="Sao chép câu"
                    >
                      {copiedSentence === ex.de ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={() => setSelectedWordForDetail(null)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
