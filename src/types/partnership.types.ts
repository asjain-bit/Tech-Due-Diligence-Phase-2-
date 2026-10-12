export type PartnershipStatus = 'Shortlisted' | 'Pending' | 'New' | 'Rejected'

export type StageStatus = 'completed' | 'in_progress' | 'not_started'

export interface WorkflowStage {
  id: number
  title: string
  subheading: 'Completed' | 'In Progress' | 'Not Started'
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
}

export interface KeyAssessmentAreas {
  stageOfMaturityAndExperience: string // *
  growthJourneyAndRegionalExperience: string // *
  proposalOfCollaboration: string // *
  productPlatformServiceDetails: string // *
  focusAreas: string[] // *
  solutionMaturityLevelAndRegulatory: string // *
  relevantApprovals?: string // optional
  noveltyAndDifferentiation: string // *
  developmentApproach?: string // optional
  requestedM42Resources: string // *
  impactedPatientPopulations?: string[] // optional
}

export interface UploadedDoc {
  id: string
  name: string
  size: string
  type: string
}

export interface PartnershipRequest {
  id: string
  companyName: string
  vendorName: string
  solution: string
  focusArea: string
  solutionMaturity: string
  status: PartnershipStatus
  submittedOn: string
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
  decision?: {
    status: 'proceeded' | 'rejected'
    reason?: string
    date?: string
    decidedBy?: string
  }
}

