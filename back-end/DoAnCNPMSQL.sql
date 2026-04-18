-- Tạo Database hỗ trợ Tiếng Việt
CREATE DATABASE IF NOT EXISTS KTX_HUMG
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE KTX_HUMG;

-- 1. Bảng TaiKhoan
CREATE TABLE TaiKhoan (
    MaTK INT AUTO_INCREMENT PRIMARY KEY,
    TenDangNhap VARCHAR(50) UNIQUE NOT NULL, 
    MatKhau VARCHAR(150) NOT NULL,
    VaiTro TINYINT(1) NOT NULL COMMENT '0: Admin, 1: Sinh viên'
) ENGINE=InnoDB;

-- 2. Bảng Admin
CREATE TABLE Admin (
    MaAdmin INT AUTO_INCREMENT PRIMARY KEY,
    MaTK INT,
    HoTen VARCHAR(255) NOT NULL,
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Bảng Khu
CREATE TABLE Khu (
    MaKhu INT AUTO_INCREMENT PRIMARY KEY,
    TenKhu VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- 4. Bảng ToaNha
CREATE TABLE ToaNha (
    MaToaNha INT AUTO_INCREMENT PRIMARY KEY,
    MaKhu INT NOT NULL,
    TenToaNha VARCHAR(255) NOT NULL,
    FOREIGN KEY (MaKhu) REFERENCES Khu(MaKhu) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Bảng Phong
CREATE TABLE Phong (
    MaPhong INT AUTO_INCREMENT PRIMARY KEY,
    MaToaNha INT NOT NULL,
    TenPhong VARCHAR(255) NOT NULL,
    LoaiPhong VARCHAR(100),
    GioiTinh TINYINT(1) NOT NULL COMMENT 'Phân loại: 0 = Nữ, 1 = Nam',
    TrangThai VARCHAR(50) DEFAULT 'Trống',
    SucChua INT(2) DEFAULT 0,
    SoSinhVienHienTai INT(2) DEFAULT 0,
    FOREIGN KEY (MaToaNha) REFERENCES ToaNha(MaToaNha) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Bảng SinhVien
CREATE TABLE SinhVien (
    MaSV VARCHAR(12) PRIMARY KEY,
    MaTK INT,
    MaPhong INT,
    HoTen VARCHAR(255) NOT NULL,
    Khoa VARCHAR(100),      
    KhoaHoc VARCHAR(20),
    Email VARCHAR(255),
    SDT VARCHAR(20) UNIQUE,
    CCCD VARCHAR(20) UNIQUE NOT NULL,
    GioiTinh TINYINT(1) COMMENT '0: Nữ, 1: Nam',
    NgaySinh DATE,
    FOREIGN KEY (MaTK) REFERENCES TaiKhoan(MaTK) ON DELETE SET NULL,
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Bảng DienNuoc
CREATE TABLE DienNuoc (
    MaDienNuoc INT AUTO_INCREMENT PRIMARY KEY,
    MaPhong INT NOT NULL,
    ChiSoDienCu INT(10) DEFAULT 0,
    ChiSoDienMoi INT(10) DEFAULT 0,
    ChiSoNuocCu INT(10) DEFAULT 0,
    ChiSoNuocMoi INT(10) DEFAULT 0,
    ThoiGian DATE, -- Ngày ghi nhận chỉ số
    TrangThaiChot TINYINT(1) DEFAULT 0 COMMENT '0: Chưa tạo hóa đơn, 1: Đã tạo hóa đơn',
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Bảng HoaDon
CREATE TABLE HoaDon (
    MaHoaDon INT AUTO_INCREMENT PRIMARY KEY,
    MaPhong INT NOT NULL,
    MaSV VARCHAR(12) NOT NULL,
    MaDienNuoc INT,
    LoaiHoaDon VARCHAR(100) NOT NULL,
    KyHoaDon VARCHAR(100) NOT NULL,
    SoTien DECIMAL(19, 5) NOT NULL,
    TrangThaiThanhToan TINYINT(1) DEFAULT 0 COMMENT '0: Chưa thanh toán, 1: Đã thanh toán',
    NgayLap DATE NOT NULL,
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong) ON DELETE CASCADE,
    FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV) ON DELETE CASCADE,
    FOREIGN KEY (MaDienNuoc) REFERENCES DienNuoc(MaDienNuoc) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. Bảng PhanAnh
CREATE TABLE PhanAnh (
    MaPhanAnh INT AUTO_INCREMENT PRIMARY KEY,
    MaSV VARCHAR(12) NOT NULL,
    DanhMuc VARCHAR(100) NOT NULL,
    TieuDe VARCHAR(255) NOT NULL,
    NoiDung VARCHAR(1024) NOT NULL,
    NgayGui DATE,
    TrangThai TINYINT(1) DEFAULT 0 COMMENT '0: Chờ xử lý, 1: Đã xử lý',
    FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Bảng DangKy
CREATE TABLE DangKy (
    MaDK INT AUTO_INCREMENT PRIMARY KEY,
    MaSV VARCHAR(12) NOT NULL,
    MaPhong INT,
    HocKy VARCHAR(100),
    NguyenVongKhu VARCHAR(100),
    NguyenVongLoaiPhong VARCHAR(100),
    GhiChu VARCHAR(1024),
    NgayDangKy DATE NOT NULL,
    TrangThai TINYINT(1) DEFAULT 0 COMMENT '0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối',
    FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV) ON DELETE CASCADE,
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. Bảng HopDong
CREATE TABLE HopDong (
    MaHopDong INT AUTO_INCREMENT PRIMARY KEY,
    MaSV VARCHAR(12) NOT NULL,
    MaPhong INT NOT NULL,
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE NOT NULL,
    NoiDung VARCHAR(1024),
    TrangThai TINYINT(1) DEFAULT 1 COMMENT '1: Đang hiệu lực, 0: Hết hạn/Chấm dứt',
    FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV) ON DELETE CASCADE,
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Bảng ViPham
CREATE TABLE ViPham (
    MaViPham INT AUTO_INCREMENT PRIMARY KEY,
    MaSV VARCHAR(12) NOT NULL,
    NgayViPham DATE NOT NULL,
    LoaiViPham VARCHAR(255) NOT NULL,
    NoiDung VARCHAR(1024) NOT NULL,
    HinhThucXuLy VARCHAR(255) NOT NULL,
    TrangThai TINYINT(1) DEFAULT 0 COMMENT '0: Chờ xử lý, 1: Đã xử lý',
    FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE NoiQuy (
    MaNoiQuy INT AUTO_INCREMENT PRIMARY KEY,
    TieuDe VARCHAR(255) NOT NULL,
    DanhMuc VARCHAR(100) NOT NULL,
    NoiDung TEXT NOT NULL,
    NgayCapNhat DATE NOT NULL,
    TrangThai TINYINT(1) DEFAULT 1 COMMENT '1: Đang áp dụng, 0: Đã hủy bỏ'
) ENGINE=InnoDB;


-- 1. Đổi vai trò thành Admin (0) trong bảng TaiKhoan
UPDATE TaiKhoan 
SET VaiTro = 0 
WHERE TenDangNhap = 'admin';

-- 2. Thêm thông tin vào bảng Admin (Lấy MaTK từ bảng TaiKhoan)
INSERT INTO Admin (MaTK, HoTen)
SELECT MaTK, 'Ban Quản Lý KTX' 
FROM TaiKhoan 
WHERE TenDangNhap = 'admin';

-- 3. Xóa bản ghi thừa trong bảng SinhVien (vì lúc đăng ký nó lỡ chui vào đây)
DELETE FROM SinhVien 
WHERE MaSV = 'admin';


-- Tài khoản admin mật khẩu : 12345678
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro) 
VALUES ('admin', '$2b$10$jA1ylkciUmJIqdbhiuYUO.lYePWB6ZVD6l9oBCfoQw/95C7IiRO2i', 0);

-- 2. Lấy MaTK vừa tạo để thêm vào bảng Admin (Hồ sơ hiển thị)
INSERT INTO Admin (MaTK, HoTen) 
VALUES (LAST_INSERT_ID(), 'Ban Quản lý');


ALTER TABLE TaiKhoan ADD COLUMN TrangThaiXacNhan INT DEFAULT 0;
ALTER TABLE TaiKhoan ADD COLUMN MaKhoiPhuc VARCHAR(10) DEFAULT NULL;
ALTER TABLE TaiKhoan ADD COLUMN HanMaKhoiPhuc DATETIME DEFAULT NULL;

ALTER TABLE SinhVien 
ADD COLUMN Khoa VARCHAR(100) AFTER NgaySinh,
ADD COLUMN KhoaHoc VARCHAR(20) AFTER Khoa; 