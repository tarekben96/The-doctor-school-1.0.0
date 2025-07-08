// ================ بيانات افتراضية ومحلية ================
let trainees = JSON.parse(localStorage.getItem('trainees')) || [];
let specialties = JSON.parse(localStorage.getItem('specialties')) || [
    'تطوير الويب', 'تصميم جرافيك', 'محاسبة', 'إدارة أعمال', 'لغات أجنبية'
];
let schoolSettings = JSON.parse(localStorage.getItem('schoolSettings')) || {
    name: 'مدرسة الدكاترة - تبسة',
    address: 'تبسة، الجزائر',
    phone: '0123456789',
    email: 'info@doctorsschool.dz'
};
const monthNames = ["", "جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

// ================ تهيئة الصفحة والنقل بين الأقسام ================
window.addEventListener('DOMContentLoaded', function () {
    renderDashboard();
    renderReports();
    renderSettings();
    document.getElementById('showDashboardBtn').onclick = () => showSection('dashboard');
    document.getElementById('showReportsBtn').onclick = () => showSection('reports');
    document.getElementById('showSettingsBtn').onclick = () => showSection('settings');
    showSection('dashboard');
});

function showSection(id) {
    ['dashboard','reports','settings'].forEach(sec => {
        document.getElementById(sec).classList.toggle('hidden', sec!==id);
    });
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('ring-2'));
    if(id==='dashboard') document.getElementById('showDashboardBtn').classList.add('ring-2','ring-indigo-300');
    if(id==='reports') document.getElementById('showReportsBtn').classList.add('ring-2','ring-indigo-300');
    if(id==='settings') document.getElementById('showSettingsBtn').classList.add('ring-2','ring-indigo-300');
}

