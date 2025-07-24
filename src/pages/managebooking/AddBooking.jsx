import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import Select from "react-select";
import toast from "react-hot-toast";
import {
  fetchAllConsultants,
  fetchAllSubjectAreas,
} from "../../helpers/CommonApi";
import { useAuth } from "../../utils/idb";
import { callRegardingOptions } from "../../helpers/CommonHelper";

export default function AddBooking({ user, fetchAllBookings, setShowForm }) {
  const { user: loggedInUser, priceDiscoutUsernames } = useAuth();

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
    consultant_another_option: "",
    secondary_consultant_id: "",
    third_consultant_id: "",
    name: "",
    email: "",
    phone: "",
    company_name: "",
    insta_website: "",
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
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [showReassignOptions, setShowReassignOptions] = useState(false);
  const [selectedConsultantName, setSelectedConsultantName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const consultantsData = await fetchAllConsultants();
    const subjectAreasData = await fetchAllSubjectAreas();
    setConsultants(consultantsData.data || []);
    setSubjectAreas(subjectAreasData.data || []);
  };

  useEffect(() => {
    const fetchClientDetails = async () => {
      const clientId = formData.client_id;

      if (formData.sale_type === "Presales" && clientId.length > 3) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/bookings/getPresaleClientDetails/${clientId}`
          );
          const data = await res.json();

          if (data.status && data.data) {
            const clientData = {
              name: data.data.name || "",
              email: data.data.email || "",
              phone: data.data.phone || "",
              insta_website: data.data.insta_website || "",
              company_name: data.data.assigned_company || "",
            };

            // Update formData
            setFormData((prev) => ({
              ...prev,
              ...clientData,
            }));

            const recordingRes = await fetch(
              `http://localhost:5000/api/bookings/checkCallrecording`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: clientData.email,
                  ref_id: clientId,
                }),
              }
            );

            const recordingData = await recordingRes.json();

            if (recordingData.status === false) {
              toast.error(
                "Previous call recording not uploaded for this client!"
              );
              setSubmitDisabled(true);
            } else {
              setSubmitDisabled(false);
            }
          } else {
            console.warn("Client not found or invalid response (Presales)");
            setFormData((prev) => ({
              ...prev,
              name: "",
              email: "",
              phone: "",
            }));
          }
        } catch (err) {
          console.error("Presales error", err);
        }
      }

      // Postsales
      if (formData.sale_type === "Postsales" && clientId.length > 3) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/bookings/getPostsaleClientDetails/${clientId}`
          );
          const data = await res.json();

          if (data.status && data.data) {
            setFormData((prev) => ({
              ...prev,
              name: data.data.name || "",
              email: data.data.email || "",
              phone: data.data.phone || "",
            }));

            setProjects(data.data.projects || []);
          } else {
            console.warn("Client not found or invalid response (Postsales)");
            setFormData((prev) => ({
              ...prev,
              name: "",
              email: "",
              phone: "",
            }));
            setProjects([]);
          }
        } catch (err) {
          console.error("Postsales error", err);
        }
      }
    };

    fetchClientDetails();
  }, [formData.client_id, formData.sale_type]);

  const checkConsultantConditions = (consultantId, consultantName) => {
    checkConsultantWebsiteCondition(consultantId, consultantName);
    checkConsultantTeamCondition(consultantId, consultantName);
    ("");

    //checkPresalesCall(consultantId, consultantName);
  };

  const checkConsultantWebsiteCondition = (consultantId, consultantName) => {
    try {
      fetch(
        `http://localhost:5000/api/bookings/checkConsultantWebsiteCondition`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            consultantid: consultantId,
            email: formData.email,
            insta_website: formData.insta_website,
          }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "success") {
            if (data.webStatus == "DIFFERENT") {
              setSubmitDisabled(true);
              toast.error(
                `Call already completed with ${consultantName} on ${data.bookingTime}`
              );
            } else {
              setSubmitDisabled(false);
            }
          } else {
            //toast.info("No previous call found.");
            console.log("No previous call found.");
          }
        })
        .catch((err) => {
          console.error("Error checking consultant website:", err);
          //  toast.error("Server error while checking consultant condition.");
        });
    } catch (err) {
      console.error("Unexpected error:", err);
      //toast.error("Unexpected error occurred.");
    }
  };

  const checkConsultantTeamCondition = (consultantId, consultantName) => {
    try {
      fetch(`http://localhost:5000/api/bookings/checkConsultantTeamCondition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          primaryconsultantid: consultantId,
          clientemail: formData.email,
          saletype: formData.sale_type,
          login_crm_id: loggedInUser.id, // send login CRM ID
        }),
      })
        .then((res) => res.text())
        .then((result) => {
          if (result === "call not completed") {
            setSubmitDisabled(false);
            // toast.info("No previous completed call.");
            console.log("No previous completed call.");
          } else if (result === "add call") {
            setSubmitDisabled(false);
            // toast.success("You can proceed with the call.");
          } else {
            const [displayMsg, displayConId, displayPrimaryConId] =
              result.split("||");

            if (displayPrimaryConId === displayConId) {
              setSubmitDisabled(true);
            } else {
              setSubmitDisabled(false);
            }

            if (displayMsg) {
              toast.error("You cannot add the call. " + displayMsg);
            }
          }
        })
        .catch((err) => {
          console.error("Error:", err);
          //toast.error("Something went wrong. Try again.");
        });
    } catch (err) {
      console.error("Unexpected error:", err);
      //toast.error("Unexpected error occurred.");
    }
  };

  const checkPresalesCall = (consultantId, consultantName) => {
    fetch("http://localhost:5000/api/bookings/checkPresalesCall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientemail: formData.email, // match backend
        saletype: formData.sale_type,
        primaryconsultantid: consultantId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          toast.error(
            `Previous call is still pending with ${consultantName} on ${data.booking_time}`,
            { autoClose: 5000 }
          );
          setSubmitDisabled(true);
        } else {
          setSubmitDisabled(false);
        }
      })
      .catch((err) => {
        console.error("Error checking presales call:", err);
        //  toast.error("Unexpected error occurred.");
      });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCallRelatedToChange = async (selectedOptionValue) => {
    const related_to = selectedOptionValue || "";

    // Reset fields
    setFormData((prev) => ({
      ...prev,
      call_related_to: related_to,
      subject_area: "",
      consultant_id: "",
    }));

    // If related_to is "subject_area_related", don't fetch consultants
    if (related_to === "subject_area_related") {
      setConsultants([]);
      return;
    }

    // Fetch consultants for other options
    const consultantsData = await fetchAllConsultants();
    let filteredConsultants = consultantsData.results || [];

    // If it's for price and discount, filter by allowed usernames
    if (related_to === "price_and_discount_related") {
      filteredConsultants = filteredConsultants.filter((c) =>
        priceDiscoutUsernames.includes(c.fld_username)
      );
    }

    // Set consultants to dropdown
    setConsultants(filteredConsultants);
  };

  const handleSubjectAreaChange = async (selectedOption) => {
    const subject_area = selectedOption?.value || "";

    setFormData((prev) => ({
      ...prev,
      subject_area,
      consultant_id: "",
    }));

    if (!subject_area) {
      setConsultants([]);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/helpers/getConsultantsBySubjectArea",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject_area }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setConsultants(data);
      } else {
        console.error("Error fetching consultants:", data.message);
        setConsultants([]);
      }
    } catch (err) {
      console.error("Network error:", err);
      setConsultants([]);
    }
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

  const consultantOptions = consultants.map((con) => ({
    value: con.id, // or con.id
    label: con.fld_name,
  }));

  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

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

        {formData.sale_type === "Presales" && (
          <>
            <input
              type="hidden"
              name="insta_website"
              value={formData.insta_website || ""}
            />
            <input
              type="hidden"
              name="company_name"
              value={formData.company_name || ""}
            />
          </>
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
                  projectid: selectedOption.value,
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
            onChange={(e) => {
              handleChange(e);
              handleCallRelatedToChange(e.target.value);
            }}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select Option</option>
            {formData.sale_type === "Presales" && (
              <>
                <option value="direct_call">Direct Call</option>
                <option value="subject_area_related">
                  Subject Area Related
                </option>
                <option value="price_and_discount_related">
                  Price And Discount Related
                </option>
              </>
            )}
            <option value="I_am_not_sure">I am not sure</option>
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
              onChange={(e) => {
                handleChange(e);
                handleSubjectAreaChange({ value: e.target.value });
              }}
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
        {formData.call_related_to !== "I_am_not_sure" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Consultant
            </label>
            <Select
              name="consultant_id"
              options={consultantOptions}
              value={
                consultantOptions.find(
                  (option) => option.value === formData.consultant_id
                ) || null
              }
              onChange={(selectedOption) => {
                const selectedValue = selectedOption
                  ? selectedOption.value
                  : "";
                const selectedLabel = selectedOption
                  ? selectedOption.label
                  : "";
                setSelectedConsultantName(selectedLabel);

                if (
                  selectedValue &&
                  selectedValue === formData.secondary_consultant_id
                ) {
                  toast.error(
                    "Primary and Secondary Consultant cannot be the same."
                  );
                  return;
                }

                handleChange({
                  target: {
                    name: "consultant_id",
                    value: selectedValue,
                  },
                });

                if (selectedValue) {
                  checkConsultantConditions(selectedValue, selectedLabel);

                  const selectedConsultant = consultants.find(
                    (c) => c.id === selectedValue
                  );

                  // Check if they have "Reassign" permission
                  if (
                    selectedConsultant &&
                    selectedConsultant.fld_permission &&
                    JSON.parse(selectedConsultant.fld_permission).includes(
                      "Reassign"
                    )
                  ) {
                    setShowReassignOptions(true);
                  } else {
                    setShowReassignOptions(false);
                  }
                } else {
                  setShowReassignOptions(false);
                }
              }}
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              placeholder="Select Consultant"
              required
            />
          </div>
        )}

        {formData.sale_type === "Postsales" &&
          formData.call_related_to !== "I_am_not_sure" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Consultant
              </label>
              <Select
                name="secondary_consultant_id"
                options={consultantOptions}
                value={
                  consultantOptions.find(
                    (option) =>
                      option.value === formData.secondary_consultant_id
                  ) || null
                }
                onChange={(selectedOption) => {
                  const selectedSecondaryValue = selectedOption
                    ? selectedOption.value
                    : "";

                  // Prevent duplicate consultant selection
                  if (
                    selectedSecondaryValue &&
                    selectedSecondaryValue === formData.consultant_id
                  ) {
                    toast.error(
                      "Primary and Secondary Consultant cannot be the same."
                    );
                    return;
                  }

                  handleChange({
                    target: {
                      name: "secondary_consultant_id",
                      value: selectedSecondaryValue,
                    },
                  });
                }}
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable
                placeholder="Select Secondary Consultant"
              />
            </div>
          )}

        {showReassignOptions && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Option
            </label>
            <select
              name="consultant_another_option"
              value={formData.consultant_another_option || ""}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Sub Option</option>
              <option value="CONSULTANT">
                Assign Call to {selectedConsultantName}
              </option>
              <option value="TEAM">Assign Call to Team Member</option>
            </select>
          </div>
        )}

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
          <select
            name="call_regarding"
            value={formData.call_regarding}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select</option>
            {Object.entries(callRegardingOptions[formData.sale_type] || {}).map(
              ([key, label]) => (
                <option key={key} value={label}>
                  {label}
                </option>
              )
            )}
          </select>
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
            id="submitBtn"
            type="button"
            onClick={handleSubmit}
            className={`bg-blue-600 text-white px-4 py-2 rounded transition ${
              submitDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
            disabled={submitDisabled}
          >
            Submit Booking
          </button>
        </div>
      </div>
    </motion.div>
  );
}
