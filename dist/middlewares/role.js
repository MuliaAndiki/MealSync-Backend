"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ status: 401, message: "Unauthorized" });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ status: 403, message: "Forbidden" });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
