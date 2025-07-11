"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { IoMdAdd } from "react-icons/io";
import AddApplicationModal from "./AddApplicationModal";
import { Building2 } from "lucide-react";
import ApplicationList from "./ApplicationList";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

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
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<JobApplication | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Function to open the modal (for adding a new application)
  const handleOpenModal = () => {
    setEditingApplication(null); // Clear editing state for new application
    setIsModalOpen(true);
  };

  const handleEdit = (application: JobApplication) => {
    setEditingApplication(application);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (application: JobApplication) => {
    const updatedApplications = applications.map((app) =>
      app.id === application.id ? application : app
    );
    setApplications(updatedApplications);
    setIsEditModalOpen(false);
    setEditingApplication(null);
  };

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
    toast.success("Application Deleted", {
      description: "Deleted successfully!",
    });
  };

  //   const getStatusBadge = (status: string) => {
  //     const statusOption = statusOptions.find((opt) => opt.value === status);
  //     return (
  //       <Badge className={`${statusOption?.color} text-white`}>
  //         {statusOption?.label}
  //       </Badge>
  //     );
  //   };
  return (
    <div>
      <div className="flex justify-between mx-auto">
        <h1 className="font-semibold text-gray-800 text-xl">
          Add Job Application
        </h1>
        <Button onClick={handleOpenModal} className="cursor-pointer">
          Add Application <IoMdAdd className="mx-1 h-6 w-6 font-bold" />
        </Button>
      </div>
      {/* <div className="text-center flex flex-col min-h-screen items-center justify-center py-8 text-gray-500">
        <div className="border p-36 rounded-xl">
          <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No applications yet. Click "Add Application" to get started!</p>
        </div>
      </div> */}

      <ApplicationList
        applications={applications}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApplication(null);
        }}
        onSave={(application) => {
          if (editingApplication) {
            setApplications((prev) =>
              prev.map((app) => (app.id === application.id ? application : app))
            );
          } else {
            setApplications((prev) => [...prev, application]);
          }
          setIsModalOpen(false); // Close modal after saving
        }}
        editingApplication={editingApplication} // Uncommented to pass prop
      />
    </div>
  );
}
