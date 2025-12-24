const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

// memória (trocar por DB depois)
const accessCodes = {}; // code: { approved: bool }
const keys = {};        // accessCode: key

// gerar código ao entrar
app.get("/generate-code", (req, res) => {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    accessCodes[code] = { approved: false };

    console.log("Novo código gerado:", code);

    res.json({
        code,
        approved: false
    });
});

// DEV autoriza código
app.post("/approve-code", (req, res) => {
    const { code } = req.body;

    if (!accessCodes[code]) {
        return res.status(404).json({ error: "Código não existe" });
    }

    accessCodes[code].approved = true;
    res.json({ success: true });
});

// verificar permissão
app.get("/check-code/:code", (req, res) => {
    const data = accessCodes[req.params.code];

    if (!data) return res.json({ approved: false });
    res.json({ approved: data.approved });
});

// gerar key após permissão
app.get("/generate-key/:code", (req, res) => {
    const data = accessCodes[req.params.code];

    if (!data || !data.approved) {
        return res.status(403).json({ error: "Sem permissão" });
    }

    if (!keys[req.params.code]) {
        const rand = Math.floor(100000 + Math.random() * 900000);
        keys[req.params.code] = `SxzHub-Premium_${rand}`;
    }

    res.json({ key: keys[req.params.code] });
});

app.listen(3000, () => {
    console.log("API SXZ Hub rodando na porta 3000");
});
