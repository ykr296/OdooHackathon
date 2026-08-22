// Mock dataset for the Dayflow HRMS frontend.
// This stands in for a real backend so the UI is fully demoable.
// Swap `useStore`'s persistence layer for real API calls when the backend is ready.

export const AVATAR_PALETTE = [
  "#7C5CFC", "#3ECF8E", "#EFB93E", "#F0576B", "#3EA6CF", "#C77DFF", "#FF9F5A",
];

export function colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export function initials(first, last) {
  return `${(first || "?")[0] || ""}${(last || "")[0] || ""}`.toUpperCase();
}

// Login ID format per the wireframe note (14 characters):
//  1-2   Company code                    e.g. OI  (Odoo India)
//  3-4   First 2 letters of first name   e.g. RI  (Riya)
//  5-6   First 2 letters of last name    e.g. SH  (Sharma)
//  7-10  Year of joining                 e.g. 2025
//  11-14 Serial number of joining, for that year, zero-padded to 4 digits
export function generateLoginId({ companyCode, firstName, lastName, joinYear, serial }) {
  const first2 = (firstName || "").slice(0, 2).toUpperCase().padEnd(2, "X");
  const last2 = (lastName || "").slice(0, 2).toUpperCase().padEnd(2, "X");
  const serialPart = String(serial).padStart(4, "0");
  return `${companyCode}${first2}${last2}${joinYear}${serialPart}`;
}

// Derives a 2-letter company code from a (possibly multi-word) company name,
// e.g. "Odoo India" -> "OI". Falls back to the first 2 letters of a single word.
export function deriveCompanyCode(companyName) {
  const words = (companyName || "").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (companyName || "XX").replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase().padEnd(2, "X");
}

export function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Password policy enforced on Sign Up. Each rule has an id, a human label,
// and a test function. Used to both validate and render a live checklist.
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "One special character (!@#$%^&*)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function passwordFailures(password) {
  return PASSWORD_RULES.filter((r) => !r.test(password || ""));
}

export function isPasswordValid(password) {
  return passwordFailures(password).length === 0;
}

// Mock email verification: generates a 6-digit code. In a real backend this
// would be emailed to the user; here we surface it directly in the UI since
// there's no mail server behind this frontend-only demo.
export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Live (right-now) presence status for a user, independent of the historical
// per-day "status" recorded on attendance rows. Used for the status dot in
// the top nav, employee cards, and profile header.
//  - "present"        checked in today, hasn't checked out yet     -> green dot
//  - "checked-out"    checked in AND out today                     -> grey dot
//  - "leave"          on an approved paid/sick leave that covers today -> airplane icon
//  - "absent"         hasn't checked in, no leave applied, marked absent -> yellow dot
//  - "not-checked-in" hasn't checked in yet today (default/default state) -> red dot
export function getLiveStatus(user, attendance, timeOffRequests) {
  const today = new Date().toISOString().slice(0, 10);
  const records = (attendance && attendance[user.id]) || [];
  const todayRecord = records.find((r) => r.date === today);

  if (todayRecord?.checkIn && todayRecord?.checkOut) return "checked-out";
  if (todayRecord?.checkIn) return "present";

  const onApprovedLeave = (timeOffRequests || []).some(
    (r) =>
      r.employeeId === user.id &&
      r.status === "approved" &&
      r.type !== "unpaid" &&
      today >= r.startDate &&
      today <= r.endDate
  );
  if (onApprovedLeave) return "leave";

  if (user.status === "absent") return "absent";

  return "not-checked-in";
}

const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d); };

export const seedCompany = {
  name: "Odoo India",
  code: "OI",
  logo: null,
};

