import axios from 'axios';

// Tạo một instance của axios với URL gốc của Backend
const axiosClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Thay đổi port nếu Backend của bạn chạy port khác
    headers: {
        'Content-Type': 'application/json',
    },
});

// THÊM INTERCEPTOR CHO REQUEST (Gửi đi)
axiosClient.interceptors.request.use(
    (config) => {
        // Trước khi gửi request đi, tự động lấy token từ localStorage
        const token = localStorage.getItem('token');

        // Nếu có token, đính kèm vào Header Authorization
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// THÊM INTERCEPTOR CHO RESPONSE (Nhận về)
axiosClient.interceptors.response.use(
    (response) => {
        // Nếu API trả về thành công (status 2xx), chỉ lấy phần data
        return response.data;
    },
    (error) => {
        // Xử lý lỗi tập trung tại đây
        if (error.response) {
            // Bắt mã lỗi 401 (Unauthorized) hoặc 403 (Forbidden) -> Token hết hạn hoặc sai
            if (error.response.status === 401 || error.response.status === 403) {
                console.warn("Phiên đăng nhập hết hạn hoặc không có quyền!");
                // Xóa token cũ và đẩy về trang đăng nhập
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;