import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { seedCompany } from "../data/mockData";

const AppContext = createContext(null);

const EMPTY = {
  company: seedCompany,
  users: [],
  attendance: {},
  timeOffAllocations: {},
  timeOffRequests: [],
  currentUserId: null,
};

function normalizeUser(u = {}) {
  const name = u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
  const [first, ...rest] = name.split(/\s+/).filter(Boolean);
  const salary = u.salary || {};
  const components = salary.components || {};
  const deductions = salary.deductions || {};

  return {
    ...u,
    id: String(u.id ?? u.user_id ?? ""),
    firstName: u.firstName ?? first ?? "",
    lastName: u.lastName ?? rest.join(" "),
    loginId: u.loginId ?? u.employeeId ?? "",
    designation: u.designation ?? u.jobTitle ?? "",
    department: u.department ?? "",
    manager: u.manager ?? "—",
    dateOfJoining: u.dateOfJoining ?? "",
    dateOfBirth: u.dateOfBirth ?? "",
    address: u.address ?? "",
    status: u.status ?? "absent",
    resume: {
      about: "",
      skills: [],
      experience: [],
      certifications: [],
      ...(u.resume || {}),
    },
    privateInfo: {
      personalEmail: u.email || "",
      emergencyContact: "",
      bankAccount: "",
      panNumber: "",
      aadhaar: "",
      ...(u.privateInfo || {}),
    },
    documents: Array.isArray(u.documents) ? u.documents : [],
    salary: {
      monthWage: 0,
      yearlyWage: 0,
      workingDaysPerWeek: 5,
      hrsPerDay: 8,
      compositionType: "percentage",
      basicPct: 50,
      hraPct: 50,
      components: {
        basic: 0,
        hra: 0,
        standardAllowance: 0,
        leaveTravelAllowance: 0,
        foodAllowance: 0,
        ...components,
      },
      deductions: {
        pfEmployeePct: 12,
        pfEmployerPct: 12,
        professionalTax: 200,
        ...deductions,
      },
      ...salary,
      components: {
        basic: 0,
        hra: 0,
        standardAllowance: 0,
        leaveTravelAllowance: 0,
        foodAllowance: 0,
        ...components,
      },
      deductions: {
        pfEmployeePct: 12,
        pfEmployerPct: 12,
        professionalTax: 200,
        ...deductions,
      },
    },
  };
}

function mapAttendance(rows) {
  const result = {};
  for (const r of rows || []) {
    const id = String(r.user_id ?? r.userId);
    (result[id] ||= []).push({
      id: r.id,
      date: r.date,
      checkIn: r.check_in ?? r.checkIn ?? "",
      checkOut: r.check_out ?? r.checkOut ?? "",
      status: r.status ?? "absent",
    });
  }
  return result;
}

function mapLeave(r) {
  return {
    id: String(r.id),
    employeeId: String(r.employee_id ?? r.employeeId),
    type: r.leave_type ?? r.type,
    startDate: r.start_date ?? r.startDate,
    endDate: r.end_date ?? r.endDate,
    days: r.days ?? 0,
    remarks: r.remarks ?? "",
    status: r.status,
    attachment: r.attachment ?? null,
    adminComment: r.admin_comment ?? r.adminComment ?? "",
  };
}

function mapAllocations(rows) {
  const result = {};
  for (const r of rows || []) {
    result[String(r.user_id)] = {
      paid: { total: r.paid_total ?? 20, used: r.paid_used ?? 0 },
      sick: { total: r.sick_total ?? 10, used: r.sick_used ?? 0 },
      unpaid: { used: r.unpaid_used ?? 0 },
    };
  }
  return result;
}

