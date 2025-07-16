import React, { useState, useEffect } from "react";

export default function AddBooking({ user, fetchAllBookings }) {
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

  const [consultants, setConsultants] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [subjectAreas, setSubjectAreas] = useState([]);

  useEffect(() => {
    // fetch consultant list
    fetch("/api/admins/list?type=BOTH")
      .then((res) => res.json())
      .then((data) => setConsultants(data));

    // fetch subject areas
    fetch("/api/subjectareas")
      .then((res) => res.json())
      .then((data) => setSubjectAreas(data));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/bookings/addBooking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (result.status) {
      alert("Booking added successfully!");
      fetchAllBookings(); // refresh table
    } else {
      alert("Failed to add booking.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Select Call Type</label>
          <select name="sale_type" value={formData.sale_type} onChange={handleChange} className="form-control" required>
            <option value="">Select Call Type</option>
            <option value="Presales">Presales</option>
            <option value="Postsales">Postsales</option>
          </select>
        </div>

        <div>
          <label>Client Code</label>
          <input type="text" name="client_id" value={formData.client_id} onChange={handleChange} className="form-control" required />
        </div>

        <div>
          <label>Primary Consultant</label>
          <select name="consultant_id" value={formData.consultant_id} onChange={handleChange} className="form-control" required>
            <option value="">Select Consultant</option>
            {consultants.map((con) => (
              <option key={con.id} value={con.id}>
                {con.fld_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Call Related To</label>
          <select name="call_related_to" value={formData.call_related_to} onChange={handleChange} className="form-control" required>
            <option value="">Select Option</option>
            <option value="direct_call">Direct Call</option>
            <option value="subject_area_related">Subject Area Related</option>
            <option value="price_and_discount_related">Price And Discount Related</option>
          </select>
        </div>

        {formData.call_related_to === "subject_area_related" && (
          <div>
            <label>Subject Area</label>
            <select name="subject_area" value={formData.subject_area} onChange={handleChange} className="form-control">
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
          <label>Client Name</label>
          <input type="text" name="name" value={formData.name} className="form-control" readOnly />
        </div>

        <div>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} className="form-control" readOnly />
        </div>

        <div>
          <label>Phone</label>
          <input type="text" name="phone" value={formData.phone} className="form-control" readOnly />
        </div>

        <div>
          <label>Topic of Research</label>
          <textarea name="topic_of_research" value={formData.topic_of_research} onChange={handleChange} className="form-control" required />
        </div>

        <div>
          <label>Call Regarding</label>
          <input type="text" name="call_regarding" value={formData.call_regarding} onChange={handleChange} className="form-control" required />
        </div>

        <div>
          <label>Asana URL / Quote ID</label>
          <input type="text" name="asana_link" value={formData.asana_link} onChange={handleChange} className="form-control" required />
        </div>

        <div className="col-span-2">
          <label>
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
              className="form-control mt-2"
              placeholder="Enter comments"
            />
          )}
        </div>

        <div className="col-span-2 text-right">
          <button type="submit" className="btn btn-primary">
            Submit Booking
          </button>
        </div>
      </div>
    </form>
  );
}
