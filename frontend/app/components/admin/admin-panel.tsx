import { useEffect, useState, type FormEvent } from "react";
import { API_URL } from "../../lib/api";

type AdminTab = "users" | "courses" | "classes";
type AdminUser = { id: number; name: string; email: string; role: "member" | "admin"; created_at: string };
type AdminCourse = { id: number; title: string; description: string; level: "beginner" | "intermediate" | "advanced"; estimated_minutes: number; status: "draft" | "published" | "archived" };
type AdminClass = { id: number; title: string; description: string; starts_at: string; duration_minutes: number; status: "scheduled" | "cancelled" | "completed" };
type AdminOverview = { users: number; courses: number; scheduledClasses: number };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (response.status === 204) return undefined as T;
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? `Request failed (${response.status}).`);
  return result;
}

export function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("users");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refreshOverview() {
    setOverview(await request<AdminOverview>("/api/admin/overview"));
  }

  async function refreshTab(selected: AdminTab) {
    setError("");
    try {
      if (selected === "users") setUsers((await request<{ users: AdminUser[] }>("/api/admin/users")).users);
      if (selected === "courses") setCourses((await request<{ courses: AdminCourse[] }>("/api/admin/courses")).courses);
      if (selected === "classes") setClasses((await request<{ classes: AdminClass[] }>("/api/admin/classes")).classes);
      await refreshOverview();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load administration data.");
    }
  }

  useEffect(() => {
    void refreshTab(tab);
  }, [tab]);

  async function perform(action: () => Promise<void>, message: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(message);
      await refreshTab(tab);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "The action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const values = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      level: String(form.get("level") ?? "beginner"),
      estimated_minutes: Number(form.get("estimated_minutes") ?? 0),
      status: String(form.get("status") ?? "draft"),
    };
    await perform(async () => {
      await request("/api/admin/courses", { method: "POST", body: JSON.stringify(values) });
      formElement.reset();
    }, "Course created.");
  }

  async function createClass(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const values = {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      starts_at: new Date(String(form.get("starts_at") ?? "")).toISOString(),
      duration_minutes: Number(form.get("duration_minutes") ?? 60),
      status: "scheduled",
    };
    await perform(async () => {
      await request("/api/admin/classes", { method: "POST", body: JSON.stringify(values) });
      formElement.reset();
    }, "Class scheduled.");
  }

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div><span className="eyebrow dark-eyebrow">PLATFORM MANAGEMENT</span><h1>Admin workspace</h1><p>Manage learning content, members, and class schedules.</p></div>
        <span className="admin-badge">ADMIN</span>
      </div>
      <div className="admin-stat-grid">
        <article><span>Registered members</span><strong>{overview?.users ?? "—"}</strong></article>
        <article><span>Courses</span><strong>{overview?.courses ?? "—"}</strong></article>
        <article><span>Upcoming classes</span><strong>{overview?.scheduledClasses ?? "—"}</strong></article>
      </div>
      <div className="admin-workspace">
        <div className="admin-tabs" role="tablist" aria-label="Administration areas">
          {(["users", "courses", "classes"] as const).map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? "selected" : ""} onClick={() => setTab(item)}>{item === "users" ? "Members" : item === "courses" ? "Courses" : "Classes"}</button>)}
        </div>
        {error && <p className="admin-message error" role="alert">{error}</p>}
        {notice && <p className="admin-message success" role="status">{notice}</p>}

        {tab === "users" && <div className="admin-table-wrap">
          <table className="admin-table"><thead><tr><th>Member</th><th>Joined</th><th>Role</th></tr></thead>
            <tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><small>{user.email}</small></td><td>{new Date(user.created_at).toLocaleDateString()}</td><td><select aria-label={`Role for ${user.name}`} disabled={busy} value={user.role} onChange={(event) => void perform(async () => {
              await request(`/api/admin/users/${user.id}/role`, { method: "PATCH", body: JSON.stringify({ role: event.target.value }) });
            }, "Member role updated.")}><option value="member">Member</option><option value="admin">Admin</option></select></td></tr>)}</tbody>
          </table>
          {!users.length && <p className="admin-empty">No members found.</p>}
        </div>}

        {tab === "courses" && <>
          <form className="admin-create-form" onSubmit={createCourse}>
            <h2>Add a course</h2>
            <div className="admin-form-grid">
              <label>Title<input name="title" required minLength={3} maxLength={160} /></label>
              <label>Level<select name="level"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
              <label>Estimated minutes<input name="estimated_minutes" type="number" min="0" max="65535" defaultValue="30" required /></label>
              <label>Publish status<select name="status"><option value="draft">Draft</option><option value="published">Published</option></select></label>
              <label className="wide">Description<textarea name="description" required maxLength={5000} rows={3} /></label>
            </div>
            <button className="primary-button" disabled={busy}>Create course</button>
          </form>
          <div className="admin-record-list">{courses.map((course) => <article className="admin-record" key={course.id}>
            <div><strong>{course.title}</strong><p>{course.level} · {course.estimated_minutes} min · {course.status}</p></div>
            <div className="admin-record-actions">
              <select aria-label={`Status for ${course.title}`} disabled={busy} value={course.status} onChange={(event) => void perform(async () => {
                await request(`/api/admin/courses/${course.id}`, { method: "PATCH", body: JSON.stringify({ ...course, status: event.target.value }) });
              }, "Course status updated.")}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select>
              <button className="danger-button" disabled={busy} onClick={() => void perform(async () => {
                if (!window.confirm(`Delete "${course.title}" and its lessons?`)) return;
                await request(`/api/admin/courses/${course.id}`, { method: "DELETE" });
              }, "Course deleted.")}>Delete</button>
            </div>
          </article>)}</div>
        </>}

        {tab === "classes" && <>
          <form className="admin-create-form" onSubmit={createClass}>
            <h2>Schedule a class</h2>
            <div className="admin-form-grid">
              <label>Title<input name="title" required minLength={3} maxLength={160} /></label>
              <label>Start date and time<input name="starts_at" type="datetime-local" required /></label>
              <label>Duration in minutes<input name="duration_minutes" type="number" min="1" max="1440" defaultValue="60" required /></label>
              <label className="wide">Description<textarea name="description" required maxLength={5000} rows={3} /></label>
            </div>
            <button className="primary-button" disabled={busy}>Schedule class</button>
          </form>
          <div className="admin-record-list">{classes.map((classItem) => <article className="admin-record" key={classItem.id}>
            <div><strong>{classItem.title}</strong><p>{new Date(classItem.starts_at).toLocaleString()} · {classItem.duration_minutes} min · {classItem.status}</p></div>
            <div className="admin-record-actions">
              <select aria-label={`Status for ${classItem.title}`} disabled={busy} value={classItem.status} onChange={(event) => void perform(async () => {
                await request(`/api/admin/classes/${classItem.id}`, { method: "PATCH", body: JSON.stringify({ ...classItem, starts_at: new Date(classItem.starts_at).toISOString(), status: event.target.value }) });
              }, "Class status updated.")}><option value="scheduled">Scheduled</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select>
              <button className="danger-button" disabled={busy} onClick={() => void perform(async () => {
                if (!window.confirm(`Delete "${classItem.title}"?`)) return;
                await request(`/api/admin/classes/${classItem.id}`, { method: "DELETE" });
              }, "Class deleted.")}>Delete</button>
            </div>
          </article>)}</div>
        </>}
      </div>
      <p className="admin-footnote">Member data is limited to the latest 200 accounts. Role changes are enforced by the API.</p>
    </section>
  );
}
