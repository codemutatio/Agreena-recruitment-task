import { RequestHandler, Router } from "express";
import { AuthController } from "modules/auth/auth.controller";

const router = Router();
const authController = new AuthController();

/**
 * @openapi
 * '/api/auth/login':
 *  post:
 *     tags:
 *       - Auth
 *     summary: Authenticate user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/LoginUserDto'
 *     responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserDto'
 *      400:
 *        description: Bad request
 *      422:
 *        description: Unprocessable Entity
 */
router.post("/login", authController.login.bind(authController) as RequestHandler);

export default router;
