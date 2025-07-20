import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import Select from "react-select";

export default function AddBooking({ user, fetchAllBookings, setShowForm }) {
  const [formData, setFormData] = useState({
    sale_type: "",
    client_id: "",
    crm_id: "",
    projectid: "",
    project_milestone: "",
    call_related_to: "",
    subject_area: "",
    no_of_consultant: "1",
    consultant_id: "",
    secondary_consultant_id: "",
    third_consultant_id: "",
    name: user?.fld_name || "",
    email: user?.fld_email || "",
    phone: user?.fld_phone || "",
    company_name: user?.fld_company_name || "",
    topic_of_research: "",
    call_regarding: "",
    asana_link: "",
    internal_comments: "",
    set_int_comments: false,
  });
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);

  const [consultants, setConsultants] = useState([]);

  const [subjectAreas, setSubjectAreas] = useState([]);

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (formData.sale_type === "Presales" && formData.client_id.length > 3) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/bookings/getPresaleClientDetails/${formData.client_id}`,
            {
              method: "GET",
            }
          );
          const data = await res.json();

          // Fix: Check if data.status is true AND data.client exists
          if (data.status && data.data) {
            setFormData((prev) => ({
              ...prev,
              name: data.data.name || "",
              email: data.data.email || "",
              phone: data.data.phone || "",
            }));
          } else {
            console.warn("Client not found or invalid response");
            // Optional: Reset client fields if no client found
            setFormData((prev) => ({
              ...prev,
              name: "",
              email: "",
              phone: "",
            }));
          }
        } catch (err) {
          console.error("Error fetching client", err);
          // Optional: Reset client fields on error
          setFormData((prev) => ({
            ...prev,
            name: "",
            email: "",
            phone: "",
          }));
        }
      }
      if (formData.sale_type === "Postsales" && formData.client_id.length > 3) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/bookings/getPostsaleClientDetails/${formData.client_id}`,
            {
              method: "GET",
            }
          );
          const data = await res.json();

          if (data.status && data.data) {
            setFormData((prev) => ({
              ...prev,
              name: data.data.name || "",
              email: data.data.email || "",
              phone: data.data.phone || "",
            }));

            // Set project list
            setProjects(data.data.projects || []);
          } else {
            console.warn("Client not found or invalid response");
            setFormData((prev) => ({
              ...prev,
              name: "",
              email: "",
              phone: "",
            }));
            setProjects([]);
          }
        } catch (err) {
          console.error("Error fetching client", err);
          setFormData((prev) => ({
            ...prev,
            name: "",
            email: "",
            phone: "",
          }));
          setProjects([]);
        }
      }
    };

    fetchClientDetails();
  }, [formData.client_id, formData.sale_type]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(
      "http://localhost:5000/api/bookings/addBooking",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const result = await response.json();
    if (result.status) {
      alert("Booking added successfully!");
      fetchAllBookings(); // refresh table
    } else {
      alert("Failed to add booking.");
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 w-full h-full bg-white shadow-xl z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">Add Booking</h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-600 hover:text-black text-2xl"
        >
          <XIcon size={15} />
        </button>
      </div>

      {/* Form */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Call Type
          </label>
          <select
            name="sale_type"
            value={formData.sale_type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select Call Type</option>
            <option value="Presales">Presales</option>
            <option value="Postsales">Postsales</option>
          </select>
        </div>

        {(formData.sale_type === "Presales" ||
          formData.sale_type === "Postsales") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insta CRM RefId
            </label>
            <input
              type="text"
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        )}

        {formData.sale_type === "Postsales" && formData.client_id && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project
            </label>
            <Select
              options={projects.map((project) => ({
                value: project.id,
                label: `${project.id} - ${project.project_title}`,
              }))}
              onChange={async (selectedOption) => {
                setFormData((prev) => ({
                  ...prev,
                  project_id: selectedOption.value,
                }));

                // Fetch milestones for the selected project
                try {
                  const res = await fetch(
                    `http://localhost:5000/api/bookings/getProjectMilestones/${selectedOption.value}`
                  );
                  const data = await res.json();

                  if (data.status && Array.isArray(data.data)) {
                    setMilestones(data.data);
                  } else {
                    setMilestones([]);
                  }
                } catch (error) {
                  console.error("Error fetching milestones", error);
                  setMilestones([]);
                }
              }}
              placeholder="Select a project"
            />
          </div>
        )}

        {formData.projectid && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Milestone
            </label>
            <Select
              options={milestones.map((milestone) => ({
                value: milestone.id,
                label: milestone.segment_title,
              }))}
              onChange={(selected) => {
                setFormData((prev) => ({
                  ...prev,
                  milestone_id: selected.value,
                }));
              }}
              placeholder="Select milestone"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call Related To
          </label>
          <select
            name="call_related_to"
            value={formData.call_related_to}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select Option</option>
            <option value="direct_call">Direct Call</option>
            <option value="subject_area_related">Subject Area Related</option>
            <option value="price_and_discount_related">
              Price And Discount Related
            </option>
          </select>
        </div>

        {formData.call_related_to === "subject_area_related" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Area
            </label>
            <select
              name="subject_area"
              value={formData.subject_area}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Select Subject Area</option>
              {subjectAreas.map((s) => (
                <option key={s.id} value={s.domain}>
                  {s.domain}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Consultant
          </label>
          <select
            name="consultant_id"
            value={formData.consultant_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select Consultant</option>
            {consultants.map((con) => (
              <option key={con.id} value={con.id}>
                {con.fld_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            className="w-full border px-3 py-2 rounded"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            className="w-full border px-3 py-2 rounded"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            className="w-full border px-3 py-2 rounded"
            readOnly
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic of Research
          </label>
          <textarea
            name="topic_of_research"
            value={formData.topic_of_research}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Call Regarding
          </label>
          <input
            type="text"
            name="call_regarding"
            value={formData.call_regarding}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Asana URL / Quote ID
          </label>
          <input
            type="text"
            name="asana_link"
            value={formData.asana_link}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="md:col-span-3">
          <label className="inline-flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              name="set_int_comments"
              checked={formData.set_int_comments}
              onChange={handleChange}
              className="mr-2"
            />
            Add CRM Comments
          </label>
          {formData.set_int_comments && (
            <textarea
              name="internal_comments"
              value={formData.internal_comments}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded mt-2"
              placeholder="Enter comments"
            />
          )}
        </div>

        <div className="md:col-span-3 flex justify-end pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Booking
          </button>
        </div>
      </div>
    </motion.div>
  );
}
