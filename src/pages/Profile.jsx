import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, X, Camera } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Avatar, StatusDot } from "../components/Avatar";
import { getLiveStatus } from "../data/mockData";

const TABS = ["Resume", "Private Info", "Documents", "Salary Info"];

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { users, currentUser, updateProfile, updateSalary, attendance, timeOffRequests, addDocument, removeDocument } = useApp();
  const user = users.find((u) => String(u.id) === String(userId));
  const isSelf = !!currentUser && String(currentUser.id) === String(userId);
  const isAdmin = currentUser?.role === "admin";
  const canSeeSalary = isAdmin || isSelf;
  const canEditAll = isAdmin;
  const canEditPhoto = isSelf || canEditAll;

  const [tab, setTab] = useState("Resume");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setTab("Resume");
    setEditing(false);
  }, [userId]);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => updateProfile(user.id, { photo: reader.result });
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center text-base-400">
        <p>Loading profile…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center text-base-400">
        <p>That employee record doesn't exist.</p>
        <button onClick={() => navigate("/app/employees")} className="text-accent mt-2 text-sm">
          Back to Employees
        </button>
      </div>
    );
  }

  if (!isAdmin && !isSelf) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center text-base-400">
        <p>Only admins can view other employees' profiles. You can see your own from the avatar menu.</p>
        <button onClick={() => navigate("/app/employees")} className="text-accent mt-2 text-sm">
          Back to Employees
        </button>
      </div>
    );
  }

  const visibleTabs = TABS.filter((t) => t !== "Salary Info" || canSeeSalary);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-base-400 hover:text-base-100 mb-5 focus-ring rounded"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="bg-base-850 border border-base-700 rounded-2xl p-6 shadow-card mb-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar user={user} size={64} />
              {canEditPhoto && (
                <label
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center cursor-pointer border-2 border-base-850 focus-ring"
                  title="Change profile picture"
                >
                  <Camera size={12} className="text-white" />
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-base-100">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-sm text-base-400">{user.designation} · {user.department}</p>
              <div className="mt-1.5">
                <StatusDot status={getLiveStatus(user, attendance, timeOffRequests)} withLabel />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>
              <p className="text-base-500 text-xs">Login ID</p>
              <p className="text-base-200 font-mono text-xs mt-0.5">{user.loginId}</p>
            </div>
            <div>
              <p className="text-base-500 text-xs">Reports to</p>
              <p className="text-base-200 mt-0.5">{user.manager}</p>
            </div>
            <div>
              <p className="text-base-500 text-xs">Joined</p>
              <p className="text-base-200 mt-0.5">{formatDate(user.dateOfJoining)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-base-850 border border-base-700 rounded-lg p-1">
          {visibleTabs.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setEditing(false); }}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t ? "bg-accent/15 text-accent" : "text-base-400 hover:text-base-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {(isSelf || canEditAll) && tab !== "Salary Info" && tab !== "Documents" && (
          <button
            onClick={() => setEditing((e) => !e)}
            className="flex items-center gap-1.5 text-sm text-base-300 hover:text-base-100 border border-base-700 rounded-lg px-3 py-1.5 focus-ring"
          >
            <Pencil size={13} /> {editing ? "Done" : "Edit"}
          </button>
        )}
      </div>

      {tab === "Resume" && (
        <ResumeTab user={user} editing={editing} canEditAll={canEditAll} onSave={(patch) => updateProfile(user.id, patch)} />
      )}
      {tab === "Private Info" && (
        <PrivateInfoTab
          user={user}
          editing={editing}
          isSelf={isSelf}
          canEditAll={canEditAll}
          onSave={(patch) => updateProfile(user.id, patch)}
        />
      )}
      {tab === "Documents" && (
        <DocumentsTab
          user={user}
          canUpload={canEditAll}
          onUpload={(doc) => addDocument(user.id, doc)}
          onRemove={(docId) => removeDocument(user.id, docId)}
        />
      )}
      {tab === "Salary Info" && canSeeSalary && (
        <SalaryInfoTab user={user} canEdit={canEditAll} onSave={(salary) => updateSalary(user.id, salary)} />
      )}
    </div>
  );
}

