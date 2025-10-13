import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ANALYZE_MODEL_ENDPOINTS } from '../../../api/endPointRoute';
import { fetchQuotaSummary as fetchQuotaSummaryReal } from '../api/quotaSummary';
import submitAnalyzeFilesReal from '../api/submitAnalyze';
import { buildStoredFailure, buildStoredReport } from '../../../utils/reportStorage';
import { normalizeAnalysisResult } from '../utils/normalizeResult';

const TEST_FLAG_STORAGE_KEY = 'gravifox:analyze:uiTest';
const TEST_SCENARIO_STORAGE_KEY = 'gravifox:analyze:uiTestScenario';
const DEFAULT_SCENARIO_KEY = 'happy-path';

const PLACEHOLDER_FACE_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUQEhIVFRUVFRUVFRUVFRUVFRUVFhUVFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lICYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAKgBLAMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABQYCAwQBB//EADoQAAEDAgQDBgUEAwAAAAAAAAEAAgMEBREhBhMxQVEHEyJhcYGRMkJSobHB0TNTkrLC4fAVM4L/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/EAB4RAQEAAgMBAQEAAAAAAAAAAAABAhESAyExBBNR/9oADAMBAAIRAxEAPwD8QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Z';

const PLACEHOLDER_PREVIEW_DATA_URL = `data:image/jpeg;base64,${PLACEHOLDER_FACE_JPEG_BASE64}`;

const BASE_MODELS_RESPONSE = Object.freeze({
  updatedAt: '2024-05-22T00:00:00Z',
  defaultKey: 'vision-lite',
  items: [
    {
      key: 'vision-lite',
      name: 'Vision Lite',
      description: '가장 빠른 실시간 분석 모델',
    },
    {
      key: 'vision-pro',
      name: 'Vision Pro',
      description: '고해상도 이미지에 최적화된 프리미엄 모델',
    },
    {
      key: 'vision-guard',
      name: 'Vision Guard',
      description: '조작 흔적 탐지에 특화된 실험적 모델',
    },
  ],
});

