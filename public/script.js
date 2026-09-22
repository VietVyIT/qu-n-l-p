document.addEventListener('DOMContentLoaded', () => {
    // ---- TRANG TRA CỨU (index.html) ----
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const mssvInput = document.getElementById('mssvInput').value;
            
            const loading = document.getElementById('loading');
            const errorAlert = document.getElementById('errorAlert');
            const resultCard = document.getElementById('resultCard');
            const errorMessage = document.getElementById('errorMessage');

            // Ẩn các thông báo cũ
            errorAlert.classList.add('hidden');
            resultCard.classList.add('hidden');
            loading.classList.remove('hidden');

            try {
                const response = await fetch(`/api/search?mssv=${encodeURIComponent(mssvInput)}`);
                const data = await response.json();
                
                loading.classList.add('hidden');

                if (data.success) {
                    // Cập nhật DOM
                    document.getElementById('resFullName').textContent = data.data.fullName;
                    document.getElementById('resMssv').textContent = data.data.mssv;
                    document.getElementById('resDepartment').textContent = data.data.department || 'Không có';
                    document.getElementById('resNotes').textContent = data.data.notes || 'Không có';
                    document.getElementById('resWorkDays').textContent = data.data.workDays;
                    
                    // Format Date
                    const updatedDate = new Date(data.data.updatedAt);
                    document.getElementById('resUpdatedAt').textContent = updatedDate.toLocaleString('vi-VN');

                    resultCard.classList.remove('hidden');
                } else {
                    errorMessage.textContent = data.message;
                    errorAlert.classList.remove('hidden');
                }
            } catch (error) {
                loading.classList.add('hidden');
                errorMessage.textContent = 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.';
                errorAlert.classList.remove('hidden');
            }
        });
    }

    // ---- TRANG ADMIN (admin.html) ----
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const adminKey = document.getElementById('adminKey').value;
            const excelFile = document.getElementById('excelFile').files[0];
            
            const loading = document.getElementById('loadingUpload');
            const uploadMessage = document.getElementById('uploadMessage');
            const uploadMessageText = document.getElementById('uploadMessageText');

            uploadMessage.classList.add('hidden');
            uploadMessage.className = 'alert hidden'; // Reset classes
            loading.classList.remove('hidden');

            const formData = new FormData();
            formData.append('file', excelFile);

            try {
                const response = await fetch('/api/admin/upload', {
                    method: 'POST',
                    headers: {
                        'x-admin-key': adminKey
                    },
                    body: formData
                });
                
                const data = await response.json();
                loading.classList.add('hidden');
                uploadMessage.classList.remove('hidden');

                if (data.success) {
                    uploadMessage.classList.add('success');
                    uploadMessage.querySelector('.icon').textContent = '✅';
                    uploadMessageText.textContent = data.message;
                    uploadForm.reset();
                } else {
                    uploadMessage.classList.add('error');
                    uploadMessage.querySelector('.icon').textContent = '⚠️';
                    uploadMessageText.textContent = data.message;
                }
            } catch (error) {
                loading.classList.add('hidden');
                uploadMessage.classList.remove('hidden');
                uploadMessage.classList.add('error');
                uploadMessage.querySelector('.icon').textContent = '⚠️';
                uploadMessageText.textContent = 'Lỗi tải lên. Vui lòng kiểm tra lại kết nối mạng.';
            }
        });
    }
});
