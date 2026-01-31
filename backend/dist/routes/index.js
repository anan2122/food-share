"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.impactRoutes = exports.analyticsRoutes = exports.notificationRoutes = exports.pickupRoutes = exports.donationRoutes = exports.userRoutes = exports.authRoutes = void 0;
var auth_routes_1 = require("./auth.routes");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(auth_routes_1).default; } });
var user_routes_1 = require("./user.routes");
Object.defineProperty(exports, "userRoutes", { enumerable: true, get: function () { return __importDefault(user_routes_1).default; } });
var donation_routes_1 = require("./donation.routes");
Object.defineProperty(exports, "donationRoutes", { enumerable: true, get: function () { return __importDefault(donation_routes_1).default; } });
var pickup_routes_1 = require("./pickup.routes");
Object.defineProperty(exports, "pickupRoutes", { enumerable: true, get: function () { return __importDefault(pickup_routes_1).default; } });
var notification_routes_1 = require("./notification.routes");
Object.defineProperty(exports, "notificationRoutes", { enumerable: true, get: function () { return __importDefault(notification_routes_1).default; } });
var analytics_routes_1 = require("./analytics.routes");
Object.defineProperty(exports, "analyticsRoutes", { enumerable: true, get: function () { return __importDefault(analytics_routes_1).default; } });
var impact_routes_1 = require("./impact.routes");
Object.defineProperty(exports, "impactRoutes", { enumerable: true, get: function () { return __importDefault(impact_routes_1).default; } });
//# sourceMappingURL=index.js.map