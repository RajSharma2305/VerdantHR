/**
 * Formats a username or email prefix into a properly capitalized display name.
 * e.g., "rahul.sharma" -> "Rahul Sharma"
 * e.g., "rahul.sharma@company.com" -> "Rahul Sharma"
 */
export function formatName(nameStr: string | null | undefined): string {
  if (!nameStr) return '';
  const username = nameStr.includes('@') ? nameStr.split('@')[0] : nameStr;
  return username
    .replace(/[0-9]/g, '')
    .replace(/[._-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Splits an email or name prefix into firstName and lastName.
 * e.g., "rahul.sharma@company.com" -> { firstName: "Rahul", lastName: "Sharma" }
 * e.g., "john-doe@company.com" -> { firstName: "John", lastName: "Doe" }
 * e.g., "admin@company.com" -> { firstName: "Admin", lastName: "Employee" }
 */
export function splitEmailName(email: string | null | undefined): { firstName: string; lastName: string } {
  if (!email) return { firstName: 'Employee', lastName: 'User' };
  const namePart = email.split('@')[0].replace(/[0-9]/g, '');
  const parts = namePart.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const lastName = parts.slice(1)
      .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(' ');
    return { firstName, lastName };
  } else if (parts.length === 1) {
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    return { firstName, lastName: 'Employee' };
  }
  return { firstName: 'Employee', lastName: 'User' };
}
