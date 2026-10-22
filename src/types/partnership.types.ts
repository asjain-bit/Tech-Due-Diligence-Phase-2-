import type { StrategyDecision } from './judgementCriteria'

export type PartnershipStatus = 'Pending' | 'In Progress' | 'At Risk' | 'Exited'

export type StageStatus = 'completed' | 'in_progress' | 'not_started'

export interface WorkflowStage {
  id: number
  title: string
  subheading: string
  status: StageStatus
}

export interface OverviewCards {
  evidence: string
  deployment: string
  regulatory: string
  duplicateCheck: string
}

export interface CompanyInfo {
  name: string // Submitter Name *
  jobTitle: string // Job Title *
  company: string // Company *
  phoneNumber?: string // Phone Number (optional)
  email: string // Email Address *
  yearFounded: string // Year Founded *
  location?: string // Location (e.g. UAE, Dubai)
}

export interface KeyAssessmentAreas {
  stageOfMaturityAndExperience: string // *
  growthJourneyAndRegionalExperience: string // *
  milestones?: string[]
  proposalOfCollaboration: string // *
  productPlatformServiceDetails: string // *
  focusAreas: string[] // *
  solutionMaturityLevelAndRegulatory: string // *
  relevantApprovals?: string // optional
  regulatoryApprovalList?: string[]
  noveltyAndDifferentiation: string // *
  developmentApproach?: string // optional
  requestedM42Resources: string // *
  impactedPatientPopulations?: string[] // optional
  clinicalAreas?: string[]
}

export interface UploadedDoc {
  id: string
  name: string
  size: string
  type: string
}

export interface QuestionnaireResponse {
  problemAndCurrentApproach?: string
  targetKpi?: string
  baselineToday?: string
  changeThatMatters?: string
  sponsorPilot?: string
  budgetLine?: string
  whatWouldMakeYouSayNo?: string
  submittedAt?: string
}

export interface StrategyJudgementResponse {
  criterionId: string
  value: string
  /** Why the reviewer changed the agent's pre-fill (only when edited) */
  reason?: string
}

export interface StrategyMemberResponse {
  judgements?: StrategyJudgementResponse[]
  finalDecision?: StrategyDecision
  finalDecisionNote?: string
  submittedAt?: string
}

export interface InternalInterestStakeholder {
  id: string
  name: string
  initials: string
  role: string
  department: string
  expertise: string
  whySuggested?: string
  avatarColorBg: string
  avatarColorText: string
  status?: string
  deadline?: string
  decision?: string
  source?: 'ai' | 'manual'
  response?: QuestionnaireResponse
  strategyResponse?: StrategyMemberResponse
}

export interface AgentRecommendation {
  status: 'proceed' | 'reject'
  label: string
  confidence: number
  rationale: string
}

export interface PartnershipRequest {
  id: string
  /** Human-readable request ID shown in tables, e.g. PR-124 */
  requestCode: string
  companyName: string
  vendorName: string
  referredBy?: string | null
  solution: string
  focusArea: string
  solutionMaturity: string
  status: PartnershipStatus
  submittedOn: string
  deadline: string
  submittedRelative?: string
  headline?: string
  tags?: string[]
  workflowStages: WorkflowStage[]
  overviewCards: OverviewCards
  sowDetails: {
    sowName: string
    sowDeadline: string
    tokenConsumption: string
  }
  uploadedDocuments: UploadedDoc[]
  companyInfo: CompanyInfo
  assessmentAreas: KeyAssessmentAreas
  internalInterests?: InternalInterestStakeholder[]
  strategyTeamMembers?: InternalInterestStakeholder[]
  agentRecommendation?: AgentRecommendation
  decision?: {
    status: 'proceeded' | 'rejected'
    reason?: string
    date?: string
    decidedBy?: string
  }
}

