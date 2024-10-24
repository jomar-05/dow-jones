// export interface Task {
//   ckyc_id: string | null; // Updated to include ckyc_id
//   first_name: string | null;
//   last_name: string | null;
//   middle_name: string | null;
//   primary_name?: string | null; // Optional
//   title?: string | null; // Optional
//   country_territory_code?: string | null; // Optional
//   country_territory_name?: string | null; // Optional
//   gender?: 'female' | 'male' | null; // Changed to lowercase
//   score?: number | null; // Optional
//   birth_date?: string | null; // Optional
//   icon_hints?: string | null; // Optional
//   dow_jones_id?: number | null; // Optional
//   created_by: string | null; // Updated to include created_by
// }

// // Helper function to capitalize the first letter of a string
// const capitalizeFirstLetter = (string: string | null): string | null => {
//   if (!string) return null;
//   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
// };

// export const parseFileCSV = (csvString: string): Task[] => {
//   const lines = csvString?.trim().split('\n');
//   const headers = lines[0]
//     .split(',')
//     .map((header) => header?.trim().toLowerCase());

//   const headerMapping: Record<string, keyof Task> = {
//     firstname: 'first_name',
//     'first name': 'first_name',
//     lastname: 'last_name',
//     'last name': 'last_name',
//     middlename: 'middle_name',
//     'middle name': 'middle_name',
//     ckyc_id: 'ckyc_id', // Mapping for ckyc_id
//     'ckyc id': 'ckyc_id', // Mapping for ckyc_id
//     created_by: 'created_by', // Mapping for created_by
//   };

//   return lines.slice(1).reduce<Task[]>((acc, line) => {
//     const values = line.split(',').map((value) => value?.trim().toLowerCase()); // Convert values to lowercase

//     if (values.every((value) => value === '')) return acc; // Skip empty rows

//     const row: Task = headers.reduce(
//       (obj: Task, header: string, index: number) => {
//         const normalizedHeader = header.toLowerCase();

//         if (headerMapping[normalizedHeader]) {
//           const value =
//             values[index] !== undefined && values[index] !== ''
//               ? values[index]
//               : null; // Assign null for missing or empty values

//           obj[headerMapping[normalizedHeader]] = value; // Use null for missing values
//         }

//         return obj;
//       },
//       {} as Task,
//     );

//     // Capitalize the relevant fields
//     row.first_name = capitalizeFirstLetter(row.first_name);
//     row.last_name = capitalizeFirstLetter(row.last_name);
//     row.middle_name = capitalizeFirstLetter(row.middle_name);

//     acc.push(row);
//     return acc;
//   }, []);
// };

// export const validateRequiredHeaders = (csvString: string): string[] => {
//   const lines = csvString?.trim().split('\n');
//   const headers = lines[0]
//     .split(',')
//     .map((header) => header?.trim().toLowerCase());

//   const requiredHeaders = {
//     firstname: ['firstname', 'first name'],
//     lastname: ['lastname', 'last name'],
//     middlename: ['middlename', 'middle name'],
//     ckyc_id: ['ckyc_id', 'ckyc id'], // Added required header for ckyc_id
//     created_by: ['created_by'], // Added required header for created_by
//   };

//   const errors: string[] = [];

//   Object.entries(requiredHeaders).forEach(([key, formats]) => {
//     const validHeader = formats.find((format) =>
//       headers.includes(format.toLowerCase()),
//     );

//     if (!validHeader) {
//       const formattedLabels = formats
//         .map((format) => format.toLowerCase())
//         .join(' or ');
//       errors.push(`Missing required column: ${formattedLabels}`);
//     }
//   });

//   if (errors.length > 0) {
//     throw new Error(errors.join(' '));
//   }

//   return errors;
// };
