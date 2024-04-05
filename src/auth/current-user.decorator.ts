import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "./entities/user.schema";
import { Request } from "express";

export const CurrentUser = createParamDecorator<User>(
    (data: unknown, ctx: ExecutionContext) => {
        const request: Request & { user: User } = ctx.switchToHttp().getRequest();
        return request.user;
    }
);
