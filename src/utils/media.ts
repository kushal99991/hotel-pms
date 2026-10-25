export function makeParamsFromInvoicePath(path: string) {
  const segments = path.split("/");
  const result: Record<any, any> = {};

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      // last segment is the file name
      result.fileName = segment;
    } else {
      const [key, value] = segment.split("=");
      if (key && value !== undefined) {
        result[key] = value;
      }
    }
  });

  return result;
}
