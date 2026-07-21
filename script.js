/**
 * ملف الجافا سكريبت الرئيسي - منصة تنظيم حدث Auro Verse
 * يحتوي على منطق التحكم بصفحة التقديم للحدث ولوحة تحكم مراجعي الطلبات
 */

// الرابط الافتراضي للـ Apps Script الخاص بك
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwP9bVhKAgeWe8ChXFNM1VcikU6--U9aUIvMVsNPFpuKVpyOxfI-spJ4k7botJpjpWw/exec";

let appsScriptUrl = localStorage.getItem("appsScriptUrl");

// فحص للتأكد أن القيمة ليست فارغة أو قديمة أو غير صالحة
if (!appsScriptUrl || appsScriptUrl.trim() === "" || appsScriptUrl === "null" || appsScriptUrl === "undefined" || appsScriptUrl.includes("AKfycbyTXIwoY0aHy6NaIvSKmlKOmGLx0wpx7JqGfw6UhVG8wX6YTME0S9LjHFq7rc4owLcv")) {
  appsScriptUrl = DEFAULT_APPS_SCRIPT_URL;
  localStorage.setItem("appsScriptUrl", DEFAULT_APPS_SCRIPT_URL);
}

// بيانات الحقول الديناميكية للأقسام المختلفة للفعالية
const DYNAMIC_FIELDS_CONFIG = {
  "logistics_coord": `
    <div class="form-group animate-fade-in">
        <label for="preferredRole"><i class="fas fa-id-badge"></i> الدور المفضل في التنظيم <span class="required">*</span></label>
        <select id="preferredRole" name="preferredRole" required>
            <option value="" disabled selected>اختر من القائمة...</option>
            <option value="تنظيم الطوابير وبوابات الدخول">تنظيم الطوابير وبوابات الدخول</option>
            <option value="إرشاد الحضور داخل القاعات">إرشاد الحضور وتوجيههم داخل القاعات</option>
            <option value="الدعم اللوجستي وحل المشكلات">الدعم اللوجستي وحل المشكلات الفنية</option>
            <option value="استقبال الشخصيات الهامة والضيوف">استقبال كبار الشخصيات والضيوف (VIP)</option>
            <option value="أخرى">أخرى (يرجى التوضيح بالأسفل)</option>
        </select>
    </div>
    <div class="form-group animate-fade-in">
        <label for="logisticsExp"><i class="fas fa-history"></i> الخبرة السابقة في الفعاليات والتنظيم <span class="required">*</span></label>
        <textarea id="logisticsExp" name="logisticsExp" required placeholder="اذكر أسماء الفعاليات أو المعارض التي شاركت في تنظيمها سابقاً ودورك فيها..."></textarea>
    </div>
    <div class="form-group animate-fade-in">
        <label for="additionalNotes"><i class="fas fa-file-medical"></i> ملاحظات إضافية أو مهارات خاصة (اختياري)</label>
        <input type="text" id="additionalNotes" name="additionalNotes" placeholder="مثلاً: أجيد الإسعافات الأولية، أتحدث الإنجليزية بطلاقة، إلخ...">
    </div>
  `,
  "tech_stage": `
    <div class="form-group animate-fade-in">
        <label for="techSpecialty"><i class="fas fa-tools"></i> التخصص التقني المطلق <span class="required">*</span></label>
        <select id="techSpecialty" name="techSpecialty" required>
            <option value="" disabled selected>اختر تخصصك الأساسي...</option>
            <option value="هندسة الصوت والمسارح">هندسة الصوت والمسارح (Sound Engineer)</option>
            <option value="إدارة الإضاءة والمؤثرات">إدارة الإضاءة والمؤثرات البصرية (Lighting)</option>
            <option value="إدارة شاشات العرض الكبيرة">إدارة شاشات العرض الكبيرة والبروجيكتور (Visuals)</option>
            <option value="التصوير والبث المباشر">التصوير التلفزيوني وأنظمة البث المباشر (AV Broadcast)</option>
            <option value="الدعم الفني وتجهيز الحواسيب">الدعم الفني العام وتجهيز أجهزة الحاسب والشبكات</option>
        </select>
    </div>
    <div class="form-group animate-fade-in">
        <label for="toolsMastered"><i class="fas fa-laptop-code"></i> البرامج أو الأجهزة التي تتقن استخدامها <span class="required">*</span></label>
        <textarea id="toolsMastered" name="toolsMastered" required placeholder="مثال: OBS Studio, vMix, QLab, أجهزة مكسر الصوت ياماها، أجهزة تحكم الإضاءة DMX..."></textarea>
    </div>
    <div class="form-group animate-fade-in">
        <label for="portfolioUrl"><i class="fas fa-link"></i> رابط معرض أعمالك أو سيرتك الذاتية</label>
        <input type="url" id="portfolioUrl" name="portfolioUrl" placeholder="https://drive.google.com/your-resume-link">
    </div>
  `,
  "media_content": `
    <div class="form-group animate-fade-in">
        <label for="mediaType"><i class="fas fa-photo-video"></i> نوع التغطية أو المهارة الإعلامية <span class="required">*</span></label>
        <select id="mediaType" name="mediaType" required>
            <option value="" disabled selected>اختر مهارتك الرئيسية...</option>
            <option value="تصوير فوتوغرافي احترافي">تصوير فوتوغرافي احترافي الكاميرا الخاصة بك</option>
            <option value="تصوير فيديو وصناعة ريلز">تصوير فيديو سينمائي وصناعة فيديوهات قصيرة (Reels/TikTok)</option>
            <option value="مونتاج فيديو فوري">مونتاج وتعديل الفيديو السريع أثناء الحدث</option>
            <option value="كتابة المحتوى وإدارة السوشيال ميديا">كتابة المحتوى وإدارة حسابات السوشيال ميديا للحدث</option>
        </select>
    </div>
    <div class="form-group animate-fade-in">
        <label for="socialPortfolio"><i class="fas fa-images"></i> رابط حساباتك أو بورتفوليو أعمالك السابقة <span class="required">*</span></label>
        <input type="text" id="socialPortfolio" name="socialPortfolio" required placeholder="أدخل رابط حساب أعمالك على إنستجرام، بيهانس، دريبل...">
    </div>
    <div class="form-group animate-fade-in">
        <label for="experienceYears"><i class="fas fa-star"></i> حجم الخبرة السابقة في هذا المجال <span class="required">*</span></label>
        <select id="experienceYears" name="experienceYears" required>
            <option value="" disabled selected>حدد حجم الخبرة...</option>
            <option value="مبتدئ (أقل من سنة)">مبتدئ (أقل من سنة)</option>
            <option value="متوسط (سنة إلى 3 سنوات)">متوسط (سنة إلى 3 سنوات)</option>
            <option value="محترف (أكثر من 3 سنوات)">محترف (أكثر من 3 سنوات)</option>
        </select>
    </div>
  `
};