export const DEFAULT_INTERNAL_INTERESTS: InternalInterestStakeholder[] = [
  {
    id: 'int-1',
    name: 'Riza Sayeed',
    initials: 'RS',
    role: 'Head of AI & Analytics',
    department: 'AI & Analytics',
    expertise: 'AI Strategy',
    whySuggested: 'Evaluated high-scoring diagnostic algorithms and data infrastructure alignment',
    avatarColorBg: '#dbeafe',
    avatarColorText: '#1e40af',
    status: 'Completed',
    deadline: '5 days',
    decision: 'Proceed',
    source: 'ai',
    response: {
      problemAndCurrentApproach:
        'Sepsis is still recognised late on our wards, and patients often reach ICU after the best window for antibiotics.',
      targetKpi: 'ICU sepsis mortality',
      baselineToday: '21% over 12 months',
      changeThatMatters: '3 points lower in 12 months',
      sponsorPilot: 'Yes, we would sponsor',
      budgetLine: 'Existing budget line',
      whatWouldMakeYouSayNo:
        'High latency in EHR synchronization or high false positive alarm fatigue among nursing staff.',
      submittedAt: 'Today at 2:15 PM',
    },
  },
  {
    id: 'int-2',
    name: 'Parag Agarwal',
    initials: 'PA',
    role: 'Radiology & Imaging Lead',
    department: 'Medical Imaging',
    expertise: 'Imaging',
    whySuggested: 'Direct expertise in radiology workflow integration and clinical PACS validation',
    avatarColorBg: '#f3e8ff',
    avatarColorText: '#6b21a8',
    status: 'In Progress',
    deadline: '5 days',
    decision: '-',
    source: 'ai',
  },
  {
    id: 'int-3',
    name: 'Najla Al Mansoori',
    initials: 'NA',
    role: 'Clinical Innovation Lead',
    department: 'Clinical Innovation',
    expertise: 'Clinical Validation',
    whySuggested: 'Leads clinical protocol assessment and clinical trial readiness',
    avatarColorBg: '#d1fae5',
    avatarColorText: '#065f46',
    status: 'Pending',
    deadline: '5 days',
    decision: '-',
    source: 'ai',
  },
  {
    id: 'int-4',
    name: 'Khalid Al Zaabi',
    initials: 'KA',
    role: 'Operations Transformation Lead',
    department: 'Operations',
    expertise: 'Operations',
    whySuggested: 'Assesses operational feasibility and clinical IT deployment readiness',
    avatarColorBg: '#ffedd5',
    avatarColorText: '#9a3412',
    status: 'Pending',
    deadline: '5 days',
    decision: '-',
    source: 'ai',
  },
  {
    id: 'int-5',
    name: 'Sara Malik',
    initials: 'SM',
    role: 'HealthTech Partnerships',
    department: 'Strategic Partnerships',
    expertise: 'Partnerships',
    whySuggested: 'Oversees ecosystem synergy and commercial healthtech alliance fit',
    avatarColorBg: '#fce7f3',
    avatarColorText: '#9d174d',
    status: 'Pending',
    deadline: '5 days',
    decision: '-',
    source: 'ai',
  },
]

export const DEFAULT_STRATEGY_MEMBERS: InternalInterestStakeholder[] = [
  {
    id: 'strat-1',
    name: 'Ahmed Darwish',
    initials: 'AD',
    role: 'Head of Strategy',
    department: 'Strategy',
    expertise: 'Market Strategy',
    whySuggested: 'Assesses overall strategic alignment and healthcare market expansion',
    avatarColorBg: '#dbeafe',
    avatarColorText: '#1e40af',
    status: 'Completed',
    deadline: '2-3 days',
    decision: 'Proceed with a condition',
    source: 'ai',
    strategyResponse: {
      judgements: [
        { criterionId: 'focus_areas', value: 'In scope' },
        { criterionId: 'roadmap', value: 'Overlap a roadmap item' },
        {
          criterionId: 'build_buy',
          value: 'Partner',
          reason:
            'The vendor already holds the validated model. Partnering is faster than building and the CoE has no capacity this year.',
        },
        {
          criterionId: 'architecture',
          value: 'Fits with conditions',
          reason:
            'Vendor confirmed in the call that a UAE-hosted deployment is possible. Treat it as a condition of contract.',
        },
        { criterionId: 'own_rent', value: 'Mixed' },
        { criterionId: 'scale', value: 'High' },
        { criterionId: 'sovereignty', value: 'Partially meets' },
      ],
      finalDecision: 'Proceed with a condition',
      finalDecisionNote:
        'Proceed only if the vendor commits to UAE hosting and registers a local entity. Review again once both are confirmed in writing.',
      submittedAt: 'Yesterday at 4:30 PM',
    },
  },
]

