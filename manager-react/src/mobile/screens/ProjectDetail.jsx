// 프로젝트 상세 (F-FQCGEL / S-GGWWSD) — 보기 전용.
// 간트차트 대신 프로세스 단계별 세로 리스트(단계명/담당자/완료여부).
import { ProgressBar, Badge, ViewOnlyNote } from '../ui'
import { COLOR, PROJECT_STATUS } from '../theme'
import { getProjects, stepState } from '../derive'
import { processes } from '../../data/state'

const STATE_META = {
  '완료': { tone: 'success', dot: COLOR.success },
  '진행': { tone: 'primary', dot: COLOR.primary },
  '대기': { tone: 'muted', dot: '#c7c7d1' },
}

export default function ProjectDetail({ projectId, workItems, sessions }) {
  const project = getProjects(workItems, sessions).find(p => p.id === projectId)
  if (!project) return null
  const ps = PROJECT_STATUS[project.status]
  const wi = workItems.find(w => w.id === projectId)
  const proc = wi?.processId ? processes.find(p => p.id === wi.processId) : null

  return (
    <div className="pb-6 pt-3">
      <ViewOnlyNote />
      <div className="mx-4 mb-4 rounded-[14px] border border-line bg-surface p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="text-base font-bold text-text-primary">{project.title}</span>
          <Badge tone={project.status === '지연' ? 'danger' : project.status === '진행 중' ? 'primary' : 'muted'}>{project.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1"><ProgressBar pct={project.progress} /></div>
          <span className="text-xs font-bold" style={{ color: ps.color }}>{project.progress}%</span>
        </div>
        <div className="mt-2 text-xs text-muted">담당 {project.participants.join(', ')} · 납기 {project.end?.slice(5)}</div>
      </div>

      <div className="px-4">
        <h3 className="mb-2 text-sm font-bold text-text-primary">진행 단계</h3>
        {!proc ? (
          <div className="text-xs text-muted">프로세스가 지정되지 않은 프로젝트입니다.</div>
        ) : (
          <div className="space-y-0">
            {proc.steps.map((step, i) => {
              const st = stepState(projectId, step.id, sessions)
              const meta = STATE_META[st]
              const assignees = wi.stepAssignees?.[step.id] || []
              const isLast = i === proc.steps.length - 1
              return (
                <div key={step.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: meta.dot }} />
                    {!isLast && <span className="my-0.5 w-px flex-1 bg-line" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm ${st === '대기' ? 'text-soft' : 'font-medium text-text-primary'}`}>{step.title}</span>
                      <Badge tone={meta.tone}>{st}</Badge>
                    </div>
                    {assignees.length > 0 && (
                      <div className="mt-0.5 text-xs text-muted">{assignees.join(', ')}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
