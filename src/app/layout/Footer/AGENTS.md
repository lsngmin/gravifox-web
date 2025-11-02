> 📆 최종 수정일: 2025-11-03 01:42

## ⚠️ 작업 제한 및 수정 권한 규칙

- 해당 디렉터리(`src/app/layout/Footer`)의 작업 루트는 `Footer.jsx`. 오직 이 파일만이 실제로 앱에서 렌더링되는 최종 컴포넌트이다.

- `Footer.jsx`를 제외한 모든 `*.jsx` 파일(`FooterThemeButton.jsx`, `FooterLanguageButton.jsx`, `FooterNavLinks.jsx`, `FooterActions.jsx`, `FooterCopyright.jsx` 등)은  
  **오직 `Footer.jsx` 안에서만 사용해야 해.**  
  다른 경로나 모듈에서 이 파일들을 import하거나 참조하면 안 돼.

- 각 파일의 역할은 이미 정의돼 있으니까,  
  **그 역할을 벗어난 코드 수정이나 기능 추가는 절대 하지 마.**

- 만약 역할 밖의 코드를 수정하거나 새 기능을 넣어야 한다면,  
  **바로 작업 중단하고 사람한테 “이거 수정해도 되냐” 물어봐.**  
  허락 없이는 절대 진행하지 마.

- 이 규칙은 **AI, 자동화 스크립트, 코드 생성 도구 전부**에게 적용돼.  
  지침 위반 시엔 추가 코드 생성이나 수정 없이 즉시 멈춰야 해.
