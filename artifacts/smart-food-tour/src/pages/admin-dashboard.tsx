import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CheckSquare, Store, Users, Map, Bell,
  BarChart2, Settings, LogOut, ShieldCheck, TrendingUp,
  Volume2, Globe, Eye, Check, X, AlertTriangle, Menu
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getUser() {
  try { return JSON.parse(localStorage.getItem("sft_user") || "null"); }
  catch { return null; }
}
function getEmail() { return getUser()?.email || ""; }

type Tab = "dashboard" | "pending" | "venues" | "users" | "map" | "reports" | "config";

const NAV_ITEMS: { id: Tab; label: string; icon: any; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard tổng hợp", icon: LayoutDashboard },
  { id: "pending", label: "Phê duyệt quán", icon: CheckSquare, badge: 2 },
  { id: "venues", label: "Tất cả điểm bán", icon: Store },
  { id: "users", label: "Quản lý tài khoản", icon: Users },
  { id: "map", label: "Bản đồ toàn hệ thống", icon: Map },
  { id: "reports", label: "Báo cáo", icon: BarChart2 },
  { id: "config", label: "Cấu hình hệ thống", icon: Settings },
];

const CAT_LABEL: Record<string, string> = {
  vietnamese: "🍜 Đồ Việt", "banh-mi": "🥖 Bánh Mì", coffee: "☕ Cà Phê",
  hotpot: "🔥 Lẩu", seafood: "🦐 Hải Sản", vegetarian: "🥗 Chay"
};

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<any>(null);
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);
  const user = getUser();

  const headers = { "x-admin-email": getEmail() };

  useEffect(() => {
    if (!user || user.role !== "admin") { navigate("/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [s, p, u, v] = await Promise.all([
      fetch(`${BASE}/api/admin/stats`, { headers }).then(r => r.json()).catch(() => null),
      fetch(`${BASE}/api/admin/pending`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/api/admin/users`, { headers }).then(r => r.json()).catch(() => []),
      fetch(`${BASE}/api/admin/venues`, { headers }).then(r => r.json()).catch(() => []),
    ]);
    setStats(s);
    setPendingList(Array.isArray(p) ? p : []);
    setUsers(Array.isArray(u) ? u : []);
    setVenues(Array.isArray(v) ? v : []);
  };

  const handleApprove = async (id: string) => {
    await fetch(`${BASE}/api/admin/pending/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" })
    });
    setPendingList(p => p.map(x => x.id === id ? { ...x, status: "approved" } : x));
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    await fetch(`${BASE}/api/admin/pending/${rejectModal.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason: rejectModal.reason })
    });
    setPendingList(p => p.map(x => x.id === rejectModal.id ? { ...x, status: "rejected", rejectedReason: rejectModal.reason } : x));
    setRejectModal(null);
  };

  const handleUserStatus = async (id: string, status: string) => {
    await fetch(`${BASE}/api/admin/users/${id}/status`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setUsers(u => u.map(x => x.id === id ? { ...x, status } : x));
  };

  const handleLogout = () => {
    localStorage.removeItem("sft_token");
    localStorage.removeItem("sft_user");
    navigate("/login");
  };

  const StatCard = ({ label, value, icon: Icon, color, sub }: any) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-orange-500 mt-1">{sub}</p>}
    </motion.div>
  );

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-gray-900 text-white w-64">
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={18} className="text-orange-400" />
          <span className="font-bold text-orange-400">Admin Portal</span>
        </div>
        <p className="text-xs text-gray-400">Smart Food Tour</p>
      </div>
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="bg-gray-800 rounded-xl p-3 mb-4">
          <p className="font-semibold text-sm">{user?.name}</p>
          <p className="text-xs text-orange-400">Quản trị viên</p>
        </div>
        {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${tab === id ? "bg-orange-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
            <Icon size={16} />
            <span className="flex-1 text-left">{label}</span>
            {badge && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>}
          </button>
        ))}
      </div>
      <div className="p-3 border-t border-gray-700">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-900/30 text-sm font-medium transition-colors">
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex"><Sidebar /></div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full shadow-xl"><Sidebar /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"><Menu size={20} /></button>
            <h1 className="font-semibold text-gray-800">{NAV_ITEMS.find(n => n.id === tab)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <ShieldCheck size={11} /> Admin
            </span>
            <Link href="/map"><span className="text-xs text-orange-500 hover:underline cursor-pointer">Xem bản đồ</span></Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* === DASHBOARD === */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Tổng điểm bán" value={stats?.totalVenues ?? venues.length} icon={Store} color="bg-orange-500" />
                <StatCard label="Chủ quán" value={stats?.totalVendors} icon={Users} color="bg-blue-500" />
                <StatCard label="Chờ phê duyệt" value={stats?.pendingApprovals} icon={CheckSquare} color="bg-yellow-500" sub="Cần xem xét" />
                <StatCard label="Tổng lượt nghe" value={stats?.totalAudioPlays?.toLocaleString()} icon={Volume2} color="bg-green-500" />
              </div>

              {/* Traffic Chart */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-4">Traffic toàn hệ thống 7 ngày</h2>
                <div className="flex items-end gap-2 h-36">
                  {(stats?.weeklyTraffic || [
                    { day: "T2", visits: 520 }, { day: "T3", visits: 435 }, { day: "T4", visits: 640 },
                    { day: "T5", visits: 510 }, { day: "T6", visits: 785 }, { day: "T7", visits: 920 }, { day: "CN", visits: 710 }
                  ]).map((d: any) => {
                    const max = 1000;
                    const h = Math.round((d.visits / max) * 100);
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-400">{d.visits}</span>
                        <div className="w-full flex-1 flex items-end">
                          <div className="w-full bg-blue-400 rounded-t-md hover:bg-blue-500 transition-colors" style={{ height: `${h}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top languages */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Globe size={16} />Thống kê ngôn ngữ</h2>
                <div className="space-y-2">
                  {(stats?.topLanguages || [
                    { lang: "vi", count: 4523 }, { lang: "en", count: 3201 },
                    { lang: "zh", count: 1893 }, { lang: "ja", count: 987 }, { lang: "ko", count: 654 }
                  ]).map((item: any, i: number) => {
                    const flags: Record<string, string> = { vi: "🇻🇳", en: "🇬🇧", zh: "🇨🇳", ja: "🇯🇵", ko: "🇰🇷" };
                    const total = 11258;
                    const pct = Math.round((item.count / total) * 100);
                    return (
                      <div key={item.lang} className="flex items-center gap-3">
                        <span className="text-sm w-6">{flags[item.lang] || "🌐"}</span>
                        <span className="text-xs text-gray-600 w-20 uppercase">{item.lang}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-16 text-right">{item.count.toLocaleString()} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* === PENDING APPROVALS === */}
          {tab === "pending" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{pendingList.filter(p => p.status === "pending").length} quán đang chờ phê duyệt</p>
              {pendingList.map((p) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{p.shopName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "pending" ? "bg-yellow-100 text-yellow-700" : p.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {p.status === "pending" ? "⏳ Chờ duyệt" : p.status === "approved" ? "✓ Đã duyệt" : "✗ Từ chối"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Chủ: <strong>{p.vendorName}</strong> · {CAT_LABEL[p.category] || p.category}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.address}</p>
                      <p className="text-xs text-gray-400">Nộp: {p.submittedAt}</p>
                      {p.rejectedReason && <p className="text-xs text-red-500 mt-1">Lý do từ chối: {p.rejectedReason}</p>}
                    </div>
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(p.id)}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                          <Check size={14} /> Duyệt
                        </button>
                        <button onClick={() => setRejectModal({ id: p.id, reason: "" })}
                          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                          <X size={14} /> Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {pendingList.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <CheckSquare size={40} className="mx-auto mb-2 opacity-30" />
                  <p>Không có quán nào chờ duyệt</p>
                </div>
              )}
            </div>
          )}

          {/* === ALL VENUES === */}
          {tab === "venues" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{venues.length} điểm bán trong hệ thống</p>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-4 text-gray-500 font-medium">Tên quán</th>
                      <th className="text-left p-4 text-gray-500 font-medium hidden sm:table-cell">Loại</th>
                      <th className="text-left p-4 text-gray-500 font-medium hidden md:table-cell">Địa chỉ</th>
                      <th className="text-left p-4 text-gray-500 font-medium">Đánh giá</th>
                      <th className="text-left p-4 text-gray-500 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.map((v: any) => (
                      <tr key={v.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{v.name}</td>
                        <td className="p-4 text-gray-500 hidden sm:table-cell">{CAT_LABEL[v.category] || v.category}</td>
                        <td className="p-4 text-gray-500 text-xs hidden md:table-cell">{v.address}</td>
                        <td className="p-4">
                          <span className="flex items-center gap-1 text-yellow-500">⭐ {v.rating}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {v.isOpen ? "Đang mở" : "Đóng cửa"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === USERS === */}
          {tab === "users" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{users.length} tài khoản</p>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-4 text-gray-500 font-medium">Tên</th>
                      <th className="text-left p-4 text-gray-500 font-medium">Email</th>
                      <th className="text-left p-4 text-gray-500 font-medium hidden sm:table-cell">Vai trò</th>
                      <th className="text-left p-4 text-gray-500 font-medium">Trạng thái</th>
                      <th className="text-left p-4 text-gray-500 font-medium">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{u.name}</td>
                        <td className="p-4 text-gray-500 text-xs">{u.email}</td>
                        <td className="p-4 hidden sm:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                            {u.role === "admin" ? "🛡️ Admin" : "🏪 Vendor"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === "active" ? "bg-green-100 text-green-700" : u.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {u.status === "active" ? "✓ Hoạt động" : u.status === "pending" ? "⏳ Chờ xác nhận" : "✗ Bị khóa"}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.role !== "admin" && (
                            <div className="flex gap-1">
                              {u.status !== "active" && (
                                <button onClick={() => handleUserStatus(u.id, "active")}
                                  className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-lg transition-colors">Kích hoạt</button>
                              )}
                              {u.status === "active" && (
                                <button onClick={() => handleUserStatus(u.id, "suspended")}
                                  className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg transition-colors">Khóa</button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === MAP === */}
          {tab === "map" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[70vh] flex items-center justify-center">
              <div className="text-center">
                <Map size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-600">Bản đồ toàn hệ thống</p>
                <p className="text-sm text-gray-400 mb-4">Hiển thị tất cả {venues.length} điểm bán trên bản đồ</p>
                <Link href="/map">
                  <span className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer">
                    Mở bản đồ đầy đủ
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* === REPORTS === */}
          {tab === "reports" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><BarChart2 size={16} /> Báo cáo tổng hợp</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Tổng lượt truy cập tháng này", value: "45,231", trend: "+12%" },
                    { label: "Tổng lượt nghe audio", value: "12,453", trend: "+8%" },
                    { label: "Quán nổi bật nhất", value: "Bánh Mì Hội An", trend: "4.9⭐" },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                      <p className="font-bold text-gray-800">{item.value}</p>
                      <p className="text-xs text-green-600 mt-0.5">{item.trend}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                    📊 Xuất CSV
                  </button>
                  <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                    📄 Xuất PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* === CONFIG === */}
          {tab === "config" && (
            <div className="space-y-4 max-w-lg">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-4">Cấu hình hệ thống</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ngôn ngữ mặc định</label>
                    <select className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                      <option value="vi">🇻🇳 Tiếng Việt</option>
                      <option value="en">🇬🇧 English</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bán kính GPS mặc định (mét)</label>
                    <input type="number" defaultValue={50} className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
                    <p className="text-xs text-gray-400 mt-1">Khoảng cách mặc định để kích hoạt audio khi khách đi đến gần quán</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Thông báo hệ thống</label>
                    <textarea rows={3} placeholder="Nhập nội dung thông báo gửi đến tất cả Vendor..."
                      className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                    Lưu cấu hình
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full">
              <div className="flex items-center gap-2 mb-4 text-red-600">
                <AlertTriangle size={20} />
                <h3 className="font-semibold">Từ chối đăng ký</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Vui lòng nhập lý do từ chối để thông báo cho Vendor:</p>
              <textarea
                rows={3} value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="Ví dụ: Thông tin không đầy đủ, ảnh không rõ ràng..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={handleReject}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Xác nhận từ chối
                </button>
                <button onClick={() => setRejectModal(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Hủy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
