const express = require("express");
const cors = require("cors");
const axios = require("axios");

const fs = require("fs");
const jwt = require("jsonwebtoken");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// region Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SyncStage based web app backend apy API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./server.js"], // files containing annotations as above
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
// endregion

// region JWT setup
const JWT_SECRET = "your-secret-key";
const authenticateJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
// endregion

// region Express setup
const app = express();
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// endregion

// region SyncStageSecret
const syncStageSecret = JSON.parse(
  fs.readFileSync("SyncStageSecret.json", "utf8")
);
// endregion

// region main API

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags:
 *       - [Authentication]
 *     security: []
 *     summary: Logs in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: Returns a JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid username or password
 */
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync("user-db.json", "utf8"));
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

/**
 * @swagger
 * /api/fetch-token:
 *   get:
 *     tags:
 *       - [SyncStageSDK Authentication]
 *     security:
 *       - bearerAuth: []
 *     summary: Returns a token for Desktop Agent Provisioning
 *     responses:
 *       200:
 *         description: Token for Desktop Agent Provisioning
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jwt:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
app.get("/api/fetch-token", authenticateJwt, async (req, res) => {
  try {
    const path = `${
      process.env.BASE_API_PATH || "https://api.sync-stage.com"
    }/sdk/web/login`;

    console.log(path);

    const response = await axios.post(
      path,
      {
        ...syncStageSecret,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { jwt } = response.data;
    res.json({ jwt });
  } catch (error) {
    console.error(error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    res.status(500).json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// endregion
