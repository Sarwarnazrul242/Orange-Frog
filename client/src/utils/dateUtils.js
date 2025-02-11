export function parseDate(date, format = "MM/DD/YYYY", reverse = false) {
    if (!date) return ""; // Prevent errors on empty values
  
    if (reverse) {
      // Convert MM/DD/YYYY → YYYY-MM-DDT00:00:00.000Z for database storage
      const parts = date.split("/");
      if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        console.warn("Invalid MM/DD/YYYY format while saving:", date);
        return "";
      }
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00.000Z`;
    }
  
    // Convert Database Format YYYY-MM-DDT00:00:00.000Z → MM/DD/YYYY
    if (typeof date === "string" && date.includes("T")) {
      date = date.split("T")[0]; // Extract YYYY-MM-DD part
    }
  
    const dateParts = date.split("-");
    if (dateParts.length !== 3) {
      console.warn("Invalid database date format while displaying:", date);
      return "";
    }
  
    const [year, month, day] = dateParts;
    return `${month}/${day}/${year}`;
  }