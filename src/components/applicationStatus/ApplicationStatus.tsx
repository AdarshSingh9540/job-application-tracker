"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { useSession } from "next-auth/react";

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
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    chartColor: "#3b82f6",
  },
  "resume-screening": {
    title: "Resume Screening",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200",
    badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
    chartColor: "#eab308",
  },
  "interview-process": {
    title: "Interview Process",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    chartColor: "#a855f7",
  },
  "waiting-result": {
    title: "Waiting for Result",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    chartColor: "#f97316",
  },
  selected: {
    title: "Selected",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
    chartColor: "#22c55e",
  },
  rejected: {
    title: "Rejected",
    color: "bg-white border-gray-200",
    headerColor:
      "bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200",
    badgeColor: "bg-red-100 text-red-800 border-red-200",
    chartColor: "#ef4444",
  },
};

export default function ApplicationTracker() {
  const {data:session} = useSession();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = session?.user?.id ;

  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/applications/fetch-application/${userId}`
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

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:w-1/4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAllApplications} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Application Tracker
            </h1>
          </div>
          <p className="text-gray-600">
            Track your job applications across different stages
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Pie Chart and Legend */}
          <div className="lg:w-3/4">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col lg:flex-row gap-6">
                {/* Pie Chart */}
                <div className="lg:w-2/3">
                  {chartData.length > 0 ? (
                    <ChartContainer config={{}} className="h-[240px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={90}
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
                  ) : (
                    <div className="h-[240px] flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No data to display</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Legend */}
                <div className="lg:w-1/3 space-y-3">
                  {chartData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {item.value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="lg:w-1/4 space-y-4">
            <Card className="shadow-sm py-3">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Applications
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalApplications}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm py-3">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Waiting Results
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {waitingCount}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm py-3">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {successRate}%
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {Object.entries(statusConfig).map(([statusKey, config]) => {
            const statusApplications = groupedApplications[statusKey] || [];
            return (
              <div key={statusKey} className="flex flex-col">
                <div
                  className={`${config.headerColor} p-3 rounded-t-lg flex items-center justify-between`}
                >
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {config.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className="bg-white/80 text-gray-700 text-xs"
                  >
                    {statusApplications.length}
                  </Badge>
                </div>
                <div
                  className={`${config.color} min-h-[280px] p-3 rounded-b-lg border space-y-3 bg-gray-50/50`}
                >
                  {statusApplications.map((app) => (
                    <Card
                      key={app.id}
                      className="shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-0"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                              {app.role}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                              <Building2 className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{app.company}</span>
                            </div>
                          </div>
                          {app.companyProfileLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
                              onClick={() =>
                                window.open(app.companyProfileLink, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{app.location}</span>
                          </div>
                          {app.stipend && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <DollarSign className="h-3 w-3 flex-shrink-0" />
                              <span>{app.stipend}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span>{formatDate(app.applicationDate)}</span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={`${config.badgeColor} text-xs mb-3 w-full justify-center`}
                        >
                          {config.title}
                        </Badge>

                        {app.jd && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-7 bg-transparent hover:bg-gray-50"
                            onClick={() => window.open(app.jd, "_blank")}
                          >
                            View JD
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {statusApplications.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No applications</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button
            onClick={fetchAllApplications}
            variant="outline"
            className="px-6 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Applications
          </Button>
        </div>
      </div>
    </div>
  );
}
