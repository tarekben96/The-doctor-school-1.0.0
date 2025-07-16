// ================ البيانات الافتراضية ===================
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

// ================ عرض أقسام الواجهة ===================
function showSection(sectionId) {
    ['dashboardSection', 'reportsSection', 'settingsSection'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(sectionId).style.display = '';

    if (sectionId === 'dashboardSection') {
        document.getElementById('traineesTableSection').style.display = '';
        renderDashboard(); // ✅ ضروري لإظهار البيانات
    } else {
        document.getElementById('traineesTableSection').style.display = 'none';
    }

    if (sectionId === 'reportsSection') {
        renderReports();
    }
}
// ================ عرض لوحة التحكم ===================
function renderDashboard() {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
    <div class="bg-white rounded-lg shadow-md p-3 mb-4">
        <div class="flex flex-col md:flex-row justify-between items-center mb-3">
            <h2 class="text-xl font-bold text-gray-800 mb-3 md:mb-0">إدارة المتربصين</h2>
            <button id="addTraineeBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                <i class="fas fa-plus ml-1"></i> إضافة متربص جديد
            </button>
        </div>
        <div class="flex flex-col md:flex-row gap-2 mb-2">
            <input type="text" id="searchTrainee" class="w-full border rounded-lg px-3 py-2" placeholder="بحث عن متربص...">
            <select id="filterSpecialty" class="w-full border rounded-lg px-3 py-2"></select>
            <select id="filterMonth" class="w-full border rounded-lg px-3 py-2">
                <option value="0">جميع الأشهر</option>
                ${monthNames.map((m,i)=>i?`<option value="${i}">${m}</option>`:'').join('')}
            </select>
        </div>
        <div class="overflow-x-auto mt-2">
            <table class="min-w-full text-sm bg-white rounded-lg overflow-hidden">
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
    fillSpecialtiesSelect('filterSpecialty');
    updateTraineesTable();

    document.getElementById('addTraineeBtn').onclick = () => showTraineeModal();
    document.getElementById('searchTrainee').oninput = updateTraineesTable;
    document.getElementById('filterSpecialty').onchange = updateTraineesTable;
    document.getElementById('filterMonth').onchange = updateTraineesTable;
}

// ================ التخصصات ===================
function fillSpecialtiesSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">جميع التخصصات</option>' +
        specialties.map(s=>`<option value="${s}">${s}</option>`).join('');
}