export const seedUsers = [
  {
    id: "u1",
    loginId: "OIARDE20220001",
    password: "Welcome@123",
    role: "admin",
    firstName: "Aarav",
    lastName: "Deshpande",
    email: "aarav.deshpande@odooindia.com",
    phone: "+91 98200 11223",
    department: "Human Resources",
    designation: "HR Manager",
    manager: "—",
    dateOfJoining: "2022-03-14",
    dateOfBirth: "1991-07-02",
    address: "204, Lakeview Residency, Baner, Pune",
    status: "present",
    resume: {
      about: "Leads HR operations, hiring, and people programs across the company.",
      skills: ["People Ops", "Payroll Compliance", "Recruiting", "Conflict Resolution"],
      experience: [
        { role: "HR Manager", company: "Odoo India", period: "2022 — Present" },
        { role: "HR Generalist", company: "Cascade Systems", period: "2018 — 2022" },
      ],
      certifications: ["SHRM-CP", "Payroll Management Certification"],
    },
    privateInfo: {
      personalEmail: "aarav.d@gmail.com",
      emergencyContact: "Priya Deshpande — +91 98200 99887",
      bankAccount: "HDFC •••• 4471",
      panNumber: "ABCDE1234F",
      aadhaar: "•••• •••• 4432",
    },
    documents: [
      { id: "d1", name: "Offer Letter.pdf", uploadedOn: "2022-03-10", uploadedBy: "Admin" },
      { id: "d2", name: "PAN Card.pdf", uploadedOn: "2022-03-12", uploadedBy: "Admin" },
    ],
    salary: {
      monthWage: 95000,
      yearlyWage: 1140000,
      workingDaysPerWeek: 5,
      hrsPerDay: 8,
      compositionType: "percentage", // 'fixed' | 'percentage'
      basicPct: 50,
      hraPct: 50,
      components: {
        basic: 47500,
        hra: 23750,
        standardAllowance: 8000,
        leaveTravelAllowance: 6000,
        foodAllowance: 2500,
      },
      deductions: {
        pfEmployeePct: 12,
        pfEmployerPct: 12,
        professionalTax: 200,
      },
    },
  },
  {
    id: "u2",
    loginId: "OIRISH20230001",
    password: "Welcome@123",
    role: "employee",
    firstName: "Riya",
    lastName: "Sharma",
    email: "riya.sharma@odooindia.com",
    phone: "+91 90112 33445",
    department: "Engineering",
    designation: "Frontend Engineer",
    manager: "Karthik Iyer",
    dateOfJoining: "2023-06-01",
    dateOfBirth: "1997-01-19",
    address: "12B, Palm Grove Apartments, Kothrud, Pune",
    status: "present",
    resume: {
      about: "Builds and maintains the employee-facing product surface. Loves clean UI and fast pages.",
      skills: ["React", "TypeScript", "Tailwind CSS", "Accessibility"],
      experience: [
        { role: "Frontend Engineer", company: "Odoo India", period: "2023 — Present" },
        { role: "SDE Intern", company: "Quickfox Labs", period: "2022 — 2023" },
      ],
      certifications: ["Meta Front-End Developer"],
    },
    privateInfo: {
      personalEmail: "riya.sharma19@gmail.com",
      emergencyContact: "Anita Sharma — +91 90112 00110",
      bankAccount: "ICICI •••• 2290",
      panNumber: "BXPQR9988K",
      aadhaar: "•••• •••• 7712",
    },
    documents: [
      { id: "d3", name: "Offer Letter.pdf", uploadedOn: "2023-05-28", uploadedBy: "Admin" },
      { id: "d4", name: "Aadhaar Card.pdf", uploadedOn: "2023-06-02", uploadedBy: "Admin" },
    ],
    salary: {
      monthWage: 62000,
      yearlyWage: 744000,
      workingDaysPerWeek: 5,
      hrsPerDay: 8,
      compositionType: "percentage",
      basicPct: 50,
      hraPct: 50,
      components: {
        basic: 31000,
        hra: 15500,
        standardAllowance: 6000,
        leaveTravelAllowance: 5000,
        foodAllowance: 2000,
      },
      deductions: {
        pfEmployeePct: 12,
        pfEmployerPct: 12,
        professionalTax: 200,
      },
    },
  },
  {
    id: "u3",
    loginId: "OIKAIY20210001",
    password: "Welcome@123",
    role: "employee",
    firstName: "Karthik",
    lastName: "Iyer",
    email: "karthik.iyer@odooindia.com",
    phone: "+91 99000 44556",
    department: "Engineering",
    designation: "Engineering Lead",
    manager: "Aarav Deshpande",
    dateOfJoining: "2021-11-08",
    dateOfBirth: "1989-05-30",
    address: "45, Sunrise Heights, Viman Nagar, Pune",
    status: "leave",
    resume: {
      about: "Leads the platform engineering team; focused on reliability and developer experience.",
      skills: ["System Design", "Node.js", "Kubernetes", "Mentoring"],
      experience: [
        { role: "Engineering Lead", company: "Odoo India", period: "2021 — Present" },
        { role: "Senior Engineer", company: "Bracket Labs", period: "2017 — 2021" },
      ],
      certifications: ["AWS Solutions Architect"],
    },
    privateInfo: {
      personalEmail: "karthik.iyer@gmail.com",
      emergencyContact: "Meera Iyer — +91 99000 11228",
      bankAccount: "Axis •••• 6634",
      panNumber: "CQWRT4455L",
      aadhaar: "•••• •••• 2201",
    },
    documents: [
      { id: "d5", name: "Offer Letter.pdf", uploadedOn: "2021-11-01", uploadedBy: "Admin" },
    ],
    salary: {
      monthWage: 118000,
      yearlyWage: 1416000,
      workingDaysPerWeek: 5,
      hrsPerDay: 8,
      compositionType: "percentage",
      basicPct: 50,
      hraPct: 50,
      components: {
        basic: 59000,
        hra: 29500,
        standardAllowance: 9000,
        leaveTravelAllowance: 7000,
        foodAllowance: 2500,
      },
      deductions: {
        pfEmployeePct: 12,
        pfEmployerPct: 12,
        professionalTax: 200,
      },
    },
  },
  {
    id: "u4",
    loginId: "OISAPA20240001",
    password: "Welcome@123",
    role: "employee",
    firstName: "Sanya",
    lastName: "Patil",
    email: "sanya.patil@odooindia.com",
    phone: "+91 98765 22110",
    department: "Design",
    designation: "Product Designer",
    manager: "Aarav Deshpande",
    dateOfJoining: "2024-02-19",
    dateOfBirth: "1998-09-11",
    address: "7, Willow Park, Hinjewadi, Pune",
    status: "absent",
    resume: {
      about: "Designs end-to-end product flows and maintains the design system.",
      skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
      experience: [
        { role: "Product Designer", company: "Odoo India", period: "2024 — Present" },
        { role: "UI Designer", company: "Freelance", period: "2021 — 2024" },
      ],
      certifications: ["Google UX Design"],
    },
    privateInfo: {
      personalEmail: "sanya.patil@gmail.com",
      emergencyContact: "Rohan Patil — +91 98765 99001",
      bankAccount: "SBI •••• 1183",
      panNumber: "DZXQP2231M",
      aadhaar: "•••• •••• 5567",
    },
    documents: [
      { id: "d6", name: "Offer Letter.pdf", uploadedOn: "2024-02-12", uploadedBy: "Admin" },
    ],
    salary: {
      monthWage: 58000,
      yearlyWage: 696000,
      workingDaysPerWeek: 5,
      hrsPerDay: 8,
      compositionType: "percentage",
      basicPct: 50,
      hraPct: 50,
      components: {
        basic: 29000,
        hra: 14500,
        standardAllowance: 5500,
        leaveTravelAllowance: 4500,
        foodAllowance: 2000,
      },
      deductions: {
        pfEmployeePct: 12,
        pfEmployerPct: 12,
        professionalTax: 200,
      },
    },
  },
];