export function AppProvider({ children }) {
  const [state, setState] = useState(EMPTY);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState("");

  const refresh = useCallback(async (tokenOverride = null) => {
    const token = tokenOverride || localStorage.getItem("dayflow_token");
    if (!token) {
      setState((s) => ({ ...s, currentUserId: null }));
      setBooting(false);
      return;
    }
    try {
      setBootError("");
      const me = normalizeUser(await api("/me"));
      const [att, leaves] = await Promise.all([
        api(me.role === "admin" ? "/attendance/all" : "/attendance/me"),
        api(me.role === "admin" ? "/leave/all" : "/leave/me"),
      ]);
      let users = [me];
      if (me.role === "admin") users = (await api("/employees")).map(normalizeUser).concat([me]).filter((u, i, a) => a.findIndex(x => x.id === u.id) === i);
      setState({
        company: { name: me.company_name || "Dayflow", code: me.company_code || "DF", logo: null },
        users,
        attendance: mapAttendance(att),
        timeOffRequests: (leaves || []).map(mapLeave),
        timeOffAllocations: mapAllocations(await api("/leave/allocations")),
        currentUserId: String(me.id),
      });
    } catch (e) {
      console.error("Dayflow bootstrap failed:", e);
      setBootError(e?.message || "Unable to load Dayflow data.");
      localStorage.removeItem("dayflow_token");
      setState(EMPTY);
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const currentUser = useMemo(
    () => state.users.find((u) => String(u.id) === String(state.currentUserId)) || null,
    [state.users, state.currentUserId]
  );

  const signIn = useCallback(async (loginId, password) => {
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ login_id: loginId.trim(), password }),
      });
      localStorage.setItem("dayflow_token", data.access_token);
      await refresh(data.access_token);
      return null;
    } catch (e) {
      return e.message;
    }
  }, [refresh]);

  const signOut = useCallback(() => {
    localStorage.removeItem("dayflow_token");
    setState(EMPTY);
  }, []);

  const resetToDemoData = useCallback(async () => {
    try {
      await api("/demo/reset", { method: "POST" });
      localStorage.removeItem("dayflow_token");
      setState(EMPTY);
    } catch (_) {}
  }, []);

  const signUpCompany = useCallback(async (payload) => {
    try {
      const data = await api("/auth/signup", { method: "POST", body: JSON.stringify(payload) });
      localStorage.setItem("dayflow_token", data.access_token);
      await refresh(data.access_token);
      return { loginId: data.login_id, password: payload.password };
    } catch (e) {
      return { error: e.message };
    }
  }, [refresh]);

  const addEmployee = useCallback(async (form) => {
    try {
      const data = await api("/employees", { method: "POST", body: JSON.stringify(form) });
      await refresh();
      return { loginId: data.loginId, password: data.password, name: data.name };
    } catch (e) {
      return { error: e.message };
    }
  }, [refresh]);

  const updateProfile = useCallback(async (userId, patch) => {
    try {
      await api(`/users/${userId}/profile`, { method: "PUT", body: JSON.stringify(patch) });
      await refresh();
    } catch (e) { console.error(e); }
  }, [refresh]);

  const updateSalary = useCallback(async (userId, salary) => {
    try {
      await api(`/users/${userId}/salary`, { method: "PUT", body: JSON.stringify(salary) });
      await refresh();
    } catch (e) { console.error(e); }
  }, [refresh]);

  const checkIn = useCallback(async () => {
    try { await api("/attendance/check-in", { method: "POST" }); await refresh(); } catch (e) { alert(e.message); }
  }, [refresh]);

  const checkOut = useCallback(async () => {
    try { await api("/attendance/check-out", { method: "POST" }); await refresh(); } catch (e) { alert(e.message); }
  }, [refresh]);

  const applyTimeOff = useCallback(async (request) => {
    try {
      await api("/leave", {
        method: "POST",
        body: JSON.stringify({
          leave_type: request.type,
          start_date: request.startDate,
          end_date: request.endDate,
          remarks: request.remarks || "",
        }),
      });
      await refresh();
    } catch (e) { alert(e.message); }
  }, [refresh]);

  const decideTimeOff = useCallback(async (requestId, decision, comment = "") => {
    try {
      await api(`/leave/${requestId}`, {
        method: "PUT",
        body: JSON.stringify({ status: decision, admin_comment: comment }),
      });
      await refresh();
    } catch (e) { alert(e.message); }
  }, [refresh]);

  const addDocument = useCallback(async (userId, doc) => {
    try {
      await api(`/users/${userId}/documents`, { method: "POST", body: JSON.stringify(doc) });
      await refresh();
    } catch (e) { alert(e.message); }
  }, [refresh]);

  const removeDocument = useCallback(async (userId, docId) => {
    try {
      await api(`/users/${userId}/documents/${docId}`, { method: "DELETE" });
      await refresh();
    } catch (e) { alert(e.message); }
  }, [refresh]);

  const setAttendanceStatus = useCallback(async (userId, date, status) => {
    try {
      await api(`/attendance/${userId}/${date}`, { method: "PUT", body: JSON.stringify({ status }) });
      await refresh();
    } catch (e) { alert(e.message); }
  }, [refresh]);

  const value = {
    company: state.company,
    users: state.users,
    attendance: state.attendance,
    timeOffAllocations: state.timeOffAllocations,
    timeOffRequests: state.timeOffRequests,
    currentUser,
    isAuthenticated: !!currentUser,
    booting,
    bootError,
    signIn,
    signOut,
    signUpCompany,
    resetToDemoData,
    addEmployee,
    updateProfile,
    updateSalary,
    checkIn,
    checkOut,
    applyTimeOff,
    decideTimeOff,
    addDocument,
    removeDocument,
    setAttendanceStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
