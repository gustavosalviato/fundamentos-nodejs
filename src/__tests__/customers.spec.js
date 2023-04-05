const request = require("supertest");
const { validate } = require("uuid");
const { response, set } = require("../");
const app = require("../");

describe("Customers", () => {
  it("should be able to create a new customer account", async () => {
    const response = await request(app).post("/accounts").send({
      cpf: "11706985444",
      name: "John Doe",
    });

    expect(201);
    expect(validate(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      name: "John Doe",
      cpf: "11706985444",
      statement: [],
    });
  });

  it("should not be able to create a existing customer account", async () => {
    const response = await request(app)
      .post("/accounts")
      .send({
        cpf: "11706985444",
        name: "John Doe",
      })
      .expect(400);

    expect(response.body.error).toBeTruthy();
  });

  it("should be able to create a deposit", async () => {
    const accountResponse = await request(app).post("/accounts").send({
      cpf: "111111111",
      name: "John Doe 1",
    });

    const statementDate = new Date();

    const response = await request(app)
      .post("/deposit")
      .send({
        description: "test description",
        amount: 10,
        created_at: statementDate,
      })
      .set("cpf", accountResponse.body.cpf)
      .expect(201);

    expect(response.body).toMatchObject({
      description: "test description",
      amount: 10,
      type: "credit",
    });
  });

  it("should not be able to create a new deposit to a non existing account", async () => {
    const response = await request(app)
      .post("/deposit")
      .send({
        description: "Test description",
        amount: 18000,
      })
      .set("cpf", "8527126857")
      .expect(404);

    expect(response.body.error).toBeTruthy();
  });

  it("should be able to list all account's statement", async () => {
    const accountResponse = await request(app).post("/accounts").send({
      cpf: "222222222",
      name: "John Doe 2",
    });

    const statementDate = new Date();

    const depositResponse = await request(app)
      .post("/deposit")
      .send({
        description: "test description",
        amount: 10,
        created_at: statementDate,
      })
      .set("cpf", accountResponse.body.cpf);

    const statementResponse = await request(app)
      .get("/statement")
      .set("cpf", accountResponse.body.cpf)
      .expect(200);

    expect(statementResponse.body).toEqual(
      expect.arrayContaining([depositResponse.body])
    );
  });

  it("should not be able to list all account's statement to an non existing customer account ", async () => {
    const response = await request(app)
      .get("/statement")
      .set("cpf", "8527126857")
      .expect(404);

    expect(response.body.error).toBeTruthy();
  });

  it("should be able to update an existing account", async () => {
    const accountResponse = await request(app).post("/accounts").send({
      cpf: "777777777",
      name: "John Smith",
    });

    await request(app)
      .put("/account")
      .send({
        name: "John Smith Antony",
      })
      .set("cpf", accountResponse.body.cpf)
      .expect(204);
  });

  it("should not be able to update an existing customer account", async () => {
    const response = await request(app)
      .put("/account")
      .send({
        name: "Test modified",
      })
      .set("cpf", "8527126857")
      .expect(404);

    expect(response.body.error).toBeTruthy();
  });

  it("should be able to list account information", async () => {
    const accountResponse = await request(app).post("/accounts").send({
      cpf: "333333333",
      name: "John Dorian",
    });

    const getAccountResponse = await request(app)
      .get("/account")
      .set("cpf", accountResponse.body.cpf)
      .expect(200);

    expect(getAccountResponse.body).toMatchObject(accountResponse.body);
  });

  it("should be able to delete an existing account", async () => {
    const accountResponse = await request(app).post("/accounts").send({
      cpf: "888888888",
      name: "John Hawley",
    });

    await request(app)
      .delete("/account")
      .set("cpf", accountResponse.body.cpf)
      .expect(204);
  });

  it("should not be able to delete an non existing account", async () => {
    const response = await request(app)
      .delete("/account")
      .set("cpf", "8527126857")
      .expect(404);

    expect(response.body.error).toBeTruthy();
  });

  it("should be able to list balance of an account", async () => {
    const accountResponse = await request(app).post("/accounts").send({
      cpf: "1717171717",
      name: "John Doe 17",
    });

    const statementDate = new Date();

    await request(app)
      .post("/deposit")
      .send({
        description: "test description",
        amount: 1500,
        created_at: statementDate,
      })
      .set("cpf", accountResponse.body.cpf)
      .expect(201);

    const response = await request(app)
      .get("/balance")
      .set("cpf", accountResponse.body.cpf)
      .expect(200);

    expect(response.body).toMatchObject({
      balance: 1500,
    });
  });

  it("should be able to  withdraw a balance", async () => {
    const accountResponse = await request(app).post("/accounts").send({
      cpf: "18181818",
      name: "John Doe 18",
    });

    const statementDate = new Date();

    await request(app)
      .post("/deposit")
      .send({
        description: "John Doe - Deposit",
        amount: 2500,
        created_at: statementDate,
      })
      .set("cpf", accountResponse.body.cpf);

    const withdrawResponse = await request(app)
      .post("/withdraw")
      .send({
        amount: 2000,
      })
      .set("cpf", accountResponse.body.cpf)
      .expect(201);

    const response = await request(app)
      .get("/balance")
      .set("cpf", accountResponse.body.cpf);

    expect(withdrawResponse.body).toMatchObject({
      amount: 2000,
      type: "debit",
    });
    expect(response.body).toMatchObject({
      balance: 500,
    });
  });

  it("should list only statement whos matching with the given date", async () => {
    const accountResponse = await request(app).post("/accounts").send({
      cpf: "19191919",
      name: "John Doe 19",
    });

    const firstStatementDate = new Date();

    const firstDeposit = await request(app)
      .post("/deposit")
      .send({
        description: "first description",
        amount: 10,
        created_at: firstStatementDate,
      })
      .set("cpf", accountResponse.body.cpf)
      .expect(201);

    const year = firstStatementDate.getFullYear();
    const month = String(firstStatementDate.getMonth() + 1).padStart(2, "0");
    const day = String(firstStatementDate.getDate()).padStart(2, "0");

    const date = `${year}-${month}-${day}`;

    const response = await request(app)
      .get(`/statement/date?date=${date}`)
      .set("cpf", accountResponse.body.cpf)
      .expect(200);

    expect(response.body).toEqual(expect.arrayContaining([firstDeposit.body]));
  });

  it("should not be able to withdraw a value greater than user's balance", async () => {
    const response = await request(app)
      .post("/withdraw")
      .send({
        amount: 1000,
      })
      .set("cpf", "18181818")
      .expect(400);

    expect(response.body.error).toBeTruthy();
  });
});