// ================ عرض المتربصين ===================
function updateTraineesTable() {
    const tbody = document.getElementById('traineesTableBody');
    const search = document.getElementById('searchTrainee').value.trim().toLowerCase();
    const specialty = document.getElementById('filterSpecialty').value;
    const month = parseInt(document.getElementById('filterMonth').value);

    let filtered = trainees.filter(t => {
        return (!search || t.name.toLowerCase().includes(search) || t.regNumber.toLowerCase().includes(search)) &&
               (!specialty || t.specialty === specialty) &&
               (!month || t.month === month);
    });

    tbody.innerHTML = filtered.length ? '' : `<tr><td colspan="10" class="text-center text-gray-500 py-3">لا توجد بيانات</td></tr>`;

    filtered.sort((a, b) => a.year - b.year || a.month - b.month || a.name.localeCompare(b.name));
    filtered.forEach((t, i) => {
        const tr = document.createElement('tr');
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
            <td class="px-2 py-2">${t.status}</td>
            <td class="px-2 py-2 flex gap-2">
                <button class="text-blue-600 hover:text-blue-800" onclick="editTrainee('${t.id}')" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-800" onclick="deleteTrainee('${t.id}')" title="حذف">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button class="text-green-600 hover:text-green-800" onclick="printReceipt('${t.id}')" title="طباعة وصل">
                    <i class="fas fa-print"></i>
                </button>
            </td>
`;

        tbody.appendChild(tr);
    });
}

// ================ نافذة المتربص ===================
function showTraineeModal(t = {}) {
    const modal = document.getElementById('traineeModal');
    const specialtiesOptions = specialties.map(s => `<option value="${s}">${s}</option>`).join('');
    const monthsOptions = monthNames.map((m, i) => i ? `<option value="${i}">${m}</option>` : '').join('');
    const yearsOptions = [2023, 2024, 2025].map(y => `<option value="${y}">${y}</option>`).join('');

    modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-2">
        <div class="p-4">
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-bold">${t.id ? 'تعديل' : 'إضافة'} متربص</h3>
                <button onclick="closeTraineeModal()" class="text-gray-500 hover:text-gray-700"><i class="fas fa-times"></i></button>
            </div>
            <form id="traineeForm">
                <input type="hidden" id="traineeId" value="${t.id || ''}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <div>
                        <label>رقم التسجيل</label>
                        <input type="text" id="traineeRegNumber" class="w-full border rounded-lg px-3 py-2" required value="${t.regNumber || ''}">
                    </div>
                    <div>
                        <label>الاسم الكامل</label>
                        <input type="text" id="traineeName" class="w-full border rounded-lg px-3 py-2" required value="${t.name || ''}">
                    </div>
                    <div>
                        <label>التخصص</label>
                        <select id="traineeSpecialty" class="w-full border rounded-lg px-3 py-2" required>${specialtiesOptions}</select>
                    </div>
                    <div>
                        <label>الشهر</label>
                        <select id="traineeMonth" class="w-full border rounded-lg px-3 py-2" required>${monthsOptions}</select>
                    </div>
                    <div>
                        <label>السنة</label>
                        <select id="traineeYear" class="w-full border rounded-lg px-3 py-2" required>${yearsOptions}</select>
                    </div>
                    <div>
                        <label>المبلغ المطلوب (دج)</label>
                        <input type="number" id="traineeRequiredAmount" class="w-full border rounded-lg px-3 py-2" required value="${t.requiredAmount || ''}">
                    </div>
                    <div>
                        <label>المبلغ المدفوع (دج)</label>
                        <input type="number" id="traineePaidAmount" class="w-full border rounded-lg px-3 py-2" required value="${t.paidAmount || ''}">
                    </div>
                </div>
                <div class="flex justify-end gap-2 mt-3">
                    <button type="button" onclick="closeTraineeModal()" class="bg-gray-300 px-4 py-2 rounded-lg">إلغاء</button>
                    <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">حفظ</button>
                </div>
            </form>
        </div>
    </div>
    `;

    modal.classList.remove('hidden');
    document.getElementById('traineeSpecialty').value = t.specialty || specialties[0];
    document.getElementById('traineeMonth').value = t.month || 1;
    document.getElementById('traineeYear').value = t.year || 2024;
    document.getElementById('traineeForm').onsubmit = saveTrainee;
}

function closeTraineeModal() {
    const modal = document.getElementById('traineeModal');
    modal.innerHTML = '';
    modal.classList.add('hidden');
}

function saveTrainee(e) {
    e.preventDefault();
    let trainee = {
        id: document.getElementById('traineeId').value || Date.now().toString(),
        regNumber: document.getElementById('traineeRegNumber').value.trim(),
        name: document.getElementById('traineeName').value.trim(),
        specialty: document.getElementById('traineeSpecialty').value,
        month: parseInt(document.getElementById('traineeMonth').value),
        year: parseInt(document.getElementById('traineeYear').value),
        requiredAmount: parseFloat(document.getElementById('traineeRequiredAmount').value),
        paidAmount: parseFloat(document.getElementById('traineePaidAmount').value),
    };
    trainee.remainingAmount = trainee.requiredAmount - trainee.paidAmount;
    trainee.status = trainee.paidAmount === 0 ? 'لم يدفع' :
                    (trainee.paidAmount >= trainee.requiredAmount ? 'دفع كلي' : 'دفع جزئي');

    const idx = trainees.findIndex(t => t.id === trainee.id);
    if (idx !== -1) trainees[idx] = trainee;
    else trainees.push(trainee);

    localStorage.setItem('trainees', JSON.stringify(trainees));
    closeTraineeModal();
    updateTraineesTable();
}

window.editTrainee = function(id) {
    const t = trainees.find(t => t.id === id);
    if (t) showTraineeModal(t);
};

window.deleteTrainee = function(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المتربص؟')) return;
    trainees = trainees.filter(t => t.id !== id);
    localStorage.setItem('trainees', JSON.stringify(trainees));
    updateTraineesTable();
};

// ================ الطباعة ===================
window.printReceipt = function(id) {
    const t = trainees.find(x => x.id === id);
    if (!t) return alert("المتربص غير موجود");

    const dateStr = new Date().toLocaleDateString('ar-DZ');
    const monthStr = `${monthNames[t.month]} ${t.year}`;
    const settings = schoolSettings;

    let receiptHTML = `
    <div class="receipt-print">
        ${[1,2].map(copy => `
            <div style="border:2px dashed #555; padding:18px 24px; margin-bottom:24px;">
                <h3 style="text-align:center;">وصل دفع - ${copy === 1 ? 'نسخة المتربص' : 'نسخة المؤسسة'}</h3>
                <p><strong>اسم المؤسسة:</strong> ${settings.name}</p>
                <p><strong>العنوان:</strong> ${settings.address}</p>
                <p><strong>اسم المتربص:</strong> ${t.name}</p>
                <p><strong>رقم التسجيل:</strong> ${t.regNumber}</p>
                <p><strong>التخصص:</strong> ${t.specialty}</p>
                <p><strong>الشهر/السنة:</strong> ${monthStr}</p>
                <p><strong>المبلغ المطلوب:</strong> ${t.requiredAmount.toLocaleString()} دج</p>
                <p><strong>المدفوع:</strong> ${t.paidAmount.toLocaleString()} دج</p>
                <p><strong>المتبقي:</strong> ${t.remainingAmount.toLocaleString()} دج</p>
                <p><strong>الحالة:</strong> ${t.status}</p>
                <p><strong>التاريخ:</strong> ${dateStr}</p>
            </div>
        `).join('')}
    </div>
    `;

    let win = window.open('', '', 'width=800,height=900');
    win.document.write(`<html><head><title>وصل دفع</title><link href="https://fonts.googleapis.com/css2?family=Tajawal&display=swap" rel="stylesheet"></head><body dir="rtl">${receiptHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
};

// ================ التقارير ===================
function renderReports() {
    let stats = {};
    trainees.forEach(t => {
        let key = `${t.year}-${t.month}`;
        stats[key] = stats[key] || { count: 0, total: 0, paid: 0 };
        stats[key].count++;
        stats[key].total += t.requiredAmount;
        stats[key].paid += t.paidAmount;
    });

    let keys = Object.keys(stats).sort();
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = keys.map((key, i) => {
        const [year, month] = key.split('-').map(Number);
        const s = stats[key];
        const percent = Math.round((s.paid / s.total) * 100);
        return `
        <tr class="${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
            <td class="px-2 py-2">${i + 1}</td>
            <td class="px-2 py-2">${monthNames[month]} ${year}</td>
            <td class="px-2 py-2">${s.count}</td>
            <td class="px-2 py-2">${s.total.toLocaleString()} دج</td>
            <td class="px-2 py-2 text-green-700">${s.paid.toLocaleString()} دج</td>
            <td class="px-2 py-2 text-red-700">${(s.total - s.paid).toLocaleString()} دج</td>
            <td class="px-2 py-2">${percent}%</td>
            <td class="px-2 py-2"><button class="text-indigo-700 underline">تفاصيل</button></td>
        </tr>`;
    }).join('');
}
