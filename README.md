# SyncStage Web Test Application

This application is a test environment for SyncStage web SDK. It allows you to run the application using docker-compose or without it. Please note that the backend code provided in this application is exemplary and should not be used as-is in a production environment.

## Running the application with Docker Compose

1. Ensure Docker and docker-compose are installed on your machine.
2. Copy the SyncStageSecret.json file into the backend/src path.
3. Open a terminal and navigate to the root directory of the application.
4. Run the following command: docker-compose up
5. The application will start and you can access it in your browser at http://localhost:3001 (it might take some time to load, because it runs in development mode)

## Running the application without Docker Compose

1. Ensure Node.js, npm and yarn are installed on your machine.
2. Install the required dependencies for both backend and frontend:
3. Navigate to the backend directory and run: yarn install
4. Navigate to the web-application directory and run: yarn install
5. Copy the SyncStageSecret.json file into the backend/src path.
6. Open a terminal and navigate to the backend directory.
7. Start the backend server by running: yarn start
8. Open another terminal and navigate to the web-application directory.
9. Start the frontend server by running: yarn start
10. The application will start and you can access it in your browser at http://localhost:3001.

You can view the server API Swagger definition under: http://localhost:3000/api-docs 

## Important Notes

* The SyncStageSecret.json file contains sensitive information and should be handled securely.
* The dummy user-db.json file stores user information in plaintext and should not be used in a production environment.
* The server also contains a dummy implementation of generating and validating JWT tokens. This is for testing purposes only and should not be used in a production environment.
