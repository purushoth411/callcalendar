import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { toast } from "react-hot-toast";
import $ from "jquery";
import { PlusIcon, X, XIcon } from "lucide-react";
import Select from "react-select";
import SkeletonLoader from "../components/SkeletonLoader";

DataTable.use(DT);

export default function Approveaddcallrequests() {
  const [approveaddcallrequests, setApproveaddcallrequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    approveaddcallrequest: "",
  });

  useEffect(() => {
    getAllApproveaddcallrequests();
  }, []);

  const getAllApproveaddcallrequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/approveaddcallrequests/getAllApproveaddcallrequests"
      );
      const result = await response.json();
      
      if (result.status) {
        setApproveaddcallrequests(result.data);
      } else {
        toast.error("Failed to fetch approveaddcallrequests");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching approveaddcallrequests");
    } finally {
      setIsLoading(false);
    }
  };

  const updateApproveaddcallrequestStatus = async (approveData, approveaddcallrequestId, status) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/approveaddcallrequests/update-approveaddcallrequest-status/${approveaddcallrequestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (data.status) {
        toast.success("Status updated");
        getAllApproveaddcallrequests();
      } else {
        toast.error(data.message || "Status update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }
  };

  const columns = [
    {
      title: "Request By",
      data: "crm_name",
    },
    {
      title: "Consultant",
      data: "admin_name",
    },
    {
      title: "Plan Name",
      data: "planName",
    },
    {
      title: "Client Info.",
      data: null,
      render: (data, type, row) => `${row.client_name} ${row.client_code}`
    },
    {
      title: "Request Message",
      data: "requestMessage",
    },
    {
      title: "Requested On",
      data: "addedon",
    },
    {
      title: "Action",
      data: "status",
      orderable: false,
      render: function (data, type, row) {
        if (data === "Pending") {
          return `
            <button 
              class="edit-btn bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded mr-2" 
              data-id="${row.id}" data-status="Approved">
              Approve
            </button>
            <button 
              class="edit-btn bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded" 
              data-id="${row.id}" data-status="Rejected">
              Reject
            </button>
          `;
        } else {
          const color = data === "Approved" ? "green" : "red";
          return `<span class="inline-block px-2 py-1 text-xs font-medium rounded bg-${color}-100 text-${color}-800">${data}</span>`;
        }
      },
    }

  ];

  useEffect(() => {
    $(document).on("click", ".edit-btn", function () {
      const id = $(this).data("id");
      const status = $(this).data("status");
      const selected = approveaddcallrequests.find((d) => d.id === id);
      console.log(selected);
      
      updateApproveaddcallrequestStatus(selected,id,status);
    });

    return () => {
      $(document).off("click", ".edit-btn");
    };
  }, [approveaddcallrequests]);

  const tableOptions = {
    responsive: true,
    pageLength: 25,
    lengthMenu: [5, 10, 25, 50, 100],
    ordering: false, // Disable ordering globally
    dom: '<"flex justify-between items-center mb-4"lf>rt<"flex justify-between items-center mt-4"ip>',
    language: {
      search: "",
      searchPlaceholder: "Search ...",
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "No entries available",
      infoFiltered: "(filtered from _MAX_ total entries)",
    },
    createdRow: (row, data) => {
      $(row)
        .find(".custom-checkbox")
        .on("change", function () {
          const approveaddcallrequestId = $(this).data("id");
          const newStatus = this.checked ? "ACTIVE" : "INACTIVE";
          updateApproveaddcallrequestStatus(approveaddcallrequestId, newStatus);
        });
    },
    drawCallback: function () {
      const container = $(this.api().table().container());
      container
        .find('input[type="search"]')
        .addClass(
          "px-3 !py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-[13px]"
        );
      container
        .find("select")
        .addClass(
          "px-3 !py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-[13px]"
        );
    },
  };


  return (
    <div className="">
      <div className="">
        <div className="">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[18px] font-semibold text-gray-900">Manage Approve Add Call Request</h2>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {isLoading ? (
            <SkeletonLoader
              rows={6}
              columns={["Request By", "Consultant", "Plan Name", "Client Info.","Request Message","Requested On","Action"]}
            />
          ) : (
            <DataTable
              data={approveaddcallrequests}
              columns={columns}
              className="display table table-auto w-full text-[13px] border border-gray-300 n-table-set dataTable"
              options={tableOptions}
            />
          )}
          </div>
        </div>
      </div>
     
    </div>
  );
}
