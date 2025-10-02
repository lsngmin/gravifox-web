export const metrics = [
  {
    label: 'Detection precision',
    value: '99.3%',
    description: 'Weighted average across face, voice, and multimodal deepfake scenarios under live inference.'
  },
  {
    label: 'Time to verdict',
    value: '< 4s',
    description: 'Median end-to-end latency per media item on production workloads with dynamic model routing.'
  },
  {
    label: 'Automation coverage',
    value: '78%',
    description: 'Percentage of abuse queues auto-resolved using playbooks powered by GraviFox confidence scores.'
  }
];

export const pillars = [
  {
    id: 'resilience',
    title: 'Resilient by design',
    description: 'Model fallbacks, scenario-specific detectors, and automatic retraining keep signal stable no matter how adversaries adapt.'
  },
  {
    id: 'fidelity',
    title: 'Audit-grade fidelity',
    description: 'Cryptographically signed evidence bundles and immutable traceability make it easier to collaborate with compliance teams.'
  },
  {
    id: 'velocity',
    title: 'Investigator velocity',
    description: 'Guided workflows, collaboration handoffs, and alert priority tuning let response teams move as fast as incidents unfold.'
  }
];

export const workflow = [
  {
    title: 'Ingest',
    caption: 'Drop in streams, files, or APIs. Intelligent sampling looks for risk hot-spots before the first inference call.'
  },
  {
    title: 'Detect',
    caption: 'Adaptive ensembles evaluate media frame-by-frame, pivoting between face, voice, and manipulation fingerprint models.'
  },
  {
    title: 'Triage',
    caption: 'Confidence-aware triage routes cases to the right queue, augments with context, and triggers downstream automation.'
  },
  {
    title: 'Act',
    caption: 'Export evidence bundles, push to policy tooling, or notify stakeholders with a single click—no context lost.'
  }
];

export const integrations = [
  'Slack',
  'PagerDuty',
  'Kubernetes',
  'Akamai',
  'Splunk',
  'Salesforce',
  'Snowflake',
  'Datadog'
];
