# WorkFlow Hub

디자인 조직의 보이지 않는 업무를 데이터로 가시화하는 운영 분석 플랫폼.

WorkFlow Hub는 단순 업무 관리 툴이 아니라 업무 데이터를 수집하고 분석하는 SaaS이다. 업무항목, 작업세션, 업무시간 기록을 기반으로 조직 운영 데이터를 만든다.

## 핵심 문서

- [개발 인수인계 요약](context/handoff-summary.md)
- [용어 정의](context/glossary.md)
- [정보 구조](context/information-architecture.md)
- [운영 정책](rules/policy.md)
- [역할별 권한](rules/role-permission.md)
- [기획용 데이터 모델](knowledge/data-model.md)
- [MVP Backlog](tasks/mvp-backlog.md)
- [Wireframes](wireframes/README.md)
- [Home Prototype](app/README.md)
- [Home 기능 명세](knowledge/features/home-feature-spec.md)

## 폴더 구조

```txt
vibe-projects/
  README.md
  PLAN.md
  DESIGN.md
  CLAUDE.md
  INTERVIEW.md
  agents/
  context/
  rules/
  knowledge/
    features/
  tasks/
  workflows/
  outputs/
  wireframes/
  app/
  sources/
    original-docx/
```

## 제품 원칙

- 업무항목은 프로젝트 역할을 수행하지만 별도 프로젝트 엔티티는 없다.
- 업무항목에는 완료 상태가 없다. 완료 처리는 작업세션에서만 한다.
- 업무요청 수락 후 업무항목은 자동 생성하지 않는다.
- 업무요청은 전달 팀으로 수신되고, 전달 팀의 Manager가 담당자를 배정한다.
- Calendar에는 업무항목과 회의만 표시한다.
- My Page에는 연차 현황을 포함하지 않는다.
- My Page 작업 히스토리 캘린더에는 연차 상태 표시만 허용한다.
- 연차 신청, 승인, 이력, 총/사용/잔여 연차 현황은 Leave Management에서 관리한다.
