import { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";

type ClassItem = { id: number; title: string; description: string; starts_at: string; duration_minutes: number };

export function ClassSchedule() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [status, setStatus] = useState<"loading" | "loaded" | "empty" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/classes`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Class request failed (${response.status}).`);
        return response.json() as Promise<{ classes: ClassItem[] }>;
      })
      .then(({ classes: nextClasses }) => {
        setClasses(nextClasses);
        setStatus(nextClasses.length ? "loaded" : "empty");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  return (
    <section className="class-schedule">
      <div className="class-schedule-heading"><h2>Upcoming classes</h2><span>LOCAL TIME</span></div>
      {status === "loading" && <p className="catalog-message">Loading scheduled classes…</p>}
      {status === "error" && <p className="catalog-message error">Couldn’t load scheduled classes from the API.</p>}
      {status === "empty" && <p className="catalog-message">No upcoming classes are scheduled yet.</p>}
      {status === "loaded" && <div className="class-schedule-list">{classes.map((item) => (
        <article className="class-schedule-item" key={item.id}>
          <span className="schedule-date"><strong>{new Date(item.starts_at).toLocaleDateString(undefined, { day: "2-digit" })}</strong><small>{new Date(item.starts_at).toLocaleDateString(undefined, { month: "short" })}</small></span>
          <div><strong>{item.title}</strong><p>{item.description}</p><small>{new Date(item.starts_at).toLocaleString()} · {item.duration_minutes} minutes</small></div>
        </article>
      ))}</div>}
    </section>
  );
}