const TEST_SCENARIOS = Object.freeze({
  'happy-path': {
    label: '성공 경로',
    quotaSummary: {
      planName: 'Pro',
      limit: 30,
      used: 12,
      remaining: 18,
      periodStart: '2024-05-01T00:00:00Z',
      periodEnd: '2024-05-31T23:59:59Z',
      loginType: 'EMAIL',
      emailVerified: true,
    },
    modelsResponse: BASE_MODELS_RESPONSE,
    remainingAfterSubmit: 17,
    jobBlueprints: [
      {
        jobId: 'demo-happy-1',
        meta: {
          name: 'press-photo.jpg',
          size: 542123,
          type: 'image/jpeg',
          modelKey: 'vision-lite',
          previewDataUrl: PLACEHOLDER_PREVIEW_DATA_URL,
        },
        result: {
          label: 'REAL',
          pAi: 0.18,
          pReal: 0.82,
          threshold: 0.5,
          confidence: 0.82,
          latency_sec: 2.4,
          runtime: {
            backend: 'TensorRT',
            device: 'A10G',
          },
          faces: {
            samples: [
              {
                image_jpg_base64: PLACEHOLDER_FACE_JPEG_BASE64,
              },
            ],
          },
        },
      },
      {
        jobId: 'demo-happy-2',
        meta: {
          name: 'ai-suspect.png',
          size: 781245,
          type: 'image/png',
          modelKey: 'vision-pro',
          previewDataUrl: PLACEHOLDER_PREVIEW_DATA_URL,
        },
        result: {
          label: 'FAKE',
          pAi: 0.91,
          pReal: 0.09,
          threshold: 0.5,
          confidence: 0.94,
          latency_sec: 4.1,
          runtime: {
            backend: 'ONNXRuntime',
            device: 'A100',
          },
          faces: {
            samples: [
              {
                image_jpg_base64: PLACEHOLDER_FACE_JPEG_BASE64,
              },
            ],
          },
        },
      },
    ],
  },
  'partial-failure': {
    label: '부분 실패',
    quotaSummary: {
      planName: 'Starter',
      limit: 10,
      used: 4,
      remaining: 6,
      periodStart: '2024-05-01T00:00:00Z',
      periodEnd: '2024-05-31T23:59:59Z',
      loginType: 'EMAIL',
      emailVerified: true,
    },
    modelsResponse: BASE_MODELS_RESPONSE,
    remainingAfterSubmit: 5,
    jobBlueprints: [
      {
        jobId: 'demo-partial-1',
        meta: {
          name: 'outdoor-photo.jpg',
          size: 623000,
          type: 'image/jpeg',
          modelKey: 'vision-lite',
          previewDataUrl: PLACEHOLDER_PREVIEW_DATA_URL,
        },
        result: {
          label: 'REAL',
          pAi: 0.26,
          pReal: 0.74,
          threshold: 0.5,
          confidence: 0.78,
          latency_sec: 3.5,
          runtime: {
            backend: 'TensorRT',
            device: 'L4',
          },
        },
      },
      {
        jobId: 'demo-partial-2',
        meta: {
          name: 'blurry-shot.png',
          size: 412000,
          type: 'image/png',
          modelKey: 'vision-guard',
          previewDataUrl: PLACEHOLDER_PREVIEW_DATA_URL,
        },
        error: 'AI 결과 생성 중 오류가 발생했어요. 다시 시도해 주세요.',
      },
    ],
  },
  'upload-error': {
    label: '업로드 오류',
    quotaSummary: {
      planName: 'Starter',
      limit: 10,
      used: 1,
      remaining: 9,
      periodStart: '2024-05-01T00:00:00Z',
      periodEnd: '2024-05-31T23:59:59Z',
      loginType: 'EMAIL',
      emailVerified: true,
    },
    modelsResponse: BASE_MODELS_RESPONSE,
    submitErrors: ['업로드 토큰 발급에 실패했어요. 잠시 후 다시 시도해 주세요.'],
    jobBlueprints: [],
  },
  'quota-exhausted': {
    label: '쿼터 소진',
    quotaSummary: {
      planName: 'Starter',
      limit: 10,
      used: 10,
      remaining: 0,
      periodStart: '2024-05-01T00:00:00Z',
      periodEnd: '2024-05-31T23:59:59Z',
      loginType: 'EMAIL',
      emailVerified: true,
    },
    modelsResponse: BASE_MODELS_RESPONSE,
    jobBlueprints: [
      {
        jobId: 'demo-quota-1',
        meta: {
          name: 'quota-lock.png',
          size: 382000,
          type: 'image/png',
          modelKey: 'vision-lite',
          previewDataUrl: PLACEHOLDER_PREVIEW_DATA_URL,
        },
        result: {
          label: 'REAL',
          pAi: 0.12,
          pReal: 0.88,
          threshold: 0.5,
          confidence: 0.83,
        },
      },
    ],
  },
  'email-unverified': {
    label: '이메일 미인증',
    quotaSummary: {
      planName: 'Starter',
      limit: 10,
      used: 3,
      remaining: 7,
      periodStart: '2024-05-01T00:00:00Z',
      periodEnd: '2024-05-31T23:59:59Z',
      loginType: 'EMAIL',
      emailVerified: false,
    },
    modelsResponse: BASE_MODELS_RESPONSE,
    jobBlueprints: [
      {
        jobId: 'demo-email-1',
        meta: {
          name: 'verification-needed.png',
          size: 298000,
          type: 'image/png',
          modelKey: 'vision-lite',
          previewDataUrl: PLACEHOLDER_PREVIEW_DATA_URL,
        },
        result: {
          label: 'REAL',
          pAi: 0.35,
          pReal: 0.65,
          threshold: 0.5,
          confidence: 0.7,
        },
      },
    ],
  },
});

const AnalyzeFlowContext = createContext({
  isTestMode: false,
  scenarioKey: DEFAULT_SCENARIO_KEY,
  fetchQuotaSummary: fetchQuotaSummaryReal,
  fetchModels: async () => {
    const response = await fetch(ANALYZE_MODEL_ENDPOINTS.LIST);
    if (!response.ok) {
      const detail = await safeJson(response);
      const reason = detail?.message || detail?.error || '모델 목록을 불러오지 못했어요.';
      throw new Error(reason);
    }
    return response.json();
  },
  submitAnalyzeFiles: submitAnalyzeFilesReal,
  ensureTestReports: () => {},
});

function safeJson(response) {
  try {
    return response.json();
  } catch {
    return null;
  }
}

