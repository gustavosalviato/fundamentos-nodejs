import express, { json } from "express";
import { v4 as uuidv4 } from "uuid";

const app = express();

const customers = [];

app.use(express.json());

app.listen(3333);

function verifyIfExistCPF(request, response, next) {
  const { cpf } = request.params;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, obj) => {
    if (obj.type === "credit") {
      return acc + obj.amount;
    } else {
      return acc - obj.amount;
    }
  }, 0);

  return balance;
}

app.post("/accounts", (req, res) => {
  const { cpf, name } = req.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists" });
  }

  customers.push({
    id: uuidv4(),
    cpf,
    name,
    statement: [],
  });

  return res.status(201).send();
});

app.get("/statement/:cpf", verifyIfExistCPF, (req, res) => {
  const { customer } = req;
  return res.json(customer.statement);
});

app.post("/deposit/:cpf", verifyIfExistCPF, (req, res) => {
  const { description, amount } = req.body;

  const { customer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.post("/withdraw/:cpf", verifyIfExistCPF, (req, res) => {
  const { amount } = req.body;
  const { customer } = req;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).json({ error: "Insufficient funds" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return res.status(201).send();
});

app.get("/balance/:cpf", verifyIfExistCPF, (req, res) => {
  const { customer } = req;

  const balance = getBalance(customer.statement);

  return res.json({ balance });
});

app.get("/statement/date/:cpf", verifyIfExistCPF, (req, res) => {
  const { customer } = req;

  const { date } = req.query;

  const formattedDate = new Date(date + " 00:00");

  const statementFiltered = customer.statement.filter((statement) => {
    return (
      statement.created_at.toDateString() ===
      new Date(formattedDate).toDateString()
    );
  });

  return res.json(statementFiltered);
});

app.put("/account/:cpf", verifyIfExistCPF, (req, res) => {
  const { customer } = req;

  const { name } = req.body;

  customer.name = name;

  return res.status(201).send();
});

app.get("/account/:cpf", verifyIfExistCPF, (req, res) => {
  const { customer } = req;

  return res.json(customer);
});

app.delete("/account/:cpf", verifyIfExistCPF, (req, res) => {
  const { customer } = req;

  customers.splice(customer, 1);

  return res.status(200).json(customers);
});
