// utils/socketListeners.js

export const handleBookingCreated = (user, setBookings, page) => (task) => {

  const isSuperAdmin = user?.fld_admin_type === "SUPERADMIN";
  const isAssignedToUser = parseInt(task.fld_assign_to) === parseInt(user?.id);
  const isCreatedByUser = parseInt(task.fld_added_by) === parseInt(user?.id);
  const isFollower = task?.fld_follower
    ?.split(",")
    .map((id) => id.trim())
    .includes(String(user?.id));

  // Conditions based on page
  if (
    ((page === "dashboard" || page === "teamtasks") && isSuperAdmin) ||
    (page === "createdbyme" && isCreatedByUser) ||
    (page === "following" && isFollower) ||
    isAssignedToUser
  ) {
    setTasks((prev) => [task, ...prev]);
  }
};

export const handleTaskUpdated = (setTasks) => (updatedTask) => {
  setTasks((prev) =>
    prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
  );
};

export const handleTaskDeleted = (setTasks) => (deletedId) => {
  setTasks((prev) => prev.filter((task) => task.id !== deletedId));
};


export const handleReminderAdded = (user, setTasks) => ({ user_id, task_id }) => {
  // Only update if the reminder belongs to the current user
  if (parseInt(user.id) != parseInt(user_id)) return;

  setTasks((prev) =>
    prev.map((task) =>
      task.task_id == task_id ? { ...task, hasReminder: 1 } : task
    )
  );
};
export const tagsUpdated = (user, setTasks) => ({  task_id , tag_names, tag_ids}) => {
  
  setTasks((prev) =>
    prev.map((task) =>
      task.task_id == task_id ? { ...task, tag_names: tag_names, task_tag: tag_ids } : task
    )
  );
};
export const taskStatusUpdated = (user, setTasks) => ({ fld_task_id, fld_task_status}) => {
  
  setTasks((prev) =>
    prev.map((task) =>
      task.task_id == fld_task_id ? { ...task, fld_task_status: fld_task_status } : task
    )
  );
};

export const taskDeleted = (user, setTasks) => ({ task_id }) => {
  setTasks((prev) =>
    prev.filter((task) => task.task_id !== task_id)
  );
};

export const taskMileStoneUpdated = (user, setTasks) => ({ task_id, completed_benchmarks}) => {
  
  setTasks((prev) =>
    prev.map((task) =>
      task.task_id == task_id ? { ...task, fld_completed_benchmarks: completed_benchmarks } : task
    )
  );
};
export const taskUpdated = (user, setTasks) => (updatedTask) => {

  setTasks((prevTasks) =>
    prevTasks.map((task) =>
      task.task_id === updatedTask.id
        ? { ...task, ...updatedTask }
        : task
    )
  );
};
