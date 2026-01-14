
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFirestoreNotes } from './hooks/useFirestoreNotes';
import NoteCard from './components/NoteCard';
import PlusIcon from './components/icons/PlusIcon';
import ListIcon from './components/icons/ListIcon';
import ClockIcon from './components/icons/ClockIcon';
import CheckIcon from './components/icons/CheckIcon';
import NoteList from './components/NoteList';
import TimeBox from './components/TimeBox';
import TodoBox from './components/TodoBox';

const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;
const MIN_TODOBOX_HEIGHT = 350;

// Quotes Data
const QUOTES = [
  { text: "성공은 끝이 아니며, 실패는 치명적이지 않습니다. 중요한 것은 계속해 나가는 용기입니다.", author: "윈스턴 처칠" },
  { text: "독창적으로 실패하는 것이 모방으로 성공하는 것보다 낫다.", author: "허먼 멜빌" },
  { text: "성공으로 가는 길과 실패로 가는 길은 거의 똑같다.", author: "콜린 R. 데이비스" },
  { text: "성공은 대개 그것을 찾을 겨를도 없이 바쁘게 일하는 사람에게 찾아온다.", author: "헨리 데이비드 소로" },
  { text: "성공은 실패에서 나온다. 낙담과 실패는 성공으로 가는 가장 확실한 디딤돌이다.", author: "데일 카네기" },
  { text: "세상 그 무엇도 끈기를 대신할 수 없다. 재능도, 천재성도, 교육도 안 된다.", author: "캘빈 쿨리지" },
  { text: "성공은 마음의 평화이며, 이는 최선을 다해 자신이 할 수 있는 최고의 모습을 보여줬다는 자기만족에서 나온다.", author: "존 우든" },
  { text: "나는 성공을 꿈꾸지 않았으며, 성공을 위해 일했을 뿐이다.", author: "에스티 로더" },
  { text: "성공은 원하는 걸 얻는 것이고, 행복은 얻은 걸 원하는 것이다.", author: "W. P. 킨셀라" },
  { text: "워터슬라이드 꼭대기에서 주저하면서 너무 많이 생각하는 아이가 되서는 안 된다. 그냥 미끄럼틀을 타고 내려가야 한다.", author: "티나 페이" },
  { text: "당신이 지나쳐버리는 기준은 곧 당신이 용인하는 기준이다.", author: "데이비드 허리" },
  { text: "성공은 실패에서 실패로 넘어가면서도 열정을 잃지 않는 것이다.", author: "윈스턴 처칠" },
  { text: "별을 바라보되, 발은 땅에 딛고 있어라.", author: "시어도어 루스벨트" },
  { text: "완벽함은 도달할 수 없다. 하지만 완벽함을 쫓으면 우수함을 달성할 수 있다.", author: "빈스 롬바르디" },
  { text: "좋은 아이디어를 얻었다면 그것을 붙잡고 끝까지 밀어붙여라. 제대로 될 때까지 멈추지 마라.", author: "월트 디즈니" },
  { text: "낙관주의는 성취로 이어지는 믿음이다. 희망과 신뢰 없이는 아무것도 이루어질 수 없다.", author: "헬렌 켈러" },
  { text: "비관자는 모든 기회에서 어려움을 보고, 낙관자는 모든 어려움 속에서 기회를 본다.", author: "윈스턴 처칠" },
  { text: "어제에 너무 많은 시간을 뺏기지 마라.", author: "윌 로저스" },
  { text: "실패는 성공보다 더 많은 것을 가르쳐준다. 실패가 당신을 멈추게 하지 마라. 실패는 인격을 만든다.", author: "작자 미상" },
  { text: "당신이 진심으로 아끼는 일을 하고 있다면, 누군가의 당신의 등을 떠밀 필요가 없다. 비전이 당신을 끌어당긴다.", author: "스티브 잡스" },
  { text: "알아야 할 것이 얼마나 많은지 아는 것, 그것이 배워가는 삶의 시작이다.", author: "도로시 웨스트" },
  { text: "목표 설정은 매력적인 미래를 만드는 비밀이다.", author: "토니 로빈스" },
  { text: "우리가 계획한 삶을 기꺼이 버릴 용기가 있어야, 우리를 기다리고 있는 삶을 살 수 있다.", author: "조지프 캠벨" },
  { text: "생각을 모두 지금 하고 있는 일에 집중하라. 태양의 빛도 한 점에 모아야 불이 된다.", author: "알렉산더 그레이엄 벨" },
  { text: "당신이 하루를 지배하든, 하루가 당신을 지배하든 둘 중 하나이다.", author: "짐 론" },
  { text: "나는 운을 굳게 믿는다. 그리고 열심히 일할수록 운도 더 많이 따른다는 걸 알았다.", author: "토머스 제퍼슨" },
  { text: "우리가 더 나아지려고 노력할 때, 우리 주변의 모든 것도 함께 더 나아진다.", author: "파울로 코엘료" },
  { text: "목표를 세우는 건 보이지 않는 것을 보이는 것으로 바꾸는 첫걸음이다.", author: "토니 로빈스" },
  { text: "위대한 일을 하는 유일한 방법은 당신이 하는 일을 사랑하는 것이다.", author: "스티브 잡스" },
  { text: "자기 자신을 이기는 사람이 가장 강한 전사다.", author: "공자" },
  { text: "성공한 사람이 되려고 하지 말고, 가치 있는 사람이 되려고 하라.", author: "알베르트 아인슈타인" },
  { text: "인생에서 성공의 비밀 중 하나는 기회가 왔을 때 그것을 잡을 준비가 되어 있는 것이다.", author: "벤저민 디즈레일리" },
  { text: "실수를 하고도 고치지 않는 건, 또 다른 실수를 저지르는 거다.", author: "공자" },
  { text: "현명한 사람은 가지지 못한 것 때문에 슬퍼하지 않고, 가진 것에 기뻐한다.", author: "에픽테토스" },
  { text: "교육은 세상을 바꿀 수 있는 가장 강력한 무기다.", author: "넬슨 만델라" },
  { text: "가장 어려운 건 행동하기로 결정하는 것이다. 나머지는 단지 끈기일 뿐이다.", author: "아멜리아 에어하트" },
  { text: "인생은 자전거 타기와 같다. 균형을 잡으려면 계속 움직여야 한다.", author: "알베르트 아인슈타인" },
  { text: "당신이 하는 행동은 당신이 하는 말보다 훨씬 크게 들린다.", author: "랄프 월도 에머슨" },
  { text: "아직 위대한 일을 할 수 없다면, 작은 일을 위대하게 해라.", author: "나폴레온 힐" },
  { text: "정말 무언가를 하고 싶다면 길을 찾을 거고, 하고 싶지 않다면 변명을 찾을 거다.", author: "짐 론" },
  { text: "역사 속이 아니라 상상력 속에서 살아라.", author: "스티븐 코비" },
  { text: "완벽한 시간과 장소를 기다리지 마라. 당신은 이미 무대 위에 있다.", author: "작자 미상" },
  { text: "어려움이 클수록, 그것을 극복하는 영광도 더욱 커진다.", author: "에피쿠로스" },
  { text: "용기는 언제나 포효하지 않는다. 때로 용기는 하루의 끝에서 '내일 다시 해보자'라고 말하는 조용한 목소리다.", author: "메리 앤 래드마허" },
  { text: "내 세대의 가장 위대한 발견은 인간이 태도를 바꿈으로써 자신의 삶을 바꿀 수 있다는 것이다.", author: "윌리엄 제임스" },
  { text: "하지 않은 일을 후회하느니, 차라리 내가 한 일을 후회하겠다.", author: "루실 볼" },
  { text: "마음속에서 밭을 뒤집는다고 밭이 갈리지는 않는다. 시작하려면, 시작해라.", author: "고든 B. 힝클리" },
  { text: "월요일은 1년에 52번이나 새로운 시작을 준다!", author: "데이비드 드웩" },
  { text: "불행하게 살아라, 아니면 스스로 동기를 부여하라. 무엇을 하든 선택은 언제나 당신의 몫이다.", author: "웨인 다이어" },
  { text: "당신이 원하는 걸 인생에서 모두 얻고 싶다면, 다른 사람들이 원하는 걸 얻도록 충분히 도와줘라.", author: "지그 지글러" },
  { text: "영감은 존재한다. 하지만 일을 하고 있는 사람에게만 찾아온다.", author: "파블로 피카소" },
  { text: "작은 목표를 세우지 마라. 목표를 초월하라.", author: "데비이드 오길비" },
  { text: "할 수 있다고 믿어라. 그러면 이미 절반은 성공한 것이다.", author: "시어도어 루스벨트" },
  { text: "미래는 자신의 꿈의 아름다움을 믿는 사람들의 것이다.", author: "엘리너 루스벨트" },
  { text: "사람들이 가는 길을 따라가지 마라. 길이 없는 곳으로 가서 흔적을 남겨라.", author: "랄프 월도 에머슨" },
  { text: "불가능한 것은 없다. 그 단어 자체가 '나는 가능하다'고 말한다.", author: "오드리 헵번" },
  { text: "우리는 반복적으로 하는 것 그 자체다. 그러므로 탁월함은 행동이 아니라 습관이다.", author: "아리스토텔레스" },
  { text: "지옥을 지나고 있다면, 계속 나아가라.", author: "작자 미상" },
  { text: "추구할 용기만 있다면, 우리의 모든 꿈은 실현될 수 있다.", author: "월트 디즈니" },
  { text: "당신이 원하는 모든 것은 두려움의 반대편 너머에 있다.", author: "조지 애데어" },
  { text: "나는 실패하지 않았다. 그저 잘 안 되는 방법 1만 가지를 찾았을 뿐이다.", author: "토머스 에디슨" },
  { text: "실행하지 않는 아이디어는 망상이다.", author: "로빈 샤르마" },
  { text: "팀워크는 평범한 사람들이 비범한 결과를 이루게 하는 원동력이다.", author: "앤드루 카네기" },
  { text: "혼자서는 할 수 있는 게 너무 적지만, 함께하면 할 수 있는 게 많아진다.", author: "헬렌 켈러" },
  { text: "기회는 그냥 생기지 않는다. 당신이 만들어야 한다.", author: "크리스 그로서" },
  { text: "당신이 되고 싶었던 사람이 되는 것은 결코 늦지 않았다.", author: "조지 엘리엇" },
  { text: "할 수 있는 최선을 다해라. 누구도 그 이상은 할 수 없다.", author: "존 우든" },
  { text: "꿈꿀 수 있다면, 이룰 수도 있다.", author: "월트 디즈니" },
  { text: "오늘 누군가 그늘에 앉아 있을 수 있는 건, 오래전에 누군가 나무를 심었기 때문이다.", author: "워런 버핏" },
  { text: "인내할 수 있는 사람은 원하는 것은 무엇이든 가질 수 있다.", author: "벤저민 프랭클린" },
  { text: "목표를 높게 설정하고, 거기에 도달할 때까지 멈추지 마라.", author: "보 잭슨" },
];

