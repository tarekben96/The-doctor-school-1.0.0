// تهيئة البيانات من localStorage أو القيم الافتراضية
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

// مثال: تحديث قائمة التخصصات في الإعدادات
function updateSpecialtiesList() {
    const traineeSpecialtySelect = document.getElementById('traineeSpecialty');
    if (traineeSpecialtySelect) {
        traineeSpecialtySelect.innerHTML = '';
        specialties.forEach(specialty => {
            const option = document.createElement('option');
            option.value = specialty;
            option.textContent = specialty;
            traineeSpecialtySelect.appendChild(option);
        });
    }
    const filterSpecialtySelect = document.getElementById('filterSpecialty');
    if (filterSpecialtySelect) {
        filterSpecialtySelect.innerHTML = '<option value="">جميع التخصصات</option>';
        specialties.forEach(specialty => {
            const option = document.createElement('option');
            option.value = specialty;
            option.textContent = specialty;
            filterSpecialtySelect.appendChild(option);
        });
    }
    const specialtiesList = document.getElementById('specialtiesList');
    if (specialtiesList) {
        specialtiesList.innerHTML = '';
        specialties.forEach(specialty => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center py-2 border-b border-gray-200 last:border-0';
            div.innerHTML = `<span>${specialty}</span>
            <button class="text-red-600 hover:text-red-800" onclick="removeSpecialty('${specialty}')">
                <i class="fas fa-trash-alt"></i>
            </button>`;
            specialtiesList.appendChild(div);
        });
    }
}

// إضافة تخصص جديد
document.getElementById('addSpecialtyBtn')?.addEventListener('click', function () {
    const newSpecialty = document.getElementById('newSpecialty').value.trim();
    if (newSpecialty && !specialties.includes(newSpecialty)) {
        specialties.push(newSpecialty);
        localStorage.setItem('specialties', JSON.stringify(specialties));
        updateSpecialtiesList();
        document.getElementById('newSpecialty').value = '';
    }
});

// حذف تخصص
window.removeSpecialty = function (specialty) {
    specialties = specialties.filter(s => s !== specialty);
    localStorage.setItem('specialties', JSON.stringify(specialties));
    updateSpecialtiesList();
};

// حفظ إعدادات المدرسة
document.getElementById('schoolSettingsForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    schoolSettings = {
        name: document.getElementById('schoolName').value,
        address: document.getElementById('schoolAddress').value,
        phone: document.getElementById('schoolPhone').value,
        email: document.getElementById('schoolEmail').value
    };
    localStorage.setItem('schoolSettings', JSON.stringify(schoolSettings));
    alert('تم حفظ إعدادات المؤسسة!');
});

// تصدير البيانات
document.getElementById('exportDataBtn')?.addEventListener('click', function () {
    const data = {
        trainees, specialties, schoolSettings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'school_payments_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

// استيراد البيانات
document.getElementById('importDataBtn')?.addEventListener('click', function () {
    document.getElementById('importDataFile').click();
});
document.getElementById('importDataFile')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
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
                    updateSpecialtiesList();
                    alert('تم استيراد البيانات بنجاح!');
                    window.location.reload();
                } else {
                    alert('ملف البيانات غير صالح');
                }
            } catch {
                alert('حدث خطأ أثناء قراءة الملف!');
            }
        };
        reader.readAsText(file);
    }
});

// حذف جميع البيانات
document.getElementById('clearDataBtn')?.addEventListener('click', function () {
    if (confirm('هل تريد حذف جميع البيانات؟')) {
        localStorage.removeItem('trainees');
        localStorage.removeItem('specialties');
        localStorage.removeItem('schoolSettings');
        window.location.reload();
    }
});

// تهيئة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', function () {
    updateSpecialtiesList();
    // يمكنك هنا استدعاء دوال أخرى لتهيئة الجداول أو الأقسام الأخرى
});
