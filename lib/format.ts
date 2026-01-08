import { DateTime } from "luxon";

const BYTES_PER_UNIT = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const;

type SizeUnit = keyof typeof BYTES_PER_UNIT;

export const literalToByte = (literal: string): number => {
  const matches = literal.match(/^(\d+(?:\.\d+)?)(KB|MB|GB)$/);
  if (!matches) {
    throw new Error(
      'Invalid size format. Expected format: "100KB" or "200MB" or "2GB"',
    );
  }

  const [, size, unit] = matches;
  const unitBytes = BYTES_PER_UNIT[unit as SizeUnit];

  return Number(size) * unitBytes;
};

export function monthlyRange(month: string, format: string = "yyyy-MM-dd") {
  return {
    from: DateTime.fromFormat(month, "yyyy-MM")
      .startOf("month")
      .toFormat(format),
    to: DateTime.fromFormat(month, "yyyy-MM").endOf("month").toFormat(format),
  };
}
