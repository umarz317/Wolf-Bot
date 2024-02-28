const {generatePrivateKey,privateKeyToAccount} = require('viem/accounts')

function getAccount(){
    const pk = generatePrivateKey()
    const account = privateKeyToAccount(pk).address
    //add logic to save account and pk to db
    return {account:account,pk:pk}
}

module.exports = getAccount

