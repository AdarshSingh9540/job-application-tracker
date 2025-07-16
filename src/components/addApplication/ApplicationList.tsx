"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trash2,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Edit3,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";

// Define interface for JobApplication
interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  stipend: number;
  applicationDate: string;
  status: string;
  jd: string;
  companyProfileLink: string;
}

const statusOptions = [
  {
    value: "applied",
    label: "Applied",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "resume-screening",
    label: "Resume Screening",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  {
    value: "interview-process",
    label: "Interview Process",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    value: "waiting-result",
    label: "Waiting for Result",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    value: "selected",
    label: "Selected",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
  },
];

interface ApplicationListProps {
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
  userId: string;
}

export default function ApplicationList({
  onEdit,
  onDelete,
  userId,
}: ApplicationListProps) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/applications/fetch-application/68703dbdb65b9f8c39febb6e`
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
      toast.error("Error fetching applications", {
        description: "Unable to load your job applications.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllApplications();
  }, [userId]);

  const deleteApplication = (id: string) => {
    onDelete(id);
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return (
      <Badge
        variant="outline"
        className={`${
          statusOption?.color || "bg-gray-100 text-gray-800 border-gray-200"
        } font-medium`}
      >
        {statusOption?.label || status}
      </Badge>
    );
  };

  const LoadingSkeleton = () => (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>Loading Applications...</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="my-6 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">
            Error Loading Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAllApplications} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Your Applications (0)
          </CardTitle>
          <CardDescription>
            Track and manage all your job applications in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start tracking your job applications by clicking the "Add
              Application" button to get organized!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Your Applications ({applications.length})
        </CardTitle>
        <CardDescription>
          Track and manage all your job applications
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base text-gray-900 mb-1">
                          {app.role}
                        </h3>
                        <p className="text-gray-600 font-medium mb-1">
                          {app.company}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          {app.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{app.location}</span>
                            </div>
                          )}

                          {app.stipend > 0 && (
                            <div className="flex items-center gap-1 text-green-600 font-medium">
                              <DollarSign className="w-4 h-4" />
                              <span>{app.stipend.toLocaleString()}</span>
                            </div>
                          )}

                          {app.applicationDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(
                                  app.applicationDate
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {app.companyProfileLink && (
                          <a
                            href={app.companyProfileLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Company Profile
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    // size="lg"
                    onClick={() => onEdit(app)}
                    className=""
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    // size="md"
                    onClick={() => deleteApplication(app.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
