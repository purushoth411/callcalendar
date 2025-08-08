import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Select from "react-select";
import { fetchAllSubjectAreas } from "../../helpers/CommonApi";
import { useAuth } from "../../utils/idb";
import toast from "react-hot-toast";

const EditSubjectArea = ({
  selectedRow,
  setShowEditSubjectForm,
  fetchAllBookings,
}) => {
  const row = selectedRow;

  const [formData, setFormData] = useState({
    bookingid: row?.id || "",
    saletype: "Presales",
    call_related_to: "subject_area_related",
    subject_area: "",
    consultant_id: "",
  });
  const { user } = useAuth();

  const [subjectAreas, setSubjectAreas] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [updatingSubjectArea, setUpdatingSubjectArea] = useState(false);

  useEffect(() => {
    // Fetch subject areas
    const fetchSubjects = async () => {
      try {
        const data = await fetchAllSubjectAreas();
        setSubjectAreas(data.data || []);
      } catch (err) {
        console.error("Error fetching subject areas:", err);
      }
    };
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({
      ...f,
      [name]: value,
      ...(name === "subject_area" ? { consultant_id: "" } : {}),
    }));
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
        setConsultants(data || []);
      } else {
        console.error("Error fetching consultants:", data.message);
        setConsultants([]);
      }
    } catch (err) {
      console.error("Network error:", err);
      setConsultants([]);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      user,
    };
    if (!formData.bookingid) {
      toast.error("Booking ID is required.");
      return;
    }

    if (!formData.subject_area.trim()) {
      toast.error("Subject area is required.");
      return;
    }

    if (!formData.consultant_id) {
      toast.error("Consultant ID is required.");
      return;
    }
    try {
      setUpdatingSubjectArea(true);

      const response = await fetch(
        "http://localhost:5000/api/bookings/updateSubjectArea",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log("Response from server:", result);

      if (result.status === true) {
        toast.success("Subject Area Updated Successfully");
        setShowEditSubjectForm(false);
        fetchAllBookings();
      } else {
        // toast.error(result.msg || 'Failed to update subject area.');
      }
    } catch (error) {
      console.error("Error updating subject area:", error);
      toast.error("An error occurred while updating.");
    } finally {
      setUpdatingSubjectArea(false);
    }
  };

  const consultantOptions = consultants.map((c) => ({
    value: c.id,
    label: c.fld_name,
  }));

  return (
    <motion.div className="fixed inset-0 bg-black bg-opacity-75 z-50">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 w-full sm:w-[90%] md:w-[35%] lg:w-[25%] h-full bg-white shadow-lg z-50 overflow-y-auto p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold">Edit Subject Area</h4>
          <button
            onClick={() => setShowEditSubjectForm(false)}
            className="text-gray-500 hover:text-red-500 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Hidden Fields */}
        <input type="hidden" name="bookingid" value={formData.bookingid} />
        <input type="hidden" name="saletype" value={formData.saletype} />
        <input
          type="hidden"
          name="call_related_to"
          value={formData.call_related_to}
        />

        {/* Subject Area */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">Subject Area</label>
          <select
            name="subject_area"
            value={formData.subject_area}
            onChange={(e) => {
              handleChange(e);
              handleSubjectAreaChange({ value: e.target.value });
            }}
            className="w-full border px-3 py-2 rounded-md border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="">Select Subject Area</option>
            {subjectAreas.map((s) => (
              <option key={s.id} value={s.domain}>
                {s.domain}
              </option>
            ))}
          </select>
        </div>

        {/* Consultant */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">
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
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                consultant_id: selected?.value || "",
              }))
            }
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
            placeholder="Select Consultant"
          />
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            onClick={handleSubmit}
            disabled={updatingSubjectArea}
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatingSubjectArea ? "Updating..." : "Update"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditSubjectArea;
