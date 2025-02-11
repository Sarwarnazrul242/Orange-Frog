const bcrypt = require('bcrypt');

async function generateHash(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Hashed Password:", hashedPassword);
}

generateHash("112233");