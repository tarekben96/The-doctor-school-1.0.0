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

// ================ تهيئة الصفحة والتنقل بين الأقسام ================
function showSection(sectionId) {
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.getElementById('traineesTableSection').style.display = 'none';
    document.getElementById(sectionId).style.display = '';
    if (sectionId === 'dashboardSection') {
        document.getElementById('traineesTableSection').style.display = '';
    }
}
// ================ إعداد لوحة التحكم ================
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
// ================ ملء التخصصات ==================
function fillSpecialtiesSelect(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">جميع التخصصات</option>' +
        specialties.map(s=>`<option value="${s}">${s}</option>`).join('');
}

// ================ عرض جدول المتربصين ================
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
        requiredAmount, paidAmount, remainingAmount, status,
        updatedAt: Date.now()
    };
    if (traineeId) {
        let idx = trainees.findIndex(t => t.id === traineeId);
        if (idx !== -1) trainees[idx] = trainee;
    } else {
        trainee.savedAt = Date.now();
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

// ================ طباعة وصل الدفع ================
window.printReceipt = function (id) {
    let t = trainees.find(x => x.id === id);
    if (!t) return;
    let school = schoolSettings;
    let dateStr = new Date().toLocaleDateString('ar-DZ');
    let monthStr = monthNames[t.month] + " " + t.year;
    let receiptHtml = `
    <div class="print-only" style="padding:24px;max-width:900px;margin:auto;">
        <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;">
            <div style="width:48%;min-width:300px;border:2px dashed #222;padding:12px;margin-bottom:16px;">
                <h2 style="text-align:center;font-weight:bold;">وصل دفع - نسخة المتربص</h2>
                <hr>
                <p>اسم المؤسسة: <b>${school.name}</b></p>
                <p>العنوان: ${school.address}</p>
                <p>اسم المتربص: <b>${t.name}</b></p>
                <p>رقم التسجيل: <b>${t.regNumber}</b></p>
                <p>التخصص: ${t.specialty}</p>
                <p>الشهر/السنة: ${monthStr}</p>
                <p>المبلغ المطلوب: ${t.requiredAmount} دج</p>
                <p>المبلغ المدفوع: ${t.paidAmount} دج</p>
                <p>المتبقي: ${t.remainingAmount} دج</p>
                <p>التاريخ: ${dateStr}</p>
                <div style="margin-top:22px;display:flex;justify-content:space-between;">
                    <span>توقيع المؤسسة: ____________</span>
                    <span>توقيع المتربص: ____________</span>
                </div>
                <hr>
                <div style="text-align:center;font-size:13px;color:#666;">نسخة خاصة بالمتربص</div>
            </div>
            <div style="width:48%;min-width:300px;border:2px dashed #222;padding:12px;margin-bottom:16px;">
                <h2 style="text-align:center;font-weight:bold;">وصل دفع - نسخة المؤسسة</h2>
                <hr>
                <p>اسم المؤسسة: <b>${school.name}</b></p>
                <p>العنوان: ${school.address}</p>
                <p>اسم المتربص: <b>${t.name}</b></p>
                <p>رقم التسجيل: <b>${t.regNumber}</b></p>
                <p>التخصص: ${t.specialty}</p>
                <p>الشهر/السنة: ${monthStr}</p>
                <p>المبلغ المطلوب: ${t.requiredAmount} دج</p>
                <p>المبلغ المدفوع: ${t.paidAmount} دج</p>
                <p>المتبقي: ${t.remainingAmount} دج</p>
                <p>التاريخ: ${dateStr}</p>
                <div style="margin-top:22px;display:flex;justify-content:space-between;">
                    <span>توقيع المؤسسة: ____________</span>
                    <span>توقيع المتربص: ____________</span>
                </div>
                <hr>
                <div style="text-align:center;font-size:13px;color:#666;">نسخة تحفظ في المؤسسة</div>
            </div>
        </div>
    </div>
    <div class="no-print" style="text-align:center;margin-top:10px;">
        <button onclick="window.print();" style="background:#1e40af;color:white;padding:10px 32px;border-radius:8px;">طباعة</button>
        <button onclick="closeReceiptModal();" style="margin-right:12px;background:#eee;padding:10px 32px;border-radius:8px;">إغلاق</button>
    </div>
    `;
    let modal = document.getElementById('traineeModal');
    modal.innerHTML = receiptHtml;
    modal.classList.remove('hidden');
    window.closeReceiptModal = function(){
        modal.innerHTML = '';
        modal.classList.add('hidden');
    };
};
// ================ التقارير ================
function renderReports() {
    // حساب الإحصائيات
    let stats = {};
    trainees.forEach(t => {
        let key = `${t.year}-${t.month}`;
        if (!stats[key]) stats[key] = { count: 0, total: 0, paid: 0, unpaid: 0 };
        stats[key].count++;
        stats[key].total += t.requiredAmount;
        stats[key].paid += t.paidAmount;
        stats[key].unpaid += (t.requiredAmount - t.paidAmount);
    });

    // ترتيب التقارير حسب التاريخ
    let sortedKeys = Object.keys(stats).sort((a, b) => {
        let [ya, ma] = a.split('-').map(Number);
        let [yb, mb] = b.split('-').map(Number);
        return ya !== yb ? ya - yb : ma - mb;
    });

// جدول التقارير
let rows = sortedKeys.map((key, idx) => {
    let [year, month] = key.split('-').map(Number);
    let s = stats[key];
    let percentPaid = s.total ? Math.round((s.paid / s.total) * 100) : 0;
    return `
    <tr class="${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
        <td class="px-2 py-2">${idx + 1}</td>
        <td class="px-2 py-2">${monthNames[month]} ${year}</td>
        <td class="px-2 py-2">${s.count}</td>
        <td class="px-2 py-2">${s.total.toLocaleString()} دج</td>
        <td class="px-2 py-2 text-green-700">${s.paid.toLocaleString()} دج</td>
        <td class="px-2 py-2 text-red-700">${s.unpaid.toLocaleString()} دج</td>
        <td class="px-2 py-2">${percentPaid}%</td>
        <td class="px-2 py-2">
            <button class="text-indigo-700 underline" onclick="window.showMonthDetails('${key}')">تفاصيل</button>
        </td>
    </tr>
    `;
}).join('');
    window.printReceipt = function(id) {
    let t = trainees.find(t => t.id === id);
    if (!t) return alert("لم يتم العثور على بيانات المتربصة.");
    let settings = schoolSettings;

    // نفس الوصل مرتين: للمتربصة+للإدارة
    let receiptHtml = `
    <div class="receipt-print" style="width:700px; margin:24px auto; font-family:'Tajawal',Arial,sans-serif;">
      ${[1,2].map(copy => `
        <div style="border:2px dashed #555; margin-bottom:28px; padding:18px 24px 14px 24px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:20px;font-weight:bold;color:#3b82f6;">${settings.name || ''}</div>
              <div style="font-size:13px;color:#555;">${settings.address || ''}</div>
              <div style="font-size:13px;color:#555;">هاتف: ${settings.phone || ''}</div>
            </div>
            <div style="text-align:left;">
              <div style="font-size:18px;font-weight:bold;">
                ${copy===1 ? 'نسخة خاصة بالمتربصة' : 'نسخة خاصة بالإدارة'}
              </div>
              <div style="font-size:12px;color:#888;">${(new Date()).toLocaleDateString('ar-DZ')}</div>
            </div>
          </div>
          <hr style="margin:14px 0;">
          <div style="font-size:16px;margin-bottom:9px;">
            <span style="font-weight:bold;">وصل دفع رسوم شهر:</span>
            <span>${monthNames[t.month]} ${t.year}</span>
          </div>
          <table style="width:100%;font-size:16px;">
            <tr><td style="width:160px;">اسم المتربصة:</td><td style="font-weight:bold;">${t.name}</td></tr>
            <tr><td>رقم التسجيل:</td><td>${t.regNumber}</td></tr>
            <tr><td>التخصص:</td><td>${t.specialty}</td></tr>
            <tr><td>المبلغ المطلوب:</td><td>${t.requiredAmount.toLocaleString()} دج</td></tr>
            <tr><td>المبلغ المدفوع:</td><td style="font-weight:bold;color:green;">${t.paidAmount.toLocaleString()} دج</td></tr>
            <tr><td>المتبقي:</td><td style="color:red;">${t.remainingAmount.toLocaleString()} دج</td></tr>
            <tr><td>الحالة:</td><td>${t.status}</td></tr>
          </table>
          <div style="margin-top:28px;display:flex;justify-content:space-between;">
            <div>
              <span>توقيع الإدارة:</span>
              <span style="display:inline-block;width:120px;border-bottom:1px solid #bbb;">&nbsp;</span>
            </div>
            <div>
              <span>توقيع المتربصة:</span>
              <span style="display:inline-block;width:120px;border-bottom:1px solid #bbb;">&nbsp;</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
    <style>
      @media print {
        body > *:not(.receipt-print) { display:none !important; }
        .receipt-print { display:block !important; }
      }
    </style>
    `;

    // فتح نافذة طباعة
    let printWindow = window.open('', '', 'width=800,height=900');
    printWindow.document.write('<html><head><title>وصل دفع</title>');
    // نسخ الخط من style.css (اختياري)
    printWindow.document.write(`<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">`);
    printWindow.document.write('</head><body dir="rtl">' + receiptHtml + '</body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 350);
};
// إظهار الأقسام حسب الزر المضغوط
function showSection(sectionId) {
    // أخفِ كل الأقسام
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('reportsSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    document.getElementById('traineesTableSection').style.display = 'none';

    // أظهر القسم المطلوب فقط
    document.getElementById(sectionId).style.display = '';
    // إذا كان لوحة التحكم، أظهر جدول المتربصين
    if (sectionId === 'dashboardSection') {
        document.getElementById('traineesTableSection').style.display = '';
    }
}

