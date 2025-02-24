// api/salvarNoSnowflake.js
const snowflake = require("snowflake-sdk");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const dados = req.body;

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

      // Inserindo os dados no Snowflake
      dados.forEach(async (dado) => {
        const query = `
          INSERT INTO respostas_escalas (
            medico, coordenacao, tipoPreenchimento, unidade, data, horario, observacoes
          ) VALUES (
            '${dado.medico}', '${dado.coordenacao}', '${dado.tipoPreenchimento}', '${dado.unidade}', 
            TO_DATE('${dado.data}', 'YYYY-MM-DD'), '${dado.horario}', '${dado.observacoes}'
          )
        `;
        
        connection.execute({
          sqlText: query,
          complete: (err, stmt, rows) => {
            if (err) {
              console.log("Erro ao executar consulta: " + err.message);
            } else {
              console.log("Dados inseridos com sucesso.");
            }
          },
        });
      });

      res.status(200).json({ message: "Dados enviados com sucesso!" });
      connection.destroy();
    });
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}
