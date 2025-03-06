"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var http_1 = require("http");
var ws_1 = require("ws");
var ioredis_1 = require("ioredis");
var firebase_admin_1 = require("firebase-admin");
var dotenv_1 = require("dotenv");
// 🔥 Configurar Variáveis de Ambiente
dotenv_1.default.config();
// 🔥 Inicializar Firebase
var serviceAccount = require("./serviceAccountKey.json"); // Baixa isso do Firebase Console
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    databaseURL: "https://teuprojeto.firebaseio.com",
});
var db = firebase_admin_1.default.firestore();
// 🔥 Configurar Redis
var redis = new ioredis_1.default();
// 🔥 Criar o servidor HTTP e WebSocket
var app = (0, express_1.default)();
var server = (0, http_1.createServer)(app);
var wss = new ws_1.WebSocketServer({ server: server });
// 🔥 Armazena conexões ativas
var users = new Map();
wss.on("connection", function (ws) {
    console.log("🔗 Novo usuário conectado");
    ws.on("message", function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var data, to, from, message_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = JSON.parse(message);
                    if (!(data.type === "join_queue")) return [3 /*break*/, 2];
                    console.log("\u2705 Usu\u00E1rio ".concat(data.userId, " entrou na fila"));
                    return [4 /*yield*/, redis.lpush("queue", data.userId)];
                case 1:
                    _b.sent(); // Adiciona o usuário na fila
                    users.set(data.userId, ws);
                    matchUsers();
                    _b.label = 2;
                case 2:
                    if (!(data.type === "send_message")) return [3 /*break*/, 4];
                    to = data.to, from = data.from, message_1 = data.message;
                    if (users.has(to)) {
                        (_a = users.get(to)) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({ type: "receive_message", from: from, message: message_1 }));
                    }
                    // 🔥 Salva a mensagem no Firebase
                    return [4 /*yield*/, db.collection("chats").add({ from: from, to: to, message: message_1, timestamp: Date.now() })];
                case 3:
                    // 🔥 Salva a mensagem no Firebase
                    _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); });
    ws.on("close", function () {
        console.log("❌ Usuário desconectado");
    });
});
// 🔄 Função para parear usuários
function matchUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var user1, user2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, redis.rpop("queue")];
                case 1:
                    user1 = _c.sent();
                    return [4 /*yield*/, redis.rpop("queue")];
                case 2:
                    user2 = _c.sent();
                    if (user1 && user2) {
                        console.log("\uD83D\uDD17 Pareando ".concat(user1, " com ").concat(user2));
                        (_a = users.get(user1)) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify({ type: "matched", partner: user2 }));
                        (_b = users.get(user2)) === null || _b === void 0 ? void 0 : _b.send(JSON.stringify({ type: "matched", partner: user1 }));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// 🔥 Iniciar Servidor
var PORT = process.env.PORT || 3000;
server.listen(PORT, function () { return console.log("\uD83D\uDE80 Servidor rodando na porta ".concat(PORT)); });
