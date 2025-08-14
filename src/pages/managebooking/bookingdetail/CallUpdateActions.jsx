import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import {
  ArrowRight,
  Settings,
  UserCheck,
  ExternalLink,
  FileText,
  Upload,
  Star,
} from "lucide-react";

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
  const [scaleQuestion1, setScaleQuestion1] = useState("Being Poor");
  const [scaleQuestion2, setScaleQuestion2] = useState("Being Poor");
  const [scaleQuestion3, setScaleQuestion3] = useState("scale8");
  const [callSummary, setCallSummary] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const userType = user.fld_admin_type;
  console.log(userType);
  const permissions = user.fld_permission;
  const [externalCount, setExternalCount] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [displayConsultantId, setDisplayConsultantId] = useState("");

  useEffect(() => {
    if (bookingData?.id) {
      fetchExternalCallCount(bookingData.id);
    }
  }, [bookingData?.id]);

  // Check if component should be visible
  const shouldShowComponent = () => {
    return (
      (userType === "CONSULTANT" || userType === "SUBADMIN") &&
      !["Completed", "Reject", "Cancelled"].includes(
        bookingData.fld_consultation_sts
      ) &&
      bookingData.fld_call_related_to !== "I_am_not_sure" &&
      bookingData.fld_call_external_assign !== "Yes"
    );
  };

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
    console.log(status);
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
    if (
      !bookingData.fld_email ||
      !consultantId ||
      bookingData.fld_sale_type !== "Presales"
    )
      return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/checkCompletedCall`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            primaryconsultantid: consultantId,
            clientemail: bookingData.fld_email,
            saletype: bookingData.fld_sale_type,
          }),
        }
      );

      const resultText = await response.text();

      if (resultText === "call not completed" || resultText === "add call") {
        setIsButtonDisabled(false);
        // toast.success('Call not completed. You can proceed.');
        return;
      }

      // Else: call already completed
      const [displayMsg, displayConId, displayPrimConId] =
        resultText.split("||");
      setDisplayConsultantId(displayConId);

      if (displayPrimConId === displayConId) {
        setIsButtonDisabled(true);
      } else {
        setIsButtonDisabled(false);
      }

      if (displayMsg) {
        toast.error(displayMsg);
        //toast.error('You cannot reassign the call. Call already completed!');
      } else {
        toast.error("You cannot reassign the call. Call already completed!");
      }
    } catch (err) {
      console.error(err);
      //toast.error('Error checking consultant call status.');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-4 min-w-[60%]">
      <div id="msgloader" className="text-center"></div>

      <div className="">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-300 pb-3 mb-3">
          <Settings size={16} className="mr-2" />
          Call Booking Action
        </h2>

        <div className="flex w-full gap-2">
          {[
            {
              label: "Update Call Status",
              value: "Update Call Status",
              icon: <UserCheck className="mr-1 mt-0.5" size={13} />,
            },
            {
              label: "Reassign Call",
              value: "Reassign Call",
              icon: <UserCheck className="mr-1 mt-0.5" size={13} />,
            },
            {
              label: "Assign External",
              value: "Assign External",
              icon: <ExternalLink className="mr-1 mt-0.5" size={13} />,
            },
          ].map((tab) => (
            <label
              key={tab.value}
              className={`flex items-start px-3 py-1 rounded-md border transition-all cursor-pointer
        ${
          selectedAction === tab.value
            ? "bg-orange-50 border-orange-500 text-orange-700"
            : "bg-white border-orange-200 hover:bg-orange-50 text-gray-700 hover:text-orange-700"
        }`}
            >
              <input
                type="radio"
                name="call_booking_action"
                value={tab.value}
                checked={selectedAction === tab.value}
                onChange={(e) => handleActionChange(e.target.value)}
                className="hidden"
              />
              {tab.icon}
              <span className="text-[12px] font-medium">{tab.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Update Call Status Form */}
      {selectedAction === "Update Call Status" && (
        <div className="space-y-6 mt-4 bg-orange-50 border-orange-400 border p-3 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={consultationStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full bg-white px-3 py-2 border border-gray-300 text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-2 mb-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    value="I have gone through all the details"
                    onChange={(e) =>
                      handleStatusOptionChange(e.target.value, e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I have gone through all the details
                  </span>
                </label>
                <label className="flex items-center p-2 mb-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    value="I have received the meeting link"
                    onChange={(e) =>
                      handleStatusOptionChange(e.target.value, e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I have received the meeting link
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Client Did Not Join Comments */}
          {consultationStatus === "Client did not join" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Enter your comments..."
                required
              />
            </div>
          )}

          {/* Reject Status Options */}
          {consultationStatus === "Reject" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Relevant Options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {[
                  "Details are incomplete",
                  "Meeting link is invalid",
                  "Call not related to my subject area",
                  "Call scheduled by mistake",
                ].map((option) => (
                  <label
                    key={option}
                    className="flex items-center p-2 mb-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={option}
                      onChange={(e) =>
                        handleStatusOptionChange(
                          e.target.value,
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Rescheduled Status Options */}
          {consultationStatus === "Rescheduled" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Options <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {[
                  "I have another meeting scheduled offline",
                  "I have urgent work delivery",
                  "I have internal team call",
                  "Others",
                ].map((option) => (
                  <label
                    key={option}
                    className="flex items-center p-2 mb-4 border border-gray-200 rounded bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="rescheduled_options"
                      value={option}
                      onChange={(e) =>
                        handleStatusOptionChange(e.target.value, true, true)
                      }
                      className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-[12px] text-gray-700">{option}</span>
                  </label>
                ))}
              </div>

              {statusOptions.includes("Others") && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Others <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rescheduledOthersText}
                    onChange={(e) => setRescheduledOthersText(e.target.value)}
                    className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please specify..."
                    required
                  />
                </div>
              )}
            </div>
          )}

          {/* Completed Status - Rating Questions */}
          {consultationStatus === "Completed" && userType !== "CONSULTANT" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  On Scale of 1, 2 and 3 (1 being Poor, 2 being Average and 3
                  being Good), Please answer the following questions.
                </label>

                <div className="space-y-6">
                  {/* Question 1 with Scale UI */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-4 text-sm font-medium text-gray-700">
                      Question 1 <span className="text-red-500">*</span>: Was
                      the CRM able to Bridge the call effectively?
                    </div>

                    {/* Scale Rating UI */}
                    <div className="flex items-center justify-between mb-2 pt-3 the_rbac">
                      {[
                        {
                          value: "Being Poor",
                          label: "Poor",
                          number: 1,
                          color: "bg-blue-500",
                          hoverColor: "hover:bg-blue-400",
                        },
                        {
                          value: "Being Average",
                          label: "Average",
                          number: 2,
                          color: "bg-blue-500",
                          hoverColor: "hover:bg-blue-400",
                        },
                        {
                          value: "Being Good",
                          label: "Good",
                          number: 3,
                          color: "bg-blue-500",
                          hoverColor: "hover:bg-blue-400",
                        },
                      ].map((option, index) => (
                        <div
                          key={option.value}
                          className="flex flex-col items-center flex-1"
                        >
                          <button
                            type="button"
                            onClick={() => setScaleQuestion1(option.value)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center  text-white font-bold text-lg transition-all duration-200 transform hover:scale-110 ${
                              scaleQuestion1 === option.value
                                ? `${option.color} ring-4 ring-offset-2 ring-blue-200`
                                : `bg-gray-300 ${option.hoverColor}`
                            }`}
                          >
                            {option.number}
                          </button>
                          <span
                            className={`mt-3 text-sm font-medium transition-colors ${
                              scaleQuestion1 === option.value
                                ? "text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {option.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative the_rever">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            scaleQuestion1 === "Being Poor"
                              ? "w-1/3 bg-blue-500"
                              : scaleQuestion1 === "Being Average"
                              ? "w-2/3 bg-blue-500"
                              : scaleQuestion1 === "Being Good"
                              ? "w-full bg-blue-500"
                              : "w-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question 2 with Scale UI */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-4 text-sm font-medium text-gray-700">
                      Question 2 <span className="text-red-500">*</span>: Was
                      the CRM's voice loud and clear?
                    </div>

                    {/* Scale Rating UI */}
                    <div className="flex items-center justify-between mb-2 pt-3  the_rbac">
                      {[
                        {
                          value: "Being Poor",
                          label: "Poor",
                          number: 1,
                          color: "bg-blue-500",
                          hoverColor: "hover:bg-blue-400",
                        },
                        {
                          value: "Being Average",
                          label: "Average",
                          number: 2,
                          color: "bg-blue-500",
                          hoverColor: "hover:bg-blue-400",
                        },
                        {
                          value: "Being Good",
                          label: "Good",
                          number: 3,
                          color: "bg-blue-500",
                          hoverColor: "hover:bg-blue-400",
                        },
                      ].map((option, index) => (
                        <div
                          key={option.value}
                          className="flex flex-col items-center flex-1"
                        >
                          <button
                            type="button"
                            onClick={() => setScaleQuestion2(option.value)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-200 transform hover:scale-110 ${
                              scaleQuestion2 === option.value
                                ? `${option.color} ring-4 ring-offset-2 ring-blue-200`
                                : `bg-gray-300 ${option.hoverColor}`
                            }`}
                          >
                            {option.number}
                          </button>
                          <span
                            className={`mt-3 text-sm font-medium transition-colors ${
                              scaleQuestion2 === option.value
                                ? "text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {option.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative the_rever">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            scaleQuestion2 === "Being Poor"
                              ? "w-1/3 bg-blue-500"
                              : scaleQuestion2 === "Being Average"
                              ? "w-2/3 bg-blue-500"
                              : scaleQuestion2 === "Being Good"
                              ? "w-full bg-blue-500"
                              : "w-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Question 3 with Toggle UI */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-4 text-sm font-medium text-gray-700">
                      Question 3 <span className="text-red-500">*</span>: Was
                      the client informed about the call being recorded?
                    </div>

                    <div className="flex items-center space-x-4">
                      <span
                        className={`text-sm font-medium transition-colors ${
                          scaleQuestion3 !== "scale8"
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        No
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setScaleQuestion3(
                            scaleQuestion3 === "scale8" ? "scale9" : "scale8"
                          )
                        }
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          scaleQuestion3 === "scale8"
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            scaleQuestion3 === "scale8"
                              ? "translate-x-9"
                              : "translate-x-1"
                          }`}
                        />
                      </button>

                      <span
                        className={`text-sm font-medium transition-colors ${
                          scaleQuestion3 === "scale8"
                            ? "text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        Yes
                      </span>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center space-x-2 mt-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          scaleQuestion3 === "scale8"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <span className="text-sm text-gray-600">
                        Client was {scaleQuestion3 === "scale8" ? "" : "not "}
                        informed about call recording
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={callSummary}
                  onChange={(e) => setCallSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Enter call summary..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Upload File
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadedFile(e.target.files[0])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-0">
            <button
              type="button"
              onClick={handleUpdateStatus}
              className="inline-flex items-center px-2 py-1 bg-[#ff6800] text-white text-[12px] font-medium rounded-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              <ArrowRight className="mr-1" size={12} />
              Update
            </button>
          </div>
        </div>
      )}

      {/* Reassign Call Form */}
      {selectedAction === "Reassign Call" && (
        <div className="space-y-6 mt-4 bg-orange-50 border-orange-400 border p-3 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Consultant <span className="text-red-500">*</span>
            </label>
            <div className=" gap-4">
              <div className="flex-1">
                <Select
                  value={
                    consultantOptions.find(
                      (option) => option.value === selectedConsultant
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    const consultantId = selectedOption?.value || "";
                    setSelectedConsultant(consultantId);
                    checkCompletedCallsForSelectedConsultant(consultantId);
                  }}
                  options={consultantOptions}
                  placeholder="Select Consultant"
                  classNamePrefix="react-select the_hei"
                  isClearable
                  required
                />
                <input
                  type="hidden"
                  id="call_completed_consultant_id"
                  value={displayConsultantId}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleReassignCall}
                  disabled={isButtonDisabled}
                  className="inline-flex items-center px-2 py-1 mt-4 bg-[#ff6800] text-white text-[12px] font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="mr-2" size={12} />
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign External Form */}
      {selectedAction === "Assign External" && (
        <div className="space-y-6 mt-4 bg-orange-50 border-orange-400 border p-3 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consultant Name <span className="text-red-500">*</span>
            </label>
            <div className="">
              <input
                type="text"
                value={externalConsultantName}
                onChange={(e) => setExternalConsultantName(e.target.value)}
                placeholder="Enter consultant name"
                className="w-full bg-white flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAssignExternal}
                  className="inline-flex items-center px-2 py-1 mt-4 bg-[#ff6800] text-white text-[12px] font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <ArrowRight className="mr-2" size={12} />
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div id="call_completed_msg"></div>
      <div id="call_completed_error_msg"></div>
    </div>
  );
};

export default CallUpdateActions;