// Attendance keyed by userId -> array of { date, checkIn, checkOut, status }
export const seedAttendance = {
  u1: [
    { date: daysAgo(2), checkIn: "09:58", checkOut: "18:42", status: "present" },
    { date: daysAgo(1), checkIn: "10:04", checkOut: "19:01", status: "present" },
    { date: daysAgo(0), checkIn: "", checkOut: "", status: "present" },
  ],
  u2: [
    { date: daysAgo(2), checkIn: "09:47", checkOut: "18:30", status: "present" },
    { date: daysAgo(1), checkIn: "09:55", checkOut: "18:12", status: "present" },
    { date: daysAgo(0), checkIn: "", checkOut: "", status: "present" },
  ],
  u3: [
    { date: daysAgo(2), checkIn: "10:12", checkOut: "19:20", status: "present" },
    { date: daysAgo(1), checkIn: "", checkOut: "", status: "leave" },
    { date: daysAgo(0), checkIn: "", checkOut: "", status: "leave" },
  ],
  u4: [
    { date: daysAgo(2), checkIn: "09:40", checkOut: "18:05", status: "present" },
    { date: daysAgo(1), checkIn: "10:20", checkOut: "17:58", status: "half-day" },
    { date: daysAgo(0), checkIn: "", checkOut: "", status: "absent" },
  ],
};

export const seedTimeOffAllocations = {
  u1: { paid: { total: 24, used: 6 }, sick: { total: 12, used: 1 }, unpaid: { used: 0 } },
  u2: { paid: { total: 20, used: 4 }, sick: { total: 10, used: 2 }, unpaid: { used: 0 } },
  u3: { paid: { total: 20, used: 9 }, sick: { total: 10, used: 3 }, unpaid: { used: 1 } },
  u4: { paid: { total: 18, used: 3 }, sick: { total: 10, used: 5 }, unpaid: { used: 0 } },
};

export const seedTimeOffRequests = [
  {
    id: "t1",
    employeeId: "u3",
    type: "paid",
    startDate: daysAgo(1),
    endDate: daysAgo(0),
    days: 2,
    remarks: "Family function out of town.",
    status: "approved",
    attachment: null,
  },
  {
    id: "t2",
    employeeId: "u4",
    type: "sick",
    startDate: daysAgo(0),
    endDate: daysAgo(-1),
    days: 2,
    remarks: "Fever, resting at home.",
    status: "pending",
    attachment: "sick_note.pdf",
  },
  {
    id: "t3",
    employeeId: "u2",
    type: "paid",
    startDate: daysAgo(-6),
    endDate: daysAgo(-4),
    days: 3,
    remarks: "Trip planned with family.",
    status: "pending",
    attachment: null,
  },
];
