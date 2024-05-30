const { generateEncryptionKey } = require("./utils/keyManagement");
const {parse,stringify} = require("envfile")
const fs = require("fs");

function generateAndSaveKey(){
    console.log("Generating new encryption key...");
    var key = generateEncryptionKey(); 
    var file = fs.readFileSync(".env");
    var env = parse(file);
    env['ENCRYPTION_KEY'] = key;
    fs.writeFileSync(".env",stringify(env));
    console.log("New encryption key generated and saved in .env file");
}

generateAndSaveKey();