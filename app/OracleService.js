//1. Dependecias 
const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const fetch = require("node-fetch");
require('dotenv').config();

// const fetch =  import('node-fetch');

// 2. json de los contratos
const contractJson = require('../build/contracts/Oracle.json');


//3. Instancia de web3
const web3 = new Web3("ws://127.0.0.1:7545"); 

//4. direcciones blockchain (ganache)
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractInstance = new web3.eth.Contract(contractJson.abi , contractAddress);
const privateKey = Buffer.from(process.env.PRIVATE_KEY,"hex");
const accountAddress = process.env.ACCOUNT_ADDRESS; 

//Obtener el numero de bloque --> para que?
web3.eth.getBlockNumber()
    .then( n => listenEvent( n - 1));


function listenEvent( last_block ){

    contractInstance.events.__callbackNewData ({}, {
        fromBlock: last_block,
        // toBlock: "latest"
    }, ( err, event) => {
        console.log("evento");
        event ? updateData() : null;
        err ? console.log(err) : null;
    });

}

function updateData(){
    console.log("update data");
    //https://api.nasa.gov/neo/rest/v1/feed?start_date=START_DATE&end_date=END_DATE&api_key=DEMO_KEY
    const url = "https://api.nasa.gov/neo/rest/v1/feed?start_date=2022-02-05&end_date=2022-02-05&api_key=DEMO_KEY";
    fetch( url )
        .then( response => response.json() )
        .then( json => setDataContract(json.element_count) );

}


//  Funcion para enviar la informacion obtenida del API al contrato inteligente
function setDataContract( value ){
    web3.eth.getTransactionCount( accountAddress, ( err, tx_num) => {
        contractInstance.methods.setAsteroidsCount( value )
            .estimateGas({}, ( err, gas_amount ) => {

                // Parametrizacion de la transaccion
                let rawTx = {
                    nonce: web3.utils.toHex(tx_num),
                    gasPrice: web3.utils.toHex(web3.utils.toWei("1.4", "gwei")),
                    gasLimit: web3.utils.toHex(gas_amount),
                    to: contractAddress,
                    value: "0x00",
                    data: contractInstance.methods.setAsteroidsCount(value).encodeABI()
                }

                //Instancio una nueva transaccion y la firmo
                const tx = new Tx( rawTx );
                tx.sign( privateKey );

                //serializo la transaccion tx y la envio como transaccion firmada
                const serialized_tx = tx.serialize().toString("hex");
                web3.eth.sendSignedTransaction("0x" + serialized_tx);

            });
    });
}