export function toTitleCase(text) {
    return text
      .toLowerCase() // Convert everything to lowercase
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
  }
  