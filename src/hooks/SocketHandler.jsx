// components/SocketHandler.jsx
import { useEffect } from "react";
import { getSocket } from "../utils/Socket";
import { useAuth } from "../utils/idb";
import {
  handleBookingCreated,
  handleTaskUpdated,
  handleTaskDeleted,
  handleReminderAdded,
  tagsUpdated,
  taskStatusUpdated,
  taskDeleted,
  taskMileStoneUpdated,
  taskUpdated
} from "./SocketListeners";

export default function SocketHandler({ setBookings, page }) {
  const { user } = useAuth();
  const socket = getSocket();

  useEffect(() => {
    if (!user?.id) return;

    const onCreated = handleBookingCreated(user, setBookings, page);
    const onUpdated = handleTaskUpdated(setBookings);
    const onDeleted = handleTaskDeleted(setBookings);
    const onReminder = handleReminderAdded(user, setBookings);
    const onTagUpdated = tagsUpdated(user, setBookings);
    const onTaskStatusUpdated = taskStatusUpdated(user, setBookings);
    const onTaskDeleted = taskDeleted(user, setBookings);
    const onTaskMileStoneUpdated = taskMileStoneUpdated(user, setBookings);
    const onTaskUpdated = taskUpdated(user, setBookings);

    socket.on("task_created", onCreated);
    socket.on("task_updated", onUpdated);
    socket.on("task_deleted", onDeleted);
    socket.on("newReminder", onReminder);
    socket.on("tagsUpdated", onTagUpdated);
    socket.on("taskStatusUpdated", onTaskStatusUpdated);
    socket.on("taskDeleted", onTaskDeleted);
    socket.on("benchmarkupdated", onTaskMileStoneUpdated);
    socket.on("task_updated", onTaskUpdated);

    return () => {
      socket.off("task_created", onCreated);
      socket.off("task_updated", onUpdated);
      socket.off("task_deleted", onDeleted);
      socket.off("newReminder", onReminder);
      socket.off("tagsUpdated", onTagUpdated);
      socket.off("taskStatusUpdated", onTaskStatusUpdated);
      socket.off("taskDeleted", onTaskDeleted);
      socket.off("benchmarkupdated", onTaskMileStoneUpdated);
      socket.off("task_updated", onTaskUpdated);
    };
  }, [user?.id]);

  return null;
}
