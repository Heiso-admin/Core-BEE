"use client";

function stringToHex(str: string) {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  return hex;
}

function getColorByName(name: string, reverse: boolean = false) {
  let letters = stringToHex(name);
  if (reverse) {
    letters = letters.split("").reverse().join("");
  }
  return `#${letters.slice(0, 6)}`;
}

export function RandomAvatar({ name }: { name: string }) {
  const color1 = getColorByName(name);
  const color2 = getColorByName(name, true);

  // 使用基于name的确定性ID避免水合错误
  const gradientId = `grad-${stringToHex(name).slice(0, 8)}`;

  // SVG 中使用线性渐变背景，设置为100%宽高以适应容器
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      role="img"
      aria-label={`Avatar for ${name}`}
    >
      <title>Avatar for {name}</title>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: color1, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: color2, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gradientId})`} />
    </svg>
  );
}
