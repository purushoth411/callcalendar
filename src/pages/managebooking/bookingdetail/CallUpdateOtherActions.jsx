import React, { useState } from "react";
import Select from "react-select";
import {
  ArrowRight,
  ArrowDown,
  UserPlus,
  Calendar,
  Clock,
  Link,
  MessageSquare,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";

const CallUpdateOtherActions = ({
  bookingData,
  user,
  consultantList,
  externalCallInfo,
  onUpdateExternal,
  onSubmitCompletedComment,
  onAddFollower,
  onUpdateExternalBooking,
  followerConsultants = [],
  hasFollowers,
  getFollowerConsultant,
  loadingFollowers,
}) => {
  const [consultantName, setConsultantName] = useState(
    externalCallInfo?.fld_consultant_name || ""
  );
  const [initialConsultationStatus, setInitialConsultationStatus] = useState(
    bookingData?.fld_consultation_sts || ""
  );
  const [consultationStatus, setConsultationStatus] = useState("");
  const [externalComment, setExternalComment] = useState("");
  const [callCompleteComment, setCallCompleteComment] = useState("");
  const [callCompleteRating, setCallCompleteRating] = useState("");
  const [callRecordingUrl, setCallRecordingUrl] = useState("");

  const [showFollowerForm, setShowFollowerForm] = useState(false);
  const [followerConsultantId, setFollowerConsultantId] = useState("");
  const [followerConsultantName, setFollowerConsultantName] = useState("");

  const [externalBookingDate, setExternalBookingDate] = useState("");
  const [externalBookingTime, setExternalBookingTime] = useState("");
  const [callJoiningLink, setCallJoiningLink] = useState(
    bookingData.fld_call_joining_link || ""
  );

  const isSubadmin = user.fld_admin_type === "SUBADMIN";
  const isExecutive = user.fld_admin_type === "EXECUTIVE";
  const isConsultant = user.fld_admin_type === "CONSULTANT";

  const now = new Date();
  const bookingTime = new Date(
    `${bookingData.fld_booking_date}T${bookingData.fld_booking_slot}`
  );
const isBeforeBookingTime = now < bookingTime;
const hasNoFollowers = hasFollowers === false;

  const showFollowerSection =
  bookingData.fld_call_confirmation_status === "Call Confirmed by Client" &&
  (isConsultant || isSubadmin) &&
  isBeforeBookingTime &&
  hasNoFollowers &&
  bookingData.fld_call_request_sts !== "Completed" &&
  bookingData.fld_call_related_to !== "I_am_not_sure";

  const showExecutiveExternalBooking =
    isExecutive &&
    bookingData.fld_call_related_to === "I_am_not_sure" &&
    bookingData.fld_call_external_assign === "Yes" &&
    bookingData.fld_call_request_sts !== "Completed";

  const isPendingStatus =
    !["Completed", "Reject", "Cancelled", "Client did not join"].includes(
      bookingData.fld_call_request_sts
    ) &&
    bookingData.fld_call_related_to === "I_am_not_sure" &&
    bookingData.fld_call_external_assign === "Yes" &&
    bookingData.fld_booking_date &&
    bookingData.fld_booking_slot;

  const handleExternalSubmit = async () => {
    const payload = {
      bookingid: bookingData.id,
      consultant_name: consultantName,
      consultation_sts: consultationStatus,
      externalCallComnt: externalComment,
    };
    onUpdateExternal(payload);
  };

  const handleCompletionSubmit = async () => {
    const payload = {
      bookingid: bookingData.id,
      call_complete_comment: callCompleteComment,
      call_complete_rating: callCompleteRating,
      call_complete_recording: callRecordingUrl,
    };
    onSubmitCompletedComment(payload);
  };

  const handleFollowerSubmit = (e) => {
    e.preventDefault();
    const payload = {
      bookingid: bookingData.id,
      followerConsultantId: followerConsultantId,
      followerConsultantName: followerConsultantName,
    };
    onAddFollower(payload);
  };

  const handleExternalBookingSubmit = () => {
    const payload = {
      bookingid: bookingData.id,
      call_joining_link: callJoiningLink,
      external_booking_date: externalBookingDate,
      external_booking_time: externalBookingTime,
    };
    onUpdateExternalBooking(payload);
  };

  const getRatings = () => [1, 2, 3, 4, 5];

  const followerOptions = followerConsultants.map((f) => ({
    value: f.id,
    label: f.name,
  }));

  return (
    <>
      {/* Call Booking Action */}
      {isSubadmin && isPendingStatus && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Call Booking Action
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultant Name
              </label>
              {externalCallInfo?.fld_consultant_name ? (
                <p className="text-gray-900 font-medium">
                  {externalCallInfo.fld_consultant_name}
                </p>
              ) : (
                <input
                  type="text"
                  value={consultantName}
                  onChange={(e) => setConsultantName(e.target.value)}
                  placeholder="Enter consultant name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Status
              </label>
              <select
                value={consultationStatus}
                onChange={(e) => setConsultationStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select status</option>
                {initialConsultationStatus !== "Accept" && (
                  <option value="Accept">Accept</option>
                )}
                <option value="Client did not join">Client did not join</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                External Call Comment
              </label>
              <textarea
                value={externalComment}
                onChange={(e) => setExternalComment(e.target.value)}
                placeholder="Enter your comment here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleExternalSubmit}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* After Call Comments Form */}
      {isExecutive &&
        bookingData.fld_consultation_sts === "Completed" &&
        !bookingData.fld_call_complete_comment &&
        bookingData.callRecordingSts === "Call Recording Pending" && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              After Call Comments
            </h2>

           <div className="grid grid-cols-1 gap-4">
  {/* Comments - Full Width */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Comments
    </label>
    <textarea
      value={callCompleteComment}
      onChange={(e) => setCallCompleteComment(e.target.value)}
      placeholder="Add Comments"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
    />
  </div>

  {/* Rating + Call Recording in 2 Columns */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Rating
      </label>
      <select
        value={callCompleteRating}
        onChange={(e) => setCallCompleteRating(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select Rating</option>
        {getRatings().map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Call Recording URL
      </label>
      <input
        type="text"
        value={callRecordingUrl}
        onChange={(e) => setCallRecordingUrl(e.target.value)}
        placeholder="G-Drive URL"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
</div>


            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleCompletionSubmit}
                className="inline-flex items-center px-2 py-1 bg-[#ff6800] text-white text-sm font-medium rounded-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                
                Submit<ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

      {/* After Call Comments Display */}
      {bookingData.fld_consultation_sts === "Completed" &&
        bookingData.fld_call_complete_comment &&
        bookingData.callRecordingSts === "Call Recording Updated" &&
        bookingData.fld_call_complete_recording && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              After Call Comments
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments
                </label>
                <p className="text-gray-800">
                  {bookingData.fld_call_complete_comment}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <p className="text-gray-800">
                  {bookingData.fld_call_complete_rating}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Call Recordings
                </label>
                <p className="text-blue-600 underline break-words">
                  {bookingData.fld_call_complete_recording.startsWith(
                    "http"
                  ) ? (
                    <a
                      href={bookingData.fld_call_complete_recording}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {bookingData.fld_call_complete_recording}
                    </a>
                  ) : (
                    <a
                      href={`/assets/call_recordings/${bookingData.fld_call_complete_recording}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center"
                    >
                      Download Call Recording File{" "}
                      <ArrowDown className="w-4 h-4 ml-1" />
                    </a>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
 
        

      {/* Add Follower */}
      {showFollowerSection && (
        <div className="bg-white border border-gray-200 rounded p-4 w-full m-w-[40%]">
          <div className="">
           
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-300 pb-3 mb-3">
              <UserPlus size={16} className="mr-2" />
              Add Follower
            </h2>

            <button
              className="inline-flex items-center px-2 py-1 bg-orange-500 text-white text-[11px] font-medium rounded-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              onClick={() => {
                setShowFollowerForm(!showFollowerForm);
                getFollowerConsultant();
              }}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Add Follower
            </button>
          </div>

          {showFollowerForm && (
            <div className="space-y-4 mt-4">
              {loadingFollowers ? (
                <p className="text-blue-600 text-sm mb-2">
                  Fetching followers...This may take some time.
                </p>
              ) : (
                <>
                  <Select
                    options={followerOptions}
                    value={
                      followerOptions.find(
                        (option) => option.value === followerConsultantId
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      setFollowerConsultantId(selectedOption?.value || "");
                      setFollowerConsultantName(selectedOption?.label || "");
                    }}
                    placeholder="Select Follower"
                    className="basic-single"
                    classNamePrefix="select"
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleFollowerSubmit}
                      className="inline-flex items-center px-2 py-1 bg-blue-600 text-white text-[13px]  font-medium rounded-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                  
                      Add    <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Update Booking Info */}
      {showExecutiveExternalBooking && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Update Booking Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="url"
              value={callJoiningLink}
              onChange={(e) => setCallJoiningLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Call Joining Link"
              required
            />
            <input
              type="date"
              value={externalBookingDate}
              onChange={(e) => {
                const selectedDate = new Date(e.target.value);
                if (selectedDate.getDay() === 0) {
                  toast.error(
                    "Sundays are not allowed. Please select another date."
                  );
                  return;
                }
                setExternalBookingDate(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().split("T")[0]}
              required
            />
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={externalBookingTime}
              onChange={(e) => setExternalBookingTime(e.target.value)}
              required
            >
              <option value="">Select Time</option>
              {Array.from({ length: 24 }).flatMap((_, h) =>
                [0, 30].map((m) => {
                  const time = `${h.toString().padStart(2, "0")}:${m
                    .toString()
                    .padStart(2, "0")}`;
                  return time > "09:00" && time < "19:00" ? (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ) : null;
                })
              )}
            </select>
            <button
              type="button"
              onClick={handleExternalBookingSubmit}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Update
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CallUpdateOtherActions;