// ================ لوحة التحكم ================
function renderDashboard() {
    let html = `
    <div class="bg-white rounded-lg shadow-md p-3 mb-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-3">
            <h2 class="text-xl font-bold text-gray-800 mb-3 md:mb-0">إدارة المتربصين</h2>
            <button id="addTraineeBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                <i class="fas fa-plus ml-1"></i> إضافة متربص جديد
            </button>
        </div>
        <div class="flex flex-col md:flex-row gap-2 mb-2">
            <input type="text" id="searchTrainee" class="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="بحث عن متربص...">
            <select id="filterSpecialty" class="w-full border border-gray-300 rounded-lg px-3 py-2"></select>
            <select id="filterMonth" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="0">جميع الأشهر</option>
                ${monthNames.map((m,i)=>i?`<option value="${i}">${m}</option>`:'').join('')}
            </select>
        </div>
        <div class="overflow-x-auto mt-2">
            <table class="min-w-full bg-white rounded-lg overflow-hidden text-sm">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-2 py-2">#</th>
                        <th class="px-2 py-2">رقم التسجيل</th>
                        <th class="px-2 py-2">الاسم الكامل</th>
                        <th class="px-2 py-2">التخصص</th>
                        <th class="px-2 py-2">الشهر</th>
                        <th class="px-2 py-2">المطلوب</th>
                        <th class="px-2 py-2">المدفوع</th>
                        <th class="px-2 py-2">المتبقي</th>
                        <th class="px-2 py-2">الحالة</th>
                        <th class="px-2 py-2">إجراءات</th>
                    </tr>
                </thead>
                <tbody id="traineesTableBody"></tbody>
            </table>
        </div>
    </div>
    `;
    document.getElementById('dashboard').innerHTML = html;
    fillSpecialtiesSelect('filterSpecialty');
    updateTraineesTable();
    document.getElementById('addTraineeBtn').onclick = showTraineeModal;
    document.getElementById('searchTrainee').oninput = updateTraineesTable;
    document.getElementById('filterSpecialty').onchange = updateTraineesTable;
    document.getElementById('filterMonth').onchange = updateTraineesTable;
}
function fillSpecialtiesSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">جميع التخصصات</option>' +
        specialties.map(s=>`<option value="${s}">${s}</option>`).join('');
}
function updateTraineesTable() {
    const tbody = document.getElementById('traineesTableBody');
    if (!tbody) return;
    let search = document.getElementById('searchTrainee')?.value.trim().toLowerCase() || '';
    let specialty = document.getElementById('filterSpecialty')?.value || '';
    let month = parseInt(document.getElementById('filterMonth')?.value) || 0;
    let filtered = trainees.filter(t => {
        let cond = true;
        if (search) cond = cond && (t.name.toLowerCase().includes(search) || t.regNumber.toLowerCase().includes(search));
        if (specialty) cond = cond && t.specialty === specialty;
        if (month) cond = cond && t.month === month;
        return cond;
    });
    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="px-4 py-3 text-center text-gray-500">لا توجد بيانات متاحة</td></tr>`;
        return;
    }
    filtered.sort((a, b) => a.year !== b.year ? a.year - b.year : (a.month !== b.month ? a.month - b.month : a.name.localeCompare(b.name)));
    filtered.forEach((t, i) => {
        let tr = document.createElement('tr');
        tr.className = i % 2 === 0 ? 'bg-gray-50' : 'bg-white';
        tr.innerHTML = `
            <td class="px-2 py-2">${i + 1}</td>
            <td class="px-2 py-2">${t.regNumber}</td>
            <td class="px-2 py-2">${t.name}</td>
            <td class="px-2 py-2">${t.specialty}</td>
            <td class="px-2 py-2">${monthNames[t.month]} ${t.year}</td>
            <td class="px-2 py-2">${t.requiredAmount.toLocaleString()} دج</td>
            <td class="px-2 py-2">${t.paidAmount.toLocaleString()} دج</td>
            <td class="px-2 py-2">${t.remainingAmount.toLocaleString()} دج</td>
            <td class="px-2 py-2">${t.status || ''}</td>
            <td class="px-2 py-2">
                <button class="text-blue-600" onclick="window.editTrainee('${t.id}')"><i class="fas fa-edit"></i></button>
                <button class="text-red-600" onclick="window.deleteTrainee('${t.id}')"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ================ إضافة/تعديل متربص ================
function showTraineeModal(editObj=null) {
    let specialtiesOptions = specialties.map(s => `<option value="${s}">${s}</option>`).join('');
    let monthsOptions = monthNames.map((m, i) => i ? `<option value="${i}">${m}</option>` : '').join('');
    let yearsOptions = [2023,2024,2025].map(y => `<option value="${y}">${y}</option>`).join('');
    let t = editObj || {};
    let html = `
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-2 relative animate-fadeIn">
        <div class="p-4">
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-bold text-gray-800" id="modalTitle">${editObj?'تعديل':'إضافة'} متربص</h3>
                <button id="closeTraineeModal" class="text-gray-500 hover:text-gray-700"><i class="fas fa-times"></i></button>
            </div>
            <form id="traineeForm">
                <input type="hidden" id="traineeId" value="${t.id||''}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <div>
                        <label class="block text-gray-700 mb-1">رقم التسجيل</label>
                        <input type="text" id="traineeRegNumber" class="w-full border border-gray-300 rounded-lg px-3 py-2" required value="${t.regNumber||''}">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-1">الاسم الكامل</label>
                        <input type="text" id="traineeName" class="w-full border border-gray-300 rounded-lg px-3 py-2" required value="${t.name||''}">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-1">التخصص</label>
                        <select id="traineeSpecialty" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>${specialtiesOptions}</select>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-1">الشهر</label>
                        <select id="traineeMonth" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>${monthsOptions}</select>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-1">السنة</label>
                        <select id="traineeYear" class="w-full border border-gray-300 rounded-lg px-3 py-2" required>${yearsOptions}</select>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-1">المبلغ المطلوب (دج)</label>
                        <input type="number" id="traineeRequiredAmount" class="w-full border border-gray-300 rounded-lg px-3 py-2" required value="${t.requiredAmount||''}">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-1">المبلغ المدفوع (دج)</label>
                        <input type="number" id="traineePaidAmount" class="w-full border border-gray-300 rounded-lg px-3 py-2" required value="${t.paidAmount||''}">
                    </div>
                </div>
                <div class="flex justify-end gap-2 mt-3">
                    <button type="button" id="cancelTraineeBtn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">إلغاء</button>
                    <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">حفظ</button>
                </div>
            </form>
        </div>
    </div>
    `;
    let modal = document.getElementById('traineeModal');
    modal.innerHTML = html;
    modal.classList.remove('hidden');
    modal.onclick = function(e){ if(e.target==modal) closeTraineeModal(); }
    document.getElementById('closeTraineeModal').onclick = closeTraineeModal;
    document.getElementById('cancelTraineeBtn').onclick = closeTraineeModal;
    document.getElementById('traineeSpecialty').value = t.specialty||specialties[0];
    document.getElementById('traineeMonth').value = t.month||1;
    document.getElementById('traineeYear').value = t.year||2024;
    document.getElementById('traineeForm').onsubmit = saveTrainee;
}
function closeTraineeModal() {
    let modal = document.getElementById('traineeModal');
    modal.innerHTML = '';
    modal.classList.add('hidden');
}
function saveTrainee(e) {
    e.preventDefault();
    let traineeId = document.getElementById('traineeId').value;
    let regNumber = document.getElementById('traineeRegNumber').value.trim();
    let name = document.getElementById('traineeName').value.trim();
    let specialty = document.getElementById('traineeSpecialty').value;
    let month = parseInt(document.getElementById('traineeMonth').value);
    let year = parseInt(document.getElementById('traineeYear').value);
    let requiredAmount = parseFloat(document.getElementById('traineeRequiredAmount').value);
    let paidAmount = parseFloat(document.getElementById('traineePaidAmount').value);
    let remainingAmount = requiredAmount - paidAmount;
    let status = paidAmount === 0 ? 'لم يدفع' : (paidAmount >= requiredAmount ? 'دفع كلي' : 'دفع جزئي');
    let trainee = {
        id: traineeId || Date.now().toString(),
        regNumber, name, specialty,
        month, year,
        requiredAmount, paidAmount, remainingAmount, status
    };
    if (traineeId) {
        let idx = trainees.findIndex(t => t.id === traineeId);
        if (idx !== -1) trainees[idx] = trainee;
    } else {
        trainees.push(trainee);
    }
    localStorage.setItem('trainees', JSON.stringify(trainees));
    closeTraineeModal();
    updateTraineesTable();
}

// تعديل متربص
window.editTrainee = function (id) {
    let t = trainees.find(t => t.id === id);
    if (!t) return;
    showTraineeModal(t);
};

// حذف متربص
window.deleteTrainee = function (id) {
    if (!confirm('هل أنت متأكد من حذف هذا المتربص؟')) return;
    trainees = trainees.filter(t => t.id !== id);
    localStorage.setItem('trainees', JSON.stringify(trainees));
    updateTraineesTable();
};

// ================ التقارير ================
function renderReports() {
    document.getElementById('reports').innerHTML = `
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">التقارير الشهرية</h2>
        <div class="text-gray-600">سيتم تطوير التقارير لاحقاً. يمكنك التعديل حسب حاجتك.</div>
    </div>
    `;
}

// ================ الإعدادات ================
function renderSettings() {
    let specialtiesRows = specialties.map(sp =>
        `<div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
            <span>${sp}</span>
            <button class="text-red-600 hover:text-red-800" onclick="window.removeSpecialty('${sp}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>`
    ).join('');
    document.getElementById('settings').innerHTML = `
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">إعدادات النظام</h2>
        <form id="schoolSettingsForm">
            <div class="mb-2">
                <label class="block text-gray-700 mb-1">اسم المؤسسة</label>
                <input type="text" id="schoolName" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="${schoolSettings.name}">
            </div>
            <div class="mb-2">
                <label class="block text-gray-700 mb-1">عنوان المؤسسة</label>
                <input type="text" id="schoolAddress" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="${schoolSettings.address}">
            </div>
            <div class="mb-2">
                <label class="block text-gray-700 mb-1">رقم الهاتف</label>
                <input type="text" id="schoolPhone" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="${schoolSettings.phone}">
            </div>
            <div class="mb-2">
                <label class="block text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" id="schoolEmail" class="w-full border border-gray-300 rounded-lg px-3 py-2" value="${schoolSettings.email}">
            </div>
            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">حفظ الإعدادات</button>
        </form>
        <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">إدارة التخصصات</h3>
            <div class="flex mb-2">
                <input type="text" id="newSpecialty" class="w-full border border-gray-300 rounded-r-lg px-3 py-2" placeholder="اسم التخصص">
                <button id="addSpecialtyBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-l-lg hover:bg-indigo-700">إضافة</button>
            </div>
            <div id="specialtiesList" class="border border-gray-300 rounded-lg p-2 max-h-44 overflow-y-auto">${specialtiesRows}</div>
        </div>
        <div class="mt-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">إدارة البيانات</h3>
            <div class="flex gap-2">
                <button id="exportDataBtn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    <i class="fas fa-download ml-1"></i> تصدير البيانات
                </button>
                <button id="importDataBtn" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <i class="fas fa-upload ml-1"></i> استيراد البيانات
                </button>
                <input type="file" id="importDataFile" class="hidden" accept=".json">
                <button id="clearDataBtn" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                    <i class="fas fa-trash-alt ml-1"></i> مسح جميع البيانات
                </button>
            </div>
        </div>
    </div>
    `;
    document.getElementById('schoolSettingsForm').onsubmit = saveSchoolSettings;
    document.getElementById('addSpecialtyBtn').onclick = addSpecialty;
    document.getElementById('exportDataBtn').onclick = exportData;
    document.getElementById('importDataBtn').onclick = () => document.getElementById('importDataFile').click();
    document.getElementById('importDataFile').onchange = importData;
    document.getElementById('clearDataBtn').onclick = clearData;
}
function addSpecialty() {
    const input = document.getElementById('newSpecialty');
    let val = input.value.trim();
    if (val && !specialties.includes(val)) {
        specialties.push(val);
        localStorage.setItem('specialties', JSON.stringify(specialties));
        renderSettings();
        renderDashboard();
    }
    input.value = '';
}
window.removeSpecialty = function (specialty) {
    specialties = specialties.filter(s => s !== specialty);
    localStorage.setItem('specialties', JSON.stringify(specialties));
    renderSettings();
    renderDashboard();
};
function saveSchoolSettings(e) {
    e.preventDefault();
    schoolSettings = {
        name: document.getElementById('schoolName').value,
        address: document.getElementById('schoolAddress').value,
        phone: document.getElementById('schoolPhone').value,
        email: document.getElementById('schoolEmail').value
    };
    localStorage.setItem('schoolSettings', JSON.stringify(schoolSettings));
    alert('تم حفظ إعدادات المؤسسة!');
    renderSettings();
}
function exportData() {
    const data = { trainees, specialties, schoolSettings };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'school_payments_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const data = JSON.parse(evt.target.result);
            if (data.trainees && data.specialties && data.schoolSettings) {
                trainees = data.trainees;
                specialties = data.specialties;
                schoolSettings = data.schoolSettings;
                localStorage.setItem('trainees', JSON.stringify(trainees));
                localStorage.setItem('specialties', JSON.stringify(specialties));
                localStorage.setItem('schoolSettings', JSON.stringify(schoolSettings));
                alert('تم استيراد البيانات بنجاح!');
                location.reload();
            } else {
                alert('ملف البيانات غير صالح');
            }
        } catch {
            alert('حدث خطأ أثناء قراءة الملف!');
        }
    };
    reader.readAsText(file);
}
function clearData() {
    if (confirm('هل تريد حذف جميع البيانات؟')) {
        localStorage.removeItem('trainees');
        localStorage.removeItem('specialties');
        localStorage.removeItem('schoolSettings');
        location.reload();
    }
}
