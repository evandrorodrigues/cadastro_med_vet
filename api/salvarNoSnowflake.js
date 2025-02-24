const snowflake = require("snowflake-sdk");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { medico, coordenacao, tipoPreenchimento, unidade, data, horario, observacoes } = req.body;

  // Configuração do Snowflake
  const connection = snowflake.createConnection({
    account: "DF05068",
    username: "EVANDRO_CARVALHO",
    password: "Naninho1305!!!",
    warehouse: "SERES_WH",
    database: "SERES",
    schema: "DADOS_SERES",
  });

  connection.connect((err) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao conectar com o Snowflake: " + err.message });
    }

    // Query para inserir os dados
    const query = `
      INSERT INTO respostas_escalas (
        medico, coordenacao, tipoPreenchimento, unidade, data, horario, observacoes
      ) VALUES (
        ?, ?, ?, ?, TO_DATE(?, 'YYYY-MM-DD'), ?, ?
      )`;

    connection.execute({
      sqlText: query,
      binds: [medico, coordenacao, tipoPreenchimento, unidade, data, horario, observacoes],
      complete: (err, stmt, rows) => {
        if (err) {
          console.log("Erro ao inserir dados: " + err.message);
          return res.status(500).json({ error: "Erro ao salvar dados" });
        }

        console.log("Dados inseridos com sucesso.");
        res.status(200).json({ message: "Dados enviados com sucesso!" });

        connection.destroy();
      },
    });
  });
}
