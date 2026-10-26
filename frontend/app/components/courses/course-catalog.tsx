import { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";
import type { Course } from "../../types";

export function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [status, setStatus] = useState<"loading" | "loaded" | "empty" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/api/courses`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Course request failed (${response.status}).`);
        return response.json() as Promise<{ courses: Course[] }>;
      })
      .then(({ courses: result }) => {
        setCourses(result);
        setStatus(result.length ? "loaded" : "empty");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="catalog-panel">
      <div className="catalog-heading"><h2>Published courses</h2><span>FROM YOUR LEARNING LIBRARY</span></div>
      {status === "loading" && <p className="catalog-message">Loading courses…</p>}
      {status === "error" && <p className="catalog-message error">Couldn’t load courses. Check that the API is running and connected to MySQL.</p>}
      {status === "empty" && <p className="catalog-message">No courses have been published yet. Add a published course to see it here.</p>}
      {status === "loaded" && <div className="catalog-list">{courses.map((course) => (
        <article className="catalog-course" key={course.id}>
          <div className="catalog-course-top"><span className={`course-level-tag ${course.level}`}>{course.level}</span><span>{course.estimated_minutes ? `${course.estimated_minutes} min` : "Self-paced"}</span></div>
          <h3>{course.title}</h3><p>{course.description}</p>
        </article>
      ))}</div>}
    </div>
  );
}
