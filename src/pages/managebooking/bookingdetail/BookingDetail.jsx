import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowDown,
  Eye,
  ArrowRight,
  User,
  Mail,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../utils/idb";
import toast from "react-hot-toast";
import ViewCommentModal from "./ViewCommentModal";
import SetAsConvertedModal from "./SetAsConvertedModal";
import ChatBox from "./ChatBox";
import ReassignModal from "./ReassignModal";
import UserInformation from "./UserInformation";
import { AnimatePresence, motion } from "framer-motion";
import ConsultantInformation from "./ConsultantInformation";
import { fetchAllConsultants } from "../../../helpers/CommonApi";
import Select from "react-select";
import CallUpdateActions from "./CallUpdateActions";
import OverallHistory from "./OverallHistory";
import OtherCalls from "./OtherCalls";

const BookingDetail = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [bookingData, setBookingData] = useState([]);
  const { user,priceDiscoutUsernames } = useAuth();

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [statusByCrm, setStatusByCrm] = useState("");

  const [reassignComment, setReassignComment] = useState("");
  const [showReassignForm, setShowReassignForm] = useState(false);
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [messageData, setMessageData] = useState([]);
  const [isMsgSending, setIsMsgSending] = useState(false);
  const [otherBookings, setOtherBookings] = useState([]);
  const [isReassigning, setIsReassigning] = useState(false);
  const [externalCallInfo, setExternalCallInfo] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("Processing...");
  const [primaryConsultantId, setPrimaryConsultantId] = useState("");
  const [cancelComment, setCancelComment] = useState("");
  const [consultantList, setConsultantList] = useState([]);

  useEffect(() => {
    fetchBookingById(bookingId);
  }, [bookingId]);

  const fetchBookingById = async (bookingId) => {
    let tempBooking = null;
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/fetchBookingById`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId }),
        }
      );

      const result = await response.json();

      if (result.status) {
        console.log("Booking Data:", result.data);
        setBookingData(result.data);
        tempBooking = result.data;
      } else {
        console.warn("Booking not found or error:", result.message);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      fetchMsgData(bookingId);
      getOtherBookings();
      getExternalCallByBookingId(bookingId);
     if(tempBooking && tempBooking.fld_subject_area && tempBooking.fld_call_related_to){

       fetchConsultants(tempBooking.fld_subject_area, tempBooking.fld_call_related_to);
     }else{

       fetchConsultants(null, null);
     }
      
      
    }
  };

  const fetchConsultants = async (subject_area, call_related_to) => {
  try {
    let filteredConsultants = [];
    if (call_related_to === "subject_area_related") {
     
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
       
        setConsultantList(data);
      }

    } else if (call_related_to === "price_and_discount_related") {
      
      const consultantsData = await fetchAllConsultants();
      filteredConsultants = consultantsData.results || [];

     

      filteredConsultants = filteredConsultants.filter((c) =>
        priceDiscoutUsernames.includes(c.fld_username)
      );

     
      setConsultantList(filteredConsultants);

    } else {
     
      const consultantsData = await fetchAllConsultants();
     
      setConsultantList(consultantsData.results || []);
    }

  } catch (error) {
    console.error("Error fetching consultants:", error);
  }
};

  const fetchMsgData = async (bookingId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/helpers/getMessageData?bookingId=${bookingId}`
      );
      const data = await response.json();
      if (data.status) {
        setMessageData(data.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const getExternalCallByBookingId = async (bookingId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/getExternalCallByBookingId?bookingId=${bookingId}`
      );
      const data = await response.json();
      if (data.status) {
        setExternalCallInfo(data.data);
      } else {
        console.error("Error fetching external call info");
      }
    } catch (err) {
      console.error("Error fetching external call info:", err);
    }
  };

  // Get background color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Accept":
        return "#c2f5da";
      case "Reject":
        return "#f5d0cd";
      case "Client did not join":
        return "#cdd2f5";
      case "Rescheduled":
        return "#f5f5cd";
      case "Completed":
        return "#d2cdf5";
      default:
        return "#f8f8f8";
    }
  };

  const handleDeleteCallRequest = async () => {
    if (!window.confirm("Are you sure you want to delete this call request?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/bookings/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const result = await response.json();

      if (result.status) {
        toast.success("Call request deleted successfully");

        // Delay navigation by 2 seconds (2000 ms)
        setTimeout(() => {
          navigate("/bookings");
        }, 2000);
      } else {
        toast.error("Failed to delete call request");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Server error during deletion");
    }
  };

  const handleSetAsConverted = async (rcCode, projectId) => {
    if (!rcCode || !projectId) {
      toast.error("Please enter RC Code and Project ID");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/setAsConverted`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            rcCode,
            projectId,
            user,
          }),
        }
      );

      if (!response.ok) {
        // HTTP error (500, 404 etc.)
        throw new Error("Server error");
      }

      const result = await response.json();

      if (result.status) {
        toast.success("Marked as converted successfully");
        setBookingData((prev) => ({ ...prev, fld_converted_sts: "Yes" }));
        setShowConvertForm(false);
        canSetAsConverted = false;
      } else {
        toast.error(result.message || "Failed to mark as converted");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      // toast.error("Failed to mark as converted");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendMessage = async (message) => {
    if (!message || message.trim() === "") {
      toast.error("Enter a message before sending");
      return;
    }
    try {
      setIsMsgSending(true);
      const response = await fetch(
        "http://localhost:5000/api/helpers/sendMessage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender_id: user.id,
            comment: message,
            admin_type: user.fld_admin_type,
            bookingid: bookingId,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Message Sent");
        fetchMsgData(bookingId);
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsMsgSending(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusByCrm) {
      toast.error("Please select a status");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        "http://localhost:5000/api/bookings/updateStatusByCrm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingid: bookingId,
            statusByCrm: statusByCrm,
          }),
        }
      );

      const data = await response.json();
      if (data.status) {
        toast.success("Status updated successfully");

        setBookingData((prev) => ({
          ...prev,
          statusByCrm: statusByCrm,
        }));
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOtherBookings = async () => {
   // console.log("Booking Data:" + JSON.stringify(bookingData, null, 2));
    try {
      const queryParams = new URLSearchParams({
        consultantId: bookingData.fld_consultantid,
        bookingDate: bookingData.fld_booking_date,
        bookingSlot: bookingData.fld_booking_slot,
      });

      const response = await fetch(
        `http://localhost:5000/api/bookings/getBookingData?bookingId=${bookingId}`
      );

      const result = await response.json();

      if (result.status) {
        setOtherBookings(result.data);
        console.log("OtherBooking:" + JSON.stringify(otherBookings, null, 2));
      } else {
        console.error("Failed to fetch other bookings");
      }
    } catch (err) {
      console.error("Error fetching other bookings:", err);
    }
  };

  // Handle mark as confirmed
  const handleMarkAsConfirmed = async () => {
    if (
      !window.confirm(
        "Are you sure you want to mark this as confirmed by the client?"
      )
    )
      return;

    setIsProcessing(true);
    setLoaderMessage("Marking as confirming...");

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/markAsConfirmByClient`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId }),
        }
      );

      const result = await response.json();

      if (result.status) {
        toast.success("Marked as confirmed by client");

        if (result.reschedulePending) {
          setLoaderMessage("Rescheduling other calls...");

          const res2 = await fetch(
            `http://localhost:5000/api/bookings/rescheduleOtherBookings`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bookingId }),
            }
          );

          const res2Json = await res2.json();
          if (res2Json.status) {
            toast.success("Other bookings rescheduled");
          } else {
            toast.error(
              res2Json.message || "Failed to reschedule other bookings"
            );
          }
        }
      } else {
        toast.error(result.message || "Failed to mark as confirmed");
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Something went wrong while marking as confirmed");
    } finally {
      setIsProcessing(false);
      setLoaderMessage("Processing...");
    }
  };

  // Handle delete call request

  // Handle set as converted

  // Handle reassign comment
  const handleReassignComment = async () => {
    if (!reassignComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setIsReassigning(true); // optional: for disabling button or showing spinner

      const response = await fetch(
        "http://localhost:5000/api/bookings/reassignComment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingid: bookingId,
            reassign_comment: reassignComment,
            user: user,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status) {
        toast.success(
          data.message || "Reassign request submitted successfully"
        );
        setShowReassignForm(false);
        setReassignComment("");
        setBookingData((prev) => ({
          ...prev,
          fld_call_request_sts: "Reassign Request",
          fld_reassign_comment: reassignComment,
        }));
      } else {
        toast.error(data.message || "Failed to submit reassign request");
      }
    } catch (error) {
      console.error("Reassign comment error:", error);
    } finally {
      setIsReassigning(false); // optional
    }
  };

  const handleReassignToConsultant = async () => {
  

  if (!primaryConsultantId) {
    toast.error("Please select a consultant");
    return;
  }

  try {
    setIsProcessing(true);
    setLoaderMessage("Reassigning Consultant...");
    const res = await fetch("http://localhost:5000/api/bookings/reassignToConsultant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId: bookingData.id,
        primary_consultant_id: primaryConsultantId,
        user,
      }),
    });

    const data = await res.json();
    if (data.status) {
      toast.success("Reassigned successfully");
      fetchBookingById(bookingData.id);
    } else {
      toast.error(data.message || "Reassignment failed");
    }
  } catch (err) {
    console.error("Reassignment error:", err);
    toast.error("Error while reassigning");
  }finally{
     setIsProcessing(false);
      setLoaderMessage("Processing...");
  }
};

