import React from 'react';
import { 
  School, 
  Award, 
  Briefcase, 
  Flag,
  Trophy,
  Medal,
  FileBadge,
  Users,
  Rocket
} from 'lucide-react';

export const translations = {
  en: {
    nav: ['About', 'Education', 'Experience', 'Projects', 'Skills', 'Certifications'],
    contactBtn: 'Hire Me',
    badge: 'Portfolio 2026',
    heroDesc: 'Accounting graduate & Certified Tax Technician (CTT). Bridging the gap between tax compliance and cutting-edge automation.',
    downloadBtn: 'Download CV',
    aboutHeader: 'About Me',
    aboutSub: 'A brief introduction to my professional background and career goals.',
    aboutText: 'Accounting graduate with a strong focus on taxation and certified as a Tax Technician (CTT). Experienced in handling tax compliance, including processing 200+ tax invoices and assisting 40+ individual taxpayers in annual tax return. Detail-oriented and analytical, with proven ability to ensure accuracy in tax reporting and support financial operations. Seeking to leverage my skills as a Tax or Accounting Staff in a dynamic organization.',
    stat1: 'Invoices Processed',
    stat2: 'Taxpayers Assisted',
    eduHeader: 'Academic Background',
    eduSub: 'My educational journey and specialized training in accounting and tax.',
    coursesBtn: "Courses I've Taken",
    expTabs: { work: 'Work Experience', org: 'Organizational Experience' },
    expHeader: 'Career Experiences',
    expSub: 'Proven track record in tax compliance and financial reporting across various roles.',
    projectsHeader: 'Featured Projects',
    projectsSub: 'Evidence of technical projects where I applied accounting and tax logic through digital solutions.',
    projectCriticalOutputs: 'Critical Outputs',
    launchArchive: 'View Project',
    viewProjectBtn: 'View Project',
    timelineHeader: 'Professional Roadmap',
    milestones: [
      { year: '2021', event: 'Graduated from MAN 3 Sleman & Entered University', icon: School },
      { year: '2023', event: 'Certified Tax Technician (CTT)', icon: FileBadge },
      { year: '2024', event: 'Directorate General of Taxes Volunteer & Internship', icon: Award },
      { year: '2024', event: 'System Analyst "My Tax"', icon: Rocket },
      { year: '2025', event: 'Bachelor of Sharia Accounting Graduation', icon: Trophy },
      { year: '2025', event: 'Internship at PT Mitra Graha Integrasi', icon: Briefcase }
    ],
    skillsHeader: 'Professional Skills',
    skillsSub: 'A comprehensive mix of technical tax knowledge and digital software proficiency.',
    technicalDetailText: 'Specializing in data processing using VLOOKUP, HLOOKUP, and Pivot Table functions for data auditing efficiency.',
    certHeader: 'Licenses & Certifications',
    certSub: 'Validating my expertise through recognized professional bodies and academies.',
    seeMoreBtn: 'See More',
    certDescriptions: {
      appreciation: 'Official recognition for dedication, active contribution, and outstanding achievements across various organizational and professional activities.',
      completion: 'Formal certification of successful completion of a self-development program and specialized skills training.',
      committee: 'Certification of dedication and active involvement in organizing committees and managerial responsibilities across a range of professional activities.',
      competency: 'Recognition of specific competencies attained through standardized professional examinations in various technical fields.'
    },
    contactHeader: "Let's Connect",
    contactSub: 'Interested in working together? Reach out via email or the form below.',
    contactDetailsTitle: 'Contact Details',
    viewCertBtn: 'View Certificate',
    formName: 'Full Name',
    formLastName: 'Last Name',
    formEmail: 'Email',
    formMsg: 'How can I help you?',
    formBtn: 'Submit Inquiry',
    hardSkills: [
      { name: 'Bookkeeping', category: 'accounting' },
      { name: 'Financial Statement Analysis', category: 'finance' },
      { name: 'Core Tax Administration System', category: 'tax' },
      { name: 'Tax Compliance', category: 'tax' },
      { name: 'Tax Accounting', category: 'accounting' },
      { name: 'Income Tax', category: 'tax' },
      { name: 'VAT', category: 'tax' },
      { name: 'Corporate Tax', category: 'tax' },
      { name: 'Tax Planning', category: 'tax' },
      { name: 'General Tax Provisions (KUP)', category: 'tax' }
    ],
    softSkills: [
      { name: 'Communication', icon: 'MessageSquare' },
      { name: 'Critical Thinking', icon: 'Brain' },
      { name: 'Detail Oriented', icon: 'Search' },
      { name: 'Fast Learner', icon: 'Zap' },
      { name: 'Problem Solving', icon: 'Lightbulb' },
      { name: 'Teamwork', icon: 'Users' },
      { name: 'Time Management', icon: 'Clock' },
      { name: 'Work Ethic', icon: 'Shield' }
    ],
    technicalTools: [
      { name: 'MS Word', logo: '/assets/tools/word.png' },
      { name: 'MS Excel', logo: '/assets/tools/excel.png' },
      { name: 'MS PowerPoint', logo: '/assets/tools/powerpoint.png' },
      { name: 'SPSS', logo: '/assets/tools/spss.png' },
      { name: 'Stata', logo: '/assets/tools/stata.png' },
      { name: 'E-Views', logo: '/assets/tools/eviews.png' },
      { name: 'G Suite', logo: '/assets/tools/gsuite.png' },
      { name: 'Python', logo: '/assets/tools/python.png' },
      { name: 'MYOB', logo: '/assets/tools/myob.png' },
      { name: 'Zahir Accounting', logo: '/assets/tools/zahir.png' },
      { name: 'Core Tax', logo: '/assets/tools/coretax.png' }
    ],
    eduData: [
      { id: 1, institution: "State Islamic University Sunan Kalijaga Yogyakarta", degree: "Bachelor of Islamic Accounting", period: "Aug 2021 - Jun 2025", gpa: "3.74 / 4.00", logo: "/assets/logos/uin-logo.png", details: ["Graduated with honors as the Highest & Most Accelerated Graduate of the Sharia Accounting Department.", "Authored an undergraduate thesis analyzing the correlation between ESG disclosures, board characteristics, and firm performance.", "Mastered computerized accounting systems and financial reporting standards to ensure high-accuracy data management."], courses: ["Cost Accounting", "Financial Accounting", "Tax Accounting", "Public Sector Accounting", "Information Systems Analysis and Design", "Financial Statement Analysis", "Economics", "Islamic Financial Management", "Risk Management", "Business and Economic Mathematics", "Auditing", "Taxation", "Accounting Information Systems", "Corporate Governance"] },
      { id: 2, institution: "Piranha Smart Center", degree: "Certificate in Tax Technician", period: "Jul 2023 - Sep 2023", gpa: "83.20 / 100.00", logo: "/assets/logos/psc-logo.png", details: ["Completed intensive certification in Indonesian taxation covering PPh, VAT, tax planning, and General Tax Provisions (KUP).", "Executed hands-on simulations for the preparation and reporting of monthly and annual tax returns (SPT).", "Developed technical proficiency in tax calculations and compliance procedures according to national regulations."], courses: ["Tax Accounting", "Stamp Duty, Land and Building Tax (PBB), & Land and Building Rights Acquisition Duty (BPHTB)", "General Tax Provisions and Procedures", "Tax Planning", "Corporate Income Tax", "Individual Income Tax", "Withholding Income Tax", "Unified Income Tax", "VAT and Luxury Goods Sales Tax"] },
      { id: 'sma', institution: "MAN 3 Sleman", degree: "Senior High School Graduate", period: "Jul 2018 - May 2021", gpa: "85.43 / 100.00", logo: "/assets/logos/man3-logo.png", details: ["Developed strong analytical and numerical skills through problem-solving and quantitative subjects.", "Active in student organizations, maintaining a balance between leadership roles and a strong academic record.", "Pursued the Natural Sciences (MIPA) curriculum with dedication to building a solid logical and disciplined foundation."], courses: ["English Language and Literature", "Indonesian Language", "Biology", "Economics", "Physics", "Informatics", "Chemistry", "Mathematics", "Islamic Religious Education"] }
    ],
    workData: [
      { id: 1, title: 'Tax Intern', company: 'PT Mitra Graha Integrasi', period: 'Nov 2025 - May 2026', location: 'Bogor City, ID', logo: "/assets/logos/migrasi-logo.png", details: ["Managed precision withholding tax (PPh 21, 23, 4(2)) calculations and timely e-Faktur issuance.", "Successfully reconciled financial statements with specific tax objects to ensure error-free SPT filings.", "Architected a systematic archival system for tax documentation to mitigate administrative penalty risks."] },
      { id: 2, title: 'Tax Volunteer', company: 'Directorate General of Taxes', period: 'Feb 2024 - Dec 2024', location: 'Bantul, ID', logo: "/assets/logos/djp-logo.png", details: ["Facilitated annual tax return (SPT) reporting for 40+ individual taxpayers through the e-Filing system.", "Provided technical guidance on EFIN activation and digital tax administration to enhance taxpayer compliance.", "Collaborated in community educational programs to increase public literacy on national tax obligations."] },
      { id: 3, title: 'System Analyst "My Tax"', company: 'Bangkit 2024 Batch 1 Capstone Project', period: 'Feb 2024 - Jul 2024', location: 'Sleman, ID', logo: "/assets/logos/tcuin-logo.png", details: ["Translated complex taxation business needs into structured system requirements (PIECES, workflows) for app development.", "Collaborated with cross-functional teams to deliver a cloud-based solution for VAT calculations and reporting logic.", "Optimized system architecture for tax data accuracy, ensuring seamless integration between inputs and outputs."] },
      { id: 4, title: 'Tax Intern', company: 'Mitra Setara Digitax', period: 'Jan 2024 - Feb 2024', location: 'Yogyakarta City, ID', logo: "/assets/logos/msd-logo.png", details: ["Spearheaded the migration of physical financial records to digital Excel bookkeeping, improving data accessibility.", "Processed and recorded over 200+ tax invoices using e-Faktur, maintaining consistency with monthly reporting aims.", "Mitigated reporting errors by conducting rigorous audits on 30+ prepopulated invoices against client ledger data."] }
    ],
    orgData: [
      { id: 1, title: 'Head of Community Service Division', company: 'Tax Center UIN Sunan Kalijaga', period: 'Sep 2023 - Sep 2024', location: 'Sleman, ID', logo: "/assets/logos/tcuin-logo.png", details: ["Spearheaded the development of informative tax-related digital content, resulting in a 100+ follower increase on Instagram within a single term.", "Personally assisted 10+ individual taxpayers in accurately completing and filing their Annual Tax Returns (SPT).", "Coordinated community outreach programs to bridge the gap between complex tax regulations and public understanding."] },
      { id: 2, title: 'Coordinator of Interest & Talents Department', company: 'HMPS Akuntansi Syariah', period: 'Feb 2023 - Feb 2024', location: 'Sleman, ID', logo: "/assets/logos/hmpsaks-logo.png", details: ["Facilitated specialized workshops and talent development programs for Islamic Accounting students through structured planning.", "Managed logistics and preparation support for students participating in regional and national accounting competitions.", "Collaborated with departmental faculty and interns to execute integrated work plans for student organization growth."] },
      { id: 3, title: 'Media & Documentation Staff (PDD)', company: '9th Febillionaire', period: 'Jul 2023 - Nov 2023', location: 'Sleman, ID', logo: "/assets/logos/9th-fbl-logo.png", details: ["Managed high-impact event publication materials and documentation for one of the institution's largest annual festivals.", "Designed visual assets for various digital platforms to maintain a consistent and professional event branding strategy.", "Coordinated with cross-functional divisions to ensure seamless information flow and event coverage."] },
      { id: 4, title: 'Event Division Staff', company: '6th Sharia Accounting Fair', period: 'Jul 2023 - Oct 2023', location: 'Sleman, ID', logo: "/assets/logos/6th-saf-logo.png", details: ["Organized a National Accounting Seminar, successfully managing logistics and guest speaker coordination for hundreds of participants.", "Supervised participant experience from registration to completion, ensuring the event met key institutional KPIs.", "Engineered a streamlined logistics flow for guest speakers and materials to maintain a punctual event schedule."] }
    ],
    projectsData: [
      { 
        id: 1, 
        title: 'Personal Financial Budget System', 
        category: 'Personal Project', 
        desc: 'Developed a spreadsheet-based personal financial management system integrated with Google Apps Script to automate transaction logging, budgeting, and the basic accounting cycle.',
        details: [
          'Automated input form using Google Apps Script.',
          'Real-time financial dashboard & trend visualization.',
          'E2E accounting cycle automation (Journal to Closing).'
        ],
        image: '/assets/projects/budget.png',
        link: 'https://docs.google.com/spreadsheets/d/1z8M98-ZcEEL1PGuQpNhuWxqzlB_J-0wE9UCl3fwLxx0/edit?usp=sharing'
      },
      { 
        id: 2, 
        title: "Tax Information System 'My Tax'", 
        category: 'Capstone Project', 
        desc: 'Designed a comprehensive tech solution to address inefficient tax reporting procedures and manual data entry burdens for clients and partners.',
        details: [
          'Solved independent tax calculation challenges.',
          'Reduced errors in tax calculation procedures.',
          'Optimized transaction data recording efficiency.'
        ],
        image: '/assets/projects/mytax.png',
        link: 'https://drive.google.com/drive/folders/1wCL99KqfPhOClrDTsUkVTvkDYXfwdJAQ?usp=sharing'
      },
      {
        id: 3,
        title: 'Accounting Information System for MSME Revenue Cycle',
        category: 'College Project',
        desc: 'Built a specialized technology and accounting information system for MSMEs focusing on streamlining the revenue cycle, improving recording transparency, and efficiency.',
        details: [
          'Automated revenue transaction logging.',
          'Improved financial transparency for MSMEs.',
          'Simplified reporting for the revenue cycle.'
        ],
        image: '/assets/projects/msme.png',
        link: 'https://docs.google.com/document/d/1nj12Dc6jyAIoUKxwXbTt2EQNe4-ziUit/edit#heading=h.trynm77i2zu6'
      },
      {
        id: 4,
        title: 'AI-Powered Portfolio Website Development',
        category: 'Web Development Project',
        desc: 'Development of an interactive portfolio website built using structured AI prompting techniques to generate efficient code and modern design.',
        details: [
          'Structured AI Prompting application',
          'Modern Web Technology integration (React, Tailwind)',
          'Responsive and interactive design',
          'Performance and animation optimization'
        ],
        image: '/assets/projects/portfolio.png',
        link: 'https://izzuls-portfolio.vercel.app/'
      }
    ],
    certsCategories: [
      { 
        id: 'appreciation', 
        icon: 'Trophy', 
        name: 'Certificate of Appreciation', 
        description: 'Awards and recognitions for tax volunteering, community service, and contributor roles.',
        items: [
          { title: 'Tax Volunteer Award 2024 - Bronze', image: '/assets/certificates/appreciation-relawan-bronze.png', link: '#' },
          { title: 'Bangkit Academy Contributor 2024', image: '/assets/certificates/appreciation-bangkit-2024.png', link: '#' },
          { title: 'Tax Volunteer Award 2024 - Silver', image: '/assets/certificates/appreciation-relawan-silver.png', link: '#' }
        ] 
      },
      { 
        id: 'completion', 
        icon: 'Medal', 
        name: 'Certificate of Completion', 
        description: 'Professional training and courses completion in tax, data science, and AI.',
        items: [
          { title: 'Google AI Professional Certificates - Google', image: '/assets/certificates/completion-google-ai-professional.jpg', link: '#' },
          { title: 'AI for Data Analysis - Google', image: '/assets/certificates/completion-google-ai-data.jpg', link: '#' },
          { title: 'AI for Content Creation - Google', image: '/assets/certificates/completion-google-ai-content.jpg', link: '#' },
          { title: 'AI for Writing and Communicating - Google', image: '/assets/certificates/completion-google-ai-writing.jpg', link: '#' },
          { title: 'AI for Research and Insights - Google', image: '/assets/certificates/completion-google-ai-research.png', link: '#' },
          { title: 'AI for Brainstorming and Planning - Google', image: '/assets/certificates/completion-google-ai-planning.png', link: '#' },
          { title: 'Praktik Kerja Lapangan - Mitra Setara Digitax', image: '/assets/certificates/completion-msd-pkl.png', link: '#' },
          { title: 'Introduction to Financial Literacy - Dicoding', image: '/assets/certificates/completion-dicoding-finance.png', link: '#' },
          { title: 'Belajar Dasar SQL - Dicoding', image: '/assets/certificates/completion-dicoding-sql.png', link: '#' },
          { title: 'Belajar Dasar Data Science - Dicoding', image: '/assets/certificates/completion-dicoding-ds.png', link: '#' },
          { title: 'Introduction to Data Science with Python - DQLab', image: '/assets/certificates/completion-dqlab-ds-python.png', link: '#' },
          { title: 'Python Fundamental for Data Science - DQLab', image: '/assets/certificates/completion-dqlab-python-fundamental.png', link: '#' },
          { title: 'Belajar Dasar AI - Dicoding', image: '/assets/certificates/completion-dicoding-ai.png', link: '#' },
          { title: 'Memulai Pemrograman dengan Python - Dicoding', image: '/assets/certificates/completion-dicoding-python.png', link: '#' },
          { title: 'Belajar Machine Learning untuk Pemula - Dicoding', image: '/assets/certificates/completion-dicoding-ml.png', link: '#' }
        ] 
      },
      { 
        id: 'committee', 
        icon: 'Users', 
        name: 'Certificate of Committee', 
        description: 'Organizational and event management roles in student associations and festivals.',
        items: [
          { title: 'Coordinator of Talents and Interest - HMPS AKS', image: '/assets/certificates/committee-hmps-koordinator.png', link: '#' },
          { title: 'Event Division - 6th Sharia Accounting Fair', image: '/assets/certificates/committee-saf-6.png', link: '#' },
          { title: 'Event Division - 5th Sharia Accounting Fair', image: '/assets/certificates/committee-saf-5.png', link: '#' },
          { title: 'Committee Member - Language Fest 2023', image: '/assets/certificates/committee-langfest-2023.png', link: '#' },
          { title: 'Committee Member - Language Fest 2022', image: '/assets/certificates/committee-langfest-2022.png', link: '#' },
          { title: 'Equipment Division - Ramadhan Fest 1444H', image: '/assets/certificates/committee-ramadhan-fest.png', link: '#' }
        ] 
      },
      { 
        id: 'competency', 
        icon: 'FileBadge', 
        name: 'Certificate of Competency', 
        description: 'Validation of technical skills in ICT, languages, and specialized accounting practicums.',
        items: [
          { title: 'Zahir User Certified', image: '/assets/certificates/competency-zahir-certified.png', link: '#' },
          { title: 'Certified Tax Technician (CTT)', image: '/assets/certificates/competency-piranha-brevet.png', link: '#' },
          { title: 'ICT Certification (TIK) - Excellent', image: '/assets/certificates/competency-tik.jpg', link: '#' },
          { title: 'Test of English Competence (TOEC)', image: '/assets/certificates/competency-toec.jpg', link: '#' },
          { title: 'Arabic Language Competence', image: '/assets/certificates/competency-arabic.jpg', link: '#' },
          { title: 'Practicum: Basic Sharia Accounting', image: '/assets/certificates/competency-sharia-acc.png', link: '#' },
          { title: 'Practicum: Manufacturing Accounting', image: '/assets/certificates/competency-manufacturing-acc.png', link: '#' },
          { title: 'Practicum: Audit', image: '/assets/certificates/competency-audit.png', link: '#' },
          { title: 'Practicum: Computer Accounting', image: '/assets/certificates/competency-computer-acc.png', link: '#' },
          { title: 'Practicum: Sharia Financial Accounting', image: '/assets/certificates/competency-sharia-finance.png', link: '#' },
          { title: 'Practicum: Intermediate Accounting', image: '/assets/certificates/competency-intermediate-acc.png', link: '#' },
          { title: 'Practicum: Statistics', image: '/assets/certificates/competency-statistics.png', link: '#' }
        ] 
      }
    ]
  },
  id: {
    nav: ['Tentang', 'Pendidikan', 'Pengalaman', 'Proyek', 'Keahlian', 'Sertifikasi'],
    contactBtn: 'Rekrut Saya',
    badge: 'Portofolio 2026',
    heroDesc: 'Lulusan Akuntansi & Teknisi Pajak Bersertifikat (CTT). Menjembatani kepatuhan pajak dengan otomasi mutakhir.',
    downloadBtn: 'Unduh CV',
    aboutHeader: 'Tentang Saya',
    aboutSub: 'Pengenalan singkat tentang latar belakang profesional dan tujuan karir saya.',
    aboutText: 'Lulusan Akuntansi dengan fokus kuat pada perpajakan dan bersertifikat Teknisi Pajak (CTT). Berpengalaman menangani kepatuhan pajak, termasuk memproses lebih dari 200 faktur pajak dan mendampingi 40+ wajib pajak dalam pelaporan SPT Tahunan. Teliti, analitis, dan berorientasi pada akurasi pelaporan keuangan guna mendukung operasional bisnis. Mencari peluang untuk berkontribusi sebagai Staf Pajak atau Akuntansi di organisasi yang dinamis.',
    stat1: 'Faktur Diproses',
    stat2: 'Wajib Pajak Dibantu',
    eduHeader: 'Latar Belakang Akademik',
    eduSub: 'Perjalanan pendidikan dan pelatihan khusus saya di bidang akuntansi dan pajak.',
    coursesBtn: "Mata Kuliah Diambil",
    expTabs: { work: 'Pengalaman Kerja', org: 'Pengalaman Organisasi' },
    expHeader: 'Pengalaman Karir',
    expSub: 'Rekam jejak terbukti dalam kepatuhan pajak dan pelaporan keuangan di berbagai peran.',
    projectsHeader: 'Proyek Unggulan',
    projectsSub: 'Bukti proyek teknis di mana saya merancang solusi digital untuk kebutuhan akuntansi dan perpajakan.',
    projectCriticalOutputs: 'Output Kritis',
    launchArchive: 'Lihat Proyek',
    viewProjectBtn: 'Lihat Proyek',
    timelineHeader: 'Peta Jalan Karir',
    milestones: [
      { year: '2021', event: 'Lulus MAN 3 Sleman & Masuk Perkuliahan', icon: School },
      { year: '2023', event: 'Sertifikasi Kompetensi Teknisi Pajak (CTT)', icon: FileBadge },
      { year: '2024', event: 'Relawan Pajak DJP & Magang Profesional', icon: Award },
      { year: '2024', event: 'System Analyst "My Tax"', icon: Rocket },
      { year: '2025', event: 'Kelulusan Sarjana Akuntansi Syariah', icon: Trophy },
      { year: '2025', event: 'Magang di PT Mitra Graha Integrasi', icon: Briefcase }
    ],
    skillsHeader: 'Keahlian Profesional',
    skillsSub: 'Kombinasi komprehensif antara pengetahuan pajak teknis dan kemahiran software digital.',
    technicalDetailText: 'Spesialisasi dalam pengolahan data menggunakan fungsi VLOOKUP, HLOOKUP, dan Pivot Table untuk efisiensi audit data.',
    certHeader: 'Lisensi & Sertifikasi',
    certSub: 'Validasi keahlian saya melalui badan profesional dan akademi yang diakui.',
    seeMoreBtn: 'Lihat selengkapnya',
    certDescriptions: {
      appreciation: 'Penghargaan resmi atas dedikasi, kontribusi aktif, serta prestasi yang diraih dalam berbagai kegiatan organisasi dan profesional.',
      completion: 'Sertifikasi formal atas keberhasilan menyelesaikan program pengembangan diri dan pelatihan berbasis keahlian khusus.',
      committee: 'Sertifikasi atas dedikasi dan keterlibatan aktif dalam kepanitiaan dan tanggung jawab manajerial di berbagai skala kegiatan profesional.',
      competency: 'Pengakuan atas kompetensi spesifik yang diraih melalui pengujian standar profesional di berbagai bidang keahlian teknis.'
    },
    contactHeader: "Mari Terhubung",
    contactSub: 'Tertarik untuk bekerja sama? Hubungi saya melalui email atau formulir di bawah.',
    contactDetailsTitle: 'Detail Kontak',
    viewCertBtn: 'Lihat Sertifikat',
    formName: 'Nama Lengkap',
    formLastName: 'Nama Belakang',
    formEmail: 'Email',
    formMsg: 'Bagaimana saya bisa membantu Anda?',
    formBtn: 'Kirim Pesan',
    hardSkills: [
      { name: 'Pembukuan', category: 'accounting' },
      { name: 'Analisis Laporan Keuangan', category: 'finance' },
      { name: 'Sistem Administrasi Perpajakan Core', category: 'tax' },
      { name: 'Kepatuhan Pajak', category: 'tax' },
      { name: 'Akuntansi Pajak', category: 'accounting' },
      { name: 'Pajak Penghasilan (PPh)', category: 'tax' },
      { name: 'PPN', category: 'tax' },
      { name: 'Pajak Perusahaan', category: 'tax' },
      { name: 'Perencanaan Pajak', category: 'tax' },
      { name: 'Ketentuan Umum Perpajakan (KUP)', category: 'tax' }
    ],
    softSkills: [
      { name: 'Komunikasi', icon: 'MessageSquare' },
      { name: 'Berpikir Kritis', icon: 'Brain' },
      { name: 'Berorientasi Detail', icon: 'Search' },
      { name: 'Pembelajar Cepat', icon: 'Zap' },
      { name: 'Penyelesaian Masalah', icon: 'Lightbulb' },
      { name: 'Kerja Sama Tim', icon: 'Users' },
      { name: 'Manajemen Waktu', icon: 'Clock' },
      { name: 'Etika Kerja', icon: 'Shield' }
    ],
    technicalTools: [
      { name: 'MS Word', logo: '/assets/tools/word.png' },
      { name: 'MS Excel', logo: '/assets/tools/excel.png' },
      { name: 'MS PowerPoint', logo: '/assets/tools/powerpoint.png' },
      { name: 'SPSS', logo: '/assets/tools/spss.png' },
      { name: 'Stata', logo: '/assets/tools/stata.png' },
      { name: 'E-Views', logo: '/assets/tools/eviews.png' },
      { name: 'G Suite', logo: '/assets/tools/gsuite.png' },
      { name: 'Python', logo: '/assets/tools/python.png' },
      { name: 'MYOB', logo: '/assets/tools/myob.png' },
      { name: 'Zahir Accounting', logo: '/assets/tools/zahir.png' },
      { name: 'Core Tax', logo: '/assets/tools/coretax.png' }
    ],
    eduData: [
      { id: 1, institution: "UIN Sunan Kalijaga Yogyakarta", degree: "Sarjana Akuntansi Syariah", period: "Agu 2021 - Jun 2025", gpa: "3.74 / 4.00", logo: "/assets/logos/uin-logo.png", details: ["Meraih predikat 'Lulusan Tercepat & Terbaik' Program Studi Akuntansi Syariah dengan IPK 3,74/4,00.", "Menyelesaikan riset skripsi mendalam mengenai pengaruh pengungkapan ESG, karakteristik dewan, dan struktur kepemilikan terhadap kinerja perusahaan.", "Menguasai implementasi sistem akuntansi terkomputerisasi untuk menjamin pelaporan keuangan yang akurat dan efisien."], courses: ["Akuntansi Biaya", "Akuntansi Keuangan", "Akuntansi Perpajakan", "Akuntansi Sektor Publik", "Analisis dan Perancangan Sistem Informasi", "Analisis Laporan Keuangan", "Ilmu Ekonomi", "Manajemen Keuangan Syariah", "Manajemen Risiko", "Matematika Ekonomi dan Bisnis", "Pengauditan", "Perpajakan", "Sistem Informasi Akuntansi", "Tata Kelola Perusahaan"] },
      { id: 2, institution: "Piranha Smart Center", degree: "Sertifikat Teknisi Perpajakan", period: "Jul 2023 - Sep 2023", gpa: "83.20 / 100.00", logo: "/assets/logos/psc-logo.png", details: ["Menyelesaikan pelatihan intensif perpajakan nasional (CTT) yang mencakup PPh, PPN, perencanaan pajak, dan KUP.", "Melakukan simulasi teknis serta praktik penyusunan dan pelaporan SPT Masa serta Tahunan untuk orang pribadi maupun badan.", "Membangun keahlian praktis dalam prosedur penghitungan dan pelaporan pajak sesuai regulasi Indonesia terbaru."], courses: ["Akuntansi Perpajakan", "Bea Materai, PBB, & BPHTB", "Ketentuan Umum dan Tata Cara Perpajakan (KUP)", "Perencanaan Pajak", "PPh Badan", "PPh Orang Pribadi", "PPh PotPut", "PPh Unifikasi", "PPN dan PPnBM"] },
      { id: 'sma', institution: "MAN 3 Sleman", degree: "Lulusan SMA", period: "Jul 2018 - Mei 2021", gpa: "85.43 / 100.00", logo: "/assets/logos/man3-logo.png", details: ["Mengembangkan kemampuan analitis dan numerik yang kuat melalui pemecahan masalah kompleks dan mata pelajaran kuantitatif.", "Aktif dalam organisasi sekolah dengan menjaga keseimbangan antara peran kepemimpinan dan catatan akademik yang solid.", "Menjalani studi di jurusan Ilmu Pengetahuan Alam (MIPA) dengan dedikasi untuk membangun dasar pemikiran yang logis dan disiplin."], courses: ["Bahasa dan Sastra Inggris", "Bahasa Indonesia", "Biologi", "Ekonomi", "Fisika", "Informatika", "Kimia", "Matematika", "Pendidikan Agama Islam"] }
    ],
    workData: [
      { id: 1, title: 'Magang Pajak', company: 'PT Mitra Graha Integrasi', period: 'Nov 2025 - Mei 2026', location: 'Kota Bogor, ID', logo: "/assets/logos/migrasi-logo.png", details: ["Mengelola siklus kalkulasi pajak potong pungut (PPh 21, 23, 4(2)) dan penerbitan e-Faktur secara presisi dan tepat waktu.", "Melakukan rekonsiliasi laporan keuangan terhadap objek pajak guna menjamin validitas dan kepatuhan pelaporan SPT.", "Mengimplementasikan sistem pengarsipan dokumen perpajakan yang sistematis guna memitigasi sanksi administratif."] },
      { id: 2, title: 'Relawan Pajak', company: 'DJP', period: 'Feb 2024 - Des 2024', location: 'Bantul, ID', logo: "/assets/logos/djp-logo.png", details: ["Mendampingi 40+ wajib pajak dalam pelaporan SPT Tahunan melalui sistem e-Filing dengan tingkat keberhasilan tinggi.", "Memberikan konsultasi teknis terkait aktivasi EFIN dan administrasi pajak digital untuk meningkatkan kepatuhan wajib pajak.", "Berkolaborasi dalam program edukasi masyarakat untuk meningkatkan literasi dan kesadaran akan kewajiban pajak nasional."] },
      { id: 3, title: 'System Analyst "My Tax"', company: 'Proyek Capstone Bangkit 2024 Batch 1', period: 'Feb 2024 - Jul 2024', location: 'Sleman, ID', logo: "/assets/logos/tcuin-logo.png", details: ["Mentransformasi kebutuhan bisnis perpajakan menjadi spesifikasi sistem terstruktur (PIECES, workflow) untuk pengembangan aplikasi.", "Berkolaborasi dengan tim lintas fungsi untuk membangun solusi berbasis cloud untuk logika perhitungan dan pelaporan PPN.", "Mengoptimalkan akurasi data perpajakan melalui perancangan arsitektur sistem yang mengutamakan integritas informasi."] },
      { id: 4, title: 'Magang Pajak', company: 'Mitra Setara Digitax', period: 'Jan 2024 - Feb 2024', location: 'Kota Yogyakarta, ID', logo: "/assets/logos/msd-logo.png", details: ["Melakukan digitalisasi pembukuan dengan memigrasi catatan fisik ke Excel, meningkatkan aksesibilitas dan akurasi data klien.", "Memproses dan memvalidasi lebih dari 200+ faktur pajak menggunakan e-Faktur dengan akurasi rekonsiliasi yang tinggi.", "Memitigasi risiko kesalahan laporan melalui verifikasi ketat terhadap 30+ data faktur prepopulated dengan catatan internal."] }
    ],
    orgData: [
      { id: 1, title: 'Ketua Divisi Pengabdian Masyarakat', company: 'Tax Center UIN Sunan Kalijaga', period: 'Sep 2023 - Sep 2024', location: 'Sleman, ID', logo: "/assets/logos/tcuin-logo.png", details: ["Memimpin pengembangan konten digital edukasi perpajakan yang informatif, menghasilkan peningkatan 100+ pengikut di Instagram dalam satu periode.", "Mendampingi secara personal 10+ wajib pajak dalam pengisian dan pelaporan SPT Tahunan secara akurat.", "Mengoordinasikan program literasi pajak untuk menjembatani regulasi perpajakan yang kompleks dengan pemahaman masyarakat."] },
      { id: 2, title: 'Koordinator Departemen Minat dan Bakat', company: 'HMPS Akuntansi Syariah', period: 'Feb 2023 - Feb 2024', location: 'Sleman, ID', logo: "/assets/logos/hmpsaks-logo.png", details: ["Memfasilitasi workshop spesialis dan pengembangan bakat mahasiswa Akuntansi Syariah melalui perencanaan yang terstruktur.", "Mengelola dukungan logistik dan persiapan bagi mahasiswa yang berpartisipasi dalam kompetisi akuntansi tingkat regional dan nasional.", "Berkolaborasi dengan fakultas dan staf intern untuk mengeksekusi rencana kerja terintegrasi bagi pertumbuhan organisasi."] },
      { id: 3, title: 'Staf Publikasi, Dekorasi, dan Dokumentasi (PDD)', company: '9th Febillionaire', period: 'Jul 2023 - Nov 2023', location: 'Sleman, ID', logo: "/assets/logos/9th-fbl-logo.png", details: ["Mengelola materi publikasi dan dokumentasi acara berskala besar untuk salah satu festival tahunan terbesar di institusi.", "Merancang aset visual untuk berbagai platform digital guna menjaga strategi branding acara yang konsisten dan profesional.", "Mengoordinasikan alur informasi antar divisi untuk memastikan cakupan acara yang menyeluruh dan tepat waktu."] },
      { id: 4, title: 'Staf Divisi Acara', company: '6th Sharia Accounting Fair', period: 'Jul 2023 - Okt 2023', location: 'Sleman, ID', logo: "/assets/logos/6th-saf-logo.png", details: ["Mengorganisir Seminar Akuntansi Nasional, mengelola logistik serta koordinasi pembicara tamu untuk ratusan peserta.", "Mengawasi pengalaman peserta dari awal pendaftaran hingga selesai, memastikan acara memenuhi standar KPI institusi.", "Merancang alur logistik pembicara dan materi yang efisien untuk menjaga ketepatan waktu jadwal acara."] }
    ],
    projectsData: [
      { 
        id: 1, 
        title: 'Sistem Anggaran Keuangan Pribadi', 
        category: 'Proyek Pribadi', 
        desc: 'Mengembangkan sistem manajemen keuangan pribadi berbasis spreadsheet yang terintegrasi dengan Google Apps Script untuk mengotomatisasi pencatatan transaksi, penganggaran, dan siklus akuntansi dasar.',
        details: [
          'Formulir input otomatis menggunakan Google Apps Script.',
          'Dashboard keuangan real-time & visualisasi tren.',
          'Otomasi siklus akuntansi E2E (Jurnal hingga Penutupan).'
        ],
        image: '/src/assets/projects/budget.png',
        link: 'https://docs.google.com/spreadsheets/d/1z8M98-ZcEEL1PGuQpNhuWxqzlB_J-0wE9UCl3fwLxx0/edit?usp=sharing'
      },
      { 
        id: 2, 
        title: "Sistem Informasi Perpajakan 'My Tax'", 
        category: 'Proyek Capstone', 
        desc: 'Merancang solusi teknologi komprehensif untuk mengatasi prosedur pelaporan pajak yang tidak efisien dan beban entri data manual bagi klien dan mitra.',
        details: [
          'Selesaikan tantangan perhitungan pajak mandiri.',
          'Kurangi kesalahan dalam prosedur perhitungan pajak.',
          'Optimalkan efisiensi pencatatan data transaksi.'
        ],
        image: '/src/assets/projects/mytax.png',
        link: 'https://drive.google.com/drive/folders/1wCL99KqfPhOClrDTsUkVTvkDYXfwdJAQ?usp=sharing'
      },
      {
        id: 3,
        title: 'Sistem Informasi Akuntansi Siklus Pendapatan UMKM',
        category: 'Proyek Kuliah',
        desc: 'Membangun sistem informasi akuntansi dan teknologi khusus untuk UMKM yang berfokus pada perampingan siklus pendapatan, meningkatkan transparansi pencatatan, dan efisiensi.',
        details: [
          'Otomasi pencatatan transaksi pendapatan.',
          'Tingkatkan transparansi keuangan untuk UMKM.',
          'Sederhanakan pelaporan siklus pendapatan.'
        ],
        image: '/src/assets/projects/msme.png',
        link: 'https://docs.google.com/document/d/1nj12Dc6jyAIoUKxwXbTt2EQNe4-ziUit/edit#heading=h.trynm77i2zu6'
      },
      {
        id: 4,
        title: 'Pembuatan Web Portofolio Berbasis AI Prompting',
        category: 'Proyek Pembuatan Web',
        desc: 'Pengembangan website portofolio interaktif yang dibangun menggunakan teknik AI prompting yang terstruktur untuk menghasilkan kode yang efisien dan desain yang modern.',
        details: [
          'Penerapan AI Prompting terstruktur',
          'Integrasi teknologi web modern (React, Tailwind)',
          'Desain responsif dan interaktif',
          'Optimasi performa dan animasi'
        ],
        image: '/src/assets/projects/portfolio.png',
        link: 'https://izzuls-portfolio.vercel.app/'
      }
    ],
    certsCategories: [
      { 
        id: 'appreciation', 
        icon: 'Trophy', 
        name: 'Sertifikat Apresiasi', 
        description: 'Penghargaan atas dedikasi sebagai relawan pajak, pengabdian masyarakat, dan kontributor program.',
        items: [
          { title: 'Relawan Pajak 2024 - Perunggu', image: '/assets/certificates/appreciation-relawan-bronze.png', link: '#' },
          { title: 'Kontributor Bangkit Academy 2024', image: '/assets/certificates/appreciation-bangkit-2024.png', link: '#' },
          { title: 'Relawan Pajak 2024 - Perak', image: '/assets/certificates/appreciation-relawan-silver.png', link: '#' }
        ] 
      },
      { 
        id: 'completion', 
        icon: 'Medal', 
        name: 'Sertifikat Penyelesaian', 
        description: 'Penyelesaian pelatihan profesional dan kursus di bidang perpajakan, data science, dan AI.',
        items: [
          { title: 'Google AI Professional Certificates - Google', image: '/assets/certificates/completion-google-ai-professional.jpg', link: '#' },
          { title: 'AI for Data Analysis - Google', image: '/assets/certificates/completion-google-ai-data.jpg', link: '#' },
          { title: 'AI for Content Creation - Google', image: '/assets/certificates/completion-google-ai-content.jpg', link: '#' },
          { title: 'AI for Writing and Communicating - Google', image: '/assets/certificates/completion-google-ai-writing.jpg', link: '#' },
          { title: 'AI for Research and Insights - Google', image: '/assets/certificates/completion-google-ai-research.png', link: '#' },
          { title: 'AI for Brainstorming and Planning - Google', image: '/assets/certificates/completion-google-ai-planning.png', link: '#' },
          { title: 'Praktik Kerja Lapangan - Mitra Setara Digitax', image: '/assets/certificates/completion-msd-pkl.png', link: '#' },
          { title: 'Introduction to Financial Literacy - Dicoding', image: '/assets/certificates/completion-dicoding-finance.png', link: '#' },
          { title: 'Belajar Dasar SQL - Dicoding', image: '/assets/certificates/completion-dicoding-sql.png', link: '#' },
          { title: 'Belajar Dasar Data Science - Dicoding', image: '/assets/certificates/completion-dicoding-ds.png', link: '#' },
          { title: 'Introduction to Data Science with Python - DQLab', image: '/assets/certificates/completion-dqlab-ds-python.png', link: '#' },
          { title: 'Python Fundamental for Data Science - DQLab', image: '/assets/certificates/completion-dqlab-python-fundamental.png', link: '#' },
          { title: 'Belajar Dasar AI - Dicoding', image: '/assets/certificates/completion-dicoding-ai.png', link: '#' },
          { title: 'Memulai Pemrograman dengan Python - Dicoding', image: '/assets/certificates/completion-dicoding-python.png', link: '#' },
          { title: 'Belajar Machine Learning untuk Pemula - Dicoding', image: '/assets/certificates/completion-dicoding-ml.png', link: '#' }
        ] 
      },
      { 
        id: 'committee', 
        icon: 'Users', 
        name: 'Sertifikat Kepanitiaan', 
        description: 'Peran dalam organisasi dan manajemen acara di himpunan mahasiswa dan festival.',
        items: [
          { title: 'Koordinator Minat dan Bakat - HMPS AKS', image: '/assets/certificates/committee-hmps-koordinator.png', link: '#' },
          { title: 'Divisi Acara - 6th Sharia Accounting Fair', image: '/assets/certificates/committee-saf-6.png', link: '#' },
          { title: 'Divisi Acara - 5th Sharia Accounting Fair', image: '/assets/certificates/committee-saf-5.png', link: '#' },
          { title: 'Panitia Pelaksana - Language Fest 2023', image: '/assets/certificates/committee-langfest-2023.png', link: '#' },
          { title: 'Panitia Pelaksana - Language Fest 2022', image: '/assets/certificates/committee-langfest-2022.png', link: '#' },
          { title: 'Divisi Perlengkapan - Ramadhan Fest 1444H', image: '/assets/certificates/committee-ramadhan-fest.png', link: '#' }
        ] 
      },
      { 
        id: 'competency', 
        icon: 'FileBadge', 
        name: 'Sertifikat Kompetensi', 
        description: 'Validasi keahlian teknis dalam TIK, bahasa, dan berbagai praktikum akuntansi spesialis.',
        items: [
          { title: 'Pengguna Zahir Bersertifikat', image: '/assets/certificates/competency-zahir-certified.png', link: '#' },
          { title: 'Teknisi Pajak Bersertifikat - Piranha Smart Center', image: '/assets/certificates/competency-piranha-brevet.png', link: '#' },
          { title: 'Sertifikasi TIK - Memuaskan', image: '/assets/certificates/competency-tik.jpg', link: '#' },
          { title: 'Test of English Competence (TOEC)', image: '/assets/certificates/competency-toec.jpg', link: '#' },
          { title: 'Tes Kompetensi Bahasa Arab', image: '/assets/certificates/competency-arabic.jpg', link: '#' },
          { title: 'Praktikum Akuntansi Syariah', image: '/assets/certificates/competency-sharia-acc.png', link: '#' },
          { title: 'Praktikum Akuntansi Manufaktur', image: '/assets/certificates/competency-manufacturing-acc.png', link: '#' },
          { title: 'Praktikum Audit', image: '/assets/certificates/competency-audit.png', link: '#' },
          { title: 'Praktikum Komputer Akuntansi', image: '/assets/certificates/competency-computer-acc.png', link: '#' },
          { title: 'Praktikum Akuntansi Keuangan Syariah', image: '/assets/certificates/competency-sharia-finance.png', link: '#' },
          { title: 'Praktikum Akuntansi Keuangan Menengah', image: '/assets/certificates/competency-intermediate-acc.png', link: '#' },
          { title: 'Praktikum Statistik', image: '/assets/certificates/competency-statistics.png', link: '#' }
        ] 
      }
    ]
  }
};