export const INITIAL_PARTNERSHIP_REQUESTS: PartnershipRequest[] = [
  {
    id: 'req-001',
    companyName: 'AlphaHealth BioTech',
    vendorName: 'Dr. Tariq Mansoor',
    solution: 'CardioScan AI Diagnostic Platform',
    focusArea: 'Cardiology & Precision Health',
    solutionMaturity: 'Clinical Validation & Pilot',
    status: 'New',
    submittedOn: '12 Oct 2026',
    workflowStages: [
      { id: 1, title: 'Submission', subheading: 'Completed', status: 'completed' },
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
        id: 'doc-1',
        name: 'Digital_Transformation_RFP.pdf',
        size: '2.8 MB',
        type: 'APPLICATION/PDF',
      },
      {
        id: 'doc-2',
        name: 'Enterprise_Architecture_Specs.pdf',
        size: '1.4 MB',
        type: 'APPLICATION/PDF',
      },
      {
        id: 'doc-3',
        name: 'Workplace_Requirements_Matrix.pdf',
        size: '920 KB',
        type: 'APPLICATION/PDF',
      },
    ],
    companyInfo: {
      name: 'Dr. Tariq Mansoor',
      jobTitle: 'Chief Executive Officer & Founder',
      company: 'AlphaHealth BioTech Ltd.',
      phoneNumber: '+971 50 234 5678',
      email: 'tariq.mansoor@alphahealth.ae',
      yearFounded: '2021',
    },
    assessmentAreas: {
      stageOfMaturityAndExperience:
        'Series A stage clinical AI enterprise with 5 years of specialized algorithmic R&D across cardiovascular modalities.',
      growthJourneyAndRegionalExperience:
        'Launched pilot programs in 3 European academic medical centers in 2023. Established Abu Dhabi ADGM presence in 2025 and conducted retrospective validation on 14,000 regional ECG records.',
      proposalOfCollaboration:
        'Collaborate with M42 to integrate CardioScan AI into primary care and ambulatory cardiology pathways, enabling rapid automated detection of heart failure and valvular irregularities.',
      productPlatformServiceDetails:
        'Cloud-native and edge-deployable AI inference engine processing standard 12-lead ECG waveforms and echocardiography Doppler streams with sub-minute turnaround.',
      focusAreas: [
        'Cardiology & Precision Health',
        'Clinical Workflow Automation',
        'Preventative Healthcare',
      ],
      solutionMaturityLevelAndRegulatory:
        'Demonstrated 94.2% diagnostic accuracy in retrospective multi-center trials. Currently in active regulatory submission with European notified body and preparing DoH Abu Dhabi submission.',
      relevantApprovals:
        'ISO 13485 certified, CE Mark Stage 2 audit cleared, Preliminary review under UAE MOHAP.',
      noveltyAndDifferentiation:
        'Proprietary transformer-based waveform interpretation with multi-lead cross-attention; achieves 38% reduction in false-positive referrals compared to legacy CAD solutions.',
      developmentApproach:
        'Developed entirely in-house by proprietary engineering and clinical team',
      requestedM42Resources:
        'Clinical validation access within M42 hospital network (Cleveland Clinic Abu Dhabi, Healthpoint), Epic EHR sandbox integration, and joint scientific publication sponsorship.',
      impactedPatientPopulations: ['Adult patients', "Women's health"],
    },
  },
  {
    id: 'req-002',
    companyName: 'NeuroVance Health Ltd',
    vendorName: 'Sarah Jenkins',
    solution: 'NeuroCognitive Screening Suite',
    focusArea: 'Neurology & Mental Health',
    solutionMaturity: 'Commercialized (CE Mark)',
    status: 'Pending',
    submittedOn: '08 Oct 2026',
    workflowStages: [
      { id: 1, title: 'Submission', subheading: 'Completed', status: 'completed' },
      { id: 2, title: 'Intake & Triage', subheading: 'Completed', status: 'completed' },
      { id: 3, title: 'Screening & Fit', subheading: 'In Progress', status: 'in_progress' },
      { id: 4, title: 'NDA & Discovery', subheading: 'Not Started', status: 'not_started' },
      { id: 5, title: 'Value Assessment', subheading: 'Not Started', status: 'not_started' },
      { id: 6, title: 'Due Diligence', subheading: 'Not Started', status: 'not_started' },
      { id: 7, title: 'Term Sheet & Pilot', subheading: 'Not Started', status: 'not_started' },
    ],
    overviewCards: {
      evidence: 'Clinical trial completed',
      deployment: '6 live hospital sites',
      regulatory: 'CE Mark Approved',
      duplicateCheck: 'Clear',
    },
    sowDetails: {
      sowName: 'NeuroVance Health — NeuroCognitive Screening Suite',
      sowDeadline: '15/11/2026',
      tokenConsumption: '1450',
    },
    uploadedDocuments: [
      {
        id: 'doc-4',
        name: 'NeuroVance_Clinical_Whitepaper.pdf',
        size: '3.1 MB',
        type: 'APPLICATION/PDF',
      },
      {
        id: 'doc-5',
        name: 'CE_MDR_Certificate_Class_IIa.pdf',
        size: '1.2 MB',
        type: 'APPLICATION/PDF',
      },
      {
        id: 'doc-6',
        name: 'Integration_Architecture_Guide.pdf',
        size: '840 KB',
        type: 'APPLICATION/PDF',
      },
    ],
    companyInfo: {
      name: 'Sarah Jenkins',
      jobTitle: 'VP of Global Partnerships',
      company: 'NeuroVance Health Ltd',
      phoneNumber: '+44 20 7946 0912',
      email: 's.jenkins@neurovancehealth.com',
      yearFounded: '2019',
    },
    assessmentAreas: {
      stageOfMaturityAndExperience:
        'Established growth-stage digital neurology company with commercial deployments across the NHS and GCC private health providers.',
      growthJourneyAndRegionalExperience:
        'Scaled to 6 major teaching hospitals in the UK and UAE. Piloted in Dubai Healthcare City in 2024 with over 8,500 patient screenings conducted.',
      proposalOfCollaboration:
        'Partner with M42 to deploy tablet and VR-based cognitive biomarker screening across elderly care and neurological outpatient clinics.',
      productPlatformServiceDetails:
        'Proprietary gamified digital neuro-assessment capturing micro-saccades, motor reaction latency, and verbal recall metrics within 10 minutes.',
      focusAreas: ['Neurology & Mental Health', 'Preventative Healthcare', 'Digital Therapeutics'],
      solutionMaturityLevelAndRegulatory:
        'Commercial stage with full CE Mark MDR Class IIa certification and ISO 27001 data security compliance.',
      relevantApprovals: 'CE Mark (MDR 2017/745 Class IIa), ISO 13485, UKCA marked.',
      noveltyAndDifferentiation:
        'Eye-tracking augmented cognitive assessment yielding 89% sensitivity in detecting mild cognitive impairment (MCI) 3 years before clinical symptom onset.',
      developmentApproach:
        'Co-developed with University of Oxford Department of Clinical Neurosciences.',
      requestedM42Resources:
        'Clinical trial partnership for bilingual Arabic/English dialect normalization, pilot site hosting, and procurement framework agreement.',
      impactedPatientPopulations: ['Adult patients', 'Pediatric patients'],
    },
  },
  {
    id: 'req-003',
    companyName: 'GenomicX MENA FZ-LLC',
    vendorName: 'Karim El-Sayed',
    solution: 'Rare Disease Variant Interpreter',
    focusArea: 'Genomics & Oncology',
    solutionMaturity: 'Commercial / FDA 510(k)',
    status: 'Shortlisted',
    submittedOn: '01 Oct 2026',
    workflowStages: [
      { id: 1, title: 'Submission', subheading: 'Completed', status: 'completed' },
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
      {
        id: 'doc-9',
        name: 'UAE_Genome_Program_Alignment.pdf',
        size: '1.1 MB',
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
    },
    assessmentAreas: {
      stageOfMaturityAndExperience:
        'Mature clinical bioinformatics provider specializing in whole-genome and exome sequencing analysis for hereditary and rare conditions.',
      growthJourneyAndRegionalExperience:
        'Established in Boston with EMEA headquarters in Dubai Science Park since 2021. Actively processing research cohorts for Middle Eastern population genetics.',
      proposalOfCollaboration:
        'Direct pipeline integration with the Emirati Genome Program and M42 Omics Centre of Excellence to accelerate automated ACMG classification for pediatric rare disorders.',
      productPlatformServiceDetails:
        'AI variant filtering and interpretation platform cross-referencing population-specific allele frequencies with clinical phenotyping data in under 4 minutes per genome.',
      focusAreas: ['Genomics & Oncology', 'Precision Health & Diagnostics', 'Rare Diseases'],
      solutionMaturityLevelAndRegulatory:
        'Commercial platform cleared under FDA 510(k) and IVDR certified in the European Union.',
      relevantApprovals: 'FDA 510(k) Class II, CE-IVD, ISO 15189 compliance.',
      noveltyAndDifferentiation:
        'Contains the largest curated database of MENA-specific non-coding variants; reduces unclassified variants of unknown significance (VUS) by 42%.',
      developmentApproach: 'Developed in-house with Harvard Medical School research affiliations',
      requestedM42Resources:
        'High-throughput sequencing pipeline integration, clinical geneticist pilot evaluation, and enterprise biobanking access.',
      impactedPatientPopulations: ['Adult patients', 'Pediatric patients', "Women's health"],
    },
  },
  {
    id: 'req-004',
    companyName: 'CarePulse Technologies',
    vendorName: 'Elena Rostova',
    solution: 'Remote Patient Monitoring & Triage',
    focusArea: 'Virtual Care & Remote Monitoring',
    solutionMaturity: 'Commercial (DOH Approved)',
    status: 'Pending',
    submittedOn: '28 Sep 2026',
    workflowStages: [
      { id: 1, title: 'Submission', subheading: 'Completed', status: 'completed' },
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
      {
        id: 'doc-11',
        name: 'DoH_Abu_Dhabi_Approval_Certificate.pdf',
        size: '980 KB',
        type: 'APPLICATION/PDF',
      },
      {
        id: 'doc-12',
        name: 'Security_Architecture_and_FHIR_Specs.pdf',
        size: '1.5 MB',
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
    },
    assessmentAreas: {
      stageOfMaturityAndExperience:
        'Commercial scale RPM platform currently managing over 25,000 active chronic disease patients across the UAE and Saudi Arabia.',
      growthJourneyAndRegionalExperience:
        'Bootstrapped to initial UAE traction in 2020, secured DoH telehealth licensure in 2022, and integrated with major private health networks across Abu Dhabi and Al Ain.',
      proposalOfCollaboration:
        'Integrate CarePulse RPM with M42 virtual health centers for post-discharge hypertension, diabetes, and COPD patients to lower 30-day readmissions.',
      productPlatformServiceDetails:
        'Cellular-enabled connected devices (BP cuff, glucometer, pulse oximeter) coupled with an AI clinical escalation dashboard that notifies care coordinators of vitals deterioration.',
      focusAreas: [
        'Virtual Care & Remote Monitoring',
        'Clinical Workflow Automation',
        'Preventative Healthcare',
      ],
      solutionMaturityLevelAndRegulatory:
        'Fully commercialized with Department of Health Abu Dhabi telemedicine and RPM authorization.',
      relevantApprovals: 'DoH Abu Dhabi Telehealth License, CE Mark Class I, ISO 27001.',
      noveltyAndDifferentiation:
        'Zero-pairing cellular hub requiring no patient smartphone or Wi-Fi setup; achieves 88% continuous adherence in elderly diabetic populations.',
      developmentApproach:
        'Proprietary hardware firmware with cloud AWS-Middle East infrastructure',
      requestedM42Resources:
        'Formal partnership with M42 Ambulatory Healthcare Services (AHS), joint remote patient monitoring clinical pathways, and formulary inclusion.',
      impactedPatientPopulations: ['Adult patients', "Women's health"],
    },
  },
]
