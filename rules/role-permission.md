03_ROLE_PERMISSION.md
WorkFlow Hub - 권한 정의서
목적
본 문서는 WorkFlow Hub 서비스의 역할별 권한을 정의한다.
모든 기능은 본 권한 정책을 기준으로 구현한다.

권한 레벨
권한
설명
Owner
서비스 최고 관리자
Manager
팀 관리자
Member
일반 사용자

프로세스 관리 권한
기능
Owner
Manager
Member
프로세스 템플릿 조회
O
O
X
프로세스 템플릿 생성
O
O
X
프로세스 템플릿 수정
O
본인 등록 템플릿만
X
프로세스 템플릿 비활성화
O
본인 등록 템플릿만
X
프로세스 단계 완료 처리
O
O
X

업무카테고리 권한
기능
Owner
Manager
Member
조회
O
O
O
생성
O
X
X
수정
O
X
X
비활성화
O
X
X

업무요청 권한
조회
기능
Owner
Manager
Member
전체 업무요청 조회
O
X
X
팀 업무요청 조회
O
O
O

생성
기능
Owner
Manager
Member
업무요청 생성
O
O
X

수락 / 거절
기능
Owner
Manager
Member
본인 요청 수락
O
O
O
본인 요청 거절
O
O
O
타인 요청 수락
X
X
X
타인 요청 거절
X
X
X

업무항목 권한
생성
기능
Owner
Manager
Member
직접 생성
O
O
O
업무요청 기반 생성
O
O
O

수정
기능
Owner
Manager
Member
업무명 수정
O
O
본인 생성 업무만
시작일 수정
O
O
본인 생성 업무만
마감일 수정
O
O
본인 생성 업무만
업무유형 수정
O
O
본인 생성 업무만

삭제
Home / Weekly Tasks
기능
Owner
Manager
Member
업무항목 삭제
O
O
본인 생성 업무만

Calendar
기능
Owner
Manager
Member
업무항목 삭제
O
O
X

참여자 권한
기능
Owner
Manager
Member
참여자 조회
O
O
O
참여자 추가
O
O
X
참여자 제거
O
O
X

작업세션 권한
생성
기능
Owner
Manager
Member
작업세션 생성
O
O
O

수정
기능
Owner
Manager
Member
업무카테고리 변경
O
O
본인 작업세션만
세부업무명 변경
O
O
본인 작업세션만
시작시간 변경
O
O
본인 작업세션만
종료시간 변경
O
O
본인 작업세션만
완료 상태 변경
O
O
본인 작업세션만

삭제
기능
Owner
Manager
Member
작업세션 삭제
O
O
본인 작업세션만

캘린더 권한
Team 필터
기능
Owner
Manager
Member
조회
O
O
O
수정
O
O
X
삭제
O
O
X

My 필터
모든 사용자는 본인이 참여 중인 일정만 조회할 수 있다.
My 필터는 조회 기능이며 수정 권한과는 무관하다.

회의 권한
회의 생성
기능
Owner
Manager
Member
회의 생성
O
O
O

회의 참여자 관리
기능
Owner
Manager
Member
참여자 추가
O
O
X
참여자 제거
O
O
X
※ 회의 생성자는 본인 회의에 한하여 참여자 관리 가능

회의록 조회
기능
Owner
Manager
Member
전체 회의록 조회
O
X
X
소속 팀 회의록 조회
O
O
O
상세 회의록 열람
O
O
O

팀원 업무 현황 권한
기능
Owner
Manager
Member
조회
O
O
O
타인 데이터 수정
O
O
X

연차 권한
조회
기능
Owner
Manager
Member
전체 연차 조회
O
X
X
팀 연차 조회
O
O
X
본인 연차 조회
O
O
O
연차 사유 조회
O
O
본인만

신청
기능
Owner
Manager
Member
연차 신청
O
O
O
연차 취소
O
O
O

승인
기능
Owner
Manager
Member
연차 승인
O
O
X
연차 반려
O
O
X

알림 권한
기능
Owner
Manager
Member
업무요청 알림 수신
O
O
O
업무수정 알림 수신
O
O
O
업무항목 참여자 변경 알림 수신
O
O
O
연차 승인 알림 수신
O
O
O
연차 반려 알림 수신
O
O
O
회의 참여자 변경 알림 수신
O
O
O