function clone(value) {
  if (value == null) return value;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function readStoredFlag(key) {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function writeStoredFlag(key, value) {
  try {
    if (typeof window === 'undefined') return;
    if (value == null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {}
}

function getScenarioConfig(key) {
  return TEST_SCENARIOS[key] || TEST_SCENARIOS[DEFAULT_SCENARIO_KEY];
}

function ensureSessionValue(key, value) {
  try {
    if (typeof window === 'undefined') return;
    if (value == null) {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  } catch {}
}

async function fetchModelsReal() {
  const response = await fetch(ANALYZE_MODEL_ENDPOINTS.LIST);
  if (!response.ok) {
    const detail = await safeJson(response);
    const reason = detail?.message || detail?.error || '모델 목록을 불러오지 못했어요.';
    throw new Error(reason);
  }
  return response.json();
}

function useTestState(locationSearch) {
  return useMemo(() => {
    if (typeof window === 'undefined') {
      return { isTestMode: false, scenarioKey: DEFAULT_SCENARIO_KEY };
    }
    const params = new URLSearchParams(locationSearch || window.location.search || '');
    const queryFlag = params.get('uiTest');
    const enabledFromQuery = queryFlag != null && ['1', 'true'].includes(queryFlag.toLowerCase());
    const disabledFromQuery = queryFlag != null && ['0', 'false'].includes(queryFlag.toLowerCase());
    if (enabledFromQuery) {
      writeStoredFlag(TEST_FLAG_STORAGE_KEY, '1');
    } else if (disabledFromQuery) {
      writeStoredFlag(TEST_FLAG_STORAGE_KEY, null);
    }
    const storedFlag = readStoredFlag(TEST_FLAG_STORAGE_KEY);
    const isTestMode = enabledFromQuery || (!disabledFromQuery && storedFlag === '1');

    let scenarioKey = DEFAULT_SCENARIO_KEY;
    if (isTestMode) {
      const requestedScenario = params.get('scenario');
      if (requestedScenario && TEST_SCENARIOS[requestedScenario]) {
        scenarioKey = requestedScenario;
        writeStoredFlag(TEST_SCENARIO_STORAGE_KEY, scenarioKey);
      } else {
        const storedScenario = readStoredFlag(TEST_SCENARIO_STORAGE_KEY);
        if (storedScenario && TEST_SCENARIOS[storedScenario]) {
          scenarioKey = storedScenario;
        }
      }
    }

    if (!isTestMode) {
      writeStoredFlag(TEST_SCENARIO_STORAGE_KEY, null);
    }

    return { isTestMode, scenarioKey };
  }, [locationSearch]);
}

async function submitAnalyzeFilesTest(files, options = {}, scenarioKey) {
  const scenario = getScenarioConfig(scenarioKey);
  const submitErrors = Array.isArray(scenario.submitErrors) ? [...scenario.submitErrors] : [];

  if (submitErrors.length > 0) {
    return { jobIds: [], errors: submitErrors, remainingQuota: scenario.quotaSummary?.remaining ?? null };
  }

  const list = Array.isArray(files) ? [...files] : [];
  const jobBlueprints = Array.isArray(scenario.jobBlueprints) ? scenario.jobBlueprints : [];
  const jobs = [];

  const count = list.length > 0 ? list.length : jobBlueprints.length;
  if (count === 0) {
    return { jobIds: [], errors: [], remainingQuota: scenario.quotaSummary?.remaining ?? null };
  }

  for (let idx = 0; idx < count; idx += 1) {
    const file = list[idx];
    const blueprint = jobBlueprints[idx] || jobBlueprints[jobBlueprints.length - 1] || jobBlueprints[0];
    if (!blueprint) {
      break;
    }
    const jobId = blueprint.jobId || `demo-job-${idx + 1}`;
    const baseMeta = clone(blueprint.meta) || {};
    if (file) {
      baseMeta.name = file?.name || baseMeta.name || `테스트-${idx + 1}.jpg`;
      baseMeta.size = file?.size ?? baseMeta.size ?? 0;
      baseMeta.type = file?.type || baseMeta.type || 'image/jpeg';
    }
    if (!baseMeta.modelKey && typeof options?.modelKey === 'string') {
      baseMeta.modelKey = options.modelKey;
    }
    if (typeof options?.buildMeta === 'function' && file) {
      try {
        const extraMetaMaybe = options.buildMeta(file, { uploadId: `demo-upload-${idx + 1}` });
        const extraMeta = extraMetaMaybe && typeof extraMetaMaybe.then === 'function' ? await extraMetaMaybe : extraMetaMaybe;
        if (extraMeta && typeof extraMeta === 'object') {
          Object.assign(baseMeta, extraMeta);
        }
      } catch {}
    }

    ensureSessionValue(`sse:meta:${jobId}`, JSON.stringify(baseMeta));
    ensureSessionValue(`sse:${jobId}`, null);

    if (blueprint.error) {
      ensureSessionValue(
        `sse:failed:${jobId}`,
        JSON.stringify(buildStoredFailure(blueprint.error, baseMeta))
      );
      ensureSessionValue(`sse:report:${jobId}`, null);
    } else {
      const normalized = normalizeAnalysisResult(clone(blueprint.result) || {});
      ensureSessionValue(
        `sse:report:${jobId}`,
        JSON.stringify(buildStoredReport(normalized, baseMeta))
      );
      ensureSessionValue(`sse:failed:${jobId}`, null);
    }

    jobs.push(jobId);
  }

  const remainingQuota = typeof scenario.remainingAfterSubmit === 'number'
    ? scenario.remainingAfterSubmit
    : typeof scenario.quotaSummary?.remaining === 'number'
    ? Math.max(0, scenario.quotaSummary.remaining - jobs.length)
    : null;

  return { jobIds: jobs, errors: [], remainingQuota };
}

function ensureScenarioReports(jobIds, scenarioKey) {
  const scenario = getScenarioConfig(scenarioKey);
  if (!Array.isArray(jobIds) || jobIds.length === 0) return;
  const blueprints = Array.isArray(scenario.jobBlueprints) ? scenario.jobBlueprints : [];
  jobIds.forEach((jobId, idx) => {
    if (!jobId) return;
    const existingReport = typeof window !== 'undefined' ? window.sessionStorage.getItem(`sse:report:${jobId}`) : null;
    const existingFailure = typeof window !== 'undefined' ? window.sessionStorage.getItem(`sse:failed:${jobId}`) : null;
    if (existingReport || existingFailure) return;
    const blueprint = blueprints.find((item) => item.jobId === jobId) || blueprints[idx] || blueprints[0];
    if (!blueprint) return;
    const meta = clone(blueprint.meta) || {
      name: `테스트-${idx + 1}.jpg`,
      type: 'image/jpeg',
      size: 0,
      modelKey: scenario.modelsResponse?.defaultKey || 'vision-lite',
      previewDataUrl: PLACEHOLDER_PREVIEW_DATA_URL,
    };
    ensureSessionValue(`sse:meta:${jobId}`, JSON.stringify(meta));
    ensureSessionValue(`sse:${jobId}`, null);
    if (blueprint.error) {
      ensureSessionValue(
        `sse:failed:${jobId}`,
        JSON.stringify(buildStoredFailure(blueprint.error, meta))
      );
      ensureSessionValue(`sse:report:${jobId}`, null);
    } else {
      const normalized = normalizeAnalysisResult(clone(blueprint.result) || {});
      ensureSessionValue(
        `sse:report:${jobId}`,
        JSON.stringify(buildStoredReport(normalized, meta))
      );
      ensureSessionValue(`sse:failed:${jobId}`, null);
    }
  });
}

export function AnalyzeFlowProvider({ children }) {
  const location = useLocation();
  const derived = useTestState(location?.search || '');
  const [isTestMode, setIsTestMode] = useState(derived.isTestMode);
  const [scenarioKey, setScenarioKey] = useState(derived.scenarioKey);

  useEffect(() => {
    setIsTestMode(derived.isTestMode);
    setScenarioKey(derived.scenarioKey);
  }, [derived.isTestMode, derived.scenarioKey]);

  const ensureTestReports = useCallback(
    (jobIds) => {
      if (!isTestMode) return;
      ensureScenarioReports(jobIds, scenarioKey);
    },
    [isTestMode, scenarioKey]
  );

  const contextValue = useMemo(() => {
    if (!isTestMode) {
      return {
        isTestMode: false,
        scenarioKey,
        fetchQuotaSummary: fetchQuotaSummaryReal,
        fetchModels: fetchModelsReal,
        submitAnalyzeFiles: submitAnalyzeFilesReal,
        ensureTestReports,
      };
    }

    const scenario = getScenarioConfig(scenarioKey);

    return {
      isTestMode: true,
      scenarioKey,
      fetchQuotaSummary: async () => clone(scenario.quotaSummary),
      fetchModels: async () => clone(scenario.modelsResponse),
      submitAnalyzeFiles: (files, options = {}) => submitAnalyzeFilesTest(files, options, scenarioKey),
      ensureTestReports,
    };
  }, [ensureTestReports, isTestMode, scenarioKey]);

  return <AnalyzeFlowContext.Provider value={contextValue}>{children}</AnalyzeFlowContext.Provider>;
}

export function useAnalyzeFlow() {
  return useContext(AnalyzeFlowContext);
}

export default AnalyzeFlowContext;
