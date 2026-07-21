/**
 * Google Apps Script - Auro Verse Event Recruitment & Entry Portal
 * 
 * Handles database operations for applicants using Google Sheets and Google Drive:
 * 1. doPost(e): Processes applicant forms, saves images to Google Drive, and appends data to Sheets.
 * 2. doGet(e): Reads and returns sheet rows to the administrator dashboard.
 */

// ======================================================================
// ⚙️ Configurations
// ======================================================================

// Sheet names corresponding to categories
var SHEET_NAMES = {
  "classic_cars": "Classic Cars",
  "exotic_cars": "Exotic Cars",
  "sport_cars": "Sport Cars",
  "motorcycles": "Motorcycles",
  "organizers": "Organizers"
};

// Google Drive folder name for storing applicant uploads
var DRIVE_FOLDER_NAME = "Auro Verse - Applicant Photos";

// ======================================================================

/**
 * Retrieve or create the target Google Drive folder
 */
function getOrCreateDriveFolder() {
  var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  var newFolder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newFolder;
}

/**
 * Decode Base64 photo data and save to Google Drive, returning the viewable URL
 */
function savePhotoToDrive(photoData, applicantName) {
  try {
    var folder = getOrCreateDriveFolder();
    
    // Decode Base64 string
    var decoded = Utilities.base64Decode(photoData.base64);
    var blob = Utilities.newBlob(decoded, photoData.mimeType, applicantName + "_photo");
    
    // Set file extension from MIME type
    var ext = photoData.mimeType.split("/")[1] || "jpg";
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
    var fileName = applicantName.replace(/\s+/g, "_") + "_" + timestamp + "." + ext;
    blob = blob.setName(fileName);
    
    // Save to Drive
    var file = folder.createFile(blob);
    
    // Share file publicly
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
    
  } catch (err) {
    Logger.log("Error saving photo: " + err.toString());
    return "Error uploading photo";
  }
}

/**
 * Handle POST request from applicant portal
 */
function doPost(e) {
  try {
    var postData;
    
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    } else {
      throw new Error("No data received");
    }

    var category = postData.category;
    
    if (!category || !SHEET_NAMES[category]) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Invalid category selected"
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheetName = SHEET_NAMES[category];
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName(sheetName);
    
    // Initialize sheet if not present
    if (!sheet) {
      sheet = doc.insertSheet(sheetName);
      var headerRow = getHeadersForCategory(category);
      sheet.appendRow(headerRow);
      sheet.getRange(1, 1, 1, headerRow.length)
           .setFontWeight("bold")
           .setBackground("#0f172a")
           .setFontColor("#38bdf8")
           .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    var timestamp = new Date();
    var formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    
    // Save photo if attached
    var photoUrl = "";
    if (postData.photoData && postData.photoData.base64) {
      var applicantName = postData.fullName || "unknown_applicant";
      photoUrl = savePhotoToDrive(postData.photoData, applicantName);
    }
    
    var rowData = getRowDataForCategory(category, postData, formattedDate, photoUrl);
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Your application has been submitted successfully to Auro Verse! We will contact you soon."
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Error processing entry: " + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request from administrator dashboard
 */
function doGet(e) {
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var result = {};
    
    for (var key in SHEET_NAMES) {
      var sheetName = SHEET_NAMES[key];
      var sheet = doc.getSheetByName(sheetName);
      
      if (!sheet) {
        result[key] = [];
        continue;
      }
      
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      
      if (values.length <= 1) {
        result[key] = [];
        continue;
      }
      
      var headersList = values[0];
      var rows = [];
      for (var r = 1; r < values.length; r++) {
        var rowObj = {};
        for (var c = 0; c < headersList.length; c++) {
          rowObj[headersList[c]] = values[r][c];
        }
        rows.push(rowObj);
      }
      result[key] = rows;
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: result
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Returns table headers depending on category
 */
function getHeadersForCategory(category) {
  var common = ["Timestamp", "Full Name", "Email", "Phone Number"];
  var specific = [];
  
  if (category === "organizers") {
    specific = ["Preferred Role", "Event Experience", "Additional Notes"];
  } else {
    // Automotive categories
    specific = ["Vehicle Model", "Year", "Modifications"];
  }
  
  return common.concat(specific).concat(["Attached Photo"]);
}

/**
 * Align incoming data with column structure
 */
function getRowDataForCategory(category, data, timestamp, photoUrl) {
  var common = [timestamp, data.fullName, data.email, data.phone];
  var specific = [];
  
  if (category === "organizers") {
    specific = [data.preferredRole || "", data.orgExperience || "", data.additionalNotes || ""];
  } else {
    // Automotive categories
    specific = [data.vehicleModel || "", data.vehicleYear || "", data.vehicleMods || ""];
  }
  
  return common.concat(specific).concat([photoUrl || "No Photo"]);
}