export const INITIAL_PARTNERSHIP_REQUESTS: PartnershipRequest[] = [
  {
    id: 'req-001',
    requestCode: 'PR-124',
    companyName: 'MedTech Innovations',
    vendorName: 'Sarah Ahmed',
    referredBy: 'Dr. Noura Al Ghaithi',
    solution: 'AI-powered diagnostic platform for early disease detection',
    headline: 'AI-powered diagnostic platform for early disease detection',
    focusArea: 'AI & Diagnostics',
    solutionMaturity: 'Pilot',
    status: 'Pending',
    submittedOn: '12 Oct 2026',
    deadline: '31 Oct 2026',
    submittedRelative: '3 days ago',
    tags: ['AI & Diagnostics', 'Medical Imaging', 'Clinical Decision Support'],
    internalInterests: DEFAULT_INTERNAL_INTERESTS,
    agentRecommendation: {
      status: 'proceed',
      label: 'Recommended to Proceed',
      confidence: 94,
      rationale:
        'AI evaluation confirms high clinical validation maturity, active regional hospital deployments, and strong alignment with M42 strategic healthcare priorities.',
    },
    workflowStages: [
      { id: 1, title: 'Submission', subheading: '12 Oct 2026', status: 'completed' },
      { id: 2, title: 'Intake & Triage', subheading: 'Completed', status: 'completed' },
      { id: 3, title: 'Screening & Fit', subheading: 'In Progress', status: 'in_progress' },
      { id: 4, title: 'NDA & Discovery', subheading: 'Not Started', status: 'not_started' },
      { id: 5, title: 'Value Assessment', subheading: 'Not Started', status: 'not_started' },
      { id: 6, title: 'Due Diligence', subheading: 'Not Started', status: 'not_started' },
      { id: 7, title: 'Term Sheet & Pilot', subheading: 'Not Started', status: 'not_started' },
    ],
    overviewCards: {
      evidence: 'Clinical Validation Study',
      deployment: '10+ hospitals across UAE',
      regulatory: 'FDA / CE Mark',
      duplicateCheck: 'Clear',
    },
    sowDetails: {
      sowName: 'MedTech Innovations — AI-powered Diagnostic Platform',
      sowDeadline: '31/10/2026',
      tokenConsumption: '1200',
    },
    uploadedDocuments: [
      {
        id: 'doc-1',
        name: 'MedTech_Innovations_Diagnostic_RFP.pdf',
        size: '2.8 MB',
        type: 'APPLICATION/PDF',
      },
      {
        id: 'doc-2',
        name: 'Clinical_Validation_Whitepaper.pdf',
        size: '1.4 MB',
        type: 'APPLICATION/PDF',
      },
      {
        id: 'doc-3',
        name: 'Regulatory_Approval_Documentation.pdf',
        size: '920 KB',
        type: 'APPLICATION/PDF',
      },
    ],
    companyInfo: {
      name: 'Sarah Ahmed',
      jobTitle: 'Business Development Director',
      company: 'MedTech Innovations',
      phoneNumber: '+971 50 123 4567',
      email: 'sarah@medtechinnovations.com',
      yearFounded: '2018',
      location: 'UAE, Dubai',
    },
    assessmentAreas: {
      stageOfMaturityAndExperience:
        'MedTech Innovations is a growth-stage healthtech company with extensive experience in developing AI-powered diagnostic solutions. We have successfully launched our platform in multiple markets including the UAE, KSA, and the UK, and have partnerships with leading hospitals and research institutions.',
      growthJourneyAndRegionalExperience:
        'Proven regional rollout across private and public healthcare systems with over 150,000 scans interpreted to date.',
      milestones: [
        'Product launch in 2022',
        'Deployment in 10+ hospitals across UAE',
        'Strategic partnership with a leading global medical imaging provider',
        'Ongoing collaboration with academic institutions for clinical validation',
      ],
      proposalOfCollaboration:
        'Deploy our AI diagnostic platform across M42 hospitals and clinics for automated triage and early-stage chronic disease screening across radiology and oncology.',
      productPlatformServiceDetails:
        'Secure multi-modal diagnostic engine capable of processing DICOM imaging, pathology slides, and clinical telemetry with real-time accuracy scoring.',
      focusAreas: ['AI & Diagnostics', 'Medical Imaging', 'Clinical Decision Support'],
      solutionMaturityLevelAndRegulatory:
        'Operational pilot phase with clinical validation completed across 3 tertiary hospital networks.',
      relevantApprovals: 'FDA cleared, CE Mark approved, UAE MOHAP registered.',
      regulatoryApprovalList: ['FDA', 'CE', 'Not applicable'],
      noveltyAndDifferentiation:
        'Proprietary deep learning model trained on multi-ethnic clinical datasets achieving 96.4% diagnostic sensitivity, reducing false positives by 41%.',
      developmentApproach:
        'Internally Developed by specialized medical AI engineers and radiologists.',
      requestedM42Resources:
        'Clinical sandbox integration with M42 Epic EHR, pilot validation sites at Cleveland Clinic Abu Dhabi, and joint research publication.',
      impactedPatientPopulations: ['Adult Patients', 'Pediatric Patients'],
      clinicalAreas: ['Oncology', 'Radiology', 'Chronic Disease'],
    },
  },
  {
    id: 'req-002',
    requestCode: 'PR-123',
    companyName: 'AlphaHealth BioTech',
    vendorName: 'Dr. Tariq Mansoor',
    referredBy: 'Ahmed Al Hosani',
    solution: 'CardioScan AI Diagnostic Platform',
    headline: 'CardioScan AI Diagnostic Platform',
    focusArea: 'Cardiology & Precision Health',
    solutionMaturity: 'Clinical Validation',
    status: 'In Progress',
    submittedOn: '10 Oct 2026',
    deadline: '24 Oct 2026',
    submittedRelative: '2 days ago',
    tags: ['Cardiology & Precision Health', 'Clinical Workflow Automation'],
    internalInterests: DEFAULT_INTERNAL_INTERESTS,
    agentRecommendation: {
      status: 'proceed',
      label: 'Recommended to Proceed',
      confidence: 88,
      rationale:
        'Demonstrated 94.2% diagnostic accuracy with strong primary care cardiovascular workflow alignment.',
    },
    workflowStages: [
      { id: 1, title: 'Submission', subheading: '10 Oct 2026', status: 'completed' },
      { id: 2, title: 'Intake & Triage', subheading: 'Completed', status: 'completed' },
      { id: 3, title: 'Screening & Fit', subheading: 'In Progress', status: 'in_progress' },
      { id: 4, title: 'NDA & Discovery', subheading: 'Not Started', status: 'not_started' },
      { id: 5, title: 'Value Assessment', subheading: 'Not Started', status: 'not_started' },
      { id: 6, title: 'Due Diligence', subheading: 'Not Started', status: 'not_started' },
      { id: 7, title: 'Term Sheet & Pilot', subheading: 'Not Started', status: 'not_started' },
    ],
    overviewCards: {
      evidence: 'Proof of concept',
      deployment: '1 live customer',
      regulatory: 'Unclear',
      duplicateCheck: 'Clear',
    },
    sowDetails: {
      sowName: 'AlphaHealth BioTech — CardioScan AI Diagnostic Platform',
      sowDeadline: '31/10/2026',
      tokenConsumption: '1200',
    },
    uploadedDocuments: [
      {
        id: 'doc-4',
        name: 'Digital_Transformation_RFP.pdf',
        size: '2.8 MB',
        type: 'APPLICATION/PDF',
      },
      {
        id: 'doc-5',
        name: 'Enterprise_Architecture_Specs.pdf',
        size: '1.4 MB',
        type: 'APPLICATION/PDF',
      },
      {
        id: 'doc-6',
        name: 'Workplace_Requirements_Matrix.pdf',
        size: '920 KB',
        type: 'APPLICATION/PDF',
      },
    ],
    companyInfo: {
      name: 'Dr. Tariq Mansoor',
      jobTitle: 'Chief Executive Officer & Founder',
      company: 'AlphaHealth BioTech',
      phoneNumber: '+971 50 234 5678',
      email: 'tariq.mansoor@alphahealth.ae',
      yearFounded: '2021',
      location: 'UAE, Abu Dhabi',
    },
    assessmentAreas: {
      stageOfMaturityAndExperience:
        'Series A stage clinical AI enterprise with 5 years of specialized algorithmic R&D across cardiovascular modalities.',
      growthJourneyAndRegionalExperience:
        'Launched pilot programs in 3 European academic medical centers in 2023. Established Abu Dhabi ADGM presence in 2025 and conducted retrospective validation on 14,000 regional ECG records.',
      milestones: [
        'Commercial beta launch in 2023',
        'Abu Dhabi ADGM entity setup in 2025',
        'Retrospective validation on 14,000 ECG datasets',
      ],
      proposalOfCollaboration:
        'Collaborate with M42 to integrate CardioScan AI into primary care and ambulatory cardiology pathways, enabling rapid automated detection of heart failure.',
      productPlatformServiceDetails:
        'Cloud-native and edge-deployable AI inference engine processing standard 12-lead ECG waveforms and echocardiography Doppler streams.',
      focusAreas: ['Cardiology & Precision Health', 'Clinical Workflow Automation'],
      solutionMaturityLevelAndRegulatory:
        'Demonstrated 94.2% diagnostic accuracy in retrospective multi-center trials.',
      relevantApprovals: 'ISO 13485 certified, CE Mark Stage 2 audit cleared.',
      regulatoryApprovalList: ['CE', 'ISO 13485', 'UAE MOHAP'],
      noveltyAndDifferentiation:
        'Proprietary transformer-based waveform interpretation with multi-lead cross-attention; achieves 38% reduction in false-positive referrals.',
      developmentApproach: 'Internally Developed by proprietary team',
      requestedM42Resources:
        'Clinical validation access within M42 hospital network, Epic EHR sandbox integration, and joint scientific publication sponsorship.',
      impactedPatientPopulations: ['Adult Patients', "Women's health"],
      clinicalAreas: ['Cardiology', 'Internal Medicine'],
    },
  },
  {
    id: 'req-003',
    requestCode: 'PR-122',
    companyName: 'GenomicX MENA FZ-LLC',
    vendorName: 'Karim El-Sayed',
    referredBy: null,
    solution: 'Rare Disease Variant Interpreter',
    headline: 'Rare Disease Variant Interpreter',
    focusArea: 'Genomics & Oncology',
    solutionMaturity: 'Commercial',
    status: 'At Risk',
    submittedOn: '01 Oct 2026',
    deadline: '15 Oct 2026',
    submittedRelative: '11 days ago',
    tags: ['Genomics & Oncology', 'Precision Health & Diagnostics', 'Rare Diseases'],
    internalInterests: DEFAULT_INTERNAL_INTERESTS,
    agentRecommendation: {
      status: 'proceed',
      label: 'Recommended to Proceed',
      confidence: 96,
      rationale:
        'Mature clinical bioinformatics solution with direct synergy for Emirati Genome Program partnerships.',
    },
    workflowStages: [
      { id: 1, title: 'Submission', subheading: '01 Oct 2026', status: 'completed' },
      { id: 2, title: 'Intake & Triage', subheading: 'Completed', status: 'completed' },
      { id: 3, title: 'Screening & Fit', subheading: 'Completed', status: 'completed' },
      { id: 4, title: 'NDA & Discovery', subheading: 'In Progress', status: 'in_progress' },
      { id: 5, title: 'Value Assessment', subheading: 'Not Started', status: 'not_started' },
      { id: 6, title: 'Due Diligence', subheading: 'Not Started', status: 'not_started' },
      { id: 7, title: 'Term Sheet & Pilot', subheading: 'Not Started', status: 'not_started' },
    ],
    overviewCards: {
      evidence: 'Peer-reviewed Nature publication',
      deployment: '12 Tier-1 genomics centers',
      regulatory: 'FDA 510(k) Cleared',
      duplicateCheck: 'Clear',
    },
    sowDetails: {
      sowName: 'GenomicX MENA — Rare Disease Variant Interpreter',
      sowDeadline: '20/11/2026',
      tokenConsumption: '2100',
    },
    uploadedDocuments: [
      {
        id: 'doc-7',
        name: 'GenomicX_Validation_Study_Nature.pdf',
        size: '4.5 MB',
        type: 'APPLICATION/PDF',
      },
      {
        id: 'doc-8',
        name: 'FDA_510k_Clearance_Summary.pdf',
        size: '1.8 MB',
        type: 'APPLICATION/PDF',
      },
    ],
    companyInfo: {
      name: 'Karim El-Sayed',
      jobTitle: 'Chief Scientific Officer & Regional Director',
      company: 'GenomicX MENA FZ-LLC',
      phoneNumber: '+971 4 365 8900',
      email: 'karim.elsayed@genomicx.ae',
      yearFounded: '2018',
      location: 'UAE, Dubai',
    },
    assessmentAreas: {
      stageOfMaturityAndExperience:
        'Mature clinical bioinformatics provider specializing in whole-genome and exome sequencing analysis for hereditary and rare conditions.',
      growthJourneyAndRegionalExperience:
        'Established in Boston with EMEA headquarters in Dubai Science Park since 2021. Actively processing research cohorts for Middle Eastern population genetics.',
      milestones: [
        'Dubai Science Park hub opened in 2021',
        'Nature Genetics peer-reviewed paper in 2023',
        'Over 35,000 genomes processed',
      ],
      proposalOfCollaboration:
        'Direct pipeline integration with the Emirati Genome Program and M42 Omics Centre of Excellence.',
      productPlatformServiceDetails:
        'AI variant filtering and interpretation platform cross-referencing population-specific allele frequencies.',
      focusAreas: ['Genomics & Oncology', 'Precision Health & Diagnostics', 'Rare Diseases'],
      solutionMaturityLevelAndRegulatory:
        'Commercial platform cleared under FDA 510(k) and IVDR certified in the European Union.',
      relevantApprovals: 'FDA 510(k) Class II, CE-IVD, ISO 15189 compliance.',
      regulatoryApprovalList: ['FDA', 'CE', 'ISO 15189'],
      noveltyAndDifferentiation:
        'Contains the largest curated database of MENA-specific non-coding variants; reduces unclassified variants by 42%.',
      developmentApproach: 'Internally Developed with Harvard Medical School research affiliations',
      requestedM42Resources:
        'High-throughput sequencing pipeline integration, clinical geneticist pilot evaluation, and enterprise biobanking access.',
      impactedPatientPopulations: ['Adult Patients', 'Pediatric Patients', "Women's health"],
      clinicalAreas: ['Genomics', 'Pediatrics', 'Oncology'],
    },
  },
  {
    id: 'req-004',
    requestCode: 'PR-121',
    companyName: 'CarePulse Technologies',
    vendorName: 'Elena Rostova',
    referredBy: 'Sponsor Office',
    solution: 'Remote Patient Monitoring & Triage',
    headline: 'Remote Patient Monitoring & Triage',
    focusArea: 'Virtual Care & Remote Monitoring',
    solutionMaturity: 'Commercial',
    status: 'Exited',
    submittedOn: '28 Sep 2026',
    deadline: '05 Oct 2026',
    submittedRelative: '14 days ago',
    tags: ['Virtual Care & Remote Monitoring', 'Clinical Workflow Automation'],
    internalInterests: DEFAULT_INTERNAL_INTERESTS,
    agentRecommendation: {
      status: 'proceed',
      label: 'Recommended to Proceed',
      confidence: 91,
      rationale:
        'Established regional footprint with 25,000+ active chronic care patients and DoH licensure.',
    },
    workflowStages: [
      { id: 1, title: 'Submission', subheading: '28 Sep 2026', status: 'completed' },
      { id: 2, title: 'Intake & Triage', subheading: 'Completed', status: 'completed' },
      { id: 3, title: 'Screening & Fit', subheading: 'In Progress', status: 'in_progress' },
      { id: 4, title: 'NDA & Discovery', subheading: 'Not Started', status: 'not_started' },
      { id: 5, title: 'Value Assessment', subheading: 'Not Started', status: 'not_started' },
      { id: 6, title: 'Due Diligence', subheading: 'Not Started', status: 'not_started' },
      { id: 7, title: 'Term Sheet & Pilot', subheading: 'Not Started', status: 'not_started' },
    ],
    overviewCards: {
      evidence: 'Real-world evidence study',
      deployment: '3 UAE health clusters',
      regulatory: 'DoH Abu Dhabi Approved',
      duplicateCheck: 'Clear',
    },
    sowDetails: {
      sowName: 'CarePulse Technologies — Remote Patient Monitoring & Triage',
      sowDeadline: '10/11/2026',
      tokenConsumption: '950',
    },
    uploadedDocuments: [
      {
        id: 'doc-10',
        name: 'CarePulse_RPM_Clinical_Outcomes.pdf',
        size: '2.4 MB',
        type: 'APPLICATION/PDF',
      },
    ],
    companyInfo: {
      name: 'Elena Rostova',
      jobTitle: 'Head of Strategic Alliances',
      company: 'CarePulse Technologies',
      phoneNumber: '+971 52 876 5432',
      email: 'elena.rostova@carepulse.io',
      yearFounded: '2020',
      location: 'UAE, Dubai',
    },
    assessmentAreas: {
      stageOfMaturityAndExperience:
        'Commercial scale RPM platform currently managing over 25,000 active chronic disease patients across the UAE.',
      growthJourneyAndRegionalExperience:
        'Bootstrapped to initial UAE traction in 2020, secured DoH telehealth licensure in 2022.',
      milestones: [
        'DoH telehealth license in 2022',
        'Active care for 25,000+ chronic disease patients',
      ],
      proposalOfCollaboration:
        'Integrate CarePulse RPM with M42 virtual health centers for post-discharge chronic disease care.',
      productPlatformServiceDetails:
        'Cellular-enabled connected devices coupled with an AI clinical escalation dashboard.',
      focusAreas: ['Virtual Care & Remote Monitoring', 'Preventative Healthcare'],
      solutionMaturityLevelAndRegulatory:
        'Fully commercialized with Department of Health Abu Dhabi telemedicine authorization.',
      relevantApprovals: 'DoH Abu Dhabi Telehealth License, CE Mark Class I, ISO 27001.',
      regulatoryApprovalList: ['DoH Abu Dhabi', 'CE'],
      noveltyAndDifferentiation:
        'Zero-pairing cellular hub requiring no patient smartphone or Wi-Fi setup.',
      developmentApproach: 'Internally Developed hardware firmware with AWS infrastructure',
      requestedM42Resources:
        'Formal partnership with M42 Ambulatory Healthcare Services and joint clinical pathways.',
      impactedPatientPopulations: ['Adult Patients', "Women's health"],
      clinicalAreas: ['Chronic Care', 'Virtual Health'],
    },
  },
]
