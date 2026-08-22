import { Plane } from "lucide-react";
import { colorForName, initials } from "../data/mockData";

export function Avatar({ user, size = 40 }) {
  const bg = colorForName(`${user.firstName}${user.lastName}`);
  if (user.photo) {
    return (
      <img
        src={user.photo}
        alt={`${user.firstName} ${user.lastName}`}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size, border: `1px solid ${bg}55` }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        background: `${bg}2A`,
        color: bg,
        fontSize: size * 0.38,
        border: `1px solid ${bg}55`,
      }}
    >
      {initials(user.firstName, user.lastName)}
    </div>
  );
}

const STATUS_STYLES = {
  present: { color: "#3ECF8E", label: "Present" },
  leave: { color: "#3EA6CF", label: "On leave" },
  absent: { color: "#EFB93E", label: "Absent" },
  "half-day": { color: "#3EA6CF", label: "Half-day" },
  "checked-out": { color: "#7B8194", label: "Checked out" },
  "not-checked-in": { color: "#F0576B", label: "Not checked in" },
};

export function StatusDot({ status, withLabel = false, size = 9 }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.absent;

  if (status === "leave") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-flex items-center justify-center rounded-full shrink-0"
          style={{ width: size + 8, height: size + 8, background: `${s.color}22` }}
        >
          <Plane size={size + 2} style={{ color: s.color }} className="-rotate-45" />
        </span>
        {withLabel && <span className="text-xs text-base-300">{s.label}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="rounded-full inline-block"
        style={{ width: size, height: size, background: s.color, boxShadow: `0 0 0 3px ${s.color}22` }}
      />
      {withLabel && <span className="text-xs text-base-300">{s.label}</span>}
    </span>
  );
}
