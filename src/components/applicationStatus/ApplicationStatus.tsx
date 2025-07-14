"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Toaster, toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  Building2,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";

interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  stipend: string;
  applicationDate: string;
  status: string;
  jd: string;
  companyProfileLink: string;
}

const statusConfig = {
  applied: {
    title: "Applied",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200",
    badgeColor: "bg-blue-100 text-blue-700",
    chartColor: "#3b82f6",
  },
  "resume-screening": {
    title: "Resume Screening",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200",
    badgeColor: "bg-yellow-100 text-yellow-700",
    chartColor: "#eab308",
  },
  "interview-process": {
    title: "Interview Process",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200",
    badgeColor: "bg-purple-100 text-purple-700",
    chartColor: "#a855f7",
  },
  "waiting-result": {
    title: "Waiting for Result",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200",
    badgeColor: "bg-orange-100 text-orange-700",
    chartColor: "#f97316",
  },
  selected: {
    title: "Selected",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200",
    badgeColor: "bg-green-100 text-green-700",
    chartColor: "#22c55e",
  },
  rejected: {
    title: "Rejected",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200",
    badgeColor: "bg-red-100 text-red-700",
    chartColor: "#ef4444",
  },
};

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = "68703dbdb65b9f8c39febb6e";

  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8081/api/v1/applications/fetch-application/${userId}`
      );

      const mappedApplications = response.data.data.map((app: any) => ({
        id: app._id,
        company: app.company,
        role: app.role,
        location: app.location,
        stipend: app.stipend,
        applicationDate: app.applicationDate,
        status: app.status,
        jd: app.jd,
        companyProfileLink: app.companyProfileLink,
      }));

      setApplications(mappedApplications);
      setError(null);
    } catch (err) {
      setError("Failed to fetch applications. Please try again.");
      toast.error("Unable to load your job applications.", {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllApplications();
  }, [userId]);

  const groupedApplications = applications.reduce((acc, app) => {
    const status = app.status.toLowerCase().replace(/\s+/g, "-");
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(app);
    return acc;
  }, {} as Record<string, JobApplication[]>);

  // Prepare chart data
  const chartData = Object.entries(statusConfig)
    .map(([key, config]) => ({
      name: config.title,
      value: groupedApplications[key]?.length || 0,
      color: config.chartColor,
    }))
    .filter((item) => item.value > 0);

  const totalApplications = applications.length;
  const selectedCount = groupedApplications.selected?.length || 0;
  const waitingCount = groupedApplications["waiting-result"]?.length || 0;
  const successRate =
    totalApplications > 0
      ? Math.round((selectedCount / totalApplications) * 100)
      : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAllApplications}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Application Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Track your job applications across different stages
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Pie Chart and Legend - 75% Width */}
          <div className="lg:w-3/4">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col lg:flex-row gap-4">
                {/* Pie Chart */}
                <div className="lg:w-3/4">
                  <ChartContainer config={{}} className="h-[255px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                {/* Legend - Right Side of Chart */}
                <div className="lg:w-1/4 space-y-2">
                  {chartData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm "
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="">{item.name}</span>
                      </div>
                      <span className="font-medium ">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Stats Cards - 25% Width, Right Side */}
          <div className="lg:w-1/4 flex flex-col gap-4">
            <Card className="bg-white shadow-sm border-0 shadow-blue-100">
              <CardContent className="p-2 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Total Applications
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalApplications}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 shadow-orange-100">
              <CardContent className="p-2 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Waiting for Result
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {waitingCount}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-0 shadow-green-100">
              <CardContent className="p-2 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {successRate}%
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
          {Object.entries(statusConfig).map(([statusKey, config]) => {
            const statusApplications = groupedApplications[statusKey] || [];

            return (
              <div key={statusKey} className="flex flex-col">
                <div
                  className={`${config.headerColor} p-4 rounded-t-lg flex items-center justify-between`}
                >
                  <h3 className="font-semibold text-gray-900">
                    {config.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-white/80 text-gray-700 font-medium"
                  >
                    {statusApplications.length}
                  </Badge>
                </div>

                <div
                  className={`${config.color} min-h-[320px] p-4 rounded-b-lg border space-y-4 bg-gray-50/50`}
                >
                  {statusApplications.map((app) => (
                    <Card
                      key={app.id}
                      className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm font-semibold text-gray-900 mb-2">
                              {app.role}
                            </CardTitle>
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                              <Building2 className="h-3 w-3" />
                              {app.company}
                            </div>
                          </div>
                          {app.companyProfileLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-gray-100"
                              onClick={() =>
                                window.open(app.companyProfileLink, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            {app.location}
                          </div>

                          {app.stipend && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <DollarSign className="h-3 w-3" />
                              {app.stipend}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(app.applicationDate)}
                          </div>
                        </div>

                        <Badge
                          className={`${config.badgeColor} text-xs border-0 font-medium`}
                          variant="secondary"
                        >
                          {config.title}
                        </Badge>

                        {app.jd && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs bg-transparent hover:bg-gray-50 border-gray-200"
                            onClick={() => window.open(app.jd, "_blank")}
                          >
                            View Job Description
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {statusApplications.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No applications</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={fetchAllApplications}
            variant="outline"
            className="px-8 bg-transparent"
          >
            Refresh Applications
          </Button>
        </div>
      </div>
    </div>
  );
}
