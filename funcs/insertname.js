require('dotenv').config();
const { GoogleSpreadsheet } = require("google-spreadsheet");

const defaultDocID = "1an_8E_eUJQSM2c10zAASHotbkzm0m9Sjrp-89JwcvK0";

exports.handler = async (event) => {

    console.log(event.queryStringParameters);

    const newName = (event.queryStringParameters.name) || "Aucun nom";
    const docID = (event.queryStringParameters.doc) || defaultDocID;

    addName(newName, docID);

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            ...event.queryStringParameters, 
            oldkey: process.env.GOOGLE_PRIVATE_KEY,
            key: process.env.GOOGLE_PRIVATE_KEY.split("\\n").join("\n")
        })
    }
}

async function addName(nameToAdd, cID) {
    const doc = new GoogleSpreadsheet(cID);
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.split("\\n").join("\n"),
    });
    await doc.loadInfo();

    const sheetTitle = (new Date()).toLocaleDateString("fr-FR", { timeZone: "Africa/Libreville" });
    let sheet = null;

    // Find a sheet which has day as name
    for (s of doc.sheetsByIndex) {
        if (s.title == sheetTitle) {
            sheet = s;
            break;
        }
    }

    // Line to add
    let ligne = [
        "=LIGNE()-1",
        (new Date()).toLocaleString("fr-FR", { timeZone: "Africa/Libreville" }),
        nameToAdd,
    ];

    // Create a new sheet if not exists
    if (!sheet) {
        sheet = await doc.addSheet({ title: sheetTitle });
        await sheet.setHeaderRow(["#", "Heure", "Nom"]);
    }

    // Add a new line with attendee information
    sheet.addRow(ligne);
}
