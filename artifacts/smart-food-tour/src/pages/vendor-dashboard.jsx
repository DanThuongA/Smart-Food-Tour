import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Store, Mic, BarChart2, MessageSquare, Settings, LogOut, Volume2, Users, TrendingUp, Bell, Plus, Edit2, Trash2, CheckCircle, Clock, Menu } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
function getUser() {
    try {
        return JSON.parse(localStorage.getItem("sft_user") || "null");
    }
    catch {
        return null;
    }
}
function getEmail() { return getUser()?.email || ""; }
const NAV_ITEMS = [
    { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { id: "venues", label: "Quản lý quán", icon: Store },
    { id: "audio", label: "Audio Manager", icon: Mic },
    { id: "stats", label: "Thống kê", icon: BarChart2 },
    { id: "messages", label: "Tin nhắn", icon: MessageSquare },
    { id: "settings", label: "Cài đặt", icon: Settings },
];
const MOCK_VENUES = [
    { id: "v001", name: "Phở Hà Nội Số 1", category: "vietnamese", status: "active", visits: 342, audioPlays: 178 },
    { id: "v002", name: "Phở Bắc Đặc Biệt", category: "vietnamese", status: "pending", visits: 0, audioPlays: 0 },
];
const MOCK_MSGS = [
    { id: 1, from: "Du khách Nhật Bản", message: "Quán có menu tiếng Anh không?", time: "10 phút trước", read: false },
    { id: 2, from: "John Smith (EN)", message: "What are your opening hours?", time: "1 giờ trước", read: false },
    { id: 3, from: "Li Wei (ZH)", message: "有素食选项吗？", time: "2 giờ trước", read: true },
];
const DAILY_DATA = [
    { day: "T2", visits: 120, audio: 55 },
    { day: "T3", visits: 95, audio: 40 },
    { day: "T4", visits: 140, audio: 72 },
    { day: "T5", visits: 110, audio: 48 },
    { day: "T6", visits: 185, audio: 90 },
    { day: "T7", visits: 220, audio: 110 },
    { day: "CN", visits: 160, audio: 78 },
];
const LANGUAGE_PIE = [
    { name: "🇻🇳 Tiếng Việt", value: 42, fill: "#f97316" },
    { name: "🇬🇧 English", value: 28, fill: "#3b82f6" },
    { name: "🇨🇳 中文", value: 15, fill: "#ef4444" },
    { name: "🇯🇵 日本語", value: 9, fill: "#8b5cf6" },
    { name: "🇰🇷 한국어", value: 6, fill: "#10b981" },
];
const HOURLY_DATA = [
    { hour: "6h", visits: 12 }, { hour: "8h", visits: 35 }, { hour: "10h", visits: 58 },
    { hour: "12h", visits: 94 }, { hour: "14h", visits: 72 }, { hour: "16h", visits: 48 },
    { hour: "18h", visits: 110 }, { hour: "20h", visits: 88 }, { hour: "22h", visits: 30 },
];
const RATING_DATA = [
    { name: "5★", value: 78, fill: "#f97316" },
    { name: "4★", value: 94, fill: "#fb923c" },
    { name: "3★", value: 100, fill: "#fbbf24" },
    { name: "2★", value: 30, fill: "#d1d5db" },
    { name: "1★", value: 20, fill: "#e5e7eb" },
];
export default function VendorDashboard() {
    const [, navigate] = useLocation();
    const [tab, setTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = getUser();
    useEffect(() => {
        if (!user || user.role !== "vendor") {
            navigate("/login");
            return;
        }
        fetch(`${BASE}/api/vendor/stats`, { headers: { "x-vendor-email": getEmail() } })
            .then((r) => r.json()).then(setStats).catch(() => { });
    }, []);
    const handleLogout = () => {
        localStorage.removeItem("sft_token");
        localStorage.removeItem("sft_user");
        navigate("/login");
    };
    const StatCard = ({ label, value, icon: Icon, color }) => (<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} className="text-white"/>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </motion.div>);
    const SidebarContent = () => (<div className="h-full flex flex-col bg-white border-r border-gray-100 w-60">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🍜</span>
          <span className="font-bold text-orange-600">Smart Food Tour</span>
        </div>
        <p className="text-xs text-gray-400">Vendor Portal</p>
      </div>
      <div className="p-3 flex-1">
        <div className="bg-orange-50 rounded-xl p-3 mb-4">
          <p className="font-semibold text-sm text-gray-800">{user?.name}</p>
          <p className="text-xs text-orange-500">{user?.shopName || "Chủ quán"}</p>
        </div>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (<button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors text-sm font-medium ${tab === id ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-orange-50"}`}>
            <Icon size={16}/> {label}
          </button>))}
      </div>
      <div className="p-3 border-t border-gray-100">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">
          <LogOut size={16}/> Đăng xuất
        </button>
      </div>
    </div>);
    return (<div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0"><SidebarContent /></div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)}/>
            <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "tween", duration: 0.25 }} className="md:hidden fixed left-0 top-0 h-full z-50 shadow-xl">
              <SidebarContent />
            </motion.div>
          </>)}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
              <Menu size={20}/>
            </button>
            <h1 className="font-semibold text-gray-800">{NAV_ITEMS.find(n => n.id === tab)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Bell size={18}/>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
            </button>
            <Link href="/map">
              <span className="text-xs text-orange-500 hover:underline cursor-pointer">Xem bản đồ</span>
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* === OVERVIEW === */}
          {tab === "overview" && (<div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Lượt tiếp cận tuần" value={stats?.weeklyVisits ?? 930} icon={TrendingUp} color="bg-orange-500"/>
                <StatCard label="Lượt nghe audio" value={stats?.audioPlays ?? 178} icon={Volume2} color="bg-blue-500"/>
                <StatCard label="Đang gần quán" value={stats?.nearbyNow ?? 7} icon={Users} color="bg-green-500"/>
                <StatCard label="Quán của tôi" value={MOCK_VENUES.length} icon={Store} color="bg-purple-500"/>
              </div>

              {/* Traffic Area Chart */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-700 mb-1">Traffic & Audio 7 ngày</h2>
                <p className="text-xs text-gray-400 mb-4">Lượt xem và lượt nghe audio của quán bạn</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={DAILY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vendorVisits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="vendorAudio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}/>
                    <Legend wrapperStyle={{ fontSize: 12 }}/>
                    <Area type="monotone" dataKey="visits" name="Lượt xem" stroke="#f97316" strokeWidth={2} fill="url(#vendorVisits)" dot={false}/>
                    <Area type="monotone" dataKey="audio" name="Nghe audio" stroke="#3b82f6" strokeWidth={2} fill="url(#vendorAudio)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Messages */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-700">Tin nhắn mới</h2>
                  <button onClick={() => setTab("messages")} className="text-xs text-orange-500 hover:underline">Xem tất cả</button>
                </div>
                {MOCK_MSGS.slice(0, 2).map((m) => (<div key={m.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${m.read ? "bg-gray-300" : "bg-orange-500"}`}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{m.from}</p>
                      <p className="text-xs text-gray-500 truncate">{m.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{m.time}</span>
                  </div>))}
              </div>
            </div>)}

          {/* === VENUES === */}
          {tab === "venues" && (<div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{MOCK_VENUES.length} quán đang quản lý</p>
                <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  <Plus size={15}/> Thêm quán mới
                </button>
              </div>

              {MOCK_VENUES.map((v) => (<motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{v.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {v.status === "active" ? "✓ Đã duyệt" : "⏳ Chờ duyệt"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 capitalize">{v.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Edit2 size={15}/></button>
                      <button className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={15}/></button>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1 text-xs text-gray-500"><Users size={13}/> {v.visits} lượt xem</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500"><Volume2 size={13}/> {v.audioPlays} lượt nghe</div>
                  </div>
                </motion.div>))}

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center">
                <Store size={32} className="text-orange-300 mx-auto mb-2"/>
                <p className="font-medium text-orange-700 text-sm">Thêm quán mới để xuất hiện trên bản đồ</p>
                <p className="text-xs text-orange-500 mt-1">Điền thông tin → Admin duyệt → Hiển thị cho du khách</p>
              </div>
            </div>)}

          {/* === AUDIO === */}
          {tab === "audio" && (<div className="space-y-4">
              <p className="text-sm text-gray-500">Quản lý file audio giới thiệu quán theo từng ngôn ngữ</p>

              {MOCK_VENUES.filter(v => v.status === "active").map((v) => (<div key={v.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-4">{v.name}</h3>
                  <div className="space-y-3">
                    {[
                    { lang: "🇻🇳 Tiếng Việt", status: "uploaded", plays: 89 },
                    { lang: "🇬🇧 English", status: "uploaded", plays: 64 },
                    { lang: "🇨🇳 中文", status: "uploaded", plays: 25 },
                    { lang: "🇯🇵 日本語", status: "missing", plays: 0 },
                    { lang: "🇰🇷 한국어", status: "missing", plays: 0 },
                ].map((item) => (<div key={item.lang} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm w-32 text-gray-700 flex-shrink-0">{item.lang}</span>
                        {item.status === "uploaded" ? (<>
                            <div className="flex-1 h-1.5 bg-orange-100 rounded-full">
                              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${(item.plays / 100) * 100}%` }}/>
                            </div>
                            <span className="text-xs text-gray-400 w-14 text-right">{item.plays} lượt</span>
                            <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg flex items-center gap-1"><CheckCircle size={12}/> Đã upload</button>
                          </>) : (<>
                            <div className="flex-1"/>
                            <button className="text-xs bg-orange-100 text-orange-600 hover:bg-orange-200 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"><Plus size={12}/> Upload audio</button>
                          </>)}
                      </div>))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={12}/>
                    <span>Bán kính kích hoạt audio: <strong className="text-gray-700">50m</strong></span>
                    <button className="ml-auto text-orange-500 hover:underline">Chỉnh sửa</button>
                  </div>
                </div>))}
            </div>)}

          {/* === STATS === */}
          {tab === "stats" && (<div className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                {[
                { label: "Tổng lượt xem tháng", value: "3,840", sub: "+18% so tháng trước" },
                { label: "Tổng lượt nghe audio", value: "1,243", sub: "+11% so tháng trước" },
                { label: "Đánh giá trung bình", value: "4.8★", sub: "Từ 1,243 đánh giá" },
            ].map(item => (<div key={item.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{item.value}</p>
                    <p className="text-xs text-green-600 mt-0.5">{item.sub}</p>
                  </div>))}
              </div>

              {/* Hourly bar chart */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-1">Lượt truy cập theo giờ</h3>
                <p className="text-xs text-gray-400 mb-4">Khung giờ cao điểm du khách ghé thăm quán</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={HOURLY_DATA} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                    <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}/>
                    <Bar dataKey="visits" name="Lượt xem" fill="#f97316" radius={[5, 5, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Language Pie */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-1">Ngôn ngữ du khách</h3>
                  <p className="text-xs text-gray-400 mb-3">Phân bố ngôn ngữ khách ghé thăm quán</p>
                  <div className="flex items-center gap-3">
                    <ResponsiveContainer width="55%" height={150}>
                      <PieChart>
                        <Pie data={LANGUAGE_PIE} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                          {LANGUAGE_PIE.map((entry, i) => (<Cell key={i} fill={entry.fill}/>))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} formatter={(v) => [`${v}%`, ""]}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                      {LANGUAGE_PIE.map((item) => (<div key={item.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }}/>
                          <span className="text-xs text-gray-600 flex-1 truncate">{item.name}</span>
                          <span className="text-xs font-semibold text-gray-700">{item.value}%</span>
                        </div>))}
                    </div>
                  </div>
                </div>

                {/* Rating distribution */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-1">Phân bố đánh giá</h3>
                  <p className="text-xs text-gray-400 mb-3">Số sao từ khách hàng</p>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-orange-500">4.8</p>
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {[1, 2, 3, 4, 5].map(i => (<span key={i} className={`text-sm ${i <= 4 ? "text-orange-400" : "text-gray-200"}`}>★</span>))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">1,243 đánh giá</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((s, i) => {
                const pcts = [78, 14, 5, 2, 1];
                const fills = ["#f97316", "#fb923c", "#fbbf24", "#d1d5db", "#e5e7eb"];
                return (<div key={s} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-5">{s}★</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pcts[i]}%`, backgroundColor: fills[i] }}/>
                            </div>
                            <span className="text-xs text-gray-400 w-6 text-right">{pcts[i]}%</span>
                          </div>);
            })}
                    </div>
                  </div>
                </div>
              </div>
            </div>)}

          {/* === MESSAGES === */}
          {tab === "messages" && (<div className="space-y-3">
              {MOCK_MSGS.map((m) => (<motion.div key={m.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer hover:border-orange-200 transition-colors ${!m.read ? "border-orange-300" : "border-gray-100"}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                      {m.from[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-gray-800">{m.from}</p>
                        <span className="text-xs text-gray-400">{m.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{m.message}</p>
                    </div>
                    {!m.read && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5"/>}
                  </div>
                </motion.div>))}
            </div>)}

          {/* === SETTINGS === */}
          {tab === "settings" && (<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-lg space-y-5">
              <h3 className="font-semibold text-gray-800">Thông tin tài khoản</h3>
              {[
                { label: "Họ tên", value: user?.name },
                { label: "Email", value: user?.email },
                { label: "Tên quán", value: user?.shopName || "Chưa cập nhật" },
            ].map(({ label, value }) => (<div key={label}>
                  <label className="text-xs text-gray-400">{label}</label>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                    <button className="text-xs text-orange-500 hover:underline">Chỉnh sửa</button>
                  </div>
                  <div className="border-b border-gray-50 mt-2"/>
                </div>))}
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 text-sm font-medium hover:text-red-600 transition-colors mt-4">
                <LogOut size={15}/> Đăng xuất khỏi tài khoản
              </button>
            </div>)}

        </div>
      </div>
    </div>);
}
