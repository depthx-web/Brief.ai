'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchMyTeam,
  createTeam,
  inviteTeamMember,
  revokeInvitation,
  setMemberBudget,
  setCanShareProjects,
  fetchMemberProjects,
  setProjectVisibility,
  type MyTeam,
  type TeamMemberSummary,
  type MemberProject,
} from '@/lib/teamApi';
import { showError, showSuccess } from '@/lib/toast';
import { useLocale } from '@/lib/i18n/LocaleContext';

export default function TeamSettings() {
  const { user, token } = useAuth();
  const { t } = useLocale();
  const [team, setTeam] = useState<MyTeam | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [managingMember, setManagingMember] = useState<TeamMemberSummary | null>(null);

  function load() {
    if (!token) return;
    fetchMyTeam(token)
      .then(setTeam)
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('team.couldNotLoad'));
        setTeam(null);
      });
  }

  useEffect(load, [token]);

  if (team === undefined) return null;

  return (
    <section className="mt-8 border-t border-[#EEF1F4] pt-8">
      <h2 className="font-serif text-lg font-semibold text-navy">{t('settings.team')}</h2>
      {error && <p className="mt-2 text-sm text-redline">{error}</p>}

      {!team ? (
        <CreateTeamCard isPaid={user?.plan === 'PAID'} onCreated={load} />
      ) : (
        <TeamCard team={team} onChanged={load} onManageMember={setManagingMember} />
      )}

      {managingMember && team && (
        <MemberDrawer
          teamId={team.id}
          member={managingMember}
          onClose={() => setManagingMember(null)}
          onChanged={load}
        />
      )}
    </section>
  );
}

function CreateTeamCard({ isPaid, onCreated }: { isPaid: boolean; onCreated: () => void }) {
  const { token } = useAuth();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    if (!token || !name.trim()) return;
    setIsCreating(true);
    try {
      await createTeam(token, name.trim());
      showSuccess(t('team.teamCreated'));
      onCreated();
    } catch (err) {
      showError(err instanceof Error ? err.message : t('team.couldNotCreateTeam'));
    } finally {
      setIsCreating(false);
    }
  }

  if (!isPaid) {
    return (
      <p className="mt-2 text-sm text-ink-soft">
        {t('team.paidPlanRequired')}
      </p>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('team.teamNamePlaceholder')}
        className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        onClick={handleCreate}
        disabled={isCreating || !name.trim()}
        className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isCreating ? t('team.creating') : t('team.createTeam')}
      </button>
    </div>
  );
}

