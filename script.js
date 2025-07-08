// ================== تهيئة البيانات ==================
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

// ================== تهيئة الصفحة ==================
window.addEventListener('DOMContentLoaded', function () {
    renderDashboard();
    renderReports();
    renderSettings();
    // تفعيل التنقل بين الأقسام
    document.getElementById('showDashboardBtn').onclick = () => showSection('dashboard');
    document.getElementById('showReportsBtn').onclick = () => showSection('reports');
    document.getElementById('showSettingsBtn').onclick = () => showSection('settings');
    showSection('dashboard');
});

function showSection(id) {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('reports').classList.add('hidden');
    document.getElementById('settings').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
}

// ================== لوحة التحكم ==================
function renderDashboard() {
    let html = `
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4 md:mb-0">إدارة المتربصين</h2>
            <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse">
                <button id="addTraineeBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    <i class="fas fa-plus ml-1"></i> إضافة متربص جديد
                </button>
            </div>
        </div>
        <div class="mb-6">
            <div class="flex flex-col md:flex-row justify-between items-center mb-4">
                <div class="w-full md:w-1/3 mb-4 md:mb-0">
                    <label for="searchTrainee" class="block text-gray-700 mb-2">بحث عن متربص</label>
                    <input type="text" id="searchTrainee" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="اكتب اسم المتربص أو رقم التسجيل...">
                </div>
                <div class="w-full md:w-1/3 mb-4 md:mb-0 md:mx-4">
                    <label for="filterSpecialty" class="block text-gray-700 mb-2">تصفية حسب التخصص</label>
                    <select id="filterSpecialty" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"></select>
                </div>
                <div class="w-full md:w-1/3">
                    <label for="filterMonth" class="block text-gray-700 mb-2">تصفية حسب الشهر</label>
                    <select id="filterMonth" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="0">جميع الأشهر</option>
                        <option value="1">جانفي</option>
                        <option value="2">فيفري</option>
                        <option value="3">مارس</option>
                        <option value="4">أفريل</option>
                        <option value="5">ماي</option>
                        <option value="6">جوان</option>
                        <option value="7">جويلية</option>
                        <option value="8">أوت</option>
                        <option value="9">سبتمبر</option>
                        <option value="10">أكتوبر</option>
                        <option value="11">نوفمبر</option>
                        <option value="12">ديسمبر</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white rounded-lg overflow-hidden">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-4 py-3 text-right text-gray-700">#</th>
                        <th class="px-4 py-3 text-right text-gray-700">رقم التسجيل</th>
                        <th class="px-4 py-3 text-right text-gray-700">الاسم الكامل</th>
                        <th class="px-4 py-3 text-right text-gray-700">التخصص</th>
                        <th class="px-4 py-3 text-right text-gray-700">الشهر</th>
                        <th class="px-4 py-3 text-right text-gray-700">المبلغ المطلوب</th>
                        <th class="px-4 py-3 text-right text-gray-700">المبلغ المدفوع</th>
                        <th class="px-4 py-3 text-right text-gray-700">المتبقي</th>
                        <th class="px-4 py-3 text-right text-gray-700">الحالة</th>
                        <th class="px-4 py-3 text-right text-gray-700">الإجراءات</th>
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

// ========== تعبئة خيارات التخصصات ==========
function fillSpecialtiesSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '';
    if (selectId === 'filterSpecialty') {
        const op = document.createElement('option');
        op.value = '';
        op.textContent = 'جميع التخصصات';
        select.appendChild(op);
    }
    specialties.forEach(sp => {
        const op = document.createElement('option');
        op.value = sp;
        op.textContent = sp;
        select.appendChild(op);
    });
}

// ========== جدول المتربصين ==========
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
            <td class="px-4 py-3 text-gray-800">${i + 1}</td>
            <td class="px-4 py-3 text-gray-800">${t.regNumber}</td>
            <td class="px-4 py-3 text-gray-800">${t.name}</td>
            <td class="px-4 py-3 text-gray-800">${t.specialty}</td>
            <td class="px-4 py-3 text-gray-800">${monthNames[t.month]} ${t.year}</td>
            <td class="px-4 py-3 text-gray-800">${t.requiredAmount.toLocaleString()} دج</td>
            <td class="px-4 py-3 text-gray-800">${t.paidAmount.toLocaleString()} دج</td>
            <td class="px-4 py-3 text-gray-800">${t.remainingAmount.toLocaleString()} دج</td>
            <td class="px-4 py-3">${t.status || ''}</td>
            <td class="px-4 py-3"><button class="text-blue-600" onclick="window.editTrainee('${t.id}')"><i class="fas fa-edit"></i></button>
            <button class="text-red-600" onclick="window.deleteTrainee('${t.id}')"><i class="fas fa-trash-alt"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

// ========== إضافة/تعديل متربص ==========
function showTraineeModal() {
    let specialtiesOptions = specialties.map(s => `<option value="${s}">${s}</option>`).join
