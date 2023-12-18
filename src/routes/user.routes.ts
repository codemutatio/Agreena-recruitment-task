import { RequestHandler, Router } from "express";
import { authMiddleware } from "middlewares/auth.middleware";
import { UsersController } from "modules/users/users.controller";

const router = Router();
const usersController = new UsersController();

/**
 * @openapi
 * '/api/users':
 *  post:
 *     tags:
 *       - User
 *     summary: Create a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserDto'
 *      400:
 *        description: Bad request
 */
router.post("/", usersController.create.bind(usersController) as RequestHandler);

/**
 * @openapi
 * '/api/users/location':
 *  post:
 *     tags:
 *       - User
 *     summary: Update a User location data
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/UpdateUserLocationDataDto'
 *     responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserDto'
 *      400:
 *        description: Bad request
 */
router.post("/location", authMiddleware, usersController.updateUserLocation.bind(usersController) as RequestHandler);

export default router;
