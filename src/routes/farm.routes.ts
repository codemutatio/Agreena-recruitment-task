import { RequestHandler, Router } from "express";
import { FarmsController } from "modules/farms/farms.controller";

const router = Router();
const farmsController = new FarmsController();

/**
 * @openapi
 * '/api/farms':
 *  post:
 *     tags:
 *       - Farms
 *     summary: Create new Farm
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              $ref: '#/components/schemas/CreateFarmDto'
 *     responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/FarmDto'
 *      400:
 *        description: Bad request
 *      422:
 *        description: Unprocessable Entity
 */
router.post("/", farmsController.create.bind(farmsController) as RequestHandler);

/**
 * @openapi
 * '/api/farms':
 *   get:
 *     tags:
 *       - Farms
 *     summary: Retrieve a list of farms
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/GetFarmsQueryDto'
 *     responses:
 *       200:
 *         description: A list of farms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FarmDto'
 *       400:
 *         description: Bad request
 *       422:
 *         description: Unprocessable Entity
 */
router.get("/", farmsController.getFarms.bind(farmsController) as RequestHandler);

export default router;
