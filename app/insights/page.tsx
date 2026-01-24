"use client";

import {
  Home,
  LayoutGrid,
  MessageCircle,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  Link as LinkIcon,
  User,
  Search,
  Bell,
  Sparkles,
  Filter,
  Calendar,
  Info,
  ArrowUp,
  ArrowRight,
  HelpCircle,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { ChatLogsSection } from "../components/ChatLogsSection";

export default function InsightsPage() {
  const [activeNav, setActiveNav] = useState("Insights");
  const [activeTab, setActiveTab] = useState("AI Demos");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<{ name: string; views: number } | null>(null);

  // Country view data - mapping ISO country codes to view counts
  const countryViews: Record<string, number> = {
    US: 11600, // USA - highest
    IN: 11600, // India - highest
    CA: 4000,  // Canada
    BR: 3500,  // Brazil
    GB: 2800,  // UK
    FR: 2800,  // France
    DE: 2800,  // Germany
    ES: 2200,  // Spain
    IT: 2200,  // Italy
    CN: 3000,  // China
    JP: 2500,  // Japan
    AU: 2000,  // Australia
    MX: 1500,  // Mexico
    RU: 2000,  // Russia
    KR: 1800,  // South Korea
    AR: 1200,  // Argentina
    ZA: 1000,  // South Africa
    NL: 1800,  // Netherlands
    SE: 1500,  // Sweden
    NO: 1200,  // Norway
    DK: 1200,  // Denmark
    PL: 1500,  // Poland
    TR: 1800,  // Turkey
    SA: 1500,  // Saudi Arabia
    AE: 1200,  // UAE
    SG: 2000,  // Singapore
    MY: 1500,  // Malaysia
    TH: 1200,  // Thailand
    ID: 1800,  // Indonesia
    PH: 1500,  // Philippines
    VN: 1200,  // Vietnam
    NZ: 1000,  // New Zealand
  };

  const maxViews = 11600;
  const minViews = 1;

  // Get color opacity based on views
  const getCountryColor = (views: number) => {
    if (!views || views === 0) return { fill: "#f5f5f5", opacity: 1 };
    const opacity = 0.1 + ((views - minViews) / (maxViews - minViews)) * 0.85;
    return { fill: "#b05a36", opacity: Math.min(opacity, 0.95) };
  };

  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  // AI Demos Data
  const aiDemosChartData = [
    { views: 28, viewers: 24 },
    { views: 35, viewers: 30 },
    { views: 42, viewers: 38 },
    { views: 38, viewers: 35 },
    { views: 55, viewers: 50 },
    { views: 62, viewers: 58 },
    { views: 75, viewers: 70 },
    { views: 88, viewers: 82 },
    { views: 95, viewers: 90 },
    { views: 110, viewers: 105 },
    { views: 125, viewers: 118 },
    { views: 140, viewers: 132 },
    { views: 155, viewers: 148 },
    { views: 170, viewers: 162 },
    { views: 185, viewers: 178 },
    { views: 200, viewers: 192 },
  ];

  const aiDemosMostViewed = [
    {
      showcase: "AI-Powered Sales Assistant",
      person: "Sarah Chen",
      views: 542,
      viewsChange: "+45%",
      uniqueViewers: 485,
      viewersChange: "+48%",
      completionRate: "12.5%"
    },
    {
      showcase: "Smart Product Recommendations",
      person: "Michael Park",
      views: 428,
      viewsChange: "+62%",
      uniqueViewers: 392,
      viewersChange: "+65%",
      completionRate: "8.3%"
    },
    {
      showcase: "Automated Demo Generation",
      person: "Lisa Anderson",
      views: 389,
      viewsChange: "+38%",
      uniqueViewers: 356,
      viewersChange: "+41%",
      completionRate: "15.2%"
    },
    {
      showcase: "Intelligent Lead Scoring",
      person: "James Wilson",
      views: 312,
      viewsChange: "+28%",
      uniqueViewers: 289,
      viewersChange: "+31%",
      completionRate: "9.8%"
    }
  ];

  const aiDemosOsData = [
    { name: "Mac", views: 22400, percentage: 56 },
    { name: "Windows", views: 12800, percentage: 32 },
    { name: "iOS", views: 3200, percentage: 8 },
    { name: "Android", views: 1200, percentage: 3 },
    { name: "Linux", views: 400, percentage: 1 }
  ];

  const aiDemosBrowserData = [
    { name: "Chrome", views: 28000, percentage: 70 },
    { name: "Safari", views: 8000, percentage: 20 },
    { name: "Mobile Safari", views: 2400, percentage: 6 },
    { name: "Edge", views: 1200, percentage: 3 },
    { name: "Mobile Chrome", views: 400, percentage: 1 }
  ];

  // AI Demos Data

  // Metrics Data
  const metricsData = [
    {
      title: "Unique visitors",
      value: "1,247",
      change: "+12.5%",
      comparison: "1,108 last period",
      chartData: [0.3, 0.5, 0.7]
    },
    {
      title: "Engaged visitors",
      value: "892",
      change: "+8.3%",
      comparison: "824 last period",
      chartData: [0.4, 0.5, 0.6]
    },
    {
      title: "CTA clicks",
      value: "234",
      change: "+15.2%",
      comparison: "203 last period",
      chartData: [0.2, 0.3, 0.4]
    },
    {
      title: "Time spent per session",
      value: "2m 34s",
      change: "+5.1%",
      comparison: "2m 27s last period",
      chartData: [0.35, 0.4, 0.45]
    },
    {
      title: "Click-through rate",
      value: "18.7%",
      change: "+2.3%",
      comparison: "18.3% last period",
      chartData: [0.15, 0.17, 0.19]
    },
    {
      title: "Steps viewed",
      value: "3,456",
      change: "+22.1%",
      comparison: "2,833 last period",
      chartData: [0.25, 0.4, 0.55]
    }
  ];

  const metricChartDates = ["Jan 10", "Jan 12", "Jan 14"];

  // Get current tab data
  const chartData = aiDemosChartData;
  const mostViewed = aiDemosMostViewed;
  const osData = aiDemosOsData;
  const browserData = aiDemosBrowserData;

  const maxValue = 200;
  const chartHeight = 200;
  const maxOsViews = 25000;
  const maxBrowserViews = 30000;

  const totalViews = "2.8K";
  const totalViewers = "2.5K";
  const viewsChange = "32.15%";
  const viewersChange = "35.20%";
  const sectionTitle = "AI Demo Views";

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Secondary Navigation */}
        <div className="bg-surface border-b border-primary/10 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab("AI Demos")}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === "AI Demos"
                ? "text-foreground border-b-2 border-primary"
                : "text-foreground/60 hover:text-foreground"
                }`}
            >
              AI Demos
            </button>
            <button
              onClick={() => setActiveTab("Logs")}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === "Logs"
                ? "text-foreground border-b-2 border-primary"
                : "text-foreground/60 hover:text-foreground"
                }`}
            >
              Logs
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm hover:bg-primary/5 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm hover:bg-primary/5 transition-colors">
              <Calendar className="w-4 h-4" />
              12/17/25 - 1/15/26
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 py-8 space-y-8">
          {/* Logs Tab Content */}
          {activeTab === "Logs" && (
            <ChatLogsSection />
          )}

          {/* Views Section */}
          {activeTab !== "Logs" && (
            <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
              <h2 className="text-xl font-bold text-foreground mb-6">{sectionTitle}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm text-foreground/70">Total Views</h3>
                    <HelpCircle className="w-4 h-4 text-foreground/40" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{totalViews}</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{viewsChange}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm text-foreground/70">Total Viewers</h3>
                    <HelpCircle className="w-4 h-4 text-foreground/40" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{totalViewers}</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{viewersChange}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm text-foreground/70">Views</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-foreground/70">Viewers</span>
                </div>
              </div>

              {/* Line Chart */}
              <div className="relative h-[200px]">
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  {/* Y-axis grid lines */}
                  {[0, 50, 100, 150, 200].map((value) => (
                    <g key={value}>
                      <line
                        x1="0"
                        y1={200 - (value / maxValue) * chartHeight}
                        x2="800"
                        y2={200 - (value / maxValue) * chartHeight}
                        stroke="#e5e5e5"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y={200 - (value / maxValue) * chartHeight + 4}
                        fill="#666"
                        fontSize="10"
                        textAnchor="start"
                      >
                        {value}
                      </text>
                    </g>
                  ))}

                  {/* Views line */}
                  <polyline
                    points={chartData.map((d, i) => `${(i / (chartData.length - 1)) * 800},${200 - (d.views / maxValue) * chartHeight}`).join(' ')}
                    fill="none"
                    stroke="#b05a36"
                    strokeWidth="2"
                  />

                  {/* Viewers line */}
                  <polyline
                    points={chartData.map((d, i) => `${(i / (chartData.length - 1)) * 800},${200 - (d.viewers / maxValue) * chartHeight}`).join(' ')}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                  />

                  {/* Views area fill */}
                  <polygon
                    points={`0,200 ${chartData.map((d, i) => `${(i / (chartData.length - 1)) * 800},${200 - (d.views / maxValue) * chartHeight}`).join(' ')} 800,200`}
                    fill="#b05a36"
                    fillOpacity="0.1"
                  />

                  {/* Viewers area fill */}
                  <polygon
                    points={`0,200 ${chartData.map((d, i) => `${(i / (chartData.length - 1)) * 800},${200 - (d.viewers / maxValue) * chartHeight}`).join(' ')} 800,200`}
                    fill="#22c55e"
                    fillOpacity="0.1"
                  />
                </svg>
              </div>
            </section>
          )}

          {/* Metrics Cards Section */}
          {activeTab !== "Logs" && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metricsData.map((metric, index) => (
                <div key={index} className="bg-surface rounded-lg p-4 shadow-sm border border-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">{metric.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${metric.change.startsWith('+')
                      ? 'bg-green-500/20 text-green-600'
                      : 'bg-foreground/10 text-foreground/70'
                      }`}>
                      {metric.change}
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
                    <div className="text-xs text-foreground/60">{metric.comparison}</div>
                  </div>

                  {/* Mini Line Chart */}
                  <div className="relative h-12 mt-3">
                    <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                      {/* X-axis labels */}
                      {metricChartDates.map((date, i) => {
                        const xPos = metricChartDates.length === 1
                          ? 100
                          : (i / Math.max(1, metricChartDates.length - 1)) * 200;
                        return (
                          <text
                            key={i}
                            x={xPos}
                            y="46"
                            fill="#999"
                            fontSize="8"
                            textAnchor="middle"
                          >
                            {date}
                          </text>
                        );
                      })}

                      {/* Chart line */}
                      <polyline
                        points={metric.chartData.map((d, i) => {
                          const xPos = metric.chartData.length === 1
                            ? 100
                            : (i / Math.max(1, metric.chartData.length - 1)) * 200;
                          const yPos = 48 - (d * 48);
                          return `${xPos},${yPos}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Area fill */}
                      <polygon
                        points={`0,48 ${metric.chartData.map((d, i) => {
                          const xPos = metric.chartData.length === 1
                            ? 100
                            : (i / Math.max(1, metric.chartData.length - 1)) * 200;
                          const yPos = 48 - (d * 48);
                          return `${xPos},${yPos}`;
                        }).join(' ')} 200,48`}
                        fill="#3b82f6"
                        fillOpacity="0.1"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Most Viewed Section */}
          {activeTab !== "Logs" && (
            <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Most Viewed</h2>
                <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">SHOWCASE</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">VIEWS</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">UNIQUE VIEWERS</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">COMPLETION RATE</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mostViewed.map((item, index) => (
                      <tr key={index} className="border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-foreground">{item.showcase}</p>
                            <p className="text-sm text-foreground/60">{item.person}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{item.views}</span>
                            <div className="flex items-center gap-1 text-green-600">
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">{item.viewsChange}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{item.uniqueViewers}</span>
                            <div className="flex items-center gap-1 text-green-600">
                              <ArrowUp className="w-3 h-3" />
                              <span className="text-xs">{item.viewersChange}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-foreground">{item.completionRate}</span>
                        </td>
                        <td className="py-4 px-4">
                          <ArrowRight className="w-4 h-4 text-foreground/40" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Device & Location Section */}
          {activeTab !== "Logs" && (
            <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
              <h2 className="text-xl font-bold text-foreground mb-6">Device & Location</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Viewers by OS */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Viewers by OS</h3>
                  <div className="space-y-4">
                    {osData.map((os, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground">{os.name}</span>
                          <span className="text-sm font-medium text-foreground">{os.percentage}%</span>
                        </div>
                        <div className="w-full bg-primary/5 rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${(os.views / maxOsViews) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-foreground/60 mt-1 block">{os.views.toLocaleString()} Views</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Viewers by Browser */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Viewers by Browser</h3>
                  <div className="space-y-4">
                    {browserData.map((browser, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground">{browser.name}</span>
                          <span className="text-sm font-medium text-foreground">{browser.percentage}%</span>
                        </div>
                        <div className="w-full bg-primary/5 rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${(browser.views / maxBrowserViews) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-foreground/60 mt-1 block">{browser.views.toLocaleString()} Views</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Viewers by Country Map */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Viewers by Country</h3>
                <div className="bg-surface rounded-lg border border-primary/10 p-4 min-h-[500px] relative">
                  {/* Tooltip */}
                  {tooltipContent && (
                    <div
                      className="absolute z-10 bg-foreground text-surface px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
                      style={{
                        left: '50%',
                        top: '20px',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <div className="font-semibold">{tooltipContent.name}</div>
                      <div className="text-xs mt-1">{tooltipContent.views.toLocaleString()} views</div>
                    </div>
                  )}

                  <ComposableMap
                    projectionConfig={{
                      scale: 147,
                      center: [0, 20]
                    }}
                    className="w-full h-full"
                  >
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const countryCode = geo.properties.ISO_A2 || "";
                          const countryName = (geo.properties.NAME || geo.properties.NAME_LONG || "Unknown") as string;
                          const views = countryCode ? (countryViews[countryCode] || 0) : 0;
                          const colorData = getCountryColor(views);
                          const isSelected = selectedCountry === countryCode;

                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={colorData.fill}
                              fillOpacity={colorData.opacity}
                              stroke={isSelected ? "#8a4630" : "#d0d0d0"}
                              strokeWidth={isSelected ? 2 : 0.5}
                              style={{
                                default: {
                                  outline: "none",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease"
                                },
                                hover: {
                                  fill: "#b05a36",
                                  fillOpacity: Math.min(colorData.opacity + 0.1, 1),
                                  stroke: "#8a4630",
                                  strokeWidth: 1.5,
                                  outline: "none"
                                },
                                pressed: {
                                  fill: "#8a4630",
                                  fillOpacity: 0.8,
                                  stroke: "#8a4630",
                                  strokeWidth: 2,
                                  outline: "none"
                                }
                              }}
                              onClick={() => {
                                if (countryCode) {
                                  setSelectedCountry(countryCode === selectedCountry ? null : countryCode);
                                  if (views > 0) {
                                    setTooltipContent({ name: countryName, views });
                                    setTimeout(() => setTooltipContent(null), 3000);
                                  }
                                }
                              }}
                              onMouseEnter={() => {
                                if (views > 0 && countryCode) {
                                  setTooltipContent({ name: countryName, views });
                                }
                              }}
                              onMouseLeave={() => {
                                if (!selectedCountry) {
                                  setTooltipContent(null);
                                }
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ComposableMap>

                  {/* Legend - Top Right */}
                  <div className="absolute top-4 right-4 bg-surface/95 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-primary/10">
                    <div className="text-sm font-semibold text-foreground mb-2">Views</div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-20 h-3 bg-gradient-to-r from-primary/10 to-primary rounded" />
                    </div>
                    <div className="flex justify-between text-xs text-foreground/70">
                      <span>1</span>
                      <span>11.6K</span>
                    </div>
                    {selectedCountry && (
                      <div className="mt-3 pt-3 border-t border-primary/10 text-xs text-foreground/70">
                        Click a country to select
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
