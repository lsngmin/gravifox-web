import React from 'react';

const tips = [
  { title: '판정 기준', body: "의심 확률이 임계값 이상이면 ‘FAKE’, 미만이면 ‘REAL’로 해석됩니다." },
  { title: '타임라인 해석', body: '값이 높을수록 의심도가 큽니다. 급상승 구간은 전후 프레임도 함께 확인하세요.' },
  { title: '입력 품질', body: '얼굴 크기·해상도·조명·가림(마스크/손) 등이 나쁘면 신뢰도가 떨어질 수 있어요.' },
  { title: '이미지 vs 영상', body: '단일 이미지보다 영상이 더 많은 근거를 제공합니다. 가능하면 영상을 업로드해 보세요.' },
  { title: '의사결정', body: '자동 분석 결과는 참고 자료입니다. 중요한 판단 전에는 추가 검증을 권장합니다.' },
];

function Dot({ style }) {
  return <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full" style={style}/>;
}

export default function HelpTips({ variant = 'A' }) {
  if (variant === 'A') {
    // 콜아웃 스트라이프
    return (
      <div className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">분석 리포트 활용 팁</p>
        <div className="mt-2 space-y-2">
          {tips.map((t, i) => (
            <div key={i} className="rounded-md border-l-4 bg-slate-50 p-3" style={{ borderLeftColor: 'var(--brand)' }}>
              <p className="text-sm font-medium text-slate-900">{t.title}</p>
              <p className="mt-0.5 text-sm leading-6 text-slate-700">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'B') {
    // 정의형 블록
    return (
      <div className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">결과 해석 가이드</p>
        <dl className="mt-3 divide-y divide-slate-100">
          {tips.map((t, i) => (
            <div key={i} className="grid grid-cols-3 gap-4 py-2">
              <dt className="col-span-1 text-sm font-semibold text-slate-900">{t.title}</dt>
              <dd className="col-span-2 text-sm leading-6 text-slate-700">{t.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (variant === 'C') {
    // 넘버 배지 리스트
    return (
      <div className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">분석 리포트 활용 순서</p>
        <div className="mt-2 space-y-2">
          {tips.map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ background: 'var(--brand)' }}>{i+1}</span>
              <p className="text-sm leading-6 text-slate-700"><span className="font-medium text-slate-900 mr-2">{t.title}</span>{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'D') {
    // 미니 카드 그리드
    return (
      <div className="mx-auto w-full max-w-5xl">
        <p className="mb-2 text-sm font-medium text-slate-900">분석 리포트 활용 팁</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tips.map((t, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'E') {
    // Do / Don't 2컬럼
    const doTips = [tips[1], tips[3]]; // 타임라인, 영상 권장
    const dontTips = [tips[2], tips[4]]; // 입력 품질, 의사결정 주의
    return (
      <div className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="mb-1 text-sm font-semibold text-emerald-800">Do</p>
            {doTips.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <Dot style={{ background: '#10b981' }} />
                <p className="text-sm leading-6 text-emerald-800">{t.body}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="mb-1 text-sm font-semibold text-rose-800">Don’t</p>
            {dontTips.map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <Dot style={{ background: '#f43f5e' }} />
                <p className="text-sm leading-6 text-rose-800">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // F: 아코디언
  return (
    <div className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-3">
      <p className="px-1 text-sm font-medium text-slate-900">분석 리포트 활용 FAQ</p>
      <div className="mt-1 divide-y divide-slate-100">
        {tips.map((t, i) => (
          <details key={i} className="group px-1 py-2">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--brand)' }} />
              {t.title}
              <span className="ml-2 text-slate-500 transition group-open:rotate-180">⌄</span>
            </summary>
            <p className="mt-1 pl-4 text-sm leading-6 text-slate-700">{t.body}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

