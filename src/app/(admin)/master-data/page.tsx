"use client";

import { useState } from "react";
import {
  Building2,
  Users2,
  CalendarCheck2,
  FolderTree,
  MapPin,
  Network
} from "lucide-react";

import { DepartmentsTable } from "./components/DepartmentsTable";
import { DivisionsTable } from "./components/DivisionsTable";
import { SitesTable } from "./components/SitesTable";
import { CompaniesTable } from "./components/CompaniesTable";
import { ApproversTable } from "./components/ApproversTable";
import { HolidaysTable } from "./components/HolidaysTable";

type TabId = "departments" | "divisions" | "sites" | "companies" | "approvers" | "holidays";

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<TabId>("departments");

  const tabs: { id: TabId; name: string; icon: React.ElementType }[] = [
    { id: "departments", name: "Departments", icon: Network },
    { id: "divisions", name: "Divisions", icon: FolderTree },
    { id: "sites", name: "Sites", icon: MapPin },
    { id: "companies", name: "Companies", icon: Building2 },
    { id: "approvers", name: "Approvers", icon: Users2 },
    { id: "holidays", name: "National Holidays", icon: CalendarCheck2 },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "departments": return <DepartmentsTable />;
      case "divisions": return <DivisionsTable />;
      case "sites": return <SitesTable />;
      case "companies": return <CompaniesTable />;
      case "approvers": return <ApproversTable />;
      case "holidays": return <HolidaysTable />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold">Master Data</h1>
        <p className="text-sm text-mr-muted">
          Manage departments, divisions, sites, companies, overtime approvers, and Indonesian public holidays.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b-2 border-mr-ink gap-2 scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-bold text-sm transition border-b-2 -mb-[2px] whitespace-nowrap ${
                isActive
                  ? "border-mr-purple text-mr-purple bg-mr-surface"
                  : "border-transparent text-mr-muted hover:text-mr-ink hover:bg-mr-surface2/30"
              }`}
            >
              <Icon size={16} /> {tab.name}
            </button>
          );
        })}
      </div>

      {/* Page Content */}
      <div className="mt-2">
        {renderActiveTab()}
      </div>
    </div>
  );
}
