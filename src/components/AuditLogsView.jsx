import React, { useState, useEffect } from 'react';
import { usePos } from '../context/PosContext';
import { 
  ShieldCheck, AlertOctagon, Terminal, Copy, 
  Check, Filter, RefreshCw, Cpu, Database 
} from 'lucide-react';

export default function AuditLogsView() {
  const { notifySuccess, notifyError } = usePos();
  const [activeSubTab, setActiveSubTab] = useState('AUDIT'); // 'AUDIT' or 'ERRORS' or 'HEALTH'
  const [auditLogs, setAuditLogs] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const [resAudit, resErr, resHealth] = await Promise.all([
        fetch('/api/audit-logs'),
        fetch('/api/error-logs'),
        fetch('/api/system/health')
      ]);

      if (resAudit.ok) setAuditLogs(await resAudit.json());
      if (resErr.ok) setErrorLogs(await resErr.json());
      if (resHealth.ok) setHealthData(await resHealth.json());
    } catch (e) {
      console.error('Failed fetching logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCopyError = (err) => {
    const errorDetails = `
--- POS RUNTIME ERROR DIAGNOSTIC REPORT ---
Error ID:   ${err.id}
Timestamp:  ${err.timestamp}
Code:       ${err.code}
Severity:   ${err.severity}
Category:   ${err.category}
Cashier:    ${err.user}
Message:    ${err.message}
Context:    ${JSON.stringify(err.context, null, 2)}
Stack:
${err.stack || 'No trace recorded'}
------------------------------------------
    `.trim();

    navigator.clipboard.writeText(errorDetails);
    setCopiedId(err.id);
    notifySuccess('Error diagnostic details copied to clipboard!');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const filteredAudit = auditLogs.filter(log => {
    if (actionFilter === 'All') return true;
    return log.action === actionFilter;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-100 p-4 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 rounded-xl text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 leading-tight">System Audit & Runtime Diagnostics</h1>
            <p className="text-xs text-slate-500">Immutable ledger of sensitive cashier actions, security guardrails, and error traces</p>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('AUDIT')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'AUDIT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Trail ({auditLogs.length})
            </button>
            <button
              onClick={() => setActiveSubTab('ERRORS')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'ERRORS' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              Runtime Errors ({errorLogs.length})
            </button>
            <button
              onClick={() => setActiveSubTab('HEALTH')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'HEALTH' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Server Health
            </button>
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* SUBTAB 1: AUDIT TRAIL */}
        {activeSubTab === 'AUDIT' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Filters */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2 text-xs overflow-x-auto">
              {['All', 'CHECKOUT_COMPLETED', 'WALLET_TOPUP', 'TRANSACTION_VOIDED', 'PORTION_RESTOCK', 'SHIFT_OPENED', 'SHIFT_CLOSED_RECONCILED'].map(action => (
                <button
                  key={action}
                  onClick={() => setActionFilter(action)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    actionFilter === action 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Audit Logs List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredAudit.map(log => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors text-xs flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-700">
                        by {log.user} ({log.role})
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-800 font-medium text-xs">
                      {log.details}
                    </p>
                    {log.targetId && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Target: {log.targetType} #{log.targetId}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 2: RUNTIME & ERROR LOGS */}
        {activeSubTab === 'ERRORS' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {errorLogs.length === 0 ? (
              <div className="text-center py-12 text-emerald-600">
                <Check className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
                <p className="font-bold">Zero runtime exceptions recorded</p>
                <p className="text-xs text-slate-400 mt-0.5">All atomic transactions and safety checks completed cleanly.</p>
              </div>
            ) : (
              errorLogs.map(err => (
                <div key={err.id} className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-red-600 text-white font-mono font-bold rounded text-[10px]">
                        {err.code}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {err.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(err.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyError(err)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-300 text-xs flex items-center gap-1 shadow-sm transition-colors"
                      title="Copy stack trace and context for debugging"
                    >
                      {copiedId === err.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === err.id ? 'Copied!' : 'Copy Error Details'}</span>
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-red-950">
                    {err.message}
                  </p>

                  {/* Context and Stack */}
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1">
                    {err.context && Object.keys(err.context).length > 0 && (
                      <div className="text-amber-400 text-[10px]">
                        Context: {JSON.stringify(err.context)}
                      </div>
                    )}
                    <pre className="text-slate-400 text-[10px] whitespace-pre-wrap leading-tight">
                      {err.stack || 'No stack trace'}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUBTAB 3: SYSTEM HEALTH */}
        {activeSubTab === 'HEALTH' && healthData && (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-xs font-bold uppercase text-emerald-800">System Status</span>
                <span className="text-2xl font-black text-emerald-700 block mt-1">ONLINE</span>
                <span className="text-[11px] text-emerald-600 mt-1 block">Uptime: {healthData.uptimeSeconds}s</span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-xs font-bold uppercase text-slate-600">Node Memory Usage</span>
                <span className="text-2xl font-black text-slate-800 block mt-1">{healthData.memoryUsageMB} MB</span>
                <span className="text-[11px] text-slate-400 mt-1 block">V8 Heap Allocation</span>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <span className="text-xs font-bold uppercase text-blue-800">Active Students</span>
                <span className="text-2xl font-black text-blue-700 block mt-1">{healthData.database.studentsCount}</span>
                <span className="text-[11px] text-blue-500 mt-1 block">Enrolled in school registry</span>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                <span className="text-xs font-bold uppercase text-purple-800">Menu Items</span>
                <span className="text-2xl font-black text-purple-700 block mt-1">{healthData.database.menuItemsCount}</span>
                <span className="text-[11px] text-purple-500 mt-1 block">Cafeteria & Tuck items</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Database className="w-4 h-4 text-slate-600" /> Database & Storage Diagnostic Info
              </h3>
              <p className="text-slate-600">
                School POS uses an atomic persistent storage engine with auto-flushing to disk and immediate rollback guarantees on failed checkouts.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Total Receipts Logged</span>
                  <span className="font-bold text-sm text-slate-800">{healthData.database.transactionsCount}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Audit Events Preserved</span>
                  <span className="font-bold text-sm text-slate-800">{healthData.database.auditLogsCount}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Engine Build Version</span>
                  <span className="font-bold text-sm text-slate-800">{healthData.version}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
