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
import { Trash2, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";

// Define interface for JobApplication
interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  stipend: number; // Changed to number to match JSON response
  applicationDate: string;
  status: string;
  jd: string;
  companyProfileLink: string;
}

const statusOptions = [
  { value: "applied", label: "Applied", color: "bg-blue-500" },
  {
    value: "resume-screening",
    label: "Resume Screening",
    color: "bg-yellow-500",
  },
  {
    value: "interview-process",
    label: "Interview Process",
    color: "bg-purple-500",
  },
  {
    value: "waiting-result",
    label: "Waiting for Result",
    color: "bg-orange-500",
  },
  { value: "selected", label: "Selected", color: "bg-green-500" },
  { value: "rejected", label: "Rejected", color: "bg-red-500" },
];

interface ApplicationListProps {
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
  userId: string; // Added for dynamic user ID
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
        `http://localhost:8080/api/v1/applications/fetch-application/68703dbdb65b9f8c39febb6e`
      );
      // Map API response to match JobApplication interface
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
  }, [userId]); // Added userId as dependency

  const deleteApplication = (id: string) => {
    onDelete(id);
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return (
      <Badge className={`${statusOption?.color || "bg-gray-500"} text-white`}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Loading Applications...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-gray-500">
            <p>Loading your job applications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Your Applications (0)</CardTitle>
          <CardDescription>
            Track and manage all your job applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-40 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No applications yet. Click "Add Application" to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Applications ({applications.length})</CardTitle>
        <CardDescription>
          Track and manage all your job applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`space-y-4  overflow-y-auto ${
            applications.length == 0 ? "max-h-96" : "h-auto"
          }`}
        >
          {applications.map((app) => (
            <div key={app.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{app.role}</h3>
                  <p className="text-gray-600">{app.company}</p>
                  {app.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {app.location}
                    </p>
                  )}
                  {app.companyProfileLink && (
                    <a
                      href={app.companyProfileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-700 underline"
                    >
                      Company Profile
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(app.status)}
                  <Button variant="ghost" size="sm" onClick={() => onEdit(app)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteApplication(app.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {app.stipend > 0 && (
                <p className="text-sm text-green-600 font-medium">
                  ${app.stipend.toLocaleString()}
                </p>
              )}

              {app.applicationDate && (
                <p className="text-xs text-gray-500">
                  Applied:{" "}
                  {new Date(app.applicationDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
