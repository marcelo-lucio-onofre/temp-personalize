import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

/** Up to 3 levels: every item but the last is a link, the last is the
 * current screen. Used at the top of every content page. */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="breadcrumb-item">
            {item.to && !isLast ? (
              <Link to={item.to} className="breadcrumb-link">{item.label}</Link>
            ) : (
              <span className={isLast ? "breadcrumb-current" : undefined}>{item.label}</span>
            )}
            {!isLast && <span className="breadcrumb-sep" aria-hidden>›</span>}
          </span>
        );
      })}
    </nav>
  );
}
