/**
 * Main JavaScript File - Auro Verse Event Recruitment & Entry Portal
 * Handles application forms and the administrator review dashboard.
 */

// Default deployed Apps Script Web App URL
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzLF_qoD0HwnkaNi-52ntLBfaARzWsHoMbUa9vKSiFXYt3gNYuBPXfmRb-8IfdLADdN/exec";

let appsScriptUrl = localStorage.getItem("appsScriptUrl");

// Check for old URL hashes and enforce default if found or empty
const OLD_URLS = [
  "AKfycbyTXIwoY0aHy6NaIvSKmlKOmGLx0wpx7JqGfw6UhVG8wX6YTME0S9LjHFq7rc4owLcv",
  "AKfycbzOPpVGWK09ueExj_UGJki6fJXWF_iQjU6JnNi2aBMgrnJjRU3tu-NxVec-xu2II-7g",
  "AKfycbwIlNC6CAuLWdhMqfLgZ9f9IeS0rVKPqpSh0U5Z-gE1lGpjblE94tUvhaVcbl3ya22g",
  "AKfycbx4oEpycPphJqxFMXkvc560gSaDFJqd5byknWwD3J-JlAGFkIBPa9XPcTgCltutyPNv",
  "AKfycbwP9bVhKAgeWe8ChXFNM1VcikU6--U9aUIvMVsNPFpuKVpyOxfI-spJ4k7botJpjpWw"
];
const isOldUrl = OLD_URLS.some(old => appsScriptUrl && appsScriptUrl.includes(old));

if (!appsScriptUrl || appsScriptUrl.trim() === "" || appsScriptUrl === "null" || appsScriptUrl === "undefined" || isOldUrl) {
  appsScriptUrl = DEFAULT_APPS_SCRIPT_URL;
  localStorage.setItem("appsScriptUrl", DEFAULT_APPS_SCRIPT_URL);
}

