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

const BookingDetail = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [bookingData, setBookingData] = useState([]);
  const { user } = useAuth();

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [statusByCrm, setStatusByCrm] = useState("");

  const [reassignComment, setReassignComment] = useState("");
  const [showReassignForm, setShowReassignForm] = useState(false);
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [messageData, setMessageData] = useState([]);
  const [isMsgSending, setIsMsgSending] = useState(false);
  const [otherBookings,setOtherBookings]=useState([]);
  

  useEffect(() => {
    fetchBookingById(bookingId);
  }, [bookingId]);

  const fetchBookingById = async (bookingId) => {
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
      } else {
        console.warn("Booking not found or error:", result.message);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      fetchMsgData(bookingId);
      getOtherBookings();
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
  }finally{
    setIsSubmitting(false);
  }
};

const getOtherBookings = async () => {
  try {
    const queryParams = new URLSearchParams({
     
      consultantId: bookingData.fld_consultantid,
      bookingDate: bookingData.fld_booking_date,
      bookingSlot: bookingData.fld_booking_slot
    });

    const response = await fetch(
      `http://localhost:5000/api/bookings/getBookingData?${queryParams}`
    );

    const result = await response.json();

    if (result.success) {
      setOtherBookings(result.data);
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
      !window.confirm("Are You Sure! You Want To Mark as Confirmed by Client")
    ) {
      return;
    }

    try {
      const response=await fetch(`http://localhost:5000/api/bookings/markAsConfirmByClient`,{
        method:"POST",
        headers:{
          "Content-type":"application/json"
        },
        body:JSON.stringify({
          bookingId
        })
      })
      const result =await response.json();
      if(result.status){
toast.success("Marked as confirmed by client" );
      }else{

      }
      
     
    } catch (error) {
      
    }
  };

  // Handle delete call request

  // Handle set as converted

  // Handle reassign comment
  const handleReassignComment = async (e) => {
    e.preventDefault();
    if (!reassignComment.trim()) {
      setAlert({ type: "danger", message: "Please enter a comment" });
      return;
    }

    try {
      // API call would go here
      setAlert({
        type: "success",
        message: "Reassign request submitted successfully",
      });
      setShowReassignForm(false);
      setReassignComment("");
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Failed to submit reassign request",
      });
    }
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
  user.fld_admin_type === "EXECUTIVE" &&
  (
    (
      bookingData.fld_call_confirmation_status === "Call Confirmation Pending at Client End" &&
      (bookingData.fld_call_request_sts !== "Rescheduled" || bookingData.fld_call_request_sts === "Call Rescheduled") &&
      !hasOtherConfirmedBooking &&
      bookingData.fld_call_related_to !== "I_am_not_sure"
    ) ||
    (
      bookingData.fld_booking_date &&
      bookingData.fld_booking_slot &&
      bookingData.fld_call_related_to === "I_am_not_sure" &&
      bookingData.fld_call_external_assign === "Yes" &&
      bookingData.fld_call_request_sts === "Accept"
    )
  );

  const canUpdateStatus =
    (user.fld_admin_type === "SUBADMIN" ||
      user.fld_admin_type === "EXECUTIVE") &&
    !bookingData.statusByCrm &&
    bookingData.fld_call_request_sts === "Accept";

  const canSetAsConverted =
    user.fld_admin_type === "EXECUTIVE" &&
    bookingData.fld_call_request_sts === "Completed" &&
    bookingData.fld_converted_sts === "No" &&
    bookingData.fld_sale_type === "Presales";

  useEffect(() => {
    // Auto-hide alerts after 5 seconds
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ type: "", message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            {/* Alert Messages */}
            {alert.message && (
              <div
                className={`mb-4 p-4 rounded-md border ${
                  alert.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <button
                  onClick={() => setAlert({ type: "", message: "" })}
                  className="float-right text-xl leading-none"
                >
                  ×
                </button>
                {alert.message}
              </div>
            )}

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
              <div className="mb-6 flex justify-end">
                <button
                  onClick={handleMarkAsConfirmed}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Mark as Confirmed by Client
                </button>
              </div>
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
                    className={`${isSubmitting ? "bg-blue-300 hover:bg-blue-400":"bg-blue-500 hover:bg-blue-600"} text-white px-6 py-2 rounded-md transition-colors`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..":"Submit"}
                  </button>
                </div>
              </div>
            )}

            

            {/* Reassign Comment Form */}
            {user.fld_admin_type === "EXECUTIVE" &&
              bookingData.fld_call_request_sts === "Consultant Assigned" && (
                <>
                  <div className="mb-4 flex justify-end">
                    <button
                      onClick={() => setShowReassignForm(!showReassignForm)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Request for reassign
                    </button>
                  </div>

                  {showReassignForm && (
                    <form
                      onSubmit={handleReassignComment}
                      className="mb-6 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <textarea
                          value={reassignComment}
                          onChange={(e) => setReassignComment(e.target.value)}
                          placeholder="Add Comments"
                          className="flex-1 border border-gray-300 rounded px-3 py-2 min-h-20"
                          required
                        />
                        <button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center space-x-2 transition-colors"
                        >
                          <ArrowRight size={16} />
                          <span>Update</span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

            {/* Consultant Information */}
            {(user.fld_admin_type === "SUPERADMIN" ||
              user.fld_admin_type === "EXECUTIVE") &&
              bookingData.admin_name &&
              bookingData.fld_consultant_approve_sts === "Yes" && (
                <div
                  className="p-6 rounded-lg mb-6"
                  style={{
                    backgroundColor: getStatusColor(
                      bookingData.fld_call_request_sts
                    ),
                  }}
                >
                  <h5 className="text-xl font-semibold mb-4 text-gray-800">
                    Consultant Information
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="mr-2" />
                        Consultant Id
                      </label>
                      <p className="text-gray-900">{bookingData.admin_code}</p>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="mr-2" />
                        Name
                      </label>
                      <p className="text-gray-900">{bookingData.admin_name}</p>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Mail size={16} className="mr-2" />
                        Email
                      </label>
                      <p className="text-gray-900">{bookingData.admin_email}</p>
                    </div>
                  </div>
                </div>
              )}

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-2">Booking ID</h6>
                <p className="text-gray-900">{bookingData.id}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-2">
                  Subject Area
                </h6>
                <p className="text-gray-900">{bookingData.fld_subject_area}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-2">Sale Type</h6>
                <p className="text-gray-900">{bookingData.fld_sale_type}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-2">
                  Booking Date
                </h6>
                <p className="text-gray-900">{bookingData.fld_booking_date}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-2">Time Slot</h6>
                <p className="text-gray-900">{bookingData.fld_booking_slot}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-2">
                  Questions Count
                </h6>
                <p className="text-gray-900">{questionCount}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-2">
                  Call Status
                </h6>
                <p className="text-gray-900">
                  {bookingData.fld_call_request_sts}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-2">
                  Consultation Status
                </h6>
                <p className="text-gray-900">
                  {bookingData.fld_consultation_sts}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h6 className="font-semibold text-gray-700 mb-2">
                  Confirmation Status
                </h6>
                <p className="text-gray-900">
                  {bookingData.fld_call_confirmation_status}
                </p>
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
