const publicClient = require("../utils/client");

/*
    Implement removing the event listener logic,
    and add the logic to watch for pending transactions
*/

// publicClient.watchPendingTransactions({
//   onTransactions: (hashes) => {
//     console.log(hashes);

//   },
//   onError: (error) => {
//     console.log(error);
//   }
// });

//get tx data
function getTransactions(hashes){
    hashes = ['0x8c9020e91375e7b55ff78a0783d65a34456c25e133737bca5ad21c279a84ce10']
    publicClient.getTransaction({hash:hashes[0]}).then((transactions) => {
        console.log(transactions)
    })
}

//filer older tx?
async function getCurrentBlock(){
    let block = await publicClient.getBlockNumber()
    return block
}

//decode tx data to find function selector