// Config dynamic form fields for each category
const DYNAMIC_FIELDS_CONFIG = {
  "classic_cars": `
    <div class="form-group animate-fade-in">
        <label for="vehicleModel"><i class="fas fa-car"></i> Vehicle Brand & Model <span class="required">*</span></label>
        <input type="text" id="vehicleModel" name="vehicleModel" required placeholder="e.g. Ford Mustang Fastback">
    </div>
    <div class="form-group animate-fade-in">
        <label for="vehicleYear"><i class="fas fa-calendar-alt"></i> Year of Production <span class="required">*</span></label>
        <input type="number" id="vehicleYear" name="vehicleYear" required min="1900" max="2027" placeholder="e.g. 1967">
    </div>
    <div class="form-group animate-fade-in full-width">
        <label for="vehicleMods"><i class="fas fa-tools"></i> Modifications or Condition Details (Optional)</label>
        <textarea id="vehicleMods" name="vehicleMods" placeholder="Describe any customization, parts added, or if the car is in factory original condition..."></textarea>
    </div>
  `,
  "exotic_cars": `
    <div class="form-group animate-fade-in">
        <label for="vehicleModel"><i class="fas fa-bolt"></i> Vehicle Brand & Model <span class="required">*</span></label>
        <input type="text" id="vehicleModel" name="vehicleModel" required placeholder="e.g. Lamborghini Aventador SVJ">
    </div>
    <div class="form-group animate-fade-in">
        <label for="vehicleYear"><i class="fas fa-calendar-alt"></i> Year of Production <span class="required">*</span></label>
        <input type="number" id="vehicleYear" name="vehicleYear" required min="2000" max="2027" placeholder="e.g. 2022">
    </div>
    <div class="form-group animate-fade-in full-width">
        <label for="vehicleMods"><i class="fas fa-tools"></i> Exclusive Features & Upgrades (Optional)</label>
        <textarea id="vehicleMods" name="vehicleMods" placeholder="e.g. Carbon fiber package, custom racing exhaust, custom wrap, ECU tune..."></textarea>
    </div>
  `,
  "sport_cars": `
    <div class="form-group animate-fade-in">
        <label for="vehicleModel"><i class="fas fa-tachometer-alt"></i> Vehicle Brand & Model <span class="required">*</span></label>
        <input type="text" id="vehicleModel" name="vehicleModel" required placeholder="e.g. Toyota Supra MK4 / BMW M4">
    </div>
    <div class="form-group animate-fade-in">
        <label for="vehicleYear"><i class="fas fa-calendar-alt"></i> Year of Production <span class="required">*</span></label>
        <input type="number" id="vehicleYear" name="vehicleYear" required min="1980" max="2027" placeholder="e.g. 1998">
    </div>
    <div class="form-group animate-fade-in full-width">
        <label for="vehicleMods"><i class="fas fa-cogs"></i> Performance & Mechanical Tuning (Optional)</label>
        <textarea id="vehicleMods" name="vehicleMods" placeholder="e.g. Coilovers, widebody kit, turbo upgrades, intake system..."></textarea>
    </div>
  `,
  "motorcycles": `
    <div class="form-group animate-fade-in">
        <label for="vehicleModel"><i class="fas fa-motorcycle"></i> Motorcycle Brand & Model <span class="required">*</span></label>
        <input type="text" id="vehicleModel" name="vehicleModel" required placeholder="e.g. Yamaha R1M / Harley Davidson">
    </div>
    <div class="form-group animate-fade-in">
        <label for="vehicleYear"><i class="fas fa-calendar-alt"></i> Year of Production <span class="required">*</span></label>
        <input type="number" id="vehicleYear" name="vehicleYear" required min="1900" max="2027" placeholder="e.g. 2023">
    </div>
    <div class="form-group animate-fade-in full-width">
        <label for="vehicleMods"><i class="fas fa-paint-brush"></i> Modifications & Add-ons (Optional)</label>
        <textarea id="vehicleMods" name="vehicleMods" placeholder="Detail any aftermarket exhaust, custom fairings, paint jobs, or custom accessories..."></textarea>
    </div>
  `,
  "organizers": `
    <div class="form-group animate-fade-in">
        <label for="preferredRole"><i class="fas fa-id-badge"></i> Preferred Organizing Role <span class="required">*</span></label>
        <select id="preferredRole" name="preferredRole" required>
            <option value="" disabled selected>Select from list...</option>
            <option value="Vehicle routing & slotting">Vehicle routing & slotting</option>
            <option value="Crowd control & seating">Crowd control & seating</option>
            <option value="Technical support & power logistics">Technical support & power logistics</option>
            <option value="VIP greeting & guest relations">VIP greeting & guest relations</option>
            <option value="Gate entry & registration">Gate entry & registration</option>
        </select>
    </div>
    <div class="form-group animate-fade-in">
        <label for="orgExperience"><i class="fas fa-history"></i> Experience in Event Management / Car Shows <span class="required">*</span></label>
        <textarea id="orgExperience" name="orgExperience" required placeholder="Describe any previous event coordination or motor shows you organized..."></textarea>
    </div>
    <div class="form-group animate-fade-in full-width">
        <label for="additionalNotes"><i class="fas fa-file-medical"></i> Special Skills or Additional Notes (Optional)</label>
        <input type="text" id="additionalNotes" name="additionalNotes" placeholder="e.g. First aid certified, speak multiple languages, towing license, etc...">
    </div>
  `
};

// Friendly Category Names for UI and Table titles
const CATEGORY_NAMES = {
  "classic_cars": "Classic Cars",
  "exotic_cars": "Exotic Cars",
  "sport_cars": "Sport Cars",
  "motorcycles": "Motorcycles",
  "organizers": "Organizers"
};

// Initialize scripts
document.addEventListener("DOMContentLoaded", function() {
  
  // 1. Client form page
  if (document.getElementById("request-form")) {
    console.log("Auro Verse Entry Portal initialized.");
  }

  // 2. Admin dashboard page
  if (document.getElementById("login-form") || document.getElementById("dashboard-section")) {
    checkAdminAuth();
    
    const scriptInput = document.getElementById("apps-script-url-input");
    if (scriptInput && appsScriptUrl) {
      scriptInput.value = appsScriptUrl;
    }
  }
});

/* ==========================================================================
   Client Portal Logic (index.html)
   ========================================================================== */

/**
 * Handle category card click and show form
 */
