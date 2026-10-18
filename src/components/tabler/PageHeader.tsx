import React from "react";

interface PageHeaderProps {
  title: string;
  pretitle?: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  pretitle,
  subtitle,
  description,
  actions,
  className = "",
}: PageHeaderProps) {
  const desc = subtitle || description;
  return (
    <div className={`page-header d-print-none mb-3 ${className}`}>
      <div className="row g-2 align-items-center">
        <div className="col min-w-0">
          {pretitle && <div className="page-pretitle text-secondary">{pretitle}</div>}
          <h2 className="page-title text-truncate">{title}</h2>
          {desc && <div className="text-secondary small mt-1">{desc}</div>}
        </div>
        {actions && (
          <div className="col-12 col-sm-auto ms-sm-auto d-print-none mt-2 mt-sm-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