// أسماء الأقسام باللغة العربية لعرضها بالنموذج واللوحة
const CATEGORY_NAMES = {
  "logistics_coord": "إدارة الحشود والتنظيم",
  "tech_stage": "الفريق التقني والمسرح",
  "media_content": "التغطية الإعلامية"
};

// تشغيل الدوال بمجرد تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
  
  // 1. منطق صفحة المستخدم
  if (document.getElementById("request-form")) {
    console.log("تم تحميل بوابة تقديم طلبات Auro Verse");
  }

  // 2. منطق صفحة الإدارة
  if (document.getElementById("login-form") || document.getElementById("dashboard-section")) {
    checkAdminAuth();
    
    const scriptInput = document.getElementById("apps-script-url-input");
    if (scriptInput && appsScriptUrl) {
      scriptInput.value = appsScriptUrl;
    }
  }
});

/* ==========================================================================
   وظائف صفحة المستخدم (index.html)
   ========================================================================== */

/**
 * دالة اختيار التخصص وتحديث محتوى النموذج
 */
function selectCategory(categoryKey) {
  document.querySelectorAll(".category-card").forEach(card => {
    card.classList.remove("selected");
  });

  const selectedCard = document.querySelector(`.category-card[data-category="${categoryKey}"]`);
  if (selectedCard) {
    selectedCard.classList.add("selected");
  }

  document.getElementById("selected-category").value = categoryKey;

  const categoryTag = document.getElementById("category-tag");
  categoryTag.innerText = CATEGORY_NAMES[categoryKey];
  
  categoryTag.className = "form-category-tag"; 
  categoryTag.classList.add(`tag-${categoryKey}`);

  document.getElementById("form-title").innerText = `تقديم طلب انضمام لـ ${CATEGORY_NAMES[categoryKey]}`;

  const dynamicContainer = document.getElementById("dynamic-fields-container");
  dynamicContainer.innerHTML = DYNAMIC_FIELDS_CONFIG[categoryKey] || "";

  const formSection = document.getElementById("form-section");
  formSection.classList.remove("hidden");
  
  setTimeout(() => {
    formSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

// متغير حفظ صورة المتقدم بصيغة Base64
let selectedPhotoData = null;

/**
 * دالة اختيار ومعاينة الصورة
 */
function handlePhotoSelect(event) {
  const fileInput = event.target;
  const file = fileInput.files[0];
  
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('يرجى اختيار صورة صالحة (PNG, JPG, WebP, GIF)');
    fileInput.value = '';
    return;
  }

  // الحد الأقصى 5 ميجابايت
  if (file.size > 5 * 1024 * 1024) {
    alert('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.');
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const base64String = dataUrl.split(',')[1];
    
    selectedPhotoData = {
      base64: base64String,
      fileName: file.name,
      mimeType: file.type
    };

    const previewImg = document.getElementById('photo-preview-img');
    const fileNameText = document.getElementById('file-name-text');
    const previewBox = document.getElementById('file-preview-box');
    const customBtn = document.getElementById('file-custom-btn');

    if (previewImg) previewImg.src = dataUrl;
    if (fileNameText) fileNameText.innerText = file.name + ` (${(file.size / 1024).toFixed(1)} KB)`;
    if (previewBox) previewBox.classList.remove('hidden');
    if (customBtn) customBtn.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

/**
 * دالة إزالة الصورة المختارة
 */
function removeSelectedPhoto() {
  selectedPhotoData = null;
  const fileInput = document.getElementById('photoInput');
  const previewBox = document.getElementById('file-preview-box');
  const customBtn = document.getElementById('file-custom-btn');

  if (fileInput) fileInput.value = '';
  if (previewBox) previewBox.classList.add('hidden');
  if (customBtn) customBtn.classList.remove('hidden');
}

/**
 * دالة إرسال بيانات النموذج لـ Google Apps Script
 */
function submitForm(event) {
  event.preventDefault();

  if (!appsScriptUrl) {
    showStatusMessage("error", "لم يتم ربط لوحة التحكم برابط Apps Script الخاص بك. يرجى تهيئة الرابط أولاً في لوحة تحكم الإدارة (admin.html).");
    return;
  }

  const form = document.getElementById("request-form");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = submitBtn.querySelector(".btn-text");
  const btnIcon = submitBtn.querySelector(".btn-icon");
  const spinner = submitBtn.querySelector(".spinner");

  const formData = new FormData(form);
  const payload = {};
  formData.forEach((value, key) => {
    payload[key] = value.trim();
  });

  // إضافة بيانات الصورة إلى حمولة الطلب إذا تم اختيار صورة
  if (selectedPhotoData) {
    payload.photoData = selectedPhotoData;
  }

  submitBtn.disabled = true;
  btnText.innerText = "جاري إرسال طلبك وصورتك...";
  btnIcon.classList.add("hidden");
  spinner.classList.remove("hidden");

  fetch(appsScriptUrl, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("استجابة الخادم غير صالحة");
    }
    return response.json();
  })
  .then(result => {
    if (result.status === "success") {
      showStatusMessage("success", result.message);
      form.reset();
      removeSelectedPhoto();
      
      setTimeout(() => {
        document.getElementById("form-section").classList.add("hidden");
        document.querySelectorAll(".category-card").forEach(c => c.classList.remove("selected"));
        document.getElementById("categories-section").scrollIntoView({ behavior: "smooth" });
      }, 2500);
      
    } else {
      showStatusMessage("error", result.message || "حدث خطأ أثناء معالجة الطلب.");
    }
  })
  .catch(error => {
    console.error("Error submitting request:", error);
    showStatusMessage("error", "فشل في إرسال طلبك. يرجى التحقق من اتصالك بالإنترنت وصحة رابط الـ Web App المربوط.");
  })
  .finally(() => {
    submitBtn.disabled = false;
    btnText.innerText = "إرسال طلب الانضمام";
    btnIcon.classList.remove("hidden");
    spinner.classList.add("hidden");
  });
}

function showStatusMessage(type, text) {
  const statusDiv = document.getElementById("status-message");
  const contentDiv = statusDiv.querySelector(".message-content");
  const icon = statusDiv.querySelector(".message-icon");
  const msgText = statusDiv.querySelector(".message-text");

  contentDiv.className = "message-content " + type;
  
  if (type === "success") {
    icon.className = "message-icon fas fa-user-check";
    msgText.style.color = "var(--text-main)";
  } else {
    icon.className = "message-icon fas fa-user-times";
    msgText.style.color = "#f87171";
  }

  msgText.innerText = text;
  statusDiv.classList.remove("hidden");
}

function closeStatusMessage() {
  document.getElementById("status-message").classList.add("hidden");
}


/* ==========================================================================
   وظائف صفحة الإدارة (admin.html)
   ========================================================================== */

let dashboardRawData = {}; 
let activeTab = "logistics_coord"; 

function checkAdminAuth() {
  const isLoggedIn = sessionStorage.getItem("isAdminLoggedIn") === "true";
  
  const loginSection = document.getElementById("login-section");
  const dashboardSection = document.getElementById("dashboard-section");
  const logoutBtn = document.getElementById("logout-btn-container");

  if (isLoggedIn) {
    if (loginSection) loginSection.classList.add("hidden");
    if (dashboardSection) dashboardSection.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");
    
    if (appsScriptUrl) {
      fetchDashboardData();
    } else {
      showDashboardAlert("يرجى تهيئة رابط Google Apps Script بالإعدادات بالأسفل للاتصال بقاعدة بيانات الفعالية.");
    }
  } else {
    if (loginSection) loginSection.classList.remove("hidden");
    if (dashboardSection) dashboardSection.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
  }
}

function handleLogin(event) {
  event.preventDefault();
  
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;
  const errorDiv = document.getElementById("login-error");

  if (user === "admin" && pass === "admin123") {
    sessionStorage.setItem("isAdminLoggedIn", "true");
    errorDiv.classList.add("hidden");
    
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    
    checkAdminAuth();
  } else {
    errorDiv.classList.remove("hidden");
  }
}

function logout(event) {
  event.preventDefault();
  sessionStorage.removeItem("isAdminLoggedIn");
  checkAdminAuth();
}

function saveSettings() {
  const urlInput = document.getElementById("apps-script-url-input").value.trim();
  const successLabel = document.getElementById("settings-save-success");

  if (!urlInput) {
    alert("الرجاء إدخال رابط صالح!");
    return;
  }

  localStorage.setItem("appsScriptUrl", urlInput);
  appsScriptUrl = urlInput;
  
  successLabel.classList.remove("hidden");
  
  setTimeout(() => {
    successLabel.classList.add("hidden");
  }, 3000);

  fetchDashboardData();
}

function fetchDashboardData() {
  if (!appsScriptUrl) {
    showDashboardAlert("رابط Apps Script غير مهيأ.");
    return;
  }

  const refreshIcon = document.getElementById("refresh-icon");
  if (refreshIcon) refreshIcon.classList.add("fa-spin");

  fetch(appsScriptUrl, {
    method: "GET",
    mode: "cors"
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("خطأ في جلب البيانات");
    }
    return response.json();
  })
  .then(result => {
    if (result.status === "success") {
      dashboardRawData = result.data;
      updateDashboardUI();
    } else {
      alert("فشل تحديث البيانات: " + result.message);
    }
  })
  .catch(error => {
    console.error("Dashboard Fetch Error:", error);
    showDashboardAlert("فشل الاتصال بالجدول. يرجى التحقق من الرابط والتأكد من نشر الـ Web App بنجاح وإتاحة الوصول للجميع (Anyone).");
  })
  .finally(() => {
    if (refreshIcon) refreshIcon.classList.remove("fa-spin");
  });
}

function updateDashboardUI() {
  const logisticsCount = (dashboardRawData.logistics_coord || []).length;
  const techCount = (dashboardRawData.tech_stage || []).length;
  const mediaCount = (dashboardRawData.media_content || []).length;
  const totalCount = logisticsCount + techCount + mediaCount;

  document.getElementById("stat-total").innerText = totalCount;
  document.getElementById("stat-design").innerText = logisticsCount;
  document.getElementById("stat-web").innerText = techCount;
  document.getElementById("stat-marketing").innerText = mediaCount;

  let allRequests = [];
  
  if (dashboardRawData.logistics_coord) {
    dashboardRawData.logistics_coord.forEach(item => {
      allRequests.push({ ...item, _catKey: "logistics_coord", _catLabel: "إدارة الحشود والتنظيم" });
    });
  }
  if (dashboardRawData.tech_stage) {
    dashboardRawData.tech_stage.forEach(item => {
      allRequests.push({ ...item, _catKey: "tech_stage", _catLabel: "الفريق التقني والمسرح" });
    });
  }
  if (dashboardRawData.media_content) {
    dashboardRawData.media_content.forEach(item => {
      allRequests.push({ ...item, _catKey: "media_content", _catLabel: "التغطية الإعلامية" });
    });
  }

  allRequests.sort((a, b) => {
    return new Date(b["التاريخ"]) - new Date(a["التاريخ"]);
  });

  const recentList = document.getElementById("recent-requests-list");
  recentList.innerHTML = "";

  if (allRequests.length === 0) {
    recentList.innerHTML = `<li class="empty-state">لا توجد طلبات تقديم مسجلة حتى الآن</li>`;
  } else {
    const latestFive = allRequests.slice(0, 5);
    latestFive.forEach(req => {
      const li = document.createElement("li");
      li.className = "recent-item";
      li.innerHTML = `
        <div class="recent-item-info">
            <span class="recent-name">${escapeHTML(req["الاسم الكامل"])}</span>
            <span class="recent-date">${req["التاريخ"] || "غير معروف"}</span>
        </div>
        <span class="recent-badge tag-${req._catKey}">${req._catLabel}</span>
      `;
      recentList.appendChild(li);
    });
  }

  renderChart(logisticsCount, techCount, mediaCount);
  buildDetailTable();
}

function renderChart(logistics, tech, media) {
  const ctx = document.getElementById("requestsChart").getContext("2d");
  
  if (window.myRequestsChart) {
    window.myRequestsChart.destroy();
  }

  window.myRequestsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['إدارة الحشود والتنظيم', 'الفريق التقني والمسرح', 'التغطية الإعلامية'],
      datasets: [{
        data: [logistics, tech, media],
        backgroundColor: [
          '#ec4899', // وردي
          '#3b82f6', // أزرق سماوي
          '#10b981'  // أخضر زمردي
        ],
        borderColor: '#0f1524',
        borderWidth: 2,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: {
              family: 'Cairo',
              size: 11
            },
            padding: 15
          }
        }
      }
    }
  });
}