const handleCancelBooking = async () => {
 

  if (!cancelComment.trim()) {
    toast.error("Please enter a comment");
    return;
  }

  try {
    setIsProcessing(true);
    setLoaderMessage("Cancelling...");
    const res = await fetch("http://localhost:5000/api/bookings/updateConsultationStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingid: bookingData.id,
        comment: cancelComment,
        consultation_sts: "Cancelled",
        user,
      }),
    });

    const data = await res.json();
    if (data.status) {
      toast.success("Call status updated to Cancelled");
      fetchBookingById(bookingData.id);
    } else {
      toast.error(data.message || "Cancellation failed");
    }
  } catch (err) {
    console.error("Cancellation error:", err);
    toast.error("Error while cancelling");
  }finally{
     setIsProcessing(false);
      setLoaderMessage("Processing...");
  }
};

const onUpdateStatus = async (statusData) => {
  if (!statusData.consultationStatus) {
    toast.error("Please select a consultation status.");
    return;
  }

  // 🟡 Validation by status
  if (statusData.consultationStatus === "Rescheduled") {
    if (statusData.statusOptions.length === 0) {
      toast.error("Please select options for Rescheduling.");
      return;
    }
  }

  if (statusData.consultationStatus === "Accept") {
    if (statusData.statusOptions.length !== 2) {
      toast.error("Please select exactly 2 options for Accept.");
      return;
    }
  }

  if (statusData.consultationStatus === "Client did not join") {
    if (!statusData.comment || statusData.comment.trim() === "") {
      toast.error("Enter Comments for 'Client did not join'.");
      return;
    }
  }

  if (statusData.consultationStatus === "Reject") {
    if (statusData.statusOptions.length === 0) {
      toast.error("Please select at least one reason for rejection.");
      return;
    }
  }

  if (statusData.consultationStatus === "Completed") {
    if (!statusData.callSummary || statusData.callSummary.trim() === "") {
      toast.error("Call Summary is required for completion.");
      return;
    }
  }
try {
  setIsProcessing(true);
    setLoaderMessage("Updating Status...");
    const response = await fetch("http://localhost:5000/api/bookings/updateConsultationStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingid: statusData.bookingId,
        comment: statusData.comment,
        consultation_sts: statusData.consultationStatus,
        status_options: statusData.statusOptions,
        status_options_rescheduled_others: statusData.rescheduledOthers,
        rescheduled_date: statusData.rescheduledDate || null,
        rescheduled_time: statusData.rescheduledTime || null,
        scalequestion1: statusData.scaleQuestion1,
        scalequestion2: statusData.scaleQuestion2,
        scalequestion3: statusData.scaleQuestion3,
        specific_commnets_for_the_call: statusData.callSummary,
        old_video_file: statusData.file || null,
        user: user, 
      }),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Consultation status updated successfully.");
    } else {
      toast.error(data.error || "Failed to update status.");
    }
  } catch (error) {
    console.error("API Error:", error);
    toast.error("Something went wrong while updating the status.");
  }finally {
      setIsProcessing(false);
      setLoaderMessage("Processing...");
    }
};

