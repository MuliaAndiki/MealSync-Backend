import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../types/auth.types";

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload | undefined;
    if (!user) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ status: 403, message: "Forbidden" });
    }
    next();
  };
};
