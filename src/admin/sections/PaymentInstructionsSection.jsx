import React, { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCcw, Landmark, Pencil, Trash2, Loader2 } from 'lucide-react';
import { fetchAllPaymentInstructions, upsertPaymentInstruction, togglePaymentInstructionActive, deletePaymentInstruction, maskAccount } from '../../services/payments';
import { formatInt, formatDateTime } from '../format';
import { PageHead, EmptyState, Modal } from '../ui';
import { useLang } from '../../context/LangContext';

const CURRENCIES = ['EUR', 'MGA', 'MUR'];
const METHODS = ['bank_transfer', 'mobile_money', 'cash'];

const PaymentInstructionsSection = () => {
  const { t, lang } = useLang();
  const [instructions, setInstructions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoadingData(true);
    const data = await fetchAllPaymentInstructions();
    setInstructions(data);
    setLoadingData(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (instr) => {
    const res = await togglePaymentInstructionActive(instr.id, !instr.active);
    if (res.ok) load();
  };

  const remove = async (instr) => {
    if (!window.confirm(t('admin.paymentInstructions.deleteConfirm', { name: instr.bankOrOperator }))) return;
    const res = await deletePaymentInstruction(instr.id);
    if (res.ok) load();
  };

  if (loadingData) return <InstructionsSkeleton />;

  return (
    <div>
      <PageHead
        eyebrow={t('admin.nav.system')}
        title={t('admin.paymentInstructions.title')}
        subtitle={t('admin.paymentInstructions.subtitle', { count: formatInt(instructions.length) })}
        actions={
          <>
            <button className="adm-btn adm-btn--ghost" onClick={load}>
              <RefreshCcw size={14} strokeWidth={1.75} /> {t('admin.refunds.refresh')}
            </button>
            <button className="adm-btn adm-btn--primary" onClick={() => setEditing({})}>
              <Plus size={15} strokeWidth={1.75} /> {t('admin.paymentInstructions.add')}
            </button>
          </>
        }
      />

      <div className="adm-panel">
        {instructions.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title={t('admin.paymentInstructions.emptyTitle')}
            text={t('admin.paymentInstructions.emptyText')}
          />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>{t('admin.paymentInstructions.colMethod')}</th>
                  <th>{t('admin.paymentInstructions.colBeneficiary')}</th>
                  <th>{t('admin.paymentInstructions.colAccount')}</th>
                  <th>{t('admin.paymentInstructions.colCurrency')}</th>
                  <th>{t('admin.paymentInstructions.colActive')}</th>
                  <th>{t('admin.paymentInstructions.colUpdated')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {instructions.map((instr) => (
                  <tr key={instr.id}>
                    <td>
                      <span className="adm-badge adm-badge--amber">
                        {t('payment.method.' + instr.paymentMethod)}
                      </span>
                    </td>
                    <td>
                      <div className="adm-prod-meta">
                        <span className="adm-prod-name" style={{ fontSize: 13 }}>{instr.beneficiary}</span>
                        <span className="adm-prod-code">{instr.bankOrOperator} · {instr.country}</span>
                      </div>
                    </td>
                    <td className="adm-cell-dim" style={{ fontFamily: 'monospace' }}>{maskAccount(instr.accountNumber)}</td>
                    <td><span className="adm-badge adm-badge--blue">{instr.currency}</span></td>
                    <td>
                      {instr.active ? (
                        <span className="adm-badge adm-badge--green">{t('status.active')}</span>
                      ) : (
                        <span className="adm-badge adm-badge--neutral">{t('status.inactive')}</span>
                      )}
                    </td>
                    <td className="adm-cell-dim" style={{ whiteSpace: 'nowrap' }}>{formatDateTime(instr.updatedAt || instr.createdAt, lang)}</td>
                    <td>
                      <div className="adm-row-actions">
                        <button className="adm-action" title={t('common.edit')} onClick={() => setEditing(instr)}>
                          <Pencil size={14} strokeWidth={1.75} />
                        </button>
                        <button
                          className="adm-action"
                          title={instr.active ? t('admin.paymentInstructions.deactivate') : t('admin.paymentInstructions.activate')}
                          onClick={() => toggle(instr)}
                        >
                          <RefreshCcw size={14} strokeWidth={1.75} />
                        </button>
                        <button className="adm-action" title={t('common.delete')} onClick={() => remove(instr)}>
                          <Trash2 size={14} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <InstructionModal
          instruction={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
};

const InstructionModal = ({ instruction, onClose, onSaved }) => {
  const { t } = useLang();
  const [form, setForm] = useState({
    beneficiary: instruction?.beneficiary || '',
    paymentMethod: instruction?.paymentMethod || 'bank_transfer',
    bankOrOperator: instruction?.bankOrOperator || '',
    accountNumber: instruction?.accountNumber || '',
    currency: instruction?.currency || 'EUR',
    country: instruction?.country || 'MG',
    instructions: instruction?.instructions || '',
    active: instruction ? instruction.active : true,
    commissionRate: instruction?.commissionRate == null ? '' : String(instruction.commissionRate),
    payoutDelayDays: instruction?.payoutDelayDays != null ? String(instruction.payoutDelayDays) : '3',
    doubleValidationThreshold: instruction?.doubleValidationThreshold ? String(instruction.doubleValidationThreshold) : '0',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [k]: value }));
  };

  const save = async () => {
    setError('');
    if (!form.beneficiary.trim() || !form.bankOrOperator.trim() || !form.accountNumber.trim()) {
      setError(t('admin.paymentInstructions.requiredFields'));
      return;
    }
    setBusy(true);
    const res = await upsertPaymentInstruction({
      ...(instruction ? { id: instruction.id } : {}),
      beneficiary: form.beneficiary.trim(),
      paymentMethod: form.paymentMethod,
      bankOrOperator: form.bankOrOperator.trim(),
      accountNumber: form.accountNumber.trim(),
      currency: form.currency,
      country: form.country,
      instructions: form.instructions.trim(),
      active: form.active,
      commissionRate: form.commissionRate === '' ? null : Number(form.commissionRate),
      payoutDelayDays: Number(form.payoutDelayDays || 3),
      doubleValidationThreshold: Number(form.doubleValidationThreshold || 0),
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error?.message || t('admin.paymentInstructions.saveFailed'));
      return;
    }
    onSaved();
  };

  return (
    <Modal
      title={instruction ? t('admin.paymentInstructions.editTitle') : t('admin.paymentInstructions.newTitle')}
      subtitle={t('admin.paymentInstructions.modalSub')}
      onClose={onClose}
      maxWidth={640}
      footer={
        <>
          <button className="adm-btn adm-btn--ghost" onClick={onClose}>
            {t('common.close')}
          </button>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={busy} style={{ marginLeft: 'auto' }}>
            {busy ? <Loader2 size={14} style={{ animation: 'adm-spin 0.9s linear infinite' }} /> : null}
            {instruction ? t('common.save') : t('admin.paymentInstructions.create')}
          </button>
        </>
      }
    >
      <div className="adm-form-grid">
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.paymentInstructions.beneficiary')}</label>
          <input className="adm-input" style={{ width: '100%' }} value={form.beneficiary} onChange={set('beneficiary')} />
        </div>
        <div>
          <label className="adm-meta-label" style={{ marginBottom: 6 }}>{t('payment.method')}</label>
          <select className="adm-input" style={{ width: '100%' }} value={form.paymentMethod} onChange={set('paymentMethod')}>
            {METHODS.map((m) => (
              <option key={m} value={m}>{t('payment.method.' + m)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.paymentInstructions.bank')}</label>
          <input className="adm-input" style={{ width: '100%' }} value={form.bankOrOperator} onChange={set('bankOrOperator')} />
        </div>
        <div>
          <label className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.paymentInstructions.account')}</label>
          <input className="adm-input" style={{ width: '100%', fontFamily: 'monospace' }} value={form.accountNumber} onChange={set('accountNumber')} />
        </div>
        <div>
          <label className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.paymentInstructions.currency')}</label>
          <select className="adm-input" style={{ width: '100%' }} value={form.currency} onChange={set('currency')}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.paymentInstructions.country')}</label>
          <input className="adm-input" style={{ width: '100%' }} value={form.country} onChange={set('country')} maxLength={2} />
        </div>
        <div>
          <label className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.paymentInstructions.commission')}</label>
          <input className="adm-input" type="number" step="0.01" min="0" style={{ width: '100%' }} value={form.commissionRate} onChange={set('commissionRate')} placeholder="10" />
        </div>
        <div>
          <label className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.paymentInstructions.payoutDelay')}</label>
          <input className="adm-input" type="number" min="0" style={{ width: '100%' }} value={form.payoutDelayDays} onChange={set('payoutDelayDays')} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="adm-meta-label" style={{ marginBottom: 6 }}>{t('admin.paymentInstructions.details')}</label>
          <textarea className="adm-input" rows={3} style={{ width: '100%' }} value={form.instructions} onChange={set('instructions')} />
        </div>
        <label className="adm-setting-row" style={{ gridColumn: '1 / -1', border: '1px solid var(--adm-line)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active} onChange={set('active')} style={{ accentColor: 'var(--adm-bronze)' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.paymentInstructions.activeLabel')}</span>
        </label>
      </div>

      {error && (
        <p style={{ color: 'var(--danger, #b42318)', fontSize: 12.5, margin: '12px 0 0' }}>{error}</p>
      )}
    </Modal>
  );
};

const InstructionsSkeleton = () => (
  <div aria-hidden="true">
    <div style={{ marginBottom: 26 }}>
      <div className="adm-sk" style={{ width: 70, height: 11, marginBottom: 12 }} />
      <div className="adm-sk" style={{ width: 160, height: 24 }} />
    </div>
    <div className="adm-panel">
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px' }}>
          <div className="adm-sk" style={{ flex: 1, height: 12 }} />
          <div className="adm-sk" style={{ width: 90, height: 12 }} />
          <div className="adm-sk" style={{ width: 60, height: 22, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  </div>
);

export default PaymentInstructionsSection;