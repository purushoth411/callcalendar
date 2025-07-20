import {
  Activity,
  ArrowUpRightFromCircle,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  Lock,
  Mic,
} from "lucide-react";

const StatusBadges = ({ row, user, onCrmStatusChange }) => {
  const statusMap = {
    "Call Scheduled": "slate",
    "Call Rescheduled": "slate",
    "Consultant Assigned": "blue",
    "Pending": "amber",
    "Accept": "blue",
    "Reject": "rose",
    "Completed": "green",
    "Rescheduled": "gray",
    "Reassign Request": "gray",
    "Converted": "green",
    "Client did not join": "red",
    "Cancelled": "red",
  };

  const statusText =
    row.fld_call_request_sts === "Accept"
      ? "Accepted"
      : row.fld_call_request_sts === "Reject"
      ? "Rejected"
      : row.fld_call_request_sts;

  const statusColor = statusMap[row.fld_call_request_sts] || "gray";

  const Badge = ({ children, color = "gray" }) => (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
    >
      {children}
    </span>
  );

  const badges = [];

  // Main Status
  badges.push(
    <Badge key="main" color={statusColor}>
      <Activity className="w-4 h-4" />
      {statusText}
    </Badge>
  );

  // Converted
  if (row.fld_call_request_sts === "Completed" && row.fld_converted_sts === "Yes") {
    badges.push(
      <Badge key="converted" color="green">
        <ArrowUpRightFromCircle className="w-4 h-4" />
        Converted
      </Badge>
    );
  }

  // CRM Status
  if (row.statusByCrm === "Completed") {
    badges.push(
      <Badge key="crm-completed" color="amber">
        <UserCheck className="w-4 h-4" />
        CRM: Completed
      </Badge>
    );
  } else if (row.statusByCrm === "Not Join") {
    badges.push(
      <Badge key="crm-no-show" color="rose">
        <UserX className="w-4 h-4" />
        CRM: No Show
      </Badge>
    );
  }

  // Call Confirmation
  if (row.fld_call_request_sts === "Accept") {
    const confirm = row.fld_call_confirmation_status;
    if (confirm === "Call Confirmation Pending at Client End") {
      badges.push(
        <Badge key="pending-confirm" color="blue">
          <Clock className="w-4 h-4" />
          Awaiting Client Confirmation
        </Badge>
      );
    }
    if (confirm === "Call Confirmed by Client") {
      badges.push(
        <Badge key="confirmed" color="green">
          <CheckCircle className="w-4 h-4" />
          Client Confirmed
        </Badge>
      );
    }
  }

  // Web Code (OTP)
  if (
    ["Accept", "Call Scheduled", "Call Rescheduled"].includes(row.fld_call_request_sts) &&
    user?.fld_admin_type === "EXECUTIVE" &&
    row.fld_call_confirmation_status !== "Call Confirmed by Client" &&
    row.fld_otp
  ) {
    badges.push(
      <Badge key="otp" color="blue">
        <Lock className="w-4 h-4" />
        Web Code: {row.fld_otp}
      </Badge>
    );
  }

  // Call Recording
  const callAddedTimestamp = new Date(row.fld_addedon).getTime();
  if (
    row.fld_call_request_sts === "Completed" &&
    callAddedTimestamp > new Date("2025-06-06").getTime()
  ) {
    const recStatus = row.callRecordingSts;
    const recColor = recStatus === "Call Recording Updated" ? "green" : "rose";
    badges.push(
      <Badge key="recording" color={recColor}>
        <Mic className="w-4 h-4" />
        {recStatus}
      </Badge>
    );
  }

  // Dropdown for CRM Status
  const showDropdown =
    ["SUBADMIN", "EXECUTIVE"].includes(user?.fld_admin_type) &&
    !row.statusByCrm &&
    row.fld_call_request_sts === "Accept";

  return (
    <div className="flex flex-col gap-1">
      {badges}
      {showDropdown && (
        <select
          className="mt-2 w-full sm:w-56 border rounded-md text-sm px-2 py-1 shadow-sm focus:ring-2 focus:ring-blue-500"
          onChange={(e) => onCrmStatusChange(row.id, e.target.value)}
          defaultValue=""
        >
          <option value="">Update Call Status</option>
          <option value="Completed">✔️ Mark As Completed</option>
          <option value="Not Join">❌ Client Did Not Join</option>
          <option value="Postponed">⏳ Postponed</option>
        </select>
      )}
    </div>
  );
};

export default StatusBadges;