function DocumentsTab({ user, canUpload, onUpload, onRemove }) {
  const docs = user.documents || [];

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload({ name: file.name, uploadedBy: "Admin" });
    e.target.value = "";
  }

  return (
    <Card>
      {canUpload && (
        <label className="flex items-center gap-2 text-sm text-base-300 border border-dashed border-base-600 rounded-lg px-3 py-2.5 cursor-pointer hover:border-accent/50 mb-4 w-fit">
          <Plus size={14} /> Upload document
          <input type="file" className="hidden" onChange={handleFile} />
        </label>
      )}
      {docs.length === 0 ? (
        <p className="text-sm text-base-500">No documents uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-base-700">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm text-base-100">{d.name}</p>
                <p className="text-xs text-base-500 mt-0.5">Uploaded {formatDate(d.uploadedOn)} · {d.uploadedBy}</p>
              </div>
              {canUpload && (
                <button
                  onClick={() => onRemove(d.id)}
                  className="text-xs text-base-500 hover:text-bad focus-ring rounded px-2 py-1"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Card({ children, className = "" }) {
  return <div className={`bg-base-850 border border-base-700 rounded-2xl p-5 shadow-card ${className}`}>{children}</div>;
}

function ResumeTab({ user, editing, onSave }) {
  const [about, setAbout] = useState(user.resume.about);
  const [skills, setSkills] = useState(user.resume.skills);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    setAbout(user.resume.about);
    setSkills(user.resume.skills);
  }, [user]);

  function addSkill() {
    if (!skillInput.trim()) return;
    setSkills((s) => [...s, skillInput.trim()]);
    setSkillInput("");
  }

  function save() {
    onSave({ resume: { ...user.resume, about, skills } });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-sm font-semibold text-base-100 mb-2.5">About</h3>
        {editing ? (
          <>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={4}
              className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2.5 text-sm text-base-200 focus-ring focus:border-accent resize-none"
            />
            <button onClick={save} className="mt-3 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg px-3.5 py-2 focus-ring">
              Save changes
            </button>
          </>
        ) : (
          <p className="text-sm text-base-300 leading-relaxed">
            {user.resume.about || "No bio added yet."}
          </p>
        )}

        <h3 className="text-sm font-semibold text-base-100 mt-6 mb-3">Experience</h3>
        <div className="space-y-3">
          {user.resume.experience.length === 0 && <p className="text-sm text-base-500">Nothing added yet.</p>}
          {user.resume.experience.map((exp, i) => (
            <div key={i} className="flex items-baseline justify-between border-b border-base-700 last:border-0 pb-3 last:pb-0">
              <div>
                <p className="text-sm text-base-100 font-medium">{exp.role}</p>
                <p className="text-xs text-base-400">{exp.company}</p>
              </div>
              <p className="text-xs text-base-500">{exp.period}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-base-100 mb-3">Skills</h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {skills.map((s, i) => (
            <span key={i} className="text-xs bg-accent/10 text-accent border border-accent/25 rounded-full px-2.5 py-1 flex items-center gap-1">
              {s}
              {editing && (
                <button onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}>
                  <X size={11} />
                </button>
              )}
            </span>
          ))}
          {skills.length === 0 && <p className="text-sm text-base-500">No skills listed.</p>}
        </div>
        {editing && (
          <div className="flex gap-1.5 mb-3">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Add a skill"
              className="flex-1 bg-base-900 border border-base-700 rounded-lg px-2.5 py-1.5 text-xs focus-ring focus:border-accent"
            />
            <button onClick={addSkill} className="bg-base-800 border border-base-700 rounded-lg px-2.5 hover:border-accent/50">
              <Plus size={14} />
            </button>
          </div>
        )}
        {editing && (
          <button onClick={save} className="w-full text-sm bg-accent hover:bg-accent-hover text-white rounded-lg px-3.5 py-2 focus-ring">
            Save changes
          </button>
        )}

        <h3 className="text-sm font-semibold text-base-100 mt-6 mb-3">Certifications</h3>
        <ul className="space-y-1.5">
          {user.resume.certifications.map((c, i) => (
            <li key={i} className="text-sm text-base-300">· {c}</li>
          ))}
          {user.resume.certifications.length === 0 && <p className="text-sm text-base-500">None added yet.</p>}
        </ul>
      </Card>
    </div>
  );
}

function PrivateInfoTab({ user, editing, isSelf, canEditAll, onSave }) {
  const [form, setForm] = useState({
    phone: user.phone,
    address: user.address,
    dateOfBirth: user.dateOfBirth,
    email: user.email,
    personalEmail: user.privateInfo.personalEmail,
    emergencyContact: user.privateInfo.emergencyContact,
    bankAccount: user.privateInfo.bankAccount,
    panNumber: user.privateInfo.panNumber,
    aadhaar: user.privateInfo.aadhaar,
  });

  useEffect(() => {
    setForm({
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      email: user.email,
      personalEmail: user.privateInfo.personalEmail,
      emergencyContact: user.privateInfo.emergencyContact,
      bankAccount: user.privateInfo.bankAccount,
      panNumber: user.privateInfo.panNumber,
      aadhaar: user.privateInfo.aadhaar,
    });
  }, [user]);

  // Employees can edit limited fields; admin can edit everything.
  const employeeEditable = ["phone", "address", "emergencyContact"];

  function fieldEditable(key) {
    if (!editing) return false;
    if (canEditAll) return true;
    return isSelf && employeeEditable.includes(key);
  }

  function save() {
    onSave({
      phone: form.phone,
      address: form.address,
      dateOfBirth: form.dateOfBirth,
      email: form.email,
      privateInfo: {
        personalEmail: form.personalEmail,
        emergencyContact: form.emergencyContact,
        bankAccount: form.bankAccount,
        panNumber: form.panNumber,
        aadhaar: form.aadhaar,
      },
    });
  }

  const rows = [
    ["Work email", "email"],
    ["Phone", "phone"],
    ["Date of birth", "dateOfBirth", "date"],
    ["Address", "address"],
    ["Personal email", "personalEmail"],
    ["Emergency contact", "emergencyContact"],
    ["Bank account", "bankAccount"],
    ["PAN number", "panNumber"],
    ["Aadhaar", "aadhaar"],
  ];

  return (
    <Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rows.map(([label, key, type]) => (
          <div key={key}>
            <label className="block text-xs text-base-500 mb-1">{label}</label>
            {fieldEditable(key) ? (
              <input
                type={type || "text"}
                value={form[key] || ""}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2 text-sm text-base-100 focus-ring focus:border-accent"
              />
            ) : (
              <p className="text-sm text-base-200">{type === "date" ? formatDate(form[key]) : (form[key] || "—")}</p>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <button onClick={save} className="mt-5 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg px-3.5 py-2 focus-ring">
          Save changes
        </button>
      )}
    </Card>
  );
}

function SalaryInfoTab({ user, canEdit, onSave }) {
  const s = user.salary;
  const [editing, setEditing] = useState(false);
  const [monthWage, setMonthWage] = useState(s.monthWage);
  const [basicPct, setBasicPct] = useState(s.basicPct);
  const [hraPct, setHraPct] = useState(s.hraPct);
  const [standardAllowance, setStandardAllowance] = useState(s.components.standardAllowance);
  const [leaveTravelAllowance, setLeaveTravelAllowance] = useState(s.components.leaveTravelAllowance);
  const [foodAllowance, setFoodAllowance] = useState(s.components.foodAllowance);
  const [pfEmployeePct, setPfEmployeePct] = useState(s.deductions.pfEmployeePct);
  const [pfEmployerPct, setPfEmployerPct] = useState(s.deductions.pfEmployerPct);
  const [professionalTax, setProfessionalTax] = useState(s.deductions.professionalTax);

  // Auto-calculate: Basic = Basic% of wage, HRA = HRA% of Basic (per the wireframe's worked example).
  const calc = useMemo(() => {
    const wage = Number(monthWage) || 0;
    const basic = Math.round(wage * (Number(basicPct) / 100));
    const hra = Math.round(basic * (Number(hraPct) / 100));
    const fixedTotal =
      basic + hra + Number(standardAllowance || 0) + Number(leaveTravelAllowance || 0) + Number(foodAllowance || 0);
    const pfEmployee = Math.round(basic * (Number(pfEmployeePct) / 100));
    const pfEmployer = Math.round(basic * (Number(pfEmployerPct) / 100));
    return { basic, hra, fixedTotal, pfEmployee, pfEmployer };
  }, [monthWage, basicPct, hraPct, standardAllowance, leaveTravelAllowance, foodAllowance, pfEmployeePct, pfEmployerPct]);

  function save() {
    onSave({
      ...s,
      monthWage: Number(monthWage),
      yearlyWage: Number(monthWage) * 12,
      basicPct: Number(basicPct),
      hraPct: Number(hraPct),
      components: {
        basic: calc.basic,
        hra: calc.hra,
        standardAllowance: Number(standardAllowance),
        leaveTravelAllowance: Number(leaveTravelAllowance),
        foodAllowance: Number(foodAllowance),
      },
      deductions: {
        pfEmployeePct: Number(pfEmployeePct),
        pfEmployerPct: Number(pfEmployerPct),
        professionalTax: Number(professionalTax),
      },
    });
    setEditing(false);
  }

  const rows = editing
    ? [
        ["Basic (auto)", `₹${calc.basic.toLocaleString("en-IN")} / month`],
        [`HRA (${hraPct}% of Basic)`, `₹${calc.hra.toLocaleString("en-IN")} / month`],
        ["Standard allowance", null, standardAllowance, setStandardAllowance],
        ["Leave travel allowance", null, leaveTravelAllowance, setLeaveTravelAllowance],
        ["Food allowance", null, foodAllowance, setFoodAllowance],
      ]
    : [
        ["Basic", `₹${s.components.basic.toLocaleString("en-IN")} / month`],
        ["HRA", `₹${s.components.hra.toLocaleString("en-IN")} / month`],
        ["Standard allowance", `₹${s.components.standardAllowance.toLocaleString("en-IN")} / month`],
        ["Leave travel allowance", `₹${s.components.leaveTravelAllowance.toLocaleString("en-IN")} / month`],
        ["Food allowance", `₹${s.components.foodAllowance.toLocaleString("en-IN")} / month`],
      ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-base-100">Salary components</h3>
          {canEdit && (
            <button
              onClick={() => (editing ? save() : setEditing(true))}
              className="text-xs border border-base-700 hover:border-accent/50 text-base-300 rounded-lg px-3 py-1.5 focus-ring"
            >
              {editing ? "Save" : "Edit"}
            </button>
          )}
        </div>

        {editing && (
          <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-base-700">
            <div>
              <label className="block text-xs text-base-500 mb-1">Monthly wage (₹)</label>
              <input
                type="number"
                value={monthWage}
                onChange={(e) => setMonthWage(e.target.value)}
                className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2 text-sm focus-ring focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-base-500 mb-1">Basic (% of wage)</label>
              <input
                type="number"
                value={basicPct}
                onChange={(e) => setBasicPct(e.target.value)}
                className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2 text-sm focus-ring focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-base-500 mb-1">HRA (% of Basic)</label>
              <input
                type="number"
                value={hraPct}
                onChange={(e) => setHraPct(e.target.value)}
                className="w-full bg-base-900 border border-base-700 rounded-lg px-3 py-2 text-sm focus-ring focus:border-accent"
              />
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {rows.map(([label, display, val, setVal], i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-base-400">{label}</span>
              {editing && setVal ? (
                <input
                  type="number"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  className="w-32 bg-base-900 border border-base-700 rounded-lg px-2.5 py-1.5 text-sm text-right focus-ring focus:border-accent"
                />
              ) : (
                <span className="text-base-100 font-medium">{display}</span>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between text-sm pt-2.5 border-t border-base-700">
            <span className="text-base-300 font-medium">Total fixed pay</span>
            <span className="text-base-100 font-semibold">
              ₹{(editing ? calc.fixedTotal : Object.values(s.components).reduce((a, b) => a + b, 0)).toLocaleString("en-IN")} / month
            </span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-base-100 mb-3">Wage summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-base-400">Monthly wage</span>
              <span className="text-base-100 font-medium">₹{Number(editing ? monthWage : s.monthWage).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-400">Yearly wage</span>
              <span className="text-base-100 font-medium">₹{(Number(editing ? monthWage : s.monthWage) * 12).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-400">Working days / week</span>
              <span className="text-base-100">{s.workingDaysPerWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-400">Hours / day</span>
              <span className="text-base-100">{s.hrsPerDay} hrs</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-base-100 mb-3">Provident Fund &amp; deductions</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-base-400">Employee PF</span>
              {editing ? (
                <input
                  type="number"
                  value={pfEmployeePct}
                  onChange={(e) => setPfEmployeePct(e.target.value)}
                  className="w-20 bg-base-900 border border-base-700 rounded-lg px-2 py-1 text-sm text-right focus-ring"
                />
              ) : (
                <span className="text-base-100">₹{s.components.basic ? Math.round(s.components.basic * (s.deductions.pfEmployeePct / 100)).toLocaleString("en-IN") : 0} / mo</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-400">Employer PF</span>
              {editing ? (
                <input
                  type="number"
                  value={pfEmployerPct}
                  onChange={(e) => setPfEmployerPct(e.target.value)}
                  className="w-20 bg-base-900 border border-base-700 rounded-lg px-2 py-1 text-sm text-right focus-ring"
                />
              ) : (
                <span className="text-base-100">₹{s.components.basic ? Math.round(s.components.basic * (s.deductions.pfEmployerPct / 100)).toLocaleString("en-IN") : 0} / mo</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base-400">Professional tax</span>
              {editing ? (
                <input
                  type="number"
                  value={professionalTax}
                  onChange={(e) => setProfessionalTax(e.target.value)}
                  className="w-20 bg-base-900 border border-base-700 rounded-lg px-2 py-1 text-sm text-right focus-ring"
                />
              ) : (
                <span className="text-base-100">₹{s.deductions.professionalTax} / mo</span>
              )}
            </div>
          </div>
          <p className="text-xs text-base-500 mt-3 leading-relaxed">
            Basic and HRA are calculated automatically from the wage and percentages above, so they always stay
            within the defined salary.
          </p>
        </Card>
      </div>
    </div>
  );
}
