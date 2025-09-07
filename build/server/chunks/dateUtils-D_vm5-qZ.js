function formatDate(dateString, options = {}) {
  if (!dateString) return "Invalid Date";
  try {
    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options
    };
    const hasTimeComponent = dateString.includes(" ") || dateString.includes("T") && dateString.split("T")[1] !== "00:00:00";
    if (hasTimeComponent) {
      let isoString = dateString;
      if (dateString.includes(" ") && !dateString.includes("T")) {
        isoString = dateString.replace(" ", "T");
        if (isoString.includes(".")) {
          const [datePart, fractionalPart] = isoString.split(".");
          const milliseconds = fractionalPart.substring(0, 3);
          isoString = `${datePart}.${milliseconds}`;
        }
        if (!isoString.includes("+") && !isoString.includes("Z")) {
          isoString += "Z";
        }
      }
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date after parsing:", dateString, "->", isoString);
        return "Invalid Date";
      }
      return date.toLocaleDateString("en-US", defaultOptions);
    } else {
      const parts = dateString.split("T")[0].split("-");
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const localDate = new Date(year, month, day);
      return localDate.toLocaleDateString("en-US", defaultOptions);
    }
  } catch (error) {
    console.warn("Error formatting date:", dateString, error);
    return "Invalid Date";
  }
}
function formatSubmissionTime(timestampString, showSeconds = false) {
  if (!timestampString) return "Invalid Date";
  try {
    let isoString = timestampString;
    if (timestampString.includes(" ") && !timestampString.includes("T")) {
      isoString = timestampString.replace(" ", "T");
      if (isoString.includes(".")) {
        const [datePart, fractionalPart] = isoString.split(".");
        const milliseconds = fractionalPart.substring(0, 3);
        isoString = `${datePart}.${milliseconds}`;
      }
      if (!isoString.includes("+") && !isoString.includes("Z")) {
        isoString += "Z";
      }
    }
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      console.warn("Invalid submission time after parsing:", timestampString, "->", isoString);
      return "Invalid Date";
    }
    const options = {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    };
    if (showSeconds) {
      options.second = "2-digit";
    }
    const isCurrentYear = date.getFullYear() === (/* @__PURE__ */ new Date()).getFullYear();
    if (!isCurrentYear) {
      options.year = "numeric";
    }
    return date.toLocaleDateString("en-US", options);
  } catch (error) {
    console.warn("Error formatting submission time:", timestampString, error);
    return "Invalid Date";
  }
}

export { formatSubmissionTime as a, formatDate as f };
//# sourceMappingURL=dateUtils-D_vm5-qZ.js.map