function selectCategory(categoryKey) {
  document.querySelectorAll(".wide-category-btn").forEach(card => {
    card.classList.remove("selected");
  });

  const selectedCard = document.querySelector(`.wide-category-btn[data-category="${categoryKey}"]`);
  if (selectedCard) {
    selectedCard.classList.add("selected");
  }

  document.getElementById("selected-category").value = categoryKey;

  const categoryTag = document.getElementById("category-tag");
  categoryTag.innerText = CATEGORY_NAMES[categoryKey];
  
  categoryTag.className = "form-category-tag"; 
  categoryTag.classList.add(`tag-${categoryKey}`);

  document.getElementById("form-title").innerText = `Apply for ${CATEGORY_NAMES[categoryKey]}`;

  // Dynamically change photo field label based on category (organizer vs vehicle)
  const photoInputLabel = document.getElementById("photoInputLabel");
  const uploadBtnText = document.getElementById("upload-btn-text");
  
  if (categoryKey === "organizers") {
    if (photoInputLabel) photoInputLabel.innerHTML = '<i class="fas fa-camera"></i> Your Personal Photo (Required)';
    if (uploadBtnText) uploadBtnText.innerText = "Click here to upload your headshot (PNG, JPG, WebP)";
  } else {
    if (photoInputLabel) photoInputLabel.innerHTML = '<i class="fas fa-camera"></i> Vehicle Image (Required for evaluation)';
    if (uploadBtnText) uploadBtnText.innerText = "Click here to upload your vehicle photo (PNG, JPG, WebP)";
  }

  const dynamicContainer = document.getElementById("dynamic-fields-container");
  dynamicContainer.innerHTML = DYNAMIC_FIELDS_CONFIG[categoryKey] || "";

  const formSection = document.getElementById("form-section");
  formSection.classList.remove("hidden");
  
  setTimeout(() => {
    formSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

// Stores file payload as Base64 object
let selectedPhotoData = null;

/**
 * Handle file input selection and preview
 */
function handlePhotoSelect(event) {
  const fileInput = event.target;
  const file = fileInput.files[0];
  
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, WebP, GIF)');
    fileInput.value = '';
    return;
  }

  // Max 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    alert('File size exceeds the 5MB limit. Please upload a smaller image.');
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
 * Remove selected photo file
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
 * Handle form submission
 */
function submitForm(event) {
  event.preventDefault();

  if (!appsScriptUrl) {
    showStatusMessage("error", "Apps Script endpoint is not configured. Please save your Web App URL in the Admin Dashboard.");
    return;
  }

  // Enforce image attachment
  if (!selectedPhotoData) {
    alert("Please upload a photo (vehicle image for cars/bikes, or personal headshot for organizers) to submit your request.");
    return;
  }

  // Enforce category selection
  const categoryValue = document.getElementById("selected-category").value;
  if (!categoryValue || categoryValue.trim() === "") {
    alert("Please select a registration category before submitting.");
    return;
  }

  const form = document.getElementById("request-form");
  const submitBtn = document.getElementById("submit-btn");
  const btnText = submitBtn.querySelector(".btn-text");
  const spinner = submitBtn.querySelector(".spinner");

  const formData = new FormData(form);
  const payload = {};
  formData.forEach((value, key) => {
    // Skip File objects (e.g. photoInput) — handled separately via selectedPhotoData
    if (value instanceof File) return;
    payload[key] = typeof value === "string" ? value.trim() : value;
  });

  // Always enforce category from the DOM directly (belt-and-suspenders)
  payload.category = categoryValue.trim();
  payload.photoData = selectedPhotoData;

  // DEBUG — remove after fix confirmed
  console.log("📤 Sending category:", payload.category);
  console.log("🔗 Sending to URL:", appsScriptUrl);

  submitBtn.disabled = true;
  btnText.innerText = "Submitting application...";
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
      throw new Error("Server responded with error status");
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
        document.querySelectorAll(".wide-category-btn").forEach(c => c.classList.remove("selected"));
        document.getElementById("categories-section").scrollIntoView({ behavior: "smooth" });
      }, 2500);
      
    } else {
      showStatusMessage("error", result.message || "Failed to save submission data.");
    }
  })
  .catch(error => {
    console.error("Error submitting request:", error);
    showStatusMessage("error", "Failed to submit. Please verify internet connectivity and Apps Script connection settings.");
  })
  .finally(() => {
    submitBtn.disabled = false;
    btnText.innerText = "Submit Application";
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
   Administrator Dashboard Logic (admin.html)
   ========================================================================== */

let dashboardRawData = {}; 
let activeTab = "classic_cars"; 

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
      showDashboardAlert("Please save your Google Apps Script Web App URL in the settings card below to sync event files.");
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
    alert("Please enter a valid URL!");
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
    showDashboardAlert("Web App URL is empty.");
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
      throw new Error("HTTP error retrieving rows");
    }
    return response.json();
  })
  .then(result => {
    if (result.status === "success") {
      dashboardRawData = result.data;
      updateDashboardUI();
    } else {
      alert("Error refreshing rows: " + result.message);
    }
  })
  .catch(error => {
    console.error("Dashboard Fetch Error:", error);
    showDashboardAlert("Connection to database sheets failed. Ensure the Web App is deployed as 'Anyone' and CORS is active.");
  })
  .finally(() => {
    if (refreshIcon) refreshIcon.classList.remove("fa-spin");
  });
}

