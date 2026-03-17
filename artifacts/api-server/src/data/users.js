export const users = [
    {
        id: "u001",
        email: "admin@smartfoodtour.vn",
        password: "admin123",
        role: "admin",
        name: "Admin SFT",
        status: "active",
        createdAt: "2025-01-01"
    },
    {
        id: "u002",
        email: "phohanoi@gmail.com",
        password: "vendor123",
        role: "vendor",
        name: "Nguyễn Văn An",
        phone: "0901234567",
        shopName: "Phở Hà Nội Số 1",
        status: "active",
        createdAt: "2025-01-15"
    },
    {
        id: "u003",
        email: "banhmi@gmail.com",
        password: "vendor123",
        role: "vendor",
        name: "Trần Thị Lan",
        phone: "0912345678",
        shopName: "Bánh Mì Hội An",
        status: "active",
        createdAt: "2025-01-20"
    },
    {
        id: "u004",
        email: "cafetruong@gmail.com",
        password: "vendor123",
        role: "vendor",
        name: "Lê Văn Dũng",
        phone: "0923456789",
        shopName: "Cà Phê Trứng Việt",
        status: "pending",
        createdAt: "2025-03-10"
    }
];
export const pendingVenues = [
    {
        id: "pv001",
        vendorId: "u004",
        vendorName: "Lê Văn Dũng",
        shopName: "Cà Phê Trứng Việt",
        category: "coffee",
        address: "78 Đồng Khởi, Quận 1",
        submittedAt: "2025-03-10",
        status: "pending"
    },
    {
        id: "pv002",
        vendorId: "u002",
        vendorName: "Nguyễn Văn An",
        shopName: "Phở Bắc Đặc Biệt",
        category: "vietnamese",
        address: "55 Lê Lợi, Quận 1",
        submittedAt: "2025-03-12",
        status: "pending"
    }
];
