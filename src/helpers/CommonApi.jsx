export const fetchAllConsultants = async () => {
  try {
    const response = await fetch("https://callback-2suo.onrender.com/elpers/getAllActiveConsultants");
    if (!response.ok) throw new Error("Failed to fetch consultants");
    return await response.json();
  } catch (error) {
    console.error("Error fetching consultants:", error);
    return [];
  }
};

export const fetchAllSubjectAreas = async () => {
  try {
    const response = await fetch("https://callback-2suo.onrender.com/api/helpers/getAllSubjectAreas");
    if (!response.ok) throw new Error("Failed to fetch subject areas");
    return await response.json();
  } catch (error) {
    console.error("Error fetching subject areas:", error);
    return [];
  }
};

export const fetchPlanDetails = async () => {
  try {
    const response = await fetch("https://callback-2suo.onrender.com/api/helpers/getPlanDetails");
    if (!response.ok) throw new Error("Failed to fetch plan details");
    return await response.json();
  } catch (error) {
    console.error("Error fetching plan details:", error);
    return [];
  }
};
