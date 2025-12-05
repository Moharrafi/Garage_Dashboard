module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/timers [external] (timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("timers", () => require("timers"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getConnection",
    ()=>getConnection,
    "query",
    ()=>query
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mysql2/promise.js [app-route] (ecmascript)");
;
const requiredEnv = [
    "MYSQL_HOST",
    "MYSQL_PORT",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DATABASE"
];
for (const key of requiredEnv){
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
const pool = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_POOL_SIZE ?? 10),
    timezone: "+00:00"
});
async function query(sql, params = []) {
    const [rows] = await pool.query(sql, params);
    return rows;
}
async function getConnection() {
    return pool.getConnection();
}
}),
"[project]/lib/auth/password.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40b33f995b231e84364047821324d655ace27a7d04":"hashPassword","707ad3260a1148b6a4fc6c07c7999ec713c3e15290":"verifyPassword"},"",""] */ __turbopack_context__.s([
    "hashPassword",
    ()=>hashPassword,
    "verifyPassword",
    ()=>verifyPassword
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-route] (ecmascript)");
;
;
async function hashPassword(password) {
    const salt = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(16).toString("hex");
    const hash = await new Promise((resolve, reject)=>{
        __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].scrypt(password, salt, 64, (error, derivedKey)=>{
            if (error) {
                reject(error);
            } else {
                resolve(derivedKey.toString("hex"));
            }
        });
    });
    return {
        hash,
        salt
    };
}
async function verifyPassword(password, hash, salt) {
    const derived = await new Promise((resolve, reject)=>{
        __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].scrypt(password, salt, 64, (error, derivedKey)=>{
            if (error) {
                reject(error);
            } else {
                resolve(derivedKey.toString("hex"));
            }
        });
    });
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    hashPassword,
    verifyPassword
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(hashPassword, "40b33f995b231e84364047821324d655ace27a7d04", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registerServerReference"])(verifyPassword, "707ad3260a1148b6a4fc6c07c7999ec713c3e15290", null);
}),
"[project]/lib/profile.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getOrCreateAdminProfile",
    ()=>getOrCreateAdminProfile,
    "saveAdminPassword",
    ()=>saveAdminPassword,
    "toPublicProfile",
    ()=>toPublicProfile,
    "updateAdminProfileFields",
    ()=>updateAdminProfileFields
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/password.ts [app-route] (ecmascript)");
;
;
;
const PROFILE_TABLE = "admin_profiles";
async function ensureProfileTable() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
    CREATE TABLE IF NOT EXISTS ${PROFILE_TABLE} (
      id CHAR(36) PRIMARY KEY,
      email VARCHAR(191) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      password_salt VARCHAR(255) NOT NULL,
      full_name VARCHAR(191) NOT NULL,
      phone VARCHAR(50),
      address TEXT,
      workshop_name VARCHAR(191),
      role ENUM('admin','staff','owner') NOT NULL DEFAULT 'staff',
      avatar_url TEXT,
      join_date DATE DEFAULT (CURRENT_DATE),
      notify_email TINYINT(1) DEFAULT 1,
      notify_push TINYINT(1) DEFAULT 1,
      notify_stock_alert TINYINT(1) DEFAULT 1,
      notify_unit_complete TINYINT(1) DEFAULT 1,
      notify_daily_report TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}
function mapProfile(row) {
    return {
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        phone: row.phone ?? "",
        address: row.address ?? "",
        workshop_name: row.workshop_name ?? "",
        role: row.role,
        avatar_url: row.avatar_url ?? "",
        join_date: row.join_date ? new Date(row.join_date).toISOString() : null,
        notify_email: Boolean(row.notify_email),
        notify_push: Boolean(row.notify_push),
        notify_stock_alert: Boolean(row.notify_stock_alert),
        notify_unit_complete: Boolean(row.notify_unit_complete),
        notify_daily_report: Boolean(row.notify_daily_report),
        created_at: row.created_at,
        updated_at: row.updated_at,
        password_hash: row.password_hash,
        password_salt: row.password_salt
    };
}
async function seedAdminProfile() {
    const email = process.env.APP_ADMIN_EMAIL ?? "admin@gtagarage.com";
    const password = process.env.APP_ADMIN_PASSWORD ?? "admin123";
    const { hash, salt } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$password$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])(password);
    const id = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomUUID();
    const defaultName = "Admin GTA Garage";
    const workshopName = "GTA Garage";
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO ${PROFILE_TABLE} (
      id, email, password_hash, password_salt, full_name, workshop_name, role,
      notify_email, notify_push, notify_stock_alert, notify_unit_complete, notify_daily_report
    ) VALUES (?, ?, ?, ?, ?, ?, 'admin', 1, 1, 1, 1, 0)`, [
        id,
        email,
        hash,
        salt,
        defaultName,
        workshopName
    ]);
}
async function getOrCreateAdminProfile() {
    await ensureProfileTable();
    const rows = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT * FROM ${PROFILE_TABLE} ORDER BY created_at ASC LIMIT 1`);
    if (rows.length > 0) {
        return mapProfile(rows[0]);
    }
    await seedAdminProfile();
    const seeded = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT * FROM ${PROFILE_TABLE} ORDER BY created_at ASC LIMIT 1`);
    return mapProfile(seeded[0]);
}
function toPublicProfile(profile) {
    const { password_hash: _hash, password_salt: _salt, ...rest } = profile;
    return rest;
}
async function updateAdminProfileFields(payload) {
    const profile = await getOrCreateAdminProfile();
    const fieldMap = {
        full_name: "full_name",
        email: "email",
        phone: "phone",
        address: "address",
        workshop_name: "workshop_name",
        avatar_url: "avatar_url",
        notify_email: "notify_email",
        notify_push: "notify_push",
        notify_stock_alert: "notify_stock_alert",
        notify_unit_complete: "notify_unit_complete",
        notify_daily_report: "notify_daily_report"
    };
    const updates = [];
    const values = [];
    Object.entries(payload).forEach(([key, value])=>{
        const column = fieldMap[key];
        if (!column || typeof value === "undefined" || value === null) return;
        if (typeof value === "boolean") {
            updates.push(`${column} = ?`);
            values.push(value ? 1 : 0);
        } else {
            updates.push(`${column} = ?`);
            values.push(value);
        }
    });
    if (updates.length === 0) {
        return profile;
    }
    updates.push("updated_at = NOW()");
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE ${PROFILE_TABLE} SET ${updates.join(", ")} WHERE id = ?`, [
        ...values,
        profile.id
    ]);
    return getOrCreateAdminProfile();
}
async function saveAdminPassword(hash, salt) {
    const profile = await getOrCreateAdminProfile();
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE ${PROFILE_TABLE} SET password_hash = ?, password_salt = ?, updated_at = NOW() WHERE id = ?`, [
        hash,
        salt,
        profile.id
    ]);
    return profile.id;
}
}),
"[project]/app/api/profile/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/profile.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const profile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOrCreateAdminProfile"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toPublicProfile"])(profile));
    } catch (error) {
        console.error("Failed to load profile:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Gagal memuat profil"
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const payload = await request.json();
        if (!payload || typeof payload !== "object") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: "Data tidak valid"
            }, {
                status: 400
            });
        }
        const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["updateAdminProfileFields"])(payload);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profile$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["toPublicProfile"])(updated));
    } catch (error) {
        console.error("Failed to update profile:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "Gagal memperbarui profil"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6ec64aac._.js.map