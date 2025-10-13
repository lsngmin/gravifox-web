# 모바일 분석 UI 테스트 가이드

테스트 모드는 실서비스 API 호출 없이 업로드/결과 화면을 점검할 수 있도록 더미 데이터를 제공합니다. 아래 안내를 참고해 테스트 플로우를 구성하세요.

## 테스트 모드 진입 방법

1. 주소창에 `uiTest=1` 쿼리를 추가합니다.
   - 예) `/analyze/upload?uiTest=1&scenario=happy-path`
2. 또는 개발자 도구에서 `localStorage.setItem('gravifox:analyze:uiTest', '1')`을 실행합니다.
   - `localStorage.removeItem('gravifox:analyze:uiTest')`로 해제할 수 있습니다.

시나리오는 `scenario` 쿼리나 `localStorage.setItem('gravifox:analyze:uiTestScenario', '<scenario>')`로 지정할 수 있습니다. 쿼리 값이 우선 적용되며, 지정하지 않으면 마지막에 사용한 시나리오가 유지됩니다.

## 지원 시나리오

| 시나리오 키 | 설명 | 기본 jobIds |
| --- | --- | --- |
| `happy-path` | 두 개의 업로드가 모두 성공해 리포트를 확인할 수 있어요. | `demo-happy-1,demo-happy-2` |
| `partial-failure` | 첫 번째는 성공, 두 번째는 실패 메시지가 표시돼요. | `demo-partial-1,demo-partial-2` |
| `upload-error` | 업로드 단계에서 오류가 발생해 분석이 시작되지 않아요. | (없음) |
| `quota-exhausted` | 잔여 횟수가 0으로 표시돼 업로드 전에 차단돼요. | `demo-quota-1` |
| `email-unverified` | 이메일 미인증 안내 모달을 확인할 수 있어요. | `demo-email-1` |

### 결과 화면 바로 보기

업로드 단계를 거치지 않고도 세션 스토리지에 더미 데이터가 채워집니다. 아래 예시처럼 접근하면 곧바로 결과 화면을 확인할 수 있어요.

```
/analyze/result?uiTest=1&scenario=partial-failure&jobIds=demo-partial-1,demo-partial-2
```

시나리오에서 정의한 `jobIds`를 사용하면 컨텍스트가 세션 스토리지에 리포트/실패 데이터를 자동으로 기록해 기존 UI 로직이 그대로 작동합니다.

## 참고

- 테스트 모드에서는 모델 목록, 잔여 쿼터, 업로드 응답이 모두 즉시 반환되는 더미 데이터로 대체돼요.
- 실서비스 모드로 돌아가려면 `uiTest=0` 쿼리를 추가하거나, 위에 안내한 로컬 스토리지 키를 삭제하세요.
