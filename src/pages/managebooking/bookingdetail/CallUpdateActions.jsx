import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
const CallUpdateActions = ({
  bookingData,
  user,
  consultantList,
  onUpdateStatus,
  onReassignCall,
  onAssignExternal,
}) => {
  const [selectedAction, setSelectedAction] = useState("");
  const [consultationStatus, setConsultationStatus] = useState("");
  const [statusOptions, setStatusOptions] = useState([]);
  const [comment, setComment] = useState("");
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [externalConsultantName, setExternalConsultantName] = useState("");
  const [rescheduledOthersText, setRescheduledOthersText] = useState("");
  const [scaleQuestion1, setScaleQuestion1] = useState("");
  const [scaleQuestion2, setScaleQuestion2] = useState("");
  const [scaleQuestion3, setScaleQuestion3] = useState("");
  const [callSummary, setCallSummary] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const userType = user.fld_admin_type;
  const permissions = user.fld_permission;
   const [externalCount, setExternalCount] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [displayConsultantId, setDisplayConsultantId] = useState('');

  useEffect(() => {
    if (bookingData?.id) {
      fetchExternalCallCount(bookingData.id);
    }
  }, [bookingData?.id]);

  const fetchExternalCallCount = async (bookingId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/getExternalCallCount?bookingId=${bookingId}`
      );
      const data = await response.json();

      if (response.ok) {
        setExternalCount(data.totalExternalCalls); 
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  // Check if component should be visible
  const shouldShowComponent = () => {
    return (
      (userType === "CONSULTANT" ||
        userType === "SUBADMIN" ||
        userType === "SUPERADMIN") &&
      !["Completed", "Reject", "Cancelled"].includes(
        bookingData.fld_consultation_sts
      ) &&
      bookingData.fld_call_related_to !== "I_am_not_sure" &&
      bookingData.fld_call_external_assign !== "Yes"
    );
  };

  // Check if external assignment is allowed
  const canAssignExternal = () => {
    return (
      (bookingData.fld_consultation_sts !== "Accept" ||
        bookingData.fld_call_confirmation_status ===
          "Call Confirmed by Client") &&
      externalCount == 0
    );
  };

  // Generate status options based on current status and conditions
  const getStatusOptions = () => {
    const options = [];
    const currentStatus = bookingData.fld_consultation_sts || "";
    const isTeam = bookingData.fld_consultant_another_option === "TEAM";
    const callStatus = bookingData.fld_call_request_sts;
    const isConsultant = userType === "CONSULTANT";

    const bookingTime = new Date(
      `${bookingData.fld_booking_date} ${bookingData.fld_booking_slot}`
    );
    const currentTime = new Date();
    const isBeforeCallTime =
      currentTime < new Date(bookingTime.getTime() - 30 * 60000);
    const isAfterCallTime =
      currentTime > new Date(bookingTime.getTime() - 30 * 60000);

    let hidenext = false;
    let hideRescheduled = false;

    // PENDING | EMPTY | NULL | RESCHEDULED CASE
    if (
      currentStatus === "Pending" ||
      currentStatus === "" ||
      currentStatus === null ||
      currentStatus === "Rescheduled"
    ) {
      if (currentStatus !== "Pending") {
        options.push({ value: "Pending", label: "Pending" });
      }

      if (!isTeam && currentStatus !== "Accept") {
        options.push({ value: "Accept", label: "Accept" });
      }

      if (currentStatus !== "Rescheduled") {
        options.push({ value: "Rescheduled", label: "Reschedule" });
        hideRescheduled = true;
      }

      if (currentStatus !== "Reject") {
        options.push({ value: "Reject", label: "Reject" });
      }
    }

    // ACCEPT + BEFORE CALL TIME
    if (!isTeam && currentStatus === "Accept" && isBeforeCallTime) {
      if (currentStatus !== "Accept") {
        options.push({ value: "Accept", label: "Accept" });
      }
    }

    if (!isTeam) {
      options.push({
        value: "Client did not join",
        label: "Client did not join",
      });

      if (!hideRescheduled) {
        options.push({ value: "Rescheduled", label: "Rescheduled" });
      }

      options.push({ value: "Completed", label: "Completed" });
      hidenext = true;
    }

    // ACCEPT + AFTER CALL TIME
    if (currentStatus === "Accept" && isAfterCallTime) {
      if (currentStatus !== "Accept" && !isTeam) {
        options.push({ value: "Accept", label: "Accept" });
      }
    }

    if (!hidenext) {
      options.push({
        value: "Client did not join",
        label: "Client did not join",
      });
      options.push({ value: "Completed", label: "Completed" });
    }

    if (currentStatus === "Client did not join") {
      options.push({
        value: "Client did not join",
        label: "Client did not join",
      });
    }

    // REJECT CASE
    if (currentStatus === "Reject") {
      options.push({ value: "Reject", label: "Reject" });

      if (!isTeam) {
        options.push({ value: "Accept", label: "Accept" });
      }

      options.push({ value: "Rescheduled", label: "Rescheduled" });
    }

    // CANCELLED
    if (callStatus !== "Cancelled" && !isConsultant) {
      options.push({ value: "Cancelled", label: "Cancelled" });
    }

    return options;
  };

  const handleActionChange = (action) => {
    setSelectedAction(action);

    setConsultationStatus("");
    setStatusOptions([]);
    setComment("");
    setSelectedConsultant("");
    setExternalConsultantName("");
  };

  const handleStatusChange = (status) => {
    setConsultationStatus(status);
    setStatusOptions([]); // Reset options when status changes
  };

  const handleStatusOptionChange = (option, checked, isRadio = false) => {
    if (isRadio) {
      setStatusOptions([option]);
    } else {
      if (checked) {
        setStatusOptions([...statusOptions, option]);
      } else {
        setStatusOptions(statusOptions.filter((opt) => opt !== option));
      }
    }
  };

  const handleUpdateStatus = () => {
    const formData = {
      bookingId: bookingData.id,
      consultationStatus,
      statusOptions,
      comment,
      scaleQuestion1,
      scaleQuestion2,
      scaleQuestion3,
      callSummary,
      file: uploadedFile,
      rescheduledOthers: rescheduledOthersText,
    };
    onUpdateStatus(formData);
  };

  const handleReassignCall = () => {
    const formData = {
      bookingId: bookingData.id,
      consultantId: selectedConsultant,
      bookingSlot: bookingData.fld_booking_slot,
      bookingDate: bookingData.fld_booking_date,
    };
    onReassignCall(formData);
  };

  const handleAssignExternal = () => {
    const formData = {
      bookingId: bookingData.id,
      consultantName: externalConsultantName,
    };
    onAssignExternal(formData);
  };

  if (!shouldShowComponent()) {
    return null;
  }

  const consultantOptions = consultantList
  .filter((consultant) => consultant.id !== bookingData.fld_consultantid)
  .map((consultant) => ({
    value: consultant.id,
    label: consultant.fld_name,
  }));

const checkCompletedCallsForSelectedConsultant = async (consultantId) => {
    if (!bookingData.fld_email || !consultantId || bookingData.fld_sale_type !== 'Presales') return;

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/checkCompletedCall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          primaryconsultantid: consultantId,
          clientemail: bookingData.fld_email ,
          saletype: bookingData.fld_sale_type,
        }),
      });

      const resultText = await response.text();

      if (resultText === 'call not completed' || resultText === 'add call') {
        setIsButtonDisabled(false);
       // toast.success('Call not completed. You can proceed.');
        return;
      }

      // Else: call already completed
      const [displayMsg, displayConId, displayPrimConId] = resultText.split('||');
      setDisplayConsultantId(displayConId);

      if (displayPrimConId === displayConId) {
        setIsButtonDisabled(true);
      } else {
        setIsButtonDisabled(false);
      }

      if (displayMsg) {
        toast.error(displayMsg);
        //toast.error('You cannot reassign the call. Call already completed!');
      }else{
        toast.error('You cannot reassign the call. Call already completed!');
      }

    } catch (err) {
      console.error(err);
      //toast.error('Error checking consultant call status.');
    }
  };

  return (
    <div className="col-sm-6">
      <div id="msgloader" style={{ textAlign: "center" }}></div>

      <div className="form-group row form-detls">
        <div className="col-sm-12">
          <h5>
            <strong>Call Booking Action</strong>
          </h5>
        </div>

        <div className="col-sm-12 booking-actn">
          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="call_booking_action"
                value="Update Call Status"
                checked={selectedAction === "Update Call Status"}
                onChange={(e) => handleActionChange(e.target.value)}
                className="mr-2"
              />
              Update Call Status
            </label>

            {permissions && permissions.includes("Reassign") && (
              <label className="flex items-center">
                <input
                  type="radio"
                  name="call_booking_action"
                  value="Reassign Call"
                  checked={selectedAction === "Reassign Call"}
                  onChange={(e) => handleActionChange(e.target.value)}
                  className="mr-2"
                />
                Reassign Call
              </label>
            )}

            {canAssignExternal() && (
              <label className="flex items-center">
                <input
                  type="radio"
                  name="call_booking_action"
                  value="Assign External"
                  checked={selectedAction === "Assign External"}
                  onChange={(e) => handleActionChange(e.target.value)}
                  className="mr-2"
                />
                Assign External
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Update Call Status Form */}
      {selectedAction === "Update Call Status" && (
        <div className="form-group row form-detls">
          <div className="col-sm-12">
            <label className="block mb-2 font-medium">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={consultationStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="form-control w-1/2"
              required
            >
              <option value="">Select Option</option>
              {getStatusOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Accept Status Options */}
          {consultationStatus === "Accept" && (
            <div className="col-sm-12 mt-4">
              <label className="block mb-2 font-medium">
                Select Options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="I have gone through all the details"
                    onChange={(e) =>
                      handleStatusOptionChange(e.target.value, e.target.checked)
                    }
                    className="mr-2"
                  />
                  I have gone through all the details
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="I have received the meeting link"
                    onChange={(e) =>
                      handleStatusOptionChange(e.target.value, e.target.checked)
                    }
                    className="mr-2"
                  />
                  I have received the meeting link
                </label>
              </div>
            </div>
          )}

          {/* Client Did Not Join Comments */}
          {consultationStatus === "Client did not join" && (
            <div className="col-sm-12 mt-4">
              <label className="block mb-2 font-medium">
                Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="form-control w-full"
                required
              />
            </div>
          )}

          {/* Reject Status Options */}
          {consultationStatus === "Reject" && (
            <div className="col-sm-12 mt-4">
              <label className="block mb-2 font-medium">
                Select Relevant Options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  "Details are incomplete",
                  "Meeting link is invalid",
                  "Call not related to my subject area",
                  "Call scheduled by mistake",
                ].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      onChange={(e) =>
                        handleStatusOptionChange(
                          e.target.value,
                          e.target.checked
                        )
                      }
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Rescheduled Status Options */}
          {consultationStatus === "Rescheduled" && (
            <div className="col-sm-12 mt-4">
              <label className="block mb-2 font-medium">
                Select Options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  "I have another meeting scheduled offline",
                  "I have urgent work delivery",
                  "I have internal team call",
                  "Others",
                ].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="rescheduled_options"
                      value={option}
                      onChange={(e) =>
                        handleStatusOptionChange(e.target.value, true, true)
                      }
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>

              {statusOptions.includes("Others") && (
                <div className="mt-4">
                  <label className="block mb-2 font-medium">
                    Others <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rescheduledOthersText}
                    onChange={(e) => setRescheduledOthersText(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Completed Status - Rating Questions */}
          {consultationStatus === "Completed" && userType !== "CONSULTANT" && (
            <div className="col-sm-12 mt-4 space-y-6">
              <div>
                <label className="block mb-2 font-medium">
                  On Scale of 1, 2 and 3 (1 being Poor, 2 being Average and 3
                  being Good), Please answer the following questions.
                </label>

                <div className="mt-4">
                  <div className="mb-2">
                    Question 1 <span className="text-red-500">*</span>: Was the
                    CRM able to Bridge the call effectively?
                  </div>
                  <div className="flex gap-4">
                    {["Being Poor", "Being Average", "Being Good"].map(
                      (option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="scalequestion1"
                            value={option}
                            checked={scaleQuestion1 === option}
                            onChange={(e) => setScaleQuestion1(e.target.value)}
                            className="mr-2"
                          />
                          {option}
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2">
                    Question 2 <span className="text-red-500">*</span>: Was the
                    CRM's voice loud and clear?
                  </div>
                  <div className="flex gap-4">
                    {["Being Poor", "Being Average", "Being Good"].map(
                      (option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="scalequestion2"
                            value={option}
                            checked={scaleQuestion2 === option}
                            onChange={(e) => setScaleQuestion2(e.target.value)}
                            className="mr-2"
                          />
                          {option}
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2">
                    Question 3 <span className="text-red-500">*</span>: Was the
                    client informed about the call being recorded?
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="scalequestion3"
                        value="scale8"
                        checked={scaleQuestion3 === "scale8"}
                        onChange={(e) => setScaleQuestion3(e.target.value)}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="scalequestion3"
                        value="scale9"
                        checked={scaleQuestion3 === "scale9"}
                        onChange={(e) => setScaleQuestion3(e.target.value)}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Call Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={callSummary}
                  onChange={(e) => setCallSummary(e.target.value)}
                  className="form-control w-full"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Upload File</label>
                <input
                  type="file"
                  onChange={(e) => setUploadedFile(e.target.files[0])}
                  className="form-control"
                />
              </div>
            </div>
          )}

          <div className="col-sm-12 mt-4">
            <button
              type="button"
              onClick={handleUpdateStatus}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <i className="fa fa-arrow-right mr-2" aria-hidden="true"></i>{" "}
              Update
            </button>
          </div>
        </div>
      )}

      {/* Reassign Call Form */}
      {selectedAction === "Reassign Call" && (
        <div className="form-group row form-detls">
          <div className="col-sm-9">


  <Select
        value={consultantOptions.find(option => option.value === selectedConsultant) || null}
        onChange={(selectedOption) => {
          const consultantId = selectedOption?.value || '';
          setSelectedConsultant(consultantId);
          checkCompletedCallsForSelectedConsultant(consultantId);
        }}
        options={consultantOptions}
        placeholder="Select Consultant"
        classNamePrefix="react-select"
        isClearable
        required
      />

      

      {/* Hidden to store result consultant id if needed */}
      <input type="hidden" id="call_completed_consultant_id" value={displayConsultantId} />
          </div>

          <div className="col-sm-3">
            <button
              type="button"
              onClick={handleReassignCall}
               disabled={isButtonDisabled}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <i className="fa fa-arrow-right mr-2" aria-hidden="true"></i>{" "}
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Assign External Form */}
      {selectedAction === "Assign External" && (
        <div className="form-group row form-detls">
          <div className="col-sm-9">
            <input
              type="text"
              value={externalConsultantName}
              onChange={(e) => setExternalConsultantName(e.target.value)}
              placeholder="Consultant Name"
              className="form-control"
              required
            />
          </div>

          <div className="col-sm-3">
            <button
              type="button"
              onClick={handleAssignExternal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <i className="fa fa-arrow-right mr-2" aria-hidden="true"></i>{" "}
              Submit
            </button>
          </div>
        </div>
      )}

      <div id="call_completed_msg"></div>
      <div id="call_completed_error_msg"></div>
    </div>
  );
};

export default CallUpdateActions;
