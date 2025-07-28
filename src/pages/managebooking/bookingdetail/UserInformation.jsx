import React from "react";

const UserInformation = ({ data, user, bgColor,externalCallInfo}) => {
  const isConsultant = user.fld_admin_type === "CONSULTANT";

  const formatText = (text) =>
    text?.replace(/_/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
    <div className="p-6 rounded-lg mb-6 shadow " style={{ backgroundColor: bgColor }}>
      <h5 className="text-xl font-semibold mb-4 text-gray-800">User Information</h5>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client Code / Ref Id */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <i className="fa fa-user mr-1" aria-hidden="true"></i>
            {data.fld_sale_type === "Presales" ? "Instacrm Ref Id" : "Client Code"}
          </label>
          <p className="text-gray-900">{data.fld_client_id}</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <i className="fa fa-user mr-1" aria-hidden="true"></i> Name
          </label>
          <p className="text-gray-900">{data.user_name}</p>
        </div>

        {/* Email & Phone - only for non-consultants */}
        {!isConsultant && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fa fa-envelope-o mr-1" aria-hidden="true"></i> Email
              </label>
              <p className="text-gray-900">{data.user_email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fa fa-phone mr-1" aria-hidden="true"></i> Phone
              </label>
              <p className="text-gray-900">{data.user_phone}</p>
            </div>
          </>
        )}

        {/* Sale Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <i className="fa fa-key mr-1" aria-hidden="true"></i> Call Type
          </label>
          <p className="text-gray-900">{data.fld_sale_type}</p>
        </div>

        {/* Topic of Research */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <i className="fa fa-key mr-1" aria-hidden="true"></i> Topic of Research
          </label>
          <p className="text-gray-900">{data.fld_topic_of_research}</p>
        </div>

        {/* Call Regarding */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <i className="fa fa-key mr-1" aria-hidden="true"></i> Call Regarding
          </label>
          <p className="text-gray-900">{data.fld_call_regarding}</p>
        </div>

        {/* Call Joining Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <i className="fa fa-key mr-1" aria-hidden="true"></i> Call Joining Link
          </label>
          <p className="text-gray-900">
            {["NA", "na"].includes(data.fld_call_joining_link) ? (
              data.fld_call_joining_link
            ) : (
              <a href={data.fld_call_joining_link} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                {data.fld_call_joining_link}
              </a>
            )}
          </p>
        </div>

        {/* Duration */}
        {data.fld_durations && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <i className="fa fa-clock-o mr-1" aria-hidden="true"></i> Duration
            </label>
            <p className="text-gray-900">{data.fld_durations}</p>
          </div>
        )}

        {/* Call Type */}
        {data.fld_call_type && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <i className="fa fa-key mr-1" aria-hidden="true"></i> Call Type
            </label>
            <p className="text-gray-900">{data.fld_call_type}</p>
          </div>
        )}

        {/* Call Related To */}
        {data.fld_call_related_to && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <i className="fa fa-key mr-1" aria-hidden="true"></i> Call Related To
            </label>
            <p className="text-gray-900">{formatText(data.fld_call_related_to)}</p>
          </div>
        )}

        {/* Consultant Sub Option */}
        {data.fld_consultant_another_option && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <i className="fa fa-key mr-1" aria-hidden="true"></i> Consultant Sub Option
            </label>
            <p className="text-gray-900">
              {data.fld_consultant_another_option === "TEAM"
                ? "Assign Call to Team Member"
                : `Assign Call to ${data.admin_name}`}
            </p>
          </div>
        )}

        {/* Asana Link */}
        {data.fld_asana_link && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <i className="fa fa-link mr-1" aria-hidden="true"></i> Asana Link / Quote Id
            </label>
            <p className="text-gray-900">{data.fld_asana_link}</p>
          </div>
        )}

        {/* Subject Area */}
        {data.fld_subject_area && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <i className="fa fa-book mr-1" aria-hidden="true"></i> Subject Area
            </label>
            <p className="text-gray-900">{data.fld_subject_area}</p>
          </div>
        )}

        {/* RC Project Id */}
        {data.fld_rc_projectid && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <i className="fa fa-key mr-1" aria-hidden="true"></i> RC Project Id
            </label>
            <p className="text-gray-900">{data.fld_rc_projectid}</p>
          </div>
        )}

        {/* RC Milestone Name */}
        {data.fld_rc_milestone_name && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <i className="fa fa-flag mr-1" aria-hidden="true"></i> RC Milestone Name
            </label>
            <p className="text-gray-900">{data.fld_rc_milestone_name}</p>
          </div>
        )}
      </div>

      {/* Internal Comments */}
      {data.fld_internal_comments && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <i className="fa fa-comment mr-1" aria-hidden="true"></i> Internal Comments
          </label>
          <p className="text-gray-900">{data.fld_internal_comments}</p>
        </div>
      )}
    </div>
    {/* Booking Information */}
{/* Booking Information */}
{data.fld_booking_date && data.fld_booking_slot && (
  <div className="p-6 rounded-lg mb-6 shadow mt-8" style={{ backgroundColor: bgColor }}>
    <h5 className="text-xl font-semibold mb-4 text-gray-800">Booking Information</h5>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Booking Date & Slot */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <i className="fa fa-calendar mr-1" aria-hidden="true"></i> Booking Date & Time
        </label>
        <p className="text-gray-900">
          {new Date(`${data.fld_booking_date} ${data.fld_booking_slot}`).toLocaleString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
      </div>

      {/* No. of Hours for Call */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <i className="fa fa-clock-o mr-1" aria-hidden="true"></i> No. of Hours for Call
        </label>
        <p className="text-gray-900">{data.fld_no_of_hours_for_call}</p>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <i className="fa fa-clock-o mr-1" aria-hidden="true"></i> Timezone
        </label>
        <p className="text-gray-900">{data.fld_timezone}</p>
      </div>

      {/* Booking ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <i className="fa fa-list mr-1" aria-hidden="true"></i> Booking ID
        </label>
        <p className="text-gray-900">{data.fld_bookingcode}</p>
      </div>

      {/* Current Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <i className="fa fa-list mr-1" aria-hidden="true"></i> Current Status
        </label>
        <p className="text-gray-900">
          {data.fld_call_request_sts === "Accept"
            ? "Accepted"
            : data.fld_call_request_sts === "Reject"
            ? "Rejected"
            : data.fld_call_request_sts}
        </p>
      </div>

      {/* Client Status Details */}
      {data.fld_call_confirmation_status && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <i className="fa fa-key mr-1" aria-hidden="true"></i> Client Status Details
          </label>
          <p className="text-gray-900">{data.fld_call_confirmation_status}</p>
        </div>
      )}

      {/* Consultant Name */}
      {externalCallInfo?.fld_consultant_name && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <i className="fa fa-user mr-1" aria-hidden="true"></i> Consultant Name
          </label>
          <p className="text-gray-900">{externalCallInfo.fld_consultant_name}</p>
        </div>
      )}
    </div>
  </div>
)}

</>

    
  );
};

export default UserInformation;
