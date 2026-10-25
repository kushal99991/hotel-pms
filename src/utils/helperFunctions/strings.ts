/**
 * Remove all <script>...</script> tags
 * @param {string }input the input string
 * @example
 * stripScriptTags("<script>alert('test');</script>"); >> 'test'
 * @returns {string}
 */
export function stripScriptTags(input: string = ""): string {
  return input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
}

/**
 * Check if the file is an image
 * @param {string} type the file.type
 * @returns {boolean}
 */
export function isFileImage(type: string): boolean {
  const imagePattern = /^image\//;
  return imagePattern.test(type);
}

/**
 * Slugify a string
 * @description Input: My Cool Image 2024!.jpg >> Output: my-cool-image-2024.jpg
 * @param {string} str the file name
 * @returns {string}
 */
export function slugify(str: string): string {
  return str
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-.]+/g, "") // Remove all non-word characters except hyphens and dots (for file extensions)
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens from the start and end
}

/**
 * Check if a string is empty
 * @param {any} val the value to check
 * @returns {boolean}
 * @example isEmpty("");
 */
export const isEmpty = (val: any): boolean => {
  return val === "" || val === undefined || val === null || val.length <= 0
    ? true
    : false;
};

export const truncateStr = (
  val: string,
  length: number = 30,
  suffix: string = "..."
) => {
  return val.length > length ? `${val.substring(0, length)}${suffix}` : val;
};

export const capitalizeFirst = (s: string) => {
  if (!s.length) {
    return s;
  }
  const firstVal = s.charAt(0);
  return `${firstVal.toUpperCase()}${s.slice(1)}`;
};

export const enumToReadable = (enumString: string) => {
  const parts = enumString.split("_");
  const readableParts = parts.map((p) => capitalizeFirst(p.toLowerCase()));
  return readableParts.join(" ");
};