function switchTableTab(categoryKey) {
  activeTab = categoryKey;
  
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  
  document.getElementById(`tab-btn-${categoryKey}`).classList.add("active");
  
  buildDetailTable();
}

function buildDetailTable() {
  const headersRow = document.getElementById("table-headers");
  const tableBody = document.getElementById("table-body");
  const emptyState = document.getElementById("table-empty-state");
  const table = document.getElementById("data-table");

  headersRow.innerHTML = "";
  tableBody.innerHTML = "";

  const rows = dashboardRawData[activeTab] || [];

  if (rows.length === 0) {
    table.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  table.classList.remove("hidden");
  emptyState.classList.add("hidden");

  const keys = Object.keys(rows[0]).filter(k => !k.startsWith("_"));
  
  keys.forEach(key => {
    const th = document.createElement("th");
    th.innerText = key;
    headersRow.appendChild(th);
  });

  rows.forEach(rowData => {
    const tr = document.createElement("tr");
    keys.forEach(key => {
      const td = document.createElement("td");
      const cellValue = rowData[key] !== undefined ? rowData[key] : "";

      // إذا كان العمود هو "صورة مرفقة" وكانت القيمة رابطاً
      if (key === "صورة مرفقة" && cellValue && cellValue.startsWith("http")) {
        td.innerHTML = `<a href="${escapeHTML(cellValue)}" target="_blank" rel="noopener" class="table-img-link"><i class="fas fa-image"></i> عرض الصورة</a>`;
      } else {
        td.innerText = cellValue;
      }
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

function showDashboardAlert(message) {
  const recentList = document.getElementById("recent-requests-list");
  if (recentList) {
    recentList.innerHTML = `<li class="empty-state"><i class="fas fa-exclamation-triangle"></i> ${message}</li>`;
  }
  
  const tableBody = document.getElementById("table-body");
  if (tableBody) tableBody.innerHTML = "";
  
  const emptyState = document.getElementById("table-empty-state");
  if (emptyState) {
    emptyState.classList.remove("hidden");
    emptyState.querySelector("p").innerText = message;
  }
}
