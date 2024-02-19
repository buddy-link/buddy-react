
export const sendAllTransactions = async (
  transactions,
  connection,
  wallet,
  signAllTransactions,
  signers
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
  signedTransactions,
  connection
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
    throw JSON.stringify(txids.find(txid => typeof txid === 'object').error)
  }
  return txids
}