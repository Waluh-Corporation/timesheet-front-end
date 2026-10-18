"use client";

import { useState } from "react";
import {
  IconBuilding,
  IconUsers,
  IconCalendarEvent,
  IconFolder,
  IconMapPin,
  IconHierarchy,
  IconFingerprint,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/tabler";

import { DepartmentsTable } from "./DepartmentsTable";
import { DivisionsTable } from "./DivisionsTable";
import { SitesTable } from "./SitesTable";
import { CompaniesTable } from "./CompaniesTable";
import { ApproversTable } from "./ApproversTable";
import { HolidaysTable } from "./HolidaysTable";
import { AuthenticatorsTable } from "./AuthenticatorsTable";

type TabId =
  | "departments"
  | "divisions"
  | "sites"
  | "companies"
  | "approvers"
  | "holidays"
  | "authenticators";

export function MasterDataView() {
  const [activeTab, setActiveTab] = useState<TabId>("departments");

  const tabs: { id: TabId; name: string; icon: React.ElementType }[] = [
    { id: "departments", name: "Departments", icon: IconHierarchy },
    { id: "divisions", name: "Divisions", icon: IconFolder },
    { id: "sites", name: "Sites", icon: IconMapPin },
    { id: "companies", name: "Companies", icon: IconBuilding },
    { id: "approvers", name: "Approvers", icon: IconUsers },
    { id: "holidays", name: "National Holidays", icon: IconCalendarEvent },
    { id: "authenticators", name: "Authenticators", icon: IconFingerprint },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "departments":
        return <DepartmentsTable />;
      case "divisions":
        return <DivisionsTable />;
      case "sites":
        return <SitesTable />;
      case "companies":
        return <CompaniesTable />;
      case "approvers":
        return <ApproversTable />;
      case "holidays":
        return <HolidaysTable />;
      case "authenticators":
        return <AuthenticatorsTable />;
      default:
        return null;
    }
  };

  return (
    <div>
      <PageHeader
        pretitle="Administration"
        title="Master Data"
        description="Manage organizational entities, locations, partner companies, approvers, holidays, and authenticator catalogs."
      />

      <div className="border-bottom mb-3 overflow-x-auto">
        <ul className="nav nav-bordered flex-nowrap text-nowrap pb-1" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <li key={tab.id} className="nav-item" role="presentation">
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-link d-inline-flex align-items-center gap-2 py-2 px-3 ${
                    isActive ? "active fw-bold" : ""
                  }`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-3">{renderActiveTab()}</div>
    </div>
  );
}