const App: React.FC = () => {
  const { 
    notes, files, timeBox, todos, todayStr, todoBoxPos, todoBoxSize,
    addNote, updateNoteContent, updateNotePosition, updateNoteSize, updateNoteColor, updateNoteStatus, deleteNote, bringToFront,
    addFile, deleteFile,
    updateTimeBoxEntry, updateTimeBoxPosition, updateTimeBoxColors,
    addTodo, toggleTodo, toggleFixedTodo, deleteTodo, updateTodoPosition, updateTodoBoxSize, updateTodoOrder, moveTodoToTop
  } = useFirestoreNotes();

  // Drag states as refs for buttery smooth performance
  const draggingRef = useRef<{ id?: string, type: 'note' | 'time' | 'todo' | 'resize' | 'todoResize', startX: number, startY: number, startPos: { x: number, y: number }, startSize?: { w: number, h: number } } | null>(null);
  
  const [isNoteListOpen, setIsNoteListOpen] = useState(false);
  const [isTimeBoxOpen, setIsTimeBoxOpen] = useState(false);
  const [isTodoBoxOpen, setIsTodoBoxOpen] = useState(false);
  const [randomQuote, setRandomQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    // Select a random quote on mount
    const index = Math.floor(Math.random() * QUOTES.length);
    setRandomQuote(QUOTES[index]);
  }, []);

  // Manages visual stacking order (z-index)
  const setWindowFocus = useCallback((targetId: string) => {
    // Reset all to base level
    const windows = document.querySelectorAll('[data-note-id], #timebox-window, #todobox-window');
    windows.forEach(win => {
      (win as HTMLElement).style.zIndex = '10';
    });
    
    // Bring target to front
    let target: HTMLElement | null = null;
    if (targetId === 'timebox') target = document.getElementById('timebox-window');
    else if (targetId === 'todobox') target = document.getElementById('todobox-window');
    else target = document.querySelector(`[data-note-id="${targetId}"]`);
    
    if (target) target.style.zIndex = '50';
  }, []);

  // Handler for bringing a note to front when clicked anywhere
  const handleNoteInteraction = useCallback((id: string) => {
    setWindowFocus(id);
    bringToFront(id); // Update Firestore timestamp to persist order eventually
  }, [setWindowFocus, bringToFront]);

  const handleCreateNote = async () => {
    try {
      const newNoteId = await addNote();
      const interval = setInterval(() => {
        const el = document.querySelector(`[data-note-id="${newNoteId}"]`);
        if (el) {
          setWindowFocus(newNoteId);
          clearInterval(interval);
        }
      }, 50);
      setTimeout(() => clearInterval(interval), 2000);
    } catch (e) {
      console.error("Failed to add note", e);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingRef.current) return;
    const { type, id, startX, startY, startPos, startSize } = draggingRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let el: HTMLElement | null = null;
    if (type === 'note') el = document.querySelector(`[data-note-id="${id}"]`);
    else if (type === 'time') el = document.getElementById('timebox-window');
    else if (type === 'todo') el = document.getElementById('todobox-window');
    else if (type === 'resize') el = document.querySelector(`[data-note-id="${id}"]`);
    else if (type === 'todoResize') el = document.getElementById('todobox-window');

    if (!el) return;

    if (type === 'resize' && startSize) {
      el.style.width = `${Math.max(MIN_WIDTH, startSize.w + dx)}px`;
      el.style.height = `${Math.max(MIN_HEIGHT, startSize.h + dy)}px`;
    } else if (type === 'todoResize' && startSize) {
      el.style.height = `${Math.max(MIN_TODOBOX_HEIGHT, startSize.h + dy)}px`;
    } else {
      el.style.left = `${startPos.x + dx}px`;
      el.style.top = `${startPos.y + dy}px`;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!draggingRef.current) return;
    const { type, id } = draggingRef.current;
    let el: HTMLElement | null = null;

    if (type === 'note') el = document.querySelector(`[data-note-id="${id}"]`);
    else if (type === 'time') el = document.getElementById('timebox-window');
    else if (type === 'todo') el = document.getElementById('todobox-window');
    else if (type === 'resize') el = document.querySelector(`[data-note-id="${id}"]`);
    else if (type === 'todoResize') el = document.getElementById('todobox-window');

    if (el) {
      const x = parseFloat(el.style.left);
      const y = parseFloat(el.style.top);
      const w = parseFloat(el.style.width);
      const h = parseFloat(el.style.height);

      el.style.transition = '';

      if (type === 'note') updateNotePosition(id!, { x, y });
      else if (type === 'time') updateTimeBoxPosition({ x, y });
      else if (type === 'todo') updateTodoPosition({ x, y });
      else if (type === 'resize') updateNoteSize(id!, { width: w, height: h });
      else if (type === 'todoResize') updateTodoBoxSize({ height: h });
    }

    draggingRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, updateNotePosition, updateNoteSize, updateTimeBoxPosition, updateTodoPosition, updateTodoBoxSize]);

  const startDragging = (e: React.MouseEvent, type: any, id?: string) => {
    e.preventDefault(); 
    
    if (id) handleNoteInteraction(id);
    else setWindowFocus(type === 'time' ? 'timebox' : 'todobox');

    let el: HTMLElement | null = null;
    if (type === 'note' || type === 'resize') el = document.querySelector(`[data-note-id="${id}"]`);
    else if (type === 'time') el = document.getElementById('timebox-window');
    else if (type === 'todo') el = document.getElementById('todobox-window');

    if (el) {
      el.style.transition = 'none';

      draggingRef.current = {
        type, id,
        startX: e.clientX,
        startY: e.clientY,
        startPos: { x: parseFloat(el.style.left) || 0, y: parseFloat(el.style.top) || 0 },
        startSize: { w: parseFloat(el.style.width) || 0, h: parseFloat(el.style.height) || 0 }
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-[#0f172a] relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#0f172a_100%)]"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      
      {/* Motivational Quote Background */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 px-10 md:px-20 opacity-[0.15]">
        <p className="text-3xl md:text-5xl lg:text-6xl font-black text-white text-center leading-tight break-keep select-none drop-shadow-xl transition-all duration-1000">
          "{randomQuote.text}"
        </p>
        <div className="mt-8 flex items-center gap-4">
           <div className="h-[2px] w-12 bg-white/50"></div>
           <p className="text-lg md:text-2xl font-bold text-white uppercase tracking-[0.2em] select-none">
            {randomQuote.author}
           </p>
           <div className="h-[2px] w-12 bg-white/50"></div>
        </div>
      </div>

      <NoteList
        notes={notes} files={files} isOpen={isNoteListOpen} onClose={() => setIsNoteListOpen(false)}
        onNoteSelect={(id) => { handleNoteInteraction(id); }} onDeletePermanent={deleteNote} onAddFile={addFile} onDeleteFile={deleteFile}
      />

      <TimeBox 
        data={timeBox} isOpen={isTimeBoxOpen} onClose={() => setIsTimeBoxOpen(false)}
        onUpdateEntry={updateTimeBoxEntry} onUpdateColors={updateTimeBoxColors} currentDate={todayStr}
        onMouseDown={(e) => startDragging(e, 'time')} onTouchStart={() => {}} 
      />

      <TodoBox 
        todos={todos} isOpen={isTodoBoxOpen} onClose={() => setIsTodoBoxOpen(false)}
        onAddTodo={addTodo} onToggleTodo={toggleTodo} onToggleFixed={toggleFixedTodo} onDeleteTodo={deleteTodo} onUpdateOrder={updateTodoOrder} onMoveToTop={moveTodoToTop}
        position={todoBoxPos} size={todoBoxSize} 
        onMouseDown={(e) => startDragging(e, 'todo')} 
        onResizeStart={(e) => startDragging(e, 'todoResize')} 
        onTouchStart={() => {}} currentDate={todayStr}
      />

      {/* Decorative Title (Moved slightly to not clash, but keeping it as requested watermark style) */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center w-full px-4 z-0 pointer-events-none select-none opacity-10">
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">WORKSPACE</h1>
        <div className="flex items-center justify-center gap-4 mt-2">
          <p className="text-white text-[10px] font-bold tracking-[0.8em] uppercase">{todayStr.split('-').join(' / ')}</p>
        </div>
      </div>

      {/* Note Cards */}
      {notes.filter(n => n.status === 'active').map((note) => (
          <NoteCard
            key={note.id} 
            note={note} 
            onContentChange={updateNoteContent} 
            onMinimize={(id) => updateNoteStatus(id, 'minimized')} 
            onStatusChange={updateNoteStatus}
            onInteract={(id) => handleNoteInteraction(id)}
            onDragStart={(id, e) => startDragging(e, 'note', id)} 
            onTouchStart={() => {}} 
            onResizeStart={(id, e) => startDragging(e as any, 'resize', id)} 
            onColorChange={updateNoteColor}
          />
      ))}
      
      {/* Floating Action Menu */}
      <div className="fixed bottom-10 right-10 flex flex-col items-center gap-5 z-[100]">
        <div className="flex flex-col gap-3 group">
          <button
            onClick={() => { setIsTodoBoxOpen(p => !p); if (!isTodoBoxOpen) setTimeout(() => setWindowFocus('todobox'), 100); }}
            className={`w-14 h-14 text-white rounded-2xl shadow-xl transition-all duration-500 hover:rotate-6 flex items-center justify-center ${isTodoBoxOpen ? 'bg-emerald-500 scale-110 shadow-emerald-500/40 ring-4 ring-emerald-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <CheckIcon className="w-7 h-7" />
          </button>

          <button
            onClick={() => { setIsTimeBoxOpen(p => !p); if (!isTimeBoxOpen) setTimeout(() => setWindowFocus('timebox'), 100); }}
            className={`w-14 h-14 text-white rounded-2xl shadow-xl transition-all duration-500 hover:-rotate-6 flex items-center justify-center ${isTimeBoxOpen ? 'bg-sky-500 scale-110 shadow-sky-500/40 ring-4 ring-sky-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <ClockIcon className="w-7 h-7" />
          </button>

          <button 
            onClick={() => setIsNoteListOpen(p => !p)} 
            className={`w-14 h-14 text-white rounded-2xl shadow-xl transition-all flex items-center justify-center hover:scale-110 ${isNoteListOpen ? 'bg-slate-600 scale-110 shadow-slate-500/40 ring-4 ring-slate-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            <ListIcon className="w-7 h-7" />
          </button>

          <button 
            onClick={handleCreateNote} 
            className="w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl hover:bg-blue-500 transition-all flex items-center justify-center hover:scale-110 active:scale-95 group ring-8 ring-blue-600/10"
          >
            <PlusIcon className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </main>
  );
};

export default App;
