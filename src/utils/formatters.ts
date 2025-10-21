export const formatTime = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const formatDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });

export const formatDayOfWeek = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString("en-GB", {
    weekday: "short",
  });

export const formatFullDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
