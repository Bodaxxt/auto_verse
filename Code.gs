/**
 * كود Google Apps Script لإدارة طلبات الانضمام لحدث Auro Verse وحفظها في Google Sheets
 * 
 * هذا الملف يحتوي على دالتين رئيسيتين:
 * 1. doPost(e): لاستقبل البيانات من فورم تقديم الطلبات للحدث وحفظها في التبويب المناسب.
 * 2. doGet(e): لقراءة البيانات من الجداول وإرسالها للوحة تحكم الإدارة (Admin Dashboard).
 */

// أسماء التبويبات لكل قسم في الفعالية
var SHEET_NAMES = {
  "logistics_coord": "إدارة الحشود والتنظيم",
  "tech_stage": "الفريق التقني والمسرح",
  "media_content": "التغطية الإعلامية"
};

/**
 * دالة استقبال طلبات POST من صفحة انضمام المستخدم
 */
function doPost(e) {
  try {
    var postData;
    
    // قراءة محتوى الطلب القادم وتفسيره كـ JSON
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    } else {
      throw new Error("لم يتم استقبال أي بيانات");
    }

    var category = postData.category;
    
    if (!category || !SHEET_NAMES[category]) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "القسم المطلوب غير صالح"
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }
    
    var sheetName = SHEET_NAMES[category];
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName(sheetName);
    
    // إذا لم يكن التبويب موجوداً، نقوم بإنشائه وتهيئته بالعناوين المناسبة للفعالية
    if (!sheet) {
      sheet = doc.insertSheet(sheetName);
      var headerRow = getHeadersForCategory(category);
      sheet.appendRow(headerRow);
      // تنسيق الصف الأول (العناوين)
      sheet.getRange(1, 1, 1, headerRow.length)
           .setFontWeight("bold")
           .setBackground("#1e1b4b")
           .setFontColor("#38bdf8") // لون سماوي
           .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // تجهيز الصف المراد إدخاله
    var timestamp = new Date();
    var formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    
    var rowData = getRowDataForCategory(category, postData, formattedDate);
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "تم إرسال طلب انضمامك لفريق Auro Verse بنجاح! سنتواصل معك قريباً."
    }))
    .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "حدث خطأ أثناء حفظ البيانات: " + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * دالة استقبال طلبات GET من لوحة تحكم الإدارة لـ Auro Verse
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
 * إرجاع عناوين الأعمدة المناسبة لكل وظيفة في الفعالية
 */
function getHeadersForCategory(category) {
  var common = ["التاريخ", "الاسم الكامل", "البريد الإلكتروني", "رقم الهاتف"];
  switch (category) {
    case "logistics_coord":
      return common.concat(["الدور المفضل", "الخبرة بالفعاليات", "ملاحظات إضافية"]);
    case "tech_stage":
      return common.concat(["التخصص التقني", "المعدات والبرامج المتقنة", "رابط معرض الأعمال"]);
    case "media_content":
      return common.concat(["نوع التغطية", "حسابات التواصل أو البورتفوليو", "حجم الخبرة السابقة"]);
    default:
      return common;
  }
}

/**
 * ترتيب قيم البيانات المدخلة لتطابق الأعمدة في جدول البيانات
 */
function getRowDataForCategory(category, data, timestamp) {
  var common = [timestamp, data.fullName, data.email, data.phone];
  switch (category) {
    case "logistics_coord":
      return common.concat([data.preferredRole, data.logisticsExp, data.additionalNotes]);
    case "tech_stage":
      return common.concat([data.techSpecialty, data.toolsMastered, data.portfolioUrl]);
    case "media_content":
      return common.concat([data.mediaType, data.socialPortfolio, data.experienceYears]);
    default:
      return common;
  }
}
