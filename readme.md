
# Application Installation and Usage Instructions
### Information;
This application is designed to be the back-end of an eCommerce site. Here you will find all the functionalities to CREATE, READ, UPDATE and DELETE data in the database through API endpoints.

An Admin Panel is included as the only front-end. Here you can manage the website.

This application was built with nodeJS language, expressJS framework, sequelize ORM to interact with the mySQL database.

### Installation and Instruction:
1. Clone the Repository
2. Install all dependencies using the command "npm install" in your terminal
3. Get TOKEN_SECRET by opening terminal and use the command "node" then enter the code "require('crypto').randomBytes(64).toString('hex')". You will get a code that you place in your .env as TOKEN_SECRET
4. To start the App use the command "npm start" in the terminal
5. Use an API client like Postman to run the /init endpoint(NOTE: DO THIS BEFORE YOU ADD ANYTHING ELSE TO THE DATABASE)
6. Now you can run a test if you use the command "npm test" in the terminal(NOTE: RUN /init BEFORE RUNNING TEST)
 
# Environment Variables
- ADMIN_USERNAME = "YOUR_USERNAME"
- ADMIN_PASSWORD = "YOUR_PASSWORD"
- DATABASE_NAME = "YOUR_DATABASE"
- DIALECT = "mysql"
- DIALECTMODEL = "mysql2"
- PORT = "YOUR_PORT"
- HOST = "YOUR_HOST"
- TOKEN_SECRET= YOUR_TOKEN_SECRET

# Additional Libraries/Packages
### Packages used:
   - "cookie-parser": "~1.4.4",
   - "crypto": "^1.0.1",
   - "debug": "~2.6.9",
   - "dotenv": "^16.3.1",
   - "ejs": "^3.1.9",
   - "express": "^4.18.2",
   - "http-errors": "~1.6.3",
   - "jest": "^29.7.0",
   - "jsonwebtoken": "^9.0.2",
   - "morgan": "~1.9.1",
   - "mysql": "^2.18.1",
   - "mysql2": "^3.1.0",
   - "sequelize": "^6.35.1",
   - "supertest": "^6.3.3",
   - "swagger-autogen": "^2.23.7",
   - "swagger-ui-express": "^5.0.0"

# NodeJS Version Used
- v18.16.0

# SWAGGER Documentation link
Use this link only after app is started.
- http://localhost:3000/doc/

# Acknowledgements/Resources
1. Noroff lessons
2. chatGPT for some error handling.
3. Cookies Security: https://dev.to/petrussola/today-s-rabbit-hole-jwts-in-httponly-cookies-csrf-tokens-secrets-more-1jbp
