import { google } from "googleapis";
import { NextResponse } from "next/server";

// Auth handler (Shared logic)
async function getAuthSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  return { sheets, spreadsheetId: process.env.SHEET_ID };
}

// Ensure the name is matching the tab exactly. Assuming 'Data' based on your screenshot. 
// If it fails to find the tab, it might be 'Sheet1'.
const SHEET_RANGE = "Data!A1:Z"; 

// 1. READ Data (GET)
export async function GET() {
  try {
    const { sheets, spreadsheetId } = await getAuthSheets();
    
    // Fetch all data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: SHEET_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json([]); // Return empty array if sheet empty
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET API Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// 2. CREATE Data (POST)
export async function POST(req) {
  try {
    const body = await req.json();
    const { rowData } = body; // rowData is an array like ['2023-10-12', 'ORD-01', ...]
    
    if (!rowData || !Array.isArray(rowData)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const { sheets, spreadsheetId } = await getAuthSheets();

    // Append new row
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Data!A:A", // Append below the last row
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({ message: "Row added successfully" });
  } catch (error) {
    console.error("POST API Error:", error);
    return NextResponse.json({ error: "Failed to add data" }, { status: 500 });
  }
}

// 3. UPDATE Data (PUT)
export async function PUT(req) {
  try {
    const body = await req.json();
    const { rowIndex, rowData } = body; // rowIndex from frontend
    
    if (rowIndex === undefined || !rowData) {
      return NextResponse.json({ error: "Missing rowIndex or rowData" }, { status: 400 });
    }

    const { sheets, spreadsheetId } = await getAuthSheets();

    const targetRow = rowIndex + 2; 

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Data!A${targetRow}:Z${targetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({ message: "Row updated successfully" });
  } catch (error) {
    console.error("PUT API Error:", error);
    return NextResponse.json({ error: "Failed to update data" }, { status: 500 });
  }
}

// 4. DELETE Data (DELETE)
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { rowIndex } = body;
    
    if (rowIndex === undefined) {
      return NextResponse.json({ error: "Missing rowIndex" }, { status: 400 });
    }

    const { sheets, spreadsheetId } = await getAuthSheets();
    
    // We need the sheetId (not spreadsheetId) for batchUpdate deleteDimension.
    // Fetch spreadsheet metadata to get the ID of the 'Data' tab.
    const metaData = await sheets.spreadsheets.get({
        spreadsheetId
    });
    
    // Find the sheet object where title === 'Data'
    const sheetData = metaData.data.sheets.find(s => s.properties.title === 'Data');
    if (!sheetData) {
        return NextResponse.json({ error: "Could not find 'Data' sheet" }, { status: 500 });
    }
    const sheetId = sheetData.properties.sheetId;

    // Google Sheets API dimensions are 0-indexed.
    // Header is row 0. First data row is row 1.
    // Frontend index 0 corresponds to data row 1.
    // So the dimension index is `rowIndex + 1`.
    const startIndex = rowIndex + 1;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: startIndex,
                endIndex: startIndex + 1, // Excusive end index
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({ message: "Row deleted successfully" });
  } catch (error) {
    console.error("DELETE API Error:", error);
    return NextResponse.json({ error: "Failed to delete data" }, { status: 500 });
  }
}
