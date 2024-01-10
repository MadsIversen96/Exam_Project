const request = require("supertest");
const app = require("../app")

// NOTE: POPULATE THE DATABASE WITH /init ENDPOINT BEFORE STARTING THE TESTS AND "db.sequelize.sync({ force: false })" in app.js 

// TEST 1
let token;

describe("Testing all CRUDS for /categories", () => {
    
    beforeAll(async () => {
        const credentials = {
            emailOrUsername: "admin",
            password: "P@ssword2023"
        }
        const {body} = await request(app).post("/auth/login").send(credentials);
        token = body.token;
    });

    test("GET /categories - success", async() => {
       const { body } = await request(app).get("/categories").send();
       console.log(body);
       expect(body.status).toBe(200);
       expect(body).toHaveProperty('result')
    });
    let newCategoryId;
    test("POST /categories - success", async() => {
        
        const newCategory = { name: "TEST_CATEGORY" }

        const { body } = await request(app).post("/categories").set("Cookie", `token=${token}` ).send(newCategory);
        console.log(body);
        expect(body.status).toBe(201);
        expect(body.message).toBe('Category added successfully')
        expect(body).toHaveProperty('result')
        
        newCategoryId = body.result.id;
    });

    test("PUT /categories/:id - success", async() => {
        const updateRequest = { name: "UPDATED_CATEGORY"}

        const { body } = await request(app).put(`/categories/${newCategoryId}`).set("Cookie", `token=${token}` ).send(updateRequest);
        console.log(body);
        expect(body.status).toBe(201);
        expect(body.message).toBe('Category updated successfully');
    });

    test("DELETE /categories/:id - success", async() => {
        const { body } = await request(app).delete(`/categories/${newCategoryId}`).set("Cookie", `token=${token}` ).send();
        console.log(body);
        expect(body.status).toBe(200);
        expect(body.message).toBe('Category deleted successfully');
    })

})

// TEST 2
describe("Testing all CRUDS for /products", () => {

    test("GET /products - success", async() => {
        const { body } = await request(app).get("/products").send();
        expect(body.status).toBe(200);
        expect(body).toHaveProperty('result')
    })
   
    let newProductId;
    test("POST /products - success", async () => {
        // First creates new category cause it gets deleted in in TEST 1
        const newCategory = { name: "TEST_CATEGORY" } 
        await request(app).post("/categories").set("Cookie", `token=${token}` ).send(newCategory); 
         
        const newProduct = { 
            name: "TEST_PRODUCT",
            description: "This is a testing product",
            quantity: 10,
            price: 999,
            brandId: 1, // Can also use the brand name
            categoryId: "TEST_CATEGORY",
            imgurl: "Some URL"
        }

        const { body } = await request(app).post("/products").set("Cookie", `token=${token}` ).send(newProduct);
        console.log(body);
        expect(body.status).toBe(201);
        expect(body.message).toBe('Product created successfully')
        expect(body).toHaveProperty('result')
        
        newProductId = body.result.id;
        
    })

    test("PUT /products/:id - success", async () => {
        const updateRequest = {
            name: "UPDATED_PRODUCT",
            description: "This is a updated product",
            quantity: 15,
            price: 499,
            brandId: 2, // Can also use brand name
            categoryId: 2, // Can also use category name
            imgurl: "Some updated URL"
        }

        const { body } = await request(app).put(`/products/${newProductId}`).set("Cookie", `token=${token}` ).send(updateRequest);
        console.log(body);
        expect(body.status).toBe(201);
        expect(body.message).toBe('Product updated successfully');
    })

    // This is a soft delete. isDeleted property will change to true/1
    test("DELETE /products/:id - success", async() => {
        const { body } = await request(app).delete(`/products/${newProductId}`).set("Cookie", `token=${token}` ).send();
        console.log(body);
        expect(body.status).toBe(200);
        expect(body.message).toBe('Product deleted successfully');

    })


})

// TEST 3
describe("Testing valid and invalid logins for /auth/login", () => {

    test("POST /auth/login - success", async() => {
        const credentials = {
            emailOrUsername: "admin",
            password: "P@ssword2023"
        }
        const {body} = await request(app).post("/auth/login").send(credentials);
        console.log(body);
        expect(body.status).toBe(200);
        expect(body.message).toBe("You are logged in");
        expect(body).toHaveProperty("token");
    })

    test("POST /auth/login - fail", async() => {
        const credentials = {
            emailOrUsername: "newUser",
            password: "0000"
        }
        const {body} = await request(app).post("/auth/login").send(credentials);
        console.log(body);
        expect(body.status).toBe(401);
        expect(body.message).toBe("Incorrect email or password");

    })
    
})

 