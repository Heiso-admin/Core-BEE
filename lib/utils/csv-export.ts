export interface CsvExportOptions {
  filename?: string;
  headers?: Record<string, string>;
  keyMapping?: Record<string, string>;
  dateFields?: string[];
}

/**
 * Generic CSV export function
 * @param data Array of data to export
 * @param options Export options
 */
export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  options: CsvExportOptions = {},
) => {
  const {
    filename = `export-${new Date().toISOString().split("T")[0]}.csv`,
    keyMapping = {},
    headers,
    dateFields = [],
  } = options;

  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Use provided headers or generate from first object
  const finalHeaders =
    headers ||
    Object.keys(data[0]).reduce(
      (acc, key) => {
        acc[key] = keyMapping[key] || key;
        return acc;
      },
      {} as Record<string, string>,
    );

  // Helper function to get nested property value
  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };

  // Helper function to format value
  const formatValue = (value: any, key: string): string => {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return "";
    }

    // Format dates
    if (dateFields.includes(key) || value instanceof Date) {
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleDateString();
    }

    return String(value);
  };

  // Helper function to escape CSV values
  const escapeCsvValue = (value: string): string => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // Create CSV header row
  const headerRow = Object.values(finalHeaders).join(",");

  // Create CSV data rows
  const dataRows = data.map((item) => {
    const row = Object.keys(finalHeaders).map((key) => {
      // Handle nested properties like 'institution.name'
      const value = key.includes(".") ? getNestedValue(item, key) : item[key];
      const formattedValue = formatValue(value, key);
      return escapeCsvValue(formattedValue);
    });

    return row.join(",");
  });

  // Combine header and data
  const csvContent = [headerRow, ...dataRows].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
