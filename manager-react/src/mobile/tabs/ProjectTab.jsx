// 프로젝트 탭 — Figma "project-list" 설계도 반영.
// 카드: 제목 + 상태배지 + 기간 + N% 완료 진행바 + 참여자 아바타 그룹. 지연→진행중→시작전 정렬.
import { ProgressBar, Badge } from '../ui'
import { COLOR, avatarColor } from '../theme'
import { getProjects, sortProjects } from '../derive'

const mmdd = iso => { const [, m, d] = iso.split('-'); return `${+m}/${+d}` }
const STATUS_LABEL = { '지연': '지연 중', '진행 중': '진행 중', '시작 전': '대기 중' }
const statusTone = s => s === '지연' ? 'danger' : s === '진행 중' ? 'primary' : 'muted'

function AvatarStack({ people }) {
  const shown = people.slice(0, 3)
  const extra = people.length - shown.length
  return (
    <div className="flex items-center">
      {shown.map((p, i) => (
        <span
          key={i}
          className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface text-[10px] font-semibold text-white first:ml-0"
          style={{ background: avatarColor(i) }}
        >
          {(p.name || p || '?').slice(0, 1)}
        </span>
      ))}
      {extra > 0 && <span className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-surface-hover text-[10px] font-semibold text-muted">+{extra}</span>}
    </div>
  )
}

function ProjectCard({ project, onOpen }) {
  const tone = statusTone(project.status)
  const color = tone === 'danger' ? COLOR.danger : tone === 'primary' ? COLOR.primary : COLOR.muted
  const people = project.participants || []
  return (
    <button onClick={() => onOpen(project.id)} className="w-full rounded-xl border border-line bg-surface p-4 text-left active:bg-surface-hover">
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="text-[15px] font-bold text-text-primary">{project.title}</span>
        <Badge tone={tone}>{STATUS_LABEL[project.status] || project.status}</Badge>
      </div>
      <div className="mb-3 text-xs text-muted">
        {project.start ? `${mmdd(project.start)} ~ ${mmdd(project.end)}` : `~ ${mmdd(project.end)}`}
      </div>
      <div className="mb-1.5 text-xs font-semibold" style={{ color }}>{project.progress}% 완료</div>
      <div className="mb-3"><ProgressBar pct={project.progress} /></div>
      <div className="flex justify-end">
        <AvatarStack people={people} />
      </div>
    </button>
  )
}

export default function ProjectTab({ workItems, sessions, onOpenProject }) {
  const projects = sortProjects(getProjects(workItems, sessions))
  return (
    <div className="flex flex-col gap-3 px-5 pb-8 pt-4">
      {projects.map(p => <ProjectCard key={p.id} project={p} onOpen={onOpenProject} />)}
    </div>
  )
}