const onAssignExternal = async (externalData) => {
  const { consultantName, bookingId } = externalData;

  if (!consultantName) {
    toast.error("Consultant Name is Missing");
    return;
  }

  if (!bookingId) {
    toast.error("Booking Id is Missing");
    return;
  }

  try {
    setIsProcessing(true);
    setLoaderMessage("Assigning External Call...");

    const response = await fetch("http://localhost:5000/api/bookings/assignExternalCall", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ consultantName, bookingId }),
    });

    const result = await response.json();

    if (result.status) {
      toast.success("External Call Assigned Successfully");
      fetchBookingById(bookingId); // refresh booking info
    } else {
      toast.error(result.message || "Assignment failed");
    }
  } catch (error) {
    console.error("Error during external assignment:", error);
    toast.error("Something went wrong while assigning external call");
  } finally {
    setIsProcessing(false);
    setLoaderMessage("Processing...");
  }
};



const onReassignCall = (reassignData) => {
  console.log("onReassignCall called with:", reassignData);
};


  const scrollToChat = () => {
    const chatBox = document.querySelector(".chatbox");
    if (chatBox) {
      chatBox.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Count questions
  const questionCount = bookingData.fld_question_data
    ? bookingData.fld_question_data.split("~~").filter((q) => q.trim()).length
    : 0;

  // Check conditions for various buttons
  const canDelete =
    bookingData.fld_consultation_sts !== "Completed" &&
    bookingData.fld_consultantid < 1 &&
    bookingData.fld_call_related_to !== "I_am_not_sure";

  const hasOtherConfirmedBooking = (otherBookings || []).some(
    (row) =>
      row.id !== bookingData.id &&
      row.fld_call_confirmation_status === "Call Confirmed by Client" &&
      row.fld_consultation_sts === "Accept"
  );

  const canMarkAsConfirmed =
    user.fld_admin_type === "SUBADMIN" &&
    bookingData.fld_call_confirmation_status != "Call Confirmed by Client" &&
    ((bookingData.fld_call_confirmation_status ===
      "Call Confirmation Pending at Client End" &&
      (bookingData.fld_call_request_sts !== "Rescheduled" ||
        bookingData.fld_call_request_sts === "Call Rescheduled") &&
      !hasOtherConfirmedBooking &&
      bookingData.fld_call_related_to !== "I_am_not_sure") ||
      (bookingData.fld_booking_date &&
        bookingData.fld_booking_slot &&
        bookingData.fld_call_related_to === "I_am_not_sure" &&
        bookingData.fld_call_external_assign === "Yes" &&
        bookingData.fld_call_request_sts === "Accept"));

  const canUpdateStatus =
    (user.fld_admin_type === "SUBADMIN" ||
      user.fld_admin_type === "EXECUTIVE") &&
    !bookingData.statusByCrm &&
    bookingData.fld_call_request_sts === "Accept";

  var canSetAsConverted =
    user.fld_admin_type === "EXECUTIVE" &&
    bookingData.fld_call_request_sts === "Completed" &&
    bookingData.fld_converted_sts === "No" &&
    bookingData.fld_sale_type === "Presales";

  const canShowReasignConsultant=user.fld_admin_type === "EXECUTIVE" &&
  bookingData.fld_call_related_to !== "I_am_not_sure" &&
  bookingData.fld_call_request_sts !== "Completed";

  const canCancelCall=user.fld_admin_type === "EXECUTIVE" &&
  bookingData.fld_call_related_to !== "I_am_not_sure" &&
  bookingData.fld_call_request_sts !== "Cancelled" &&
  bookingData.fld_call_request_sts !== "Completed";



  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
      

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-semibold text-gray-800">
                View Booking Information
              </h4>

              <div className="flex items-center space-x-3">
                {/* Delete Button */}
                {canDelete && (
                  <button
                    onClick={handleDeleteCallRequest}
                    className="bg-red-500 hover:bg-red-600 text-white px-2  rounded-md flex items-center space-x-2 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete Call Request</span>
                  </button>
                )}

                {/* Set as Converted */}
                {canSetAsConverted && (
                  <>
                    <button
                      onClick={() => setShowConvertModal(true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 rounded-md"
                    >
                      Set as Converted
                    </button>
                    <SetAsConvertedModal
                      isOpen={showConvertModal}
                      onClose={() => setShowConvertModal(false)}
                      onConvert={handleSetAsConverted}
                      isSubmitting={isSubmitting}
                    />
                  </>
                )}

                <ViewCommentModal user={user} bookingData={bookingData} />

                {/* View Chat */}
                {/* <button
                  onClick={scrollToChat}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 rounded-md flex items-center space-x-2 transition-colors"
                >
                  <ArrowDown size={16} />
                  <span>View Chat</span>
                </button> */}

                {/* Back Button */}
                {/* Mark as Confirmed Button */}
                {canMarkAsConfirmed && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleMarkAsConfirmed}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 rounded-md transition-colors"
                    >
                      Mark as Confirmed by Client
                    </button>
                  </div>
                )}

                {/* Loading Overlay */}
                <AnimatePresence>
                  {isProcessing && (
                    <motion.div
                      className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <svg
                          className="animate-spin h-6 w-6 text-blue-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        <span className="text-gray-700 font-medium">
                          {loaderMessage}
                        </span>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Reassign Comment Form */}
                {user.fld_admin_type === "EXECUTIVE" &&
                  bookingData.fld_call_request_sts === "Consultant Assigned" &&
                  bookingData.fld_consultant_approve_sts === "Yes" && (
                    <>
                      <div className=" flex justify-end">
                        <button
                          onClick={() => setShowReassignForm(true)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 rounded-md transition-colors"
                        >
                          Request for reassign
                        </button>
                      </div>

                      <ReassignModal
                        show={showReassignForm}
                        onClose={() => setShowReassignForm(false)}
                        comment={reassignComment}
                        setComment={setReassignComment}
                        onSubmit={handleReassignComment}
                        isReassigning={isReassigning}
                      />
                    </>
                  )}
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-2 rounded-md flex items-center space-x-2 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
              </div>
            </div>

            {/* Status Update Section */}
            {canUpdateStatus && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-end space-x-4">
                  <select
                    value={statusByCrm}
                    onChange={(e) => setStatusByCrm(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 min-w-48"
                  >
                    <option value="">Update Call Status</option>
                    <option value="Completed">✔️ Completed</option>
                    <option value="Not Join">❌ Client Did Not Join</option>
                    <option value="Postponed">⏳ Postponed</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    className={`${
                      isSubmitting
                        ? "bg-blue-300 hover:bg-blue-400"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white px-6 py-2 rounded-md transition-colors`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting.." : "Submit"}
                  </button>
                </div>
              </div>
            )}

          <ConsultantInformation
          bookingData={bookingData}
          user={user}
         bgColor={getStatusColor(bookingData?.fld_call_request_sts)}
         />
            <UserInformation
              data={bookingData}
              user={user}
              bgColor={getStatusColor(bookingData?.fld_call_request_sts)}
              externalCallInfo={externalCallInfo}
            />

            {/* Reassign to Consultant Form */}
{canShowReasignConsultant && (
  <div className="flex flex-wrap gap-4">
    <div className="w-full md:w-1/2">
      <label className="block mb-2 font-medium">Reassign to another Consultant</label>
      <Select
        name="consultant_id"
        className="react-select-container"
        classNamePrefix="react-select"
        options={consultantList
          .filter((consultant) => consultant.id !== bookingData.fld_consultantid)
          .map((consultant) => ({
            value: consultant.id,
            label: consultant.fld_name,
          }))
        }
        value={
          consultantList
            .filter((consultant) => consultant.id !== bookingData.fld_consultantid)
            .map((consultant) => ({
              value: consultant.id,
              label: consultant.fld_name,
            }))
            .find((option) => option.value === primaryConsultantId) || null
        }
        onChange={(selectedOption) =>
          setPrimaryConsultantId(selectedOption ? selectedOption.value : "")
        }
        placeholder="Select Primary Consultant"
        isClearable
      />
    </div>

    <div className="w-full md:w-1/3 self-end">
      <button
        type="button"
        onClick={handleReassignToConsultant}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        <i className="fa fa-arrow-right mr-2" aria-hidden="true"></i> Update Consultant
      </button>
    </div>
  </div>
)}


{/* Cancel Booking Form */}
{canCancelCall && (
    <>
      <h5 className="font-semibold mb-3">Call Cancelled</h5>
      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-1/2">
          <label className="block mb-2">Comments <span className="text-red-500">*</span></label>
          <textarea
            className="w-full border rounded px-4 py-2"
            value={cancelComment}
            onChange={(e) => setCancelComment(e.target.value)}
            placeholder="Add Comments"
          />
        </div>

        <div className="w-full md:w-1/3 self-end">
          <button
            type="button"
            onClick={handleCancelBooking}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            <i className="fa fa-arrow-right mr-2" aria-hidden="true"></i> Update
          </button>
        </div>
      </div>
    </>
)}

<CallUpdateActions 
bookingData={bookingData}
user={user}
consultantList={consultantList}
onUpdateStatus={onUpdateStatus}
onAssignExternal={onAssignExternal}
onReassignCall={onReassignCall} />

<div className="flex flex-wrap -mx-2">
  {/* Overall History - 1/3 width */}
  <div className="w-full md:w-1/2 px-2">
    <OverallHistory bookingData={bookingData} />
  </div>

  {/* Other Calls - 2/3 width */}
  <div className="w-full md:w-1/2 px-2">
    <OtherCalls
      bookingId={bookingId}
      clientId={bookingData.fld_client_id}
      fetchBookingById={fetchBookingById}
    />
  </div>
</div>


            {/* Chat Box Placeholder */}
            <ChatBox
              user={user}
              messageData={messageData}
              onSend={(message) => {
                sendMessage(message);
              }}
              isMsgSending={isMsgSending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
