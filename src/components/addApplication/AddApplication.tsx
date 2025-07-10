"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { IoMdAdd } from "react-icons/io";
import AddApplicationModal from "./AddApplicationModal";

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

  // Function to open the modal (for adding a new application)
  const handleOpenModal = () => {
    setEditingApplication(null); // Clear editing state for new application
    setIsModalOpen(true);
  };

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