function TeamCard({
  team,
  onChanged,
  onManageMember,
}: {
  team: MyTeam;
  onChanged: () => void;
  onManageMember: (m: TeamMemberSummary) => void;
}) {
  const { token } = useAuth();
  const { t, locale } = useLocale();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !inviteEmail.trim()) return;
    setIsInviting(true);
    try {
      await inviteTeamMember(token, team.id, inviteEmail.trim());
      showSuccess(t('team.invitationSent'));
      setInviteEmail('');
      onChanged();
    } catch (err) {
      showError(err instanceof Error ? err.message : t('team.couldNotSendInvitation'));
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!token) return;
    try {
      await revokeInvitation(token, id);
      showSuccess(t('team.invitationRevoked'));
      onChanged();
    } catch (err) {
      showError(err instanceof Error ? err.message : t('team.couldNotRevokeInvitation'));
    }
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-ink">{team.name}</p>

      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {team.members.map((m) => (
          <div key={m.userId} className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-sm last:border-b-0">
            <div>
              <p className="text-ink">{m.name || m.email}</p>
              <p className="text-xs text-ink-soft">
                {m.role === 'OWNER' ? t('team.roleOwner') : t('team.roleMember')} ·{' '}
                {t('team.joined').replace('{date}', new Date(m.joinedAt).toLocaleDateString(locale))}
                {m.monthlyUsage !== null &&
                  ` · ${t(m.monthlyUsage === 1 ? 'team.creditsThisMonthSingular' : 'team.creditsThisMonthPlural').replace('{n}', String(m.monthlyUsage))}`}
              </p>
            </div>
            {team.isOwner && m.role !== 'OWNER' && (
              <button onClick={() => onManageMember(m)} className="text-xs font-medium text-navy hover:text-emerald">
                {t('team.manage')}
              </button>
            )}
          </div>
        ))}
      </div>

      {team.isOwner && (
        <div className="mt-6">
          <form onSubmit={handleInvite} className="flex items-center gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={t('team.teammateEmailPlaceholder')}
              className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={isInviting || !inviteEmail.trim()}
              className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isInviting ? t('settings.sending') : t('team.sendInvite')}
            </button>
          </form>

          {team.invitations.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
              {team.invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 text-sm last:border-b-0">
                  <div>
                    <p className="text-ink">{inv.email}</p>
                    <p className="text-xs text-ink-soft">
                      {t('team.sentPending').replace('{date}', new Date(inv.createdAt).toLocaleDateString(locale))}
                    </p>
                  </div>
                  <button onClick={() => handleRevoke(inv.id)} className="text-xs font-medium text-redline hover:underline">
                    {t('team.revoke')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MemberDrawer({
  teamId,
  member,
  onClose,
  onChanged,
}: {
  teamId: string;
  member: TeamMemberSummary;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { token } = useAuth();
  const { t } = useLocale();
  const [budgetDraft, setBudgetDraft] = useState(member.tokenBudgetOverride?.toString() ?? '');
  const [canShare, setCanShare] = useState(member.canShareProjects);
  const [projects, setProjects] = useState<MemberProject[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchMemberProjects(token, teamId, member.userId)
      .then(setProjects)
      .catch(() => setProjects([]));
  }, [token, teamId, member.userId]);

  async function handleSaveBudget() {
    if (!token) return;
    setIsSaving(true);
    try {
      const value = budgetDraft.trim() === '' ? null : Number(budgetDraft);
      await setMemberBudget(token, teamId, member.userId, Number.isFinite(value) ? value : null);
      showSuccess(t('projectDetail.savedSuccess'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('team.couldNotSaveBudget'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleShare() {
    if (!token) return;
    const next = !canShare;
    setCanShare(next);
    try {
      await setCanShareProjects(token, teamId, member.userId, next);
    } catch (err) {
      setCanShare(!next);
      showError(err instanceof Error ? err.message : t('team.couldNotUpdateSetting'));
    }
  }

  async function handleToggleProjectVisibility(project: MemberProject) {
    if (!token) return;
    const next = project.visibility === 'PRIVATE' ? 'SHARED_WITH_TEAM' : 'PRIVATE';
    try {
      await setProjectVisibility(token, project.id, next);
      setProjects((prev) => prev?.map((p) => (p.id === project.id ? { ...p, visibility: next } : p)) ?? null);
      onChanged();
    } catch (err) {
      showError(err instanceof Error ? err.message : t('team.couldNotUpdateProject'));
    }
  }

  return (
    <Dialog.Root open onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed end-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-level-3">
          <Dialog.Title className="font-serif text-lg font-semibold text-navy">{member.name || member.email}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">{member.email}</Dialog.Description>

          <div className="mt-6">
            <label className="block text-sm font-medium text-ink">{t('team.monthlyBudgetCap')}</label>
            <p className="mt-1 text-xs text-ink-soft">{t('team.leaveBlankNoCap')}</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={budgetDraft}
                onChange={(e) => setBudgetDraft(e.target.value)}
                placeholder={t('team.noCap')}
                className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                onClick={handleSaveBudget}
                disabled={isSaving}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {t('common.save')}
              </button>
            </div>
          </div>

          <label className="mt-6 flex items-center justify-between gap-3 border-t border-[#EEF1F4] pt-6">
            <span className="text-sm font-medium text-ink">{t('team.allowShareOwnProjects')}</span>
            <button
              onClick={handleToggleShare}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${canShare ? 'bg-emerald' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  canShare ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>

          <div className="mt-6 border-t border-[#EEF1F4] pt-6">
            <p className="text-sm font-medium text-ink">{t('team.projectsHeading')}</p>
            <p className="mt-1 text-xs text-ink-soft">
              {t('team.projectsShareExplanation')}
            </p>
            <div className="mt-3 space-y-2">
              {projects === null ? (
                <p className="text-sm text-ink-soft">{t('common.loading')}</p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-ink-soft">{t('team.noProjectsYet')}</p>
              ) : (
                projects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm">
                    <span className="truncate text-ink">{p.name}</span>
                    <button
                      onClick={() => handleToggleProjectVisibility(p)}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        p.visibility === 'SHARED_WITH_TEAM' ? 'bg-emerald-soft text-emerald' : 'bg-gray-100 text-ink-soft'
                      }`}
                    >
                      {p.visibility === 'SHARED_WITH_TEAM' ? t('team.sharedArrow') : t('team.privateArrow')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button onClick={onClose} className="mt-8 text-sm font-medium text-ink-soft hover:text-ink">
            {t('wallet.close')}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
