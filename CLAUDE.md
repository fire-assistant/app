# 작업 원칙

- 파일 열람 권한은 이미 부여돼 있음. 재요청 금지.
- 단순 변경(CSS 한 줄, 스크롤 수정 등)에 Agent/Explore 서브에이전트 사용 금지. Grep/Glob/Read로 바로 찾을 것.
- 요청 범위만 수정. 요청하지 않은 리디자인·리팩토링·색상 변경 등 금지.
- 관련 파일을 바로 열고 해당 부분만 수정할 것.

## 탐색기 3종 (app.js에 multiuse/다중이용업소 코드 보여도 혼동 말 것)

- **소방시설 탐색기** = `steps[]` / `getActiveSteps()` / `state`. 간단(default)·연도별(자세한) 버전. 다중이용업소 질문 안 나옴.
- **다중이용업소 탐색기** = 별도 메뉴(multiuse-only 모드), `multiuseSteps[]` 사용. 다중이용업소 질문은 여기 전용.
- **연도별 탐색기** = `yearSteps[]` / `yearState`, `y` 접두사. 자체 다중이용업소 복제본(`yMultiuse*`, `yLodgingMultiuse*`) 보유.
- 즉 "소방시설 탐색기" 작업 시 multiuse 코드는 대개 무관함.
