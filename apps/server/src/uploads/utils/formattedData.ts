// Convert extracted data to the desired format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatData(extractedData: any[]) {
  const formattedData = await extractedData.map((item) => ({
    ckyc_id: item['CKYC ID'],
    LastName: item['Last Name'],
    FirstName: item['First Name'],
    MiddleName: item['Middle Name'],
  }));
  return formattedData;
}
