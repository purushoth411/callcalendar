import React from "react";
import { User, Mail } from "lucide-react"; // Assuming you're using lucide-react icons

const ConsultantInformation = ({ bookingData, user, bgColor }) => {
  const isSuperAdminOrExecutive =
    user?.fld_admin_type === "SUPERADMIN" ||
    user?.fld_admin_type === "EXECUTIVE";

  return (
    <>
      {/* Consultant Information */}
      {isSuperAdminOrExecutive && (
        <div
          className="p-6 rounded-lg mb-6 bg-[#f1efff] border border-[#c1b9ff]"
          // style={{ backgroundColor: bgColor }}
        >
          <h5 className="text-xl font-semibold mb-4 text-gray-800">
            Consultant Information
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 the_left">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="mr-2" />
                Consultant Id
              </label>
              <p className="text-gray-900">
                {bookingData?.consultant_client_code || "N/A"}
              </p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="mr-2" />
                Name
              </label>
              <p className="text-gray-900">
                {bookingData?.consultant_name || "N/A"}
              </p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="mr-2" />
                Email
              </label>
              <p className="text-gray-900">
                {bookingData?.consultant_email || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Consultant Information */}
      {isSuperAdminOrExecutive &&
        bookingData?.fld_secondary_consultant_id > 0 && (
          <div
            className="p-6 rounded-lg mb-6 bg-[#f1efff] border border-[#c1b9ff]"
            // style={{ backgroundColor: bgColor }}
          >
            <h5 className="text-xl font-semibold mb-4 text-gray-800">
              Secondary Consultant Information
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 the_left">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="mr-2" />
                  Consultant Id
                </label>
                <p className="text-gray-900">
                  {bookingData?.sec_consultant_client_code || "N/A"}
                </p>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="mr-2" />
                  Name
                </label>
                <p className="text-gray-900">
                  {bookingData?.sec_consultant_name || "N/A"}
                </p>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="mr-2" />
                  Email
                </label>
                <p className="text-gray-900">
                  {bookingData?.sec_consultant_email || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default ConsultantInformation;
