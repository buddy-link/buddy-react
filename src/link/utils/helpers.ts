import {Connection, PublicKey, Signer, Transaction, TransactionInstruction} from "@solana/web3.js";

export const sendAllTransactions = async (
  transactions: Transaction[],
  connection: Connection,
  wallet: PublicKey,
  signAllTransactions: any,
  signers: Signer[][] = []
) => {
  const { blockhash } = await connection.getLatestBlockhash('confirmed')

  const parsedTransactions = []
  for (let i = 0; i < transactions.length; i++) {
    transactions[i].recentBlockhash = blockhash
    transactions[i].feePayer = wallet

    if (signers[i]) {
      for (const signer of signers[i]) {
        transactions[i].partialSign(signer)
      }
    }
    parsedTransactions.push(transactions[i])
  }
  const signedTransactions = await signAllTransactions(parsedTransactions)
  const txids = await sendAllTransactionsSequentially(
    signedTransactions,
    connection
  )
  return txids
}

export const sendAllTransactionsSequentially = async (
  signedTransactions: Transaction[],
  connection: Connection
) => {
  const txids = []
  for (const signedTransaction of signedTransactions) {
    try {
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false
        }
      )
      const confirmation = await connection.confirmTransaction(signature)
      if (confirmation.value.err) throw JSON.stringify(confirmation.value.err)

      txids.push(signature)
    } catch (e) {
      console.log(e)
      txids.push({
        error: e
      })
    }
  }

  if (txids.some(txid => typeof txid === 'object')) {
    // @ts-ignore
    throw JSON.stringify(txids.find(txid => typeof txid === 'object').error)
  }
  return txids
}

export async function executeTransaction(
  instructions: TransactionInstruction[],
  publicKey: PublicKey,
  signTransaction: any,
  connection: Connection
) {
  if (instructions.length) {
    const transaction = new Transaction();
    transaction.add(...instructions);

    const { blockhash } = await connection.getLatestBlockhash();

    transaction.feePayer = publicKey;
    transaction.recentBlockhash = blockhash;
    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    const confirmedResult = await connection.confirmTransaction(signature);

    if (confirmedResult.value.err) {
      throw new Error(
        `Transaction failed (${confirmedResult.value.err}) ${signature}`
      );
    }

    return confirmedResult;
  }

  return null;
}