function updateDashboardUI() {
  // Read array bounds for statistics count
  const classicCount = (dashboardRawData.classic_cars || []).length;
  const exoticCount = (dashboardRawData.exotic_cars || []).length;
  const sportCount = (dashboardRawData.sport_cars || []).length;
  const motorcyclesCount = (dashboardRawData.motorcycles || []).length;
  const organizersCount = (dashboardRawData.organizers || []).length;
  const totalCount = classicCount + exoticCount + sportCount + motorcyclesCount + organizersCount;

  document.getElementById("stat-total").innerText = totalCount;
  document.getElementById("stat-classic_cars").innerText = classicCount;
  document.getElementById("stat-exotic_cars").innerText = exoticCount;
  document.getElementById("stat-sport_cars").innerText = sportCount;
  document.getElementById("stat-motorcycles").innerText = motorcyclesCount;
  document.getElementById("stat-organizers").innerText = organizersCount;

  let allRequests = [];
  
  if (dashboardRawData.classic_cars) {
    dashboardRawData.classic_cars.forEach(item => {
      allRequests.push({ ...item, _catKey: "classic_cars", _catLabel: "Classic Cars" });
    });
  }
  if (dashboardRawData.exotic_cars) {
    dashboardRawData.exotic_cars.forEach(item => {
      allRequests.push({ ...item, _catKey: "exotic_cars", _catLabel: "Exotic Cars" });
    });
  }
  if (dashboardRawData.sport_cars) {
    dashboardRawData.sport_cars.forEach(item => {
      allRequests.push({ ...item, _catKey: "sport_cars", _catLabel: "Sport Cars" });
    });
  }
  if (dashboardRawData.motorcycles) {
    dashboardRawData.motorcycles.forEach(item => {
      allRequests.push({ ...item, _catKey: "motorcycles", _catLabel: "Motorcycles" });
    });
  }
  if (dashboardRawData.organizers) {
    dashboardRawData.organizers.forEach(item => {
      allRequests.push({ ...item, _catKey: "organizers", _catLabel: "Organizers" });
    });
  }

  // Sort by entry Timestamp / Date descending
  allRequests.sort((a, b) => {
    var dateA = a["Timestamp"] || a["التاريخ"] || "";
    var dateB = b["Timestamp"] || b["التاريخ"] || "";
    return new Date(dateB) - new Date(dateA);
  });

  const recentList = document.getElementById("recent-requests-list");
  recentList.innerHTML = "";

  if (allRequests.length === 0) {
    recentList.innerHTML = `<li class="empty-state">No entries registered yet</li>`;
  } else {
    const latestFive = allRequests.slice(0, 5);
    latestFive.forEach(req => {
      const nameVal = req["Full Name"] || req["الاسم الكامل"] || "Unknown";
      const dateVal = req["Timestamp"] || req["التاريخ"] || "N/A";
      const li = document.createElement("li");
      li.className = "recent-item";
      li.innerHTML = `
        <div class="recent-item-info">
            <span class="recent-name">${escapeHTML(nameVal)}</span>
            <span class="recent-date">${dateVal}</span>
        </div>
        <span class="recent-badge tag-${req._catKey}">${req._catLabel}</span>
      `;
      recentList.appendChild(li);
    });
  }

  renderChart(classicCount, exoticCount, sportCount, motorcyclesCount, organizersCount);
  buildDetailTable();
}

function renderChart(classic, exotic, sport, motorcycles, organizers) {
  const ctx = document.getElementById("requestsChart").getContext("2d");
  
  if (window.myRequestsChart) {
    window.myRequestsChart.destroy();
  }

  window.myRequestsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Classic Cars', 'Exotic Cars', 'Sport Cars', 'Motorcycles', 'Organizers'],
      datasets: [{
        data: [classic, exotic, sport, motorcycles, organizers],
        backgroundColor: [
          '#f59e0b', // Amber
          '#d946ef', // Magenta
          '#06b6d4', // Cyan
          '#ef4444', // Red
          '#10b981'  // Emerald
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
  
  const tabBtn = document.getElementById(`tab-btn-${categoryKey}`);
  if (tabBtn) tabBtn.classList.add("active");
  
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

  // Filter internal Javascript descriptors starting with underscores
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

      // Handle attached image file URLs
      const isPhotoHeader = key === "Attached Photo" || key === "صورة مرفقة";
      if (isPhotoHeader && cellValue && cellValue.startsWith("http")) {
        td.innerHTML = `<a href="${escapeHTML(cellValue)}" target="_blank" rel="noopener" class="table-img-link"><i class="fas fa-image"></i> View Image</a>`;
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
