//@ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { IoMdAdd } from "react-icons/io";
import AddApplicationModal from "./AddApplicationModal";
import { toast } from "sonner";
import ApplicationList from "./ApplicationList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
  interviewQuestions: { id: string; question: string; category: string }[];
}

export default function AddApplication() {
  const { data: session } = useSession();
  const USER_ID = session?.user?.id||"";
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<JobApplication | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] =
    useState<JobApplication | null>(null);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/applications/fetch-application/${USER_ID}`
        );
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setApplications(data.data || []);
      } catch (err) {
        toast.error("Failed to load applications", {
          description: err.message,
        });
      }
    };
    fetchApplications();
  }, []);

  const handleOpenModal = () => {
    setEditingApplication(null);
    setIsModalOpen(true);
  };

  const handleEdit = (application: JobApplication) => {
    setEditingApplication(application);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (application: JobApplication) => {
    setApplicationToDelete(application);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!applicationToDelete) return;

    // console.log("hskjenlkjsrlkynkklk", applicationToDelete);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/applications/delete-application/${applicationToDelete}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Delete failed");

      setApplications((prev) =>
        prev.filter((app) => app.id !== applicationToDelete.id)
      );

      toast.success("Application Deleted", {
        description: "Deleted successfully!",
      });
    } catch (error: any) {
      toast.error("Failed to delete application", {
        description: error.message,
      });
    } finally {
      setDeleteConfirmOpen(false);
      setApplicationToDelete(null);
    }
  };

  const handleSave = (application: JobApplication) => {
    setApplications((prev) => {
      const exists = prev.find((app) => app.id === application.id);
      if (exists) {
        return prev.map((app) =>
          app.id === application.id ? application : app
        );
      } else {
        return [...prev, application];
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between mx-auto mb-8">
        <h1 className="font-semibold text-gray-800 text-xl">
          Add Job Application
        </h1>
        <Button onClick={handleOpenModal}>
          Add Application <IoMdAdd className="mx-1 h-6 w-6" />
        </Button>
      </div>

      <ApplicationList
        applications={applications}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApplication(null);
        }}
        onSave={handleSave}
        editingApplication={editingApplication}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the application for{" "}
              <strong>{applicationToDelete?.company}</strong> -{" "}
              <strong>{applicationToDelete?.role}</strong>? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
