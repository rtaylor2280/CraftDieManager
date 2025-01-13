export function sortLocations(locations) {
    return locations.sort((a, b) => {
      const regex = /(\D+)?(\d+)?/; // Match non-numeric and numeric parts
      const [, prefixA = "", numberA = ""] = a.name.match(regex) || [];
      const [, prefixB = "", numberB = ""] = b.name.match(regex) || [];
  
      // Compare non-numeric parts first
      const prefixComparison = prefixA.localeCompare(prefixB);
      if (prefixComparison !== 0) {
        return prefixComparison;
      }
  
      // Compare numeric parts
      return parseInt(numberA, 10) - parseInt(numberB, 10);
    });
  }
  