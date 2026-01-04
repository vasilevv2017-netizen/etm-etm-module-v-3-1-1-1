import React, { useState, useRef, useEffect } from 'react';
import { CanMessage, CanSpeed, MonitorView, SavedTransmitMessage, ComButton, CanRule } from '../types';
import TransmitDialog from './TransmitDialog';
import ComButtonDialog from './ComButtonDialog';
import GraphView from './GraphView';

interface Props {
  deviceName: string; connectionStatus: string; speed: CanSpeed; onSpeedChange: (s: CanSpeed) => void;
  isCanOpen: boolean; onToggleCan: (open: boolean) => void; messages: CanMessage[]; onDisconnect: () => void;
  logs: string[]; comLogs: string[]; onClearComLogs: () => void; comButtons: ComButton[];
  onUpdateComButtons: (btns: ComButton[]) => void; onComButtonPress: (btn: ComButton) => void;
  isLoggingActive: boolean; onToggleLogging: (active: boolean) => void; isLoggingPaused: boolean;
  onToggleLogPause: () => void; onClearLogs: () => void; onImportLogs: (logs: string[]) => void;
  onSendCommand: (cmd: string) => void; savedTxMessages: SavedTransmitMessage[];
  onSaveTxMessage: (msg: Partial<SavedTransmitMessage>) => void; onImportTxMessages: (messages: SavedTransmitMessage[]) => void;
  onDeleteSavedTx: (id: string) => void; activeTxIds: Set<string>; onTogglePeriodicTx: (msg: SavedTransmitMessage) => void;
  rules: CanRule[]; onUpdateRules: (rules: CanRule[]) => void;
}

