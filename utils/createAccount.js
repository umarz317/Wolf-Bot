const {generatePrivateKey,privateKeyToAccount} = require('viem/accounts')

function getAccount(){
    const pk = generatePrivateKey()
    const address = privateKeyToAccount(pk).address
    //add logic to save account and pk to db
    return {address:address,pk:pk}
}

module.exports = getAccount

