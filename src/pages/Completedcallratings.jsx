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

export default function Completedcallratings() {
  const [completedcallratings, setCompletedcallratings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllCompletedcallratings();
  }, []);

  const getAllCompletedcallratings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://callback-2suo.onrender.com/api/completedcallratings/getAllCompletedcallratings"
      );
      const result = await response.json();
      
      if (result.status) {
        setCompletedcallratings(result.data);
      } else {
        toast.error("Failed to fetch completed call ratings");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching completed call ratings");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: "Client",
      data: "fld_name",
    },
    {
      title: "CRM",
      data: "added_by_name",
    },
    {
      title: "Consultant",
      data: "consultant_name",
    },
    {
      title: "Question 1",
      data: "fld_question1",
      render: function (data, type, row) {
        const scaleMap = {
          "Being Poor": 1,
          "Being Average": 2,
          "Being Good": 3,
        };
        const scale = scaleMap[data];
        return scale ? `${scale} (${data})` : data;
      },
    },
    {
      title: "Question 2",
      data: "fld_question2",
    },
    {
      title: "Question 3",
      data: "fld_question3",
    },
    {
      title: "Comments",
      data: "fld_specific_commnets_for_the_call",
    }
  ];

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
          const completedcallratingId = $(this).data("id");
          const newStatus = this.checked ? "ACTIVE" : "INACTIVE";
          updateCompletedcallratingsStatus(completedcallratingId, newStatus);
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
            <h2 className="text-[16px] font-semibold text-gray-900">Completed Call Ratings Management</h2>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {isLoading ? (
            <SkeletonLoader
              rows={6}
              columns={["Client", "	CRM", "Consultant", "Question 1", "Question 2", "Question 3", "Comments"]}
            />
          ) : (
            <DataTable
              data={completedcallratings}
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
