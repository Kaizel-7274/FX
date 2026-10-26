import type { ReactNode } from "react";
import { moduleDetails } from "../../data/modules";
import { CourseCatalog } from "../courses/course-catalog";
import { Icon } from "../ui/icon";

export function ModulePage({ name, onSelect, children }: { name: string; onSelect: (label: string) => void; children?: ReactNode }) {
  const detail = moduleDetails[name];
  if (!detail) {
    return (
      <section className="module-page">
        <span className="eyebrow dark-eyebrow">YOUR ACCOUNT</span>
        <h1>Settings</h1>
        <p>Account preferences and notifications will live here.</p>
        <button className="primary-button" onClick={() => onSelect("Overview")}>Back to overview <Icon name="arrow" size={16} /></button>
      </section>
    );
  }
  return (
    <section className="module-page">
      <span className="eyebrow dark-eyebrow">{detail.eyebrow}</span>
      <h1>{detail.title}</h1>
      <p className="module-description">{detail.description}</p>
      {name === "Courses" && <CourseCatalog />}
      {children}
      <div className="module-preview">
        <div className="module-preview-top"><span className="preview-mark"><Icon name="grid" size={18} /></span><span className="preview-status">IN DEVELOPMENT</span></div>
        <h2>{name} at AmazonFX</h2>
        <p>We’re building this space with learning and thoughtful practice in mind.</p>
        <ul>{detail.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul>
        <button className="primary-button" onClick={() => onSelect("Overview")}>Back to overview <Icon name="arrow" size={16} /></button>
      </div>
      <p className="module-note">AmazonFX is an educational platform. Trading involves substantial risk; nothing here guarantees trading outcomes.</p>
    </section>
  );
}
