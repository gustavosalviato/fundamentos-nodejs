## Fundamentos Node.js

Esse repositório contém conteúdo de aprendizado sobre Node.js do total zero, colocando em prática os conceitos estudados durante o primeiro módulo do Ignite Node.js.

## Testes

Essa é a parte de funcionalidades e regras de negócio da aplicação utilizando testes com Jest e supertest.

## Especificação dos Testes <br/><br/>

**POST - /accounts**

- **should be able to create a new customer account** <br/>

- A rota deve receber cpf e username dentro do corpo da requisição. Ao cadastrar uma nova conta, ele dever ser armazenado dentro de um objeto no seguinte formado:

```js
{
	id: 'uuid', // precisa ser um uuid
	name: 'Gustavo Henrique',
	username: 'gust',
    statement: []
}
```

- Certifique-se que o ID seja um UUID e sempre inicializar a lista de statement como um array vazio.

- A conta criada deve ser retornada no corpo da requisição.

- **should not be able to create a existing customer account**

- Não deve permitir criar um usuárioa já existente e retornar um resposta com o status 400 e um json com o seguinte formato

```js
{
  error: "Customer already exists";
}
```

**POST - /deposit**

- **should be able to create a new deposit**

- A Rota deve receber amount e description no corpo da requisição.
- É necessário que seja enviado o cpf pelo header da requisição contento o cpf do usuário.
- Todo depósito deve ser conter a propriedade type como "credit".

- **should not be able to create a new deposit to a non existing account**

- Não deve permitir a criação de depósito para uma conta que não exista e retornar uma resposta contendo com status **404** e um json no seguinte formato:

```js
{
  error: "Customer not found";
}
```

**PUT - /account**

- **should be able to update an existing account**

- A Rota deve receber somente o name no corpo da requisição.
- É necessário que seja enviado o cpf pelo header da requisição contento o cpf do usuário.
- Ao completar a atualização de conta deve-se retornar o status "204 - No Content".

- **should not be able to update an existing customer account**

- Não deve permitir a atualização de customer não exista e retornar uma resposta contendo com status **404** e um json no seguinte formato:

```js
{
  error: "Customer not found";
}
```

**GET - /account**

- **should be able to list account information**

- É necessário que seja enviado o cpf pelo header da requisição contento o cpf do usuário.
- Ao completar a requisiçãodeve-se retornar o status "200 - Ok".

**DELETE - /account**

- **should be able to delete an existing account**

- É necessário que seja enviado o cpf pelo header da requisição contento o cpf do usuário.
- Ao completar a requisição de conta deve-se retornar o status "204 - No Content".

- **should not be able to delete an non existing account**

- Não deve permitir excluir um conta de customert que não exista, retornando um resposta com status **404** um json com o seguinte formato.

```js
{
  error: "Customer not found";
}
```

**GET - /balance**

- **should be able to list balance of an account**

- É necessário que seja enviado o cpf pelo header da requisição contento o cpf do usuário.
- Ao completar a requisição de conta deve-se retornar o status "200 - Ok".

**POST - /withdraw**

- **should be able to withdraw a balance**

- É necessário que seja enviado o cpf pelo header da requisição contento o cpf do usuário.

- **should not be able to withdraw a value greater than user's balance**
- Não deve ser possível realizar um saque de valor maior disponível no balanço do customer. Deve retornar um resposta com o status 400 e um json com o seguinte formato:

```js
{
  error: "Insufficient funds";
}
```