const CanMonitor: React.FC<Props> = (props) => {
  const [activeView, setActiveView] = useState<MonitorView>(MonitorView.Live);
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<SavedTransmitMessage | null>(null);
  const [isComDialogOpen, setIsComDialogOpen] = useState(false);
  const [editingCom, setEditingCom] = useState<ComButton | null>(null);
  
  const logEndRef = useRef<HTMLDivElement>(null);
  const comLogEndRef = useRef<HTMLDivElement>(null);
  const txFileRef = useRef<HTMLInputElement>(null);
  const logFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeView === MonitorView.Logs && !props.isLoggingPaused) logEndRef.current?.scrollIntoView({ behavior: 'auto' });
    if (activeView === MonitorView.ComPort) comLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [props.logs.length, props.comLogs.length, activeView, props.isLoggingPaused]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
      <div className="bg-gray-900 border-b border-white/5 p-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${props.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
          <div className="text-[10px] font-black uppercase text-red-600 truncate max-w-[120px]">{props.deviceName}</div>
        </div>
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{props.isCanOpen ? 'ACTIVE' : 'IDLE'}</div>
      </div>

      <div className="flex bg-gray-900 p-1 gap-1 shrink-0 border-b border-white/5 overflow-x-auto monitor-scroll">
        {(Object.values(MonitorView) as MonitorView[]).map(v => (
          <button key={v} onClick={() => setActiveView(v)} className={`flex-none py-2 px-3 text-[8px] font-black rounded uppercase transition-all ${activeView === v ? 'bg-red-600 text-white' : 'text-gray-500'}`}>{v}</button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {activeView === MonitorView.Live && (
          <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
            <div className="grid grid-cols-3 gap-1">
              {(['125', '250', '500'] as CanSpeed[]).map(s => (
                <button key={s} onClick={() => props.onSpeedChange(s)} disabled={props.isCanOpen} className={`py-1.5 rounded font-mono text-[9px] border ${props.speed === s ? 'bg-red-600 text-white border-red-400' : 'bg-gray-900 text-gray-700 border-white/5'}`}>{s}K</button>
              ))}
            </div>
            <button onClick={() => props.onToggleCan(!props.isCanOpen)} className={`w-full py-3 rounded font-black text-[10px] uppercase border ${props.isCanOpen ? 'bg-gray-800 text-red-500 border-red-500/30' : 'bg-green-600 text-white border-green-400'}`}>
              {props.isCanOpen ? 'STOP SERVICE' : 'START SERVICE'}
            </button>
            <div className="flex-1 bg-black/60 border border-white/5 rounded-xl overflow-y-auto font-mono monitor-scroll">
               <div className="sticky top-0 bg-gray-900 grid grid-cols-3 p-2 text-[7px] text-gray-600 uppercase font-black border-b border-white/5 z-10">
                 <div>ID</div><div className="col-span-2">DATA BYTES</div>
               </div>
               {props.messages.sort((a,b)=>a.id.localeCompare(b.id)).map(m => (
                 <div key={m.id} className="grid grid-cols-3 p-2 border-b border-white/5 items-start active:bg-white/5">
                   <div className="text-red-500 font-bold text-[14px] leading-tight">{m.id}</div>
                   <div className="col-span-2">
                      <div className="text-gray-300 truncate text-[12px] tabular-nums leading-none mb-1">{m.data}</div>
                      <div className="text-green-500 text-[8px] font-black uppercase opacity-70">CNT: {m.count}</div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeView === MonitorView.Logs && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 bg-gray-900 grid grid-cols-2 gap-2 shrink-0 border-b border-white/5">
               <button onClick={() => props.onToggleLogging(!props.isLoggingActive)} className={`py-2 rounded text-[8px] font-black uppercase border ${props.isLoggingActive ? 'bg-red-900/40 text-red-500 border-red-500' : 'bg-green-600 text-white'}`}>{props.isLoggingActive ? 'СТОП' : 'СТАРТ'}</button>
               <button onClick={props.onToggleLogPause} className={`py-2 rounded text-[8px] font-black uppercase ${props.isLoggingPaused ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}>ПАУЗА</button>
               <button onClick={props.onClearLogs} className="py-2 bg-gray-800 text-[8px] font-black uppercase text-gray-400 rounded">ОЧИСТИТЬ</button>
               <button onClick={() => logFileRef.current?.click()} className="py-2 bg-gray-800 text-[8px] font-black uppercase text-gray-400 rounded">ИМПОРТ</button>
               <input type="file" ref={logFileRef} onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => props.onImportLogs((ev.target?.result as string).split('\n').filter(l => l.trim()));
                    reader.readAsText(file);
                 }
               }} className="hidden" />
            </div>
            <div className="flex-1 p-2 font-mono overflow-y-auto bg-black/60 monitor-scroll">
               {props.logs.map((l, i) => (
                 <div key={i} className="mb-0.5 truncate leading-none text-green-500/90 text-[12px] tracking-tight">{l}</div>
               ))}
               <div ref={logEndRef} />
            </div>
          </div>
        )}

        {activeView === MonitorView.TX && (
          <div className="flex-1 flex flex-col p-3 overflow-y-auto monitor-scroll">
            <div className="space-y-2 pb-20">
              {props.savedTxMessages.map(msg => (
                <div key={msg.id_key} className="bg-gray-900 border border-white/5 rounded-xl p-3 flex justify-between items-center border-l-2 border-l-red-600 shadow-lg">
                  <div className="min-w-0 flex-1" onClick={() => { setEditingTx(msg); setIsTxDialogOpen(true); }}>
                    <div className="text-[12px] font-black text-gray-100 truncate uppercase">{msg.name}</div>
                    <div className="text-[10px] font-mono mt-1 flex gap-2">
                      <span className="text-red-500">{msg.id}</span>
                      <span className="text-gray-500 truncate">{msg.data}</span>
                    </div>
                  </div>
                  <button onClick={() => props.onTogglePeriodicTx(msg)} className={`ml-2 px-4 py-2 rounded-lg text-[8px] font-black uppercase ${props.activeTxIds.has(msg.id_key) ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`}>
                    {props.activeTxIds.has(msg.id_key) ? 'STOP' : 'SEND'}
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => { setEditingTx(null); setIsTxDialogOpen(true); }} className="absolute bottom-6 right-6 w-12 h-12 bg-red-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3"/></svg>
            </button>
          </div>
        )}

        {activeView === MonitorView.ComPort && (
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
            <div className="p-3 bg-gray-900/60 border-b border-white/5">
               <div className="flex justify-between items-center mb-2">
                 <h4 className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Console</h4>
                 <button onClick={() => { setEditingCom(null); setIsComDialogOpen(true); }} className="text-[8px] font-black text-red-500 uppercase">Add Key</button>
               </div>
               <div className="grid grid-cols-3 gap-1.5 max-h-[140px] overflow-y-auto monitor-scroll">
                  {props.comButtons.map(btn => (
                    <button key={btn.id} onClick={() => props.onComButtonPress(btn)} className="h-12 bg-gray-800 border border-white/5 rounded-lg flex flex-col items-center justify-center active:bg-red-600 transition-all">
                      <span className="text-[9px] font-black text-white truncate px-1">{btn.name}</span>
                      <span className="text-[7px] font-mono text-gray-500">{btn.command}</span>
                    </button>
                  ))}
               </div>
            </div>
            <div className="px-3 py-2">
               <input type="text" placeholder="CMD..." className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-[12px] font-mono text-white focus:border-red-600 outline-none" onKeyDown={(e) => { if(e.key === 'Enter'){ props.onSendCommand((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} />
            </div>
            <div className="flex-1 bg-black p-3 font-mono text-[10px] overflow-y-auto monitor-scroll">
               {props.comLogs.map((log, i) => <div key={i} className={`mb-1 leading-none text-[12px] ${log.includes('TX →') ? 'text-blue-500' : 'text-green-500'}`}>{log}</div>)}
               <div ref={comLogEndRef} />
            </div>
          </div>
        )}

        {activeView === MonitorView.Graph && <GraphView messages={props.messages} />}
        {activeView === MonitorView.Logic && (
          <div className="flex-1 p-4 overflow-y-auto monitor-scroll text-center text-gray-500 text-[10px] uppercase">
             Вкладка логики в разработке
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-900 border-t border-white/5 shrink-0">
         <button onClick={props.onDisconnect} className="w-full py-2 bg-gray-800 text-gray-500 font-black rounded-lg text-[9px] uppercase tracking-[0.3em]">DISCONNECT</button>
      </div>

      {isTxDialogOpen && <TransmitDialog initialMsg={editingTx || { id: '', data: '', period: 100 }} onSave={(msg) => { props.onSaveTxMessage(editingTx ? { ...msg, id_key: editingTx.id_key } : msg); setIsTxDialogOpen(false); }} onClose={() => setIsTxDialogOpen(false)} />}
      {isComDialogOpen && <ComButtonDialog initialBtn={editingCom || { name: '', command: '', mode: 'text', repeatCount: 1, repeatPeriod: 0 }} onSave={(btn) => { if(editingCom) props.onUpdateComButtons(props.comButtons.map(b=>b.id===editingCom.id?{...btn, id:b.id}:b)); else props.onUpdateComButtons([...props.comButtons, {...btn, id:Date.now().toString()}]); setIsComDialogOpen(false); }} onClose={() => setIsComDialogOpen(false)} />}
    </div>
  );
};

export default CanMonitor;