const Keystore = require("./config/Keystore");
const request = require("request");

const generateKeystore = (password, masterNode) => {
  try {
    const xpriv = Keystore.getXpriv(masterNode);
    const keystore = Keystore.encryptXpriv(xpriv, password);
    return keystore;
  } catch (error) {
    return null;
  }
};

const createUser = (nome, cognome, email, password, tokenVerifica, keystore, stato = 0) => {
  const queryRegistration = `INSERT INTO utenti (nome, cognome, email, password, masternode, token_verifica, stato, twofa)
    VALUES (?, ?, ?, SHA1(?), ?, ?, ?, 0)`;
  const queryParams = [nome, cognome, email, password, keystore, tokenVerifica, stato];

  return new Promise((resolve, reject) => {
    connection.query(queryRegistration, queryParams, (error, results) => {
      if (error) {
        const err = new Error("Failed to create user");
        err.code = "ER_DUP_ENTRY";
        reject(err);
      } else if (results && results.insertId) {
        resolve(results.insertId);
      } else {
        reject("Failed to retrieve the created record's ID.");
      }
    });
  });
};

const updateUser = (userId, nome, cognome, email, password, tokenVerifica, keystore, stato = 0) => {
  const queryUpdate = `UPDATE utenti 
                         SET nome = ?, cognome = ?, email = ?, password = SHA1(?), masternode = ?, token_verifica = ?, stato = ?
                         WHERE id = ?`;
  const queryParams = [nome, cognome, email, password, keystore, tokenVerifica, stato, userId];

  return new Promise((resolve, reject) => {
    connection.query(queryUpdate, queryParams, (error, results) => {
      if (error) {
        reject("Failed to update user.");
      } else {
        resolve(userId);
      }
    });
  });
};

const restoreUser = (id_utente, nome, cognome, email, password, tokenVerifica) => {
  const query = `UPDATE utenti SET nome = ?, cognome = ?, email = ?, password = SHA1(?), token_verifica = ?, stato = 0 WHERE id = ?`;
  return new Promise((resolve, reject) => {
    connection.query(query, [nome, cognome, email, password, tokenVerifica, id_utente], (error, result) => {
      if (error) {
        reject("Failed to restore user");
      } else {
        resolve(true);
      }
    });
  });
};

const createAddress = (cointype, path, address, id_utente, index, start_block) => {
  const queryRegistration = "INSERT INTO addresses (cointype, path, address, id_utente,`index`, start_block) VALUES (?, ?, ?, ?, ?, ?)";
  const queryParams = [cointype, path, address, id_utente, index, start_block];
  return new Promise((resolve, reject) => {
    connection.query(queryRegistration, queryParams, (error, results) => {
      if (error) {
        reject("Failed to create address: " + error.message);
      } else if (results && results.insertId) {
        resolve(results.insertId);
      } else {
        reject("Failed to retrieve the created record's ID.");
      }
    });
  });
};

const getMaxIndexAddress = (cointype, id_utente) => {
  const queryLastIndex = `SELECT MAX(\`index\`) AS MaxIndex
    FROM addresses
    WHERE id_utente = ? AND cointype = ?`;

  return new Promise((resolve, reject) => {
    connection.query(queryLastIndex, [id_utente, cointype], (error, results) => {
      if (error) {
        reject("Failed to retrieve max index: " + error.message);
      } else if (results.length === 1) {
        const maxIndex = results[0].MaxIndex;
        resolve(maxIndex);
      } else {
        reject("Failed to find max index.");
      }
    });
  });
};

const getUserById = (id) => {
  const query = `SELECT * FROM utenti WHERE id = ?`;

  return new Promise((resolve, reject) => {
    connection.query(query, [id], (error, results) => {
      if (error) {
        reject("Error retrieving user by ID: " + error.message);
        return;
      }

      if (results.length === 1) {
        const user = {
          id: results[0].id,
          email: results[0].email,
          password: results[0].password,
          masternode: results[0].masternode,
          twofa: results[0].twofa,
          totp: results[0].totp,
        };
        resolve(user);
      } else {
        reject("User not found for the given ID.");
      }
    });
  });
};

const getUserByVerificationToken = (token) => {
  const query = `SELECT * FROM utenti WHERE token_verifica = ?`;

  return new Promise((resolve, reject) => {
    connection.query(query, [token], (error, results) => {
      if (error) {
        reject("Error retrieving user by verification token: " + error.message);
        return;
      }

      if (results.length === 1) {
        const user = {
          id: results[0].id,
          email: results[0].email,
          password: results[0].password,
          masternode: results[0].masternode,
        };
        resolve(user);
      } else {
        reject("User not found for the given verification token.");
      }
    });
  });
};

const changePassword = (new_password, id_utente) => {
  const queryUpdatePassword = `UPDATE utenti SET password = ?, token_verifica = NULL WHERE id = ?`;

  return new Promise((resolve, reject) => {
    connection.query(queryUpdatePassword, [new_password, id_utente], (error, result) => {
      if (error) {
        reject("Error updating password: " + error.message);
        return;
      }

      if (result && result.affectedRows > 0) {
        resolve("Password updated successfully.");
      } else {
        reject("Failed to update password or no such user exists.");
      }
    });
  });
};

const getBlocks = () => {
  const query = `SELECT * FROM blocchi`;
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject("Error querying the blocks: " + error.message);
        return;
      }
      resolve(results);
    });
  });
};

const getLastSynchronizedBlock = (cryptoname) => {
  // Verifica se cryptoname è valido per evitare l'iniezione SQL
  const validNames = ["bitcoin", "ethereum", "binance", "solana", "monero"];
  if (!validNames.includes(cryptoname)) {
    return Promise.reject("Invalid cryptoname provided.");
  }

  //SELECT per prelevare l'ultimo blocco sincronizzato della blockchain, dalla tabella blocchi, dato il cryptoname
  const query = `SELECT ${cryptoname} FROM blocchi LIMIT 1`;

  return new Promise((resolve, reject) => {
    connection.query(query, (error, result) => {
      if (error) {
        reject("Error querying the last synchronized block: " + error.message);
        return;
      }

      if (result && result.length === 1) {
        resolve(result[0][cryptoname]);
      } else {
        reject("No block found for the provided cryptoname.");
      }
    });
  });
};

const insertStartingBlock = (sb_bitcoin, sb_ethereum, sb_binance, sb_solana, sb_monero) => {
  const queryInsertStartingBlock = `
        INSERT INTO blocchi (bitcoin, ethereum, binance, solana, monero)
        VALUES (?, ?, ?, ?, ?);
    `;

  return new Promise((resolve, reject) => {
    connection.query(queryInsertStartingBlock, [sb_bitcoin, sb_ethereum, sb_binance, sb_solana, sb_monero], (error, result) => {
      if (error) {
        reject("Error inserting the starting blocks: " + error.message);
        return;
      }
      resolve(result);
    });
  });
};

const getAddresses = (id) => {
  const query = `SELECT * FROM addresses WHERE id_utente = ?`;

  return new Promise((resolve, reject) => {
    connection.query(query, [id], (error, results) => {
      if (error) {
        reject("Error querying the addresses: " + error.message);
        return;
      }

      const formattedAddresses = results.reduce((acc, result) => {
        // let address = result.cointype === "XMR" ?
        //               JSON.parse(result.address).primaryAddress :
        //               result.address;
        let address = result.address;

        if (!acc[result.cointype]) {
          acc[result.cointype] = {};
        }
        acc[result.cointype][result.index] = address;
        return acc;
      }, {});

      resolve(formattedAddresses);
    });
  });
};

const getTokenData = (symbol, chain) => {
  const queryGetTokenData = `
    SELECT * from token WHERE symbol = ? AND chain = ?
`;

  return new Promise((resolve, reject) => {
    connection.query(queryGetTokenData, [symbol, chain], (error, result) => {
      if (error) {
        reject("Error retrieving token data: " + error.message);
        return;
      }
      resolve(result[0]);
    });
  });
};

const updateTokenVerifica = (tokenVerifica, email) => {
  const queryInsertToken = `
     UPDATE utenti
     SET token_verifica = ?
     WHERE email = ?`;

  return new Promise((resolve, reject) => {
    connection.query(queryInsertToken, [tokenVerifica, email], (error, result) => {
      if (error) {
        reject("Error inserting the token: " + error.message);
        return;
      }
      resolve(result);
    });
  });
};

const getTransactions = (id, network_type, limit, offset) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT 
                t.*,
                a.address AS payload_address,
                CASE 
                    WHEN t.from_address = a.address THEN 'outgoing'
                    WHEN t.destination_address = a.address THEN 'incoming'
                END AS transaction_type
            FROM 
                transactions t
            JOIN 
                addresses a ON (t.from_address = a.address OR t.destination_address = a.address)
            JOIN 
                device d ON a.id_utente = d.id
            WHERE 
                d.id = ?
                AND t.network_type = ?
            ORDER BY t.data_insert DESC
            LIMIT ? OFFSET ?`;

    const countQuery = `SELECT 
                COUNT(*) AS total_transactions
            FROM 
                transactions t
            JOIN 
                addresses a ON (t.from_address = a.address OR t.destination_address = a.address)
            JOIN 
                device d ON a.id_utente = d.id
            WHERE 
                d.id = ?
                AND t.network_type LIKE ?`;
    // network_type = '%'+network_type+'%';
    connection.query(query, [id, network_type, limit, offset], (error, transactions) => {
      if (error) {
        console.log("error", error);
        reject("Error querying the transactions: " + error.message);
        return;
      }
      connection.query(countQuery, [id, network_type], (countError, countResults) => {
        if (countError) {
          console.log("countError", countError);

          reject("Error querying the transaction count: " + countError.message);
          return;
        }

        const totalCount = countResults[0].total_transactions;
        resolve({ totalCount, transactions });
      });
    });
  });
};

const filterTransactions = (data) => {
  console.log("data", data);
  const { limit, offset, wallet_id, start_date, end_date, search, chain, network_type, device_id } = data;

  try {
    // Start building the query
    let query = `
            SELECT
                t.id, 
                t.*, 
                a.address AS payload_address,
                CASE 
                    WHEN t.from_address = a.address THEN 'outgoing'
                    WHEN t.destination_address = a.address THEN 'incoming'
                END AS transaction_type
            FROM 
                transactions t
            JOIN 
                addresses a ON (t.from_address = a.address OR t.destination_address = a.address)
            JOIN 
                device d ON a.id_utente = d.id
            WHERE 
                d.id = ?
            `;

    // Initialize the parameters array with the `device_id` first
    let params = [device_id];

    // Dynamically add conditions for each filter if provided
    if (wallet_id) {
      query += " AND t.wallet_id = ?";
      params.push(wallet_id);
    }

    if (start_date && end_date) {
      query += " AND t.data_insert BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    if (search) {
      query += " AND (t.from_address LIKE CONCAT('%', ?, '%') OR t.destination_address LIKE CONCAT('%', ?, '%'))";
      params.push(search, search);
    }

    if (chain) {
      query += " AND t.chain = ?";
      params.push(chain);
    }

    if (network_type) {
      query += " AND t.network_type = ?";
      params.push(network_type);
    }

    query += `
    ORDER BY t.id DESC
        `;
    console.log("query", query);

    // Add LIMIT and OFFSET if provided
    if (limit) {
      query += " LIMIT ?";
      params.push(limit);
    }

    if (offset) {
      query += " OFFSET ?";
      params.push(offset * limit);
    }

    return new Promise((resolve, reject) => {
      connection.query(query, params, (error, transactions) => {
        if (error) {
          console.log("error", error);
          reject("Error querying the transactions: " + error.message);
          return;
        }
        resolve({ transactions, totalCount: transactions.length });
      });
    });
  } catch (error) {
    throw error;
  }
};

const getTransactionsByAddress = (address, limit, offset) => {
  return new Promise((resolve, reject) => {
    // const query = `
    //     SELECT t.*
    //     FROM transactions t
    //     LEFT JOIN addresses a ON t.address_id = a.id
    //     LEFT JOIN utenti u ON a.id_utente = u.id
    //     WHERE a.address LIKE ?
    //     ORDER BY t.data_insert DESC
    //     LIMIT ? OFFSET ?
    // `;

    // const countQuery = `
    //     SELECT COUNT(*) AS totalCount
    //     FROM transactions t
    //     LEFT JOIN addresses a ON t.address_id = a.id
    //     LEFT JOIN utenti u ON a.id_utente = u.id
    //     WHERE a.address LIKE ?
    // `;
    const query = `
            SELECT t.*
            FROM transactions t
            LEFT JOIN addresses a ON (t.destination_address = a.address || t.from_address = a.address)
            LEFT JOIN device d ON a.id_utente = d.id
            WHERE a.address LIKE ?
            ORDER BY t.data_insert DESC
            LIMIT ? OFFSET ?
        `;

    const countQuery = `
            SELECT COUNT(*) AS totalCount
            FROM transactions t
            LEFT JOIN addresses a ON (t.destination_address = a.address || t.from_address = a.address)
            LEFT JOIN device d ON a.id_utente = d.id
            WHERE a.address LIKE ? 
        `;

    address = "%" + address + "%";

    connection.query(query, [address, limit, offset], (error, transactions) => {
      if (error) {
        reject("Error querying the transactions: " + error.message);
        return;
      }
      connection.query(countQuery, [address], (countError, countResults) => {
        if (countError) {
          reject("Error querying the transaction count: " + countError.message);
          return;
        }
        // console.log("data", transactions, "count", countResults[0].totalCount)
        const totalCount = countResults[0].totalCount;
        resolve({ totalCount, transactions });
      });
    });
  });
};

const getLatestTransactionsFromDB = (limit) => {
  return new Promise((resolve, reject) => {
    const query = `
            SELECT *
            FROM transactions 
            ORDER BY data_insert DESC
            LIMIT ?
        `;

    connection.query(query, [Number(limit)], (error, transactions) => {
      if (error) {
        reject("Error querying the transactions: " + error.message);
        return;
      }

      resolve(transactions);
    });
  });
};

const getAddressByAddress = (address) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM addresses WHERE address LIKE ?`;
    connection.query(query, [`%${address}%`], (error, results) => {
      if (error) {
        reject("Error querying the address: " + error.message);
        return;
      }
      // Se esiste l'indirizzo
      if (results && results.length === 1) {
        const addressRecord = {
          id: results[0].id,
          cointype: results[0].cointype,
          path: results[0].path,
          address: results[0].address,
          idUtente: results[0].id_utente,
          index: results[0].index,
          start_block: results[0].start_block,
          wallet_id: results[0].wallet_id,
        };
        resolve(addressRecord);
      } else {
        // Address non trovato
        const addressRecord = {};
        resolve(addressRecord);
      }
    });
  });
};

const getPathByAddress = (address) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM addresses WHERE address = ?`;

    connection.query(query, [address], (error, results) => {
      if (error) {
        reject("Error querying the address: " + error.message);
        return;
      }

      // Se esiste l'address
      if (results && results.length === 1) {
        // Restituisce il path
        resolve(results[0].path);
      } else {
        // Address non trovato
        reject("Address not found in the table.");
      }
    });
  });
};

const insertAssociatedTokenAccount = (id, tokenname, decimals, tokenAccount) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO token (id, tokenname, decimals, tokenAccount) VALUES (?, ?, ?, ?)`;
    const values = [id, tokenname, decimals, tokenAccount];

    connection.query(query, values, (error, results) => {
      if (error) {
        reject("Error during token account insertion: " + error.message);
      } else if (results && results.insertId) {
        resolve(results.insertId);
      } else {
        reject("Unable to retrieve the ID of the created record.");
      }
    });
  });
};

const insertTransaction = (
  chain,
  token,
  address_id,
  fromAddress,
  tx,
  destinationAddress,
  amount,
  data_insert,
  block_number,
  userId,
  network_type,
  wallet_id
) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM transactions where tx = ?`;
    connection.query(query, [tx], (err, txResult) => {
      if (err) {
        reject("Error in transaction data " + err.message);
      } else if (txResult && txResult.length > 0) {
        resolve(txResult);
      } else {
        const queryInsertTx = `INSERT INTO transactions (chain, address_id, from_address, tx, destination_address, amount, data_insert, block_number, id_utente, network_type, wallet_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [chain, address_id, fromAddress, tx, destinationAddress, amount, data_insert, block_number, userId, network_type, wallet_id];
        connection.query(queryInsertTx, values, (error, results) => {
          if (error) {
            reject("Error during transaction insertion: " + error.message);
          } else if (results && results.insertId) {
            resolve({
              id: results.insertId,
              chain: chain,
              address_id: address_id,
              from_address: fromAddress,
              tx: tx,
              destination_address: destinationAddress,
              amount: amount.toString(),
              data_insert: data_insert,
              // block_number: block_number,
              network_type: network_type,
              is_synced: 1,
              status: "outgoing",
            });
          } else {
            const queryInsertTx = `INSERT INTO transactions (type, chain, token, address_id, from_address, tx, destination_address, amount, data_insert, block_number, id_utente, network_type, wallet_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [
              type,
              chain,
              token,
              address_id,
              fromAddress,
              tx,
              destinationAddress,
              amount,
              data_insert,
              block_number,
              userId,
              network_type,
              wallet_id,
            ];
            connection.query(queryInsertTx, values, (error, results) => {
              if (error) {
                reject("Error during transaction insertion: " + error.message);
              } else if (results && results.insertId) {
                resolve({
                  id: results.insertId,
                  type: type,
                  chain: chain,
                  token: token,
                  address_id: address_id,
                  from_address: fromAddress,
                  tx: tx,
                  destination_address: destinationAddress,
                  amount: amount.toString(),
                  data_insert: data_insert,
                  // block_number: block_number,
                  network_type: network_type,
                  wallet_id: wallet_id,
                  is_synced: 1,
                  status: "outgoing",
                });
              } else {
                reject("Unable to retrieve the ID of the created record.");
              }
            });
          }
        });
      }
    });
  });
};

const insertTransactionNew = ({
  isHistoryReceivedFromWebhook,
  address_id,
  id_utente,
  wallet_id,
  chain,
  chain_id,
  network_type,
  block_number,
  gas,
  gas_price,
  type,
  block_hash,
  input,
  from_address,
  destination_address,
  tx,
  amount,
}) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM transactions WHERE tx = ?`, [tx], (err, results) => {
      if (err) {
        return reject(new Error("Error while inserting transaction data : " + err.message));
      }
      if (results.length) {
        // update the transaction data with new data
        connection.query(
          `UPDATE transactions SET address_id = ?, id_utente = ?, wallet_id = ?, chain = ?, chain_id = ?, network_type = ?, block_number = ?, gas = ?, gas_price = ?, type = ?, block_hash = ?, input = ?, from_address = ?, destination_address = ?, amount = ?, tx_status = ? WHERE id = ?`,
          [
            address_id,
            id_utente,
            wallet_id,
            chain,
            chain_id,
            network_type,
            block_number,
            gas,
            gas_price,
            type,
            block_hash,
            input,
            from_address,
            destination_address,
            amount,
            'success',            //update will execute when there will be webhook call from quicknode
            results[0].id,
          ],
          (error, result) => {
            if (error) {
              return reject(new Error("Error while inserting transaction data : " + error.message));
            }
            if (result.affectedRows) {
              connection.query(`SELECT * FROM transactions WHERE tx = ?`, [tx], (error, result) => {
                if (error || result.length === 0) {
                  return reject(new Error("Error while fetching updated transaction data : " + error.message));
                }
                return resolve({
                  id: result[0].id,
                  chain: result[0].chain,
                  token: result[0].token,
                  address_id: result[0].address_id,
                  from_address: result[0].from_address,
                  tx: result[0].tx,
                  destination_address: result[0].destination_address,
                  amount: amount.toString(),
                  data_insert: result[0].data_insert,
                  // block_number: block_number,
                  network_type: network_type,
                  wallet_id: result[0].wallet_id,
                  is_synced: 1,
                  status: result[0].address_id ? "outgoing" : "incoming",
                });
              });
            }
          }
        );
      } else {
        connection.query(
          `INSERT INTO transactions(address_id, id_utente, wallet_id, chain, chain_id, network_type, block_number, gas, gas_price, type, block_hash, input, from_address, destination_address, tx, amount, data_insert, tx_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            address_id,
            id_utente,
            wallet_id,
            chain,
            chain_id,
            network_type,
            block_number,
            gas,
            gas_price,
            type,
            block_hash,
            input,
            from_address,
            destination_address,
            tx,
            amount,
            new Date(),
            isHistoryReceivedFromWebhook ? 'success' : 'pending', // tx_status will be 'success' if the transaction is received from webhook, otherwise 'pending'
          ],
          (error, result) => {
            if (error) {
              return reject(new Error("Error while inserting transaction : " + error.message));
            }
            connection.query(`SELECT * FROM transactions WHERE id = ?`, [result.insertId], (error, result) => {
              if (error) {
                return reject(new Error("Error while fetching inserted data : " + error.message));
              }
              return resolve({
                id: result[0].id,
                chain: result[0].chain,
                token: result[0].token,
                address_id: result[0].address_id,
                from_address: result[0].from_address,
                tx: result[0].tx,
                destination_address: result[0].destination_address,
                amount: amount.toString(),
                data_insert: result[0].data_insert,
                // block_number: block_number,
                network_type: network_type,
                wallet_id: result[0].wallet_id,
                is_synced: 1,
                status: result[0].address_id ? "outgoing" : "incoming",
              });
            });
          }
        );
      }
    });
  });
};

const transactionExists = (txHash) => {
  const queryTransaction = "SELECT COUNT(*) AS count FROM transactions WHERE tx = ?";

  return new Promise((resolve, reject) => {
    connection.query(queryTransaction, [txHash], (error, results) => {
      if (error) {
        reject("Failed to check transaction.");
      } else {
        const count = results[0].count;
        resolve(count > 0);
      }
    });
  });
};

const insertTransactionNotification = (user_id, wallet_id, notification_title, notification_body, chain) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO transaction_notifications(user_id, wallet_id, notification_title, notification_body, chain) VALUES (?, ?, ?, ?, ?)`,
      [user_id, wallet_id, notification_title, notification_body, chain],
      (error, results) => {
        if (error) {
          return reject(new Error("Error while inserting transaction notification : " + error.message));
        }
        return resolve(results);
      }
    );
  });
};

const getAddressesByUserIdAndCoinType = (id_utente, cointype) => {
  const queryAddresses = "SELECT * FROM addresses WHERE id_utente = ? AND cointype = ? ORDER BY `index`";

  return new Promise((resolve, reject) => {
    connection.query(queryAddresses, [id_utente, cointype], (error, results) => {
      if (error) {
        reject("Failed to get addresses.");
      } else {
        resolve(results);
      }
    });
  });
};

const getAddressesByStartBlockAndCointype = (start_block, cointype) => {
  const querySelectAddresses = "SELECT * FROM addresses WHERE start_block >= ? AND cointype = ? ORDER BY `index`";

  return new Promise((resolve, reject) => {
    connection.query(querySelectAddresses, [start_block, cointype], (error, results) => {
      if (error) {
        reject("Failed to get addresses by start block and coin type.");
      } else {
        resolve(results);
      }
    });
  });
};

const getAddressesByCointype = (cointype) => {
  const querySelectAddresses = "SELECT * FROM addresses WHERE cointype = ? ORDER BY `index`";

  return new Promise((resolve, reject) => {
    connection.query(querySelectAddresses, [cointype], (error, results) => {
      if (error) {
        reject("Failed to get addresses by start block and coin type.");
      } else {
        resolve(results);
      }
    });
  });
};

const getUserIdByAddress = (address) => {
  const query = "SELECT id FROM addresses WHERE address = ?";

  return new Promise((resolve, reject) => {
    connection.query(query, [address], (error, results) => {
      if (error) {
        reject("Failed to get user ID by address: " + error.message);
      } else if (results.length === 1) {
        const id = results[0].id;
        resolve(id);
      } else {
        resolve(null);
      }
    });
  });
};

const getTransactionsForAddress = (address) => {
  const query = "SELECT * FROM transactions WHERE from_address = ? OR destination_address = ?";

  return new Promise((resolve, reject) => {
    connection.query(query, [address, address], (error, result) => {
      if (error) {
        reject(`Failed to get transactions for address ${address}`);
      } else {
        resolve(result);
      }
    });
  });
};

const saveMasternode = (masternode, id_utente) => {
  const queryInsertMasternode = "UPDATE utenti SET masternode = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connection.query(queryInsertMasternode, [masternode, id_utente], (error, results) => {
      if (error) {
        reject("Failed to update masternode.");
      } else {
        resolve(results);
      }
    });
  });
};

const getMasternode = () => {
  const queryInsertMasternode = "UPDATE utenti SET masternode = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connection.query(queryInsertMasternode, [masternode, id_utente], (error, results) => {
      if (error) {
        reject("Failed to update masternode.");
      } else {
        resolve(results);
      }
    });
  });
};

const saveTokenDataForUser = (token_verifica, email) => {
  const queryInsertMasternode = "UPDATE utenti SET token_verifica = ? WHERE email = ?";

  return new Promise((resolve, reject) => {
    connection.query(queryInsertMasternode, [token_verifica, email], (error, results) => {
      if (error) {
        reject("Failed to save token data.");
      } else {
        resolve(results);
      }
    });
  });
};

const selectTokenByEmail = (email) => {
  const querySelectTokenData = "SELECT token_verifica FROM utenti WHERE email = ?";
  return new Promise((resolve, reject) => {
    connection.query(querySelectTokenData, [email], (error, results) => {
      if (error) {
        reject("Failed to fetch token data.");
      } else {
        resolve(results[0].token_verifica);
      }
    });
  });
};

const selectUserByEmail = (email) => {
  const query = "SELECT * FROM utenti WHERE email = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [email], (error, results) => {
      if (error) {
        reject("Failed to fetch token data.");
      } else {
        resolve(results[0]);
      }
    });
  });
};

const deleteUserByEmail = (email) => {
  const query = "DELETE FROM utenti WHERE email = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [email], (error, results) => {
      if (error) {
        reject("Failed to delete user.");
      } else {
        resolve(true);
      }
    });
  });
};

const deleteUserById = (id_utente) => {
  const query = "DELETE FROM utenti WHERE id = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, [id_utente], (error, results) => {
      if (error) {
        reject("Failed to delete user.");
      } else {
        resolve(true);
      }
    });
  });
};

const activateUser = (id_utente) => {
  const querySelectTokenData = "UPDATE utenti SET stato = 1 WHERE id = ?";

  return new Promise((resolve, reject) => {
    connection.query(querySelectTokenData, [id_utente], (error, results) => {
      if (error) {
        reject("Failed to update data.");
      } else {
        resolve(true);
      }
    });
  });
};

const setRecoveryUser = (id_utente) => {
  const querySelectTokenData = "UPDATE utenti SET stato = 99 WHERE id = ?";

  return new Promise((resolve, reject) => {
    connection.query(querySelectTokenData, [id_utente], (error, results) => {
      if (error) {
        reject("Failed to update data.");
      } else {
        resolve(true);
      }
    });
  });
};

const toggleUser2FA = (id_utente, twofa) => {
  const query = "UPDATE utenti SET twofa = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connection.query(query, [twofa, id_utente], (error, results) => {
      if (error) {
        reject("Failed to update data.");
      } else {
        resolve(true);
      }
    });
  });
};

const saveUserTotp = (id_utente, totp) => {
  const query = "UPDATE utenti SET totp = ? WHERE id = ?";

  return new Promise((resolve, reject) => {
    connection.query(query, [totp, id_utente], (error, results) => {
      if (error) {
        reject("Failed to update data.");
      } else {
        resolve(true);
      }
    });
  });
};

const deleteUser = (id_utente) => {
  const querySelectTokenData = "UPDATE utenti SET " + " stato = 9, " + ' email = CONCAT("DELETE_BW_", email) ' + " WHERE id = ?";

  return new Promise((resolve, reject) => {
    connection.query(querySelectTokenData, [id_utente], (error, results) => {
      if (error) {
        reject("Failed to update data.");
      } else {
        resolve(true);
      }
    });
  });
};

const selectUserByToken = (token) => {
  const querySelectUserData = "SELECT * FROM utenti WHERE token_verifica = ?";
  return new Promise((resolve, reject) => {
    connection.query(querySelectUserData, [token], (error, results) => {
      if (error) {
        reject("Failed to fetch user data.");
      } else {
        resolve(results[0]);
      }
    });
  });
};

const updateBlocks = (cryptoname, numero) => {
  // Verifica se cryptoname è valido per evitare l'iniezione SQL
  const validNames = ["bitcoin", "ethereum", "binance", "solana", "monero"];
  if (!validNames.includes(cryptoname)) {
    return Promise.reject("Invalid cryptoname provided.");
  }
  const query = `UPDATE blocchi SET ${cryptoname} = ? `;
  return new Promise((resolve, reject) => {
    connection.query(query, [numero], (error, result) => {
      if (error) {
        reject("Error querying the last synchronized block: " + error.message);
        return;
      }
      if (result) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const isAddressOwnedByUser = (id_utente, address, cointype) => {
  return new Promise(async (resolve, reject) => {
    let query = `
        SELECT COUNT(*) > 0 AS address_belongs_to_user
        FROM addresses
        WHERE id_utente = ? AND address = ?;`;

    let moneroObj;
    if (cointype === "XMR") {
      moneroObj = (await getAddressesByUserIdAndCoinType(id_utente, cointype))[0].address;
    }
    let addressParam = cointype === "XMR" ? moneroObj : address;

    connection.query(query, [id_utente, addressParam], (error, results) => {
      if (error) {
        reject("Error during address ownership check: " + error.message);
      } else {
        resolve(results[0].address_belongs_to_user === 1);
      }
    });
  });
};

const deleteAddressByUserId = (id_utente) => {
  const querydeleteAddressByUserId = "DELETE FROM addresses WHERE id_utente = ?";
  return new Promise((resolve, reject) => {
    connection.query(querydeleteAddressByUserId, [id_utente], (error, results) => {
      if (error) {
        reject("Failed to delete address.");
      } else {
        resolve(true);
      }
    });
  });
};

const verifyDevice = (identifier, passkey, device_token) => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) return reject(new Error("Transaction start error: " + err.message));
      const checkQuery = `SELECT * FROM device WHERE identifier = ? AND is_active=1`;
      connection.query(checkQuery, [identifier], (error, results) => {
        if (error) {
          return reject(new Error("Failed to retrieve device: " + error.message));
        }

        if (results.length) {
          if (results[0].passkey !== passkey) {
            connection.query(`UPDATE device SET is_active = 0 WHERE identifier = ?`, [identifier], (error, results) => {
              if (error) {
                return connection.rollback(() => {
                  reject(new Error("Failed to update device active status : " + error.message));
                });
              }
              connection.query(
                `INSERT INTO device (identifier, passkey, device_token) VALUES (?, ?, ?)`,
                [identifier, passkey, device_token],
                (error, results) => {
                  connection.commit((err) => {
                    if (error || err) {
                      return connection.rollback(() => {
                        reject(new Error("Failed to insert device : " + error.message));
                      });
                    }
                    return resolve(results.insertId); // Return existing record's ID
                  });
                }
              );
            });
          } else {
            const updateQuery = `UPDATE device SET device_token = ? WHERE id = ? AND is_active = 1`;
            connection.query(updateQuery, [device_token, results[0].id], (updateError) => {
              if (updateError) {
                return reject(new Error("Failed to update device token: " + updateError.message));
              }
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    reject(new Error("Transaction commit error: " + err.message));
                  });
                }
                resolve(results[0].id); // Return existing record's ID
              });
            });
          }
        } else {
          // Insert new record if identifier and passkey are not found
          const insertQuery = `INSERT INTO device (identifier, passkey, device_token) VALUES (?, ?, ?)`;
          connection.query(insertQuery, [identifier, passkey, device_token], (insertError, result) => {
            if (insertError) {
              console.log("insertError", insertError);
              const err = new Error("Failed to register device");
              err.code = "ER_DUP_ENTRY";
              return reject(err);
            }
            resolve(result.insertId);
          });
        }
      });
    });
  });
};

const insertUserAddress = async (userData) => {
  const results = await Promise.all(
    userData.map((item) => {
      return new Promise((resolve, reject) => {
        const selectQuery = `SELECT * FROM addresses WHERE id_utente = ? AND address = ?`;
        const matches = [item.user_id, item.address];
        connection.query(selectQuery, matches, (error, resultData) => {
          if (error) {
            return reject(error);
          } else if (resultData.length === 1) {
            reject("Address is already exist");
          } else {
            const values = [item.coin_type, item.address, item.address_name, item.user_id, item.index, item.tatumStatus, item.wallet_id];
            const query =
              "INSERT INTO addresses (cointype, address, address_name, id_utente, `index`, tatumStatus, wallet_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
            connection.query(query, values, (error, result) => {
              if (error) {
                reject(error);
              } else if (result) {
                resolve(result.insertId);
              } else {
                reject("Failed to retrieve the created record's ID.");
              }
            });
          }
        });
      });
    })
  );
  console.log("results", results);
  return results;
};

const checkUserAddress = async (address, userId) => {
  return new Promise((resolve, reject) => {
    // check address & user id is exist or not
    const selectQuery = `SELECT * FROM addresses WHERE id_utente = ? AND address = ?`;
    const matches = [userId, address];
    connection.query(selectQuery, matches, (error, resultData) => {
      if (error) {
        reject(error);
      }
      if (resultData.length === 1) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const verifyDeviceDetails = (identifier) => {
  const query = `SELECT * FROM device WHERE identifier = ? AND is_active=1`;
  const queryParams = [identifier];
  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      console.log("identifier", results);
      if (error) {
        reject("Failed to retrieve device: " + error.message);
      } else if (results.length === 1) {
        resolve(results);
      } else {
        reject("Failed to retrieve device");
      }
    });
  });
};

const fetchAddress = (uid) => {
  const query = `SELECT * FROM addresses WHERE id_utente = ? AND addressStatus != 'Inactive'`;
  const queryParams = [uid];
  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        reject("Failed to retrieve address: " + error.message);
      } else if (results) {
        var obj = results;
        obj = obj.map((item) => {
          item.coin_type = item.cointype; // Add new key with snake case
          delete item.cointype; // Remove the old key
          return item;
        });
        resolve(obj);
      } else {
        reject("Failed to retrieve address");
      }
    });
  });
};

const fetchAddressById = (id) => {
  const query = `SELECT * FROM addresses WHERE id = ?`;
  const queryParams = [id];
  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        reject("Failed to retrieve address: " + error.message);
      } else if (results) {
        var obj = results;
        obj = obj.map((item) => {
          item.coin_type = item.cointype; // Add new key with snake case
          delete item.cointype; // Remove the old key
          return item;
        });
        resolve(obj);
      } else {
        reject("Failed to retrieve address");
      }
    });
  });
};

const fetchAddressArray = (id) => {
  const query = `SELECT address FROM addresses WHERE id_utente = ? AND addressStatus = ?`;
  const queryParams = [id, "Active"];
  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject("Failed to retrieve address: " + error.message);
      } else if (results) {
        let arrayObj = [];
        results.map((item) => {
          arrayObj.push(item.address);
        });
        return resolve(arrayObj);
      } else {
        return reject("Failed to retrieve address");
      }
    });
  });
};

const findAddressBySearchKey = (deviceId, coin_type, address) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM addresses WHERE id_utente = ? AND cointype LIKE ? AND address LIKE ? ORDER BY id DESC`;
    const id = deviceId;
    const searchField1 = "%" + coin_type + "%";
    const searchField2 = "%" + address + "%";
    connection.query(query, [id, searchField1, searchField2], (countError, results) => {
      if (countError) {
        reject("Error querying the transaction count: " + countError.message);
        return;
      } else if (results) {
        return resolve(results);
      } else {
        return reject("Search field not found");
      }
    });
  });
};

// const insertTatumAddress = (chain, address) => {
//   return new Promise((resolve, reject) => {
//     const options = {
//       method: "POST",
//       url: "https://api.tatum.io/v4/subscription",
//       headers: {
//         accept: "application/json",
//         "content-type": "application/json",
//         "x-api-key": process.env.TATUM_KEY,
//       },
//       body: {
//         type: "ADDRESS_EVENT",
//         attr: {
//           chain: chain,
//           address: address,
//           url: process.env.TATUM_URL,
//         },
//         //   mempool: true
//       },
//       json: true,
//     };
//     request(options, function (error, response, body) {
//       if (error) {
//         return reject("Error querying the transaction count: " + error.message);
//       }
//       if (response) {
//         return resolve(response);
//       }
//     });
//   });
// };

const getAddressByUserIdAndAddress = (userId, senderAddress) => {
  const query = `SELECT * FROM addresses WHERE id_utente = ? AND address = ?`;
  const queryParams = [userId, senderAddress];
  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to retrieve address: " + error.message));
      }
      if (results.length === 0) {
        return resolve(null); // No matching user or address found
      }
      return resolve(results[0]); // Return the first matching row
    });
  });
};

const getAddressByUserIdAndAddressAndChain = (userId, address, chain) => {
  const query = `SELECT * FROM addresses WHERE id_utente = ? AND address = ? AND cointype = ?`;
  const queryParams = [userId, address, chain];
  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to retrieve address: " + error.message));
      }
      if (results.length === 0) {
        return resolve(null); // No matching user or address found
      }
      return resolve(results[0]); // Return the first matching row
    });
  });
};

const setAllAddressesToInactive = (userId) => {
  const query = `UPDATE addresses SET addressStatus = 'Inactive' WHERE id_utente = ?`;
  const queryParams = [userId];
  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to set all addresses to inactive: " + error.message));
      }
      resolve(results);
    });
  });
};

const updateAddressStatus = (userId, address, status) => {
  const query = `UPDATE addresses SET addressStatus = ? WHERE id_utente = ? AND address = ?`;
  const queryParams = [status, userId, address];
  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to update address status: " + error.message));
      }
      resolve(results);
    });
  });
};

const setUnmatchedAddressesToInactive = (userId, activeAddresses) => {
  const query = `UPDATE addresses SET addressStatus = 'Inactive' WHERE id_utente = ? AND address NOT IN (?)`;
  const queryParams = [userId, activeAddresses];
  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to set unmatched addresses to inactive: " + error.message));
      }
      resolve(results);
    });
  });
};

const getDeviceTokenByFromAddress = (address) => {
  const query = `
        SELECT d.device_token 
        FROM addresses a
        JOIN device d ON d.id = a.id_utente
        WHERE a.address = ?`;

  const queryParams = [address];

  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to retrieve device token: " + error.message));
      }
      if (results.length === 0) {
        return resolve(null);
      }
      return resolve(results[0].device_token);
    });
  });
};

const createWallet = async (id, name, wallet_type, is_active, device_id, user_id) => {
  const query = `INSERT INTO wallet(id, name, wallet_type, is_active, device_id, user_id) VALUES (?, ?, ?, ?, ?, ?)`;
  const queryParams = [id, name, wallet_type, is_active, device_id, user_id];

  const existingUserWallets = await getWalletsByUserId(user_id);
  if (existingUserWallets) {
    const checkIfNameExists = existingUserWallets.find((wallet) => wallet.name === name);
    if (checkIfNameExists) {
      return Promise.reject(new Error("wallet name already exists"));
    }
  }

  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return reject(new Error("Wallet name already exists"));
        }
        return reject(new Error("Failed to create wallet : " + error.message));
      }
      connection.query("UPDATE wallet SET is_active = 0 WHERE device_id = ? AND id != ?", [device_id, id], (err, result) => {
        if (err) {
          return reject(new Error("Failed to create wallet : " + err.message));
        }
        return resolve(results);
      });
    });
  });
};

const updateWalletStatus = async (walletId, status) => {
  try {
    return new Promise((resolve, reject) => {
      //verify atleast and atmost 1 wallet for device should be active all the time
      connection.query(`SELECT * FROM wallet WHERE id = ?`, [walletId], (error, results) => {
        if (error) {
          return reject(new Error("Failed to update wallet: " + error.message));
        }
        //fetch all the wallets for this device
        if (status === 1) {
          // update all other wallets to be inactive
          connection.query(`UPDATE wallet SET is_active = 0 WHERE device_id = ?`, [results[0].device_id], (err, result) => {
            if (err) {
              return reject(new Error("Failed to update wallet: " + err.message));
            }
            //now update current wallet to active state
            connection.query(`UPDATE wallet SET is_active = 1 WHERE id = ?`, [walletId], (error, results) => {
              if (error) {
                return reject(new Error("Failed to update wallet: " + error.message));
              }
              return resolve(results);
            });
          });
        } else {
          connection.query(`SELECT * FROM wallet WHERE device_id = ? AND is_active = 1`, [results[0].device_id], (err, result) => {
            if (err) {
              return reject(new Error("Failed to update wallet: " + err.message));
            }
            if (result.length <= 1) {
              return reject(new Error("Atleast 1 wallet should be active"));
            }
            connection.query(`UPDATE wallet SET is_active = 0 WHERE id = ?`, [walletId], (err, result) => {
              if (err) {
                return reject(new Error("Failed to update wallet: " + err.message));
              }
              return resolve(result);
            });
          });
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

const updateWallet = async (wallet_id, updates) => {
  try {
    // Construct the SET clause dynamically based on the fields provided
    let setClause = [];
    let queryParams = [];

    if (updates.name != null) {
      setClause.push("name = ?");
      queryParams.push(updates.name);
    }
    if (updates.wallet_type != null) {
      setClause.push("wallet_type = ?");
      queryParams.push(updates.wallet_type);
    }
    if (updates.is_active != null) {
      // Checks for boolean value
      setClause.push("is_active = ?");
      queryParams.push(updates.is_active);
      return await updateWalletStatus(wallet_id, updates.is_active);
    }

    // If no fields are provided, return an error
    if (setClause.length === 0) {
      return Promise.reject(new Error("No fields to update"));
    }

    // Add walletId at the end of the queryParams
    queryParams.push(wallet_id);

    // Construct the final query
    const query = `UPDATE wallet SET ${setClause.join(", ")} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      connection.query(query, queryParams, (error, result) => {
        if (error) {
          return reject(new Error("Failed to update wallet: " + error.message));
        }
        resolve(result);
      });
    });
  } catch (error) {
    throw error;
  }
};

const updateWalletDuringSync = async (wallet_id, updates) => {
  try {
   // Construct the SET clause dynamically based on the fields provided
    let setClause = [];
    let queryParams = [];

    if (updates.name != null) {
      setClause.push("name = ?");
      queryParams.push(updates.name);
    }
    if (updates.wallet_type != null) {
      setClause.push("wallet_type = ?");
      queryParams.push(updates.wallet_type);
    }
    if (updates.is_active != null) {
      // Checks for boolean value
      setClause.push("is_active = ?");
      queryParams.push(updates.is_active);
    }

    // If no fields are provided, return an error
    if (setClause.length === 0) {
      return Promise.reject(new Error("No fields to update"));
    }

    // Add walletId at the end of the queryParams
    queryParams.push(wallet_id);

    // Construct the final query
    const query = `UPDATE wallet SET ${setClause.join(", ")} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      connection.query(query, queryParams, (error, result) => {
        if (error) {
          return reject(new Error("Failed to update wallet: " + error.message));
        }
        resolve(result);
      });
    });
  } catch (error) {
    throw new Error("Failed to update wallet during sync: " + error.message);
  }
};

const getWalletById = async (walletId) => {
  const query = `SELECT wallet.* FROM wallet JOIN device ON wallet.device_id = device.id WHERE wallet.id = ? AND device.is_active=1`;
  const queryParams = [walletId];

  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to get wallet : " + error.message));
      }
      if (!results.length) {
        return resolve(null);
      }
      resolve(results[0]);
    });
  });
};

const getWalletsByDeviceId = async (deviceId) => {
  const query = `SELECT wallet.* FROM wallet JOIN device ON wallet.device_id = device.id WHERE device_id = ? AND device.is_active=1`;
  const queryParams = [deviceId];

  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to get wallets : " + error.message));
      }
      if (!results.length) {
        return resolve(null);
      }
      resolve(results);
    });
  });
};

const getWalletsByUserId = async (userId) => {
  const query = `SELECT wallet.* FROM wallet JOIN device ON wallet.device_id = device.id WHERE user_id = ? AND device.is_active=1`;
  const queryParams = [userId];

  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to get wallets : " + error.message));
      }
      if (!results.length) {
        return resolve(null);
      }
      resolve(results);
    });
  });
};

const filterAddresses = (filters) => {
  let query =
    "SELECT id, cointype AS coin_type, address,address_name, id_utente AS user_id, `index`, start_block, tatumStatus AS tatum_status, addressStatus AS address_status, wallet_id  FROM addresses";
  let queryParams = [];
  if (filters) {
    query += " WHERE ";
    Object.keys(filters).map((filter, i) => {
      if (i > 0) {
        query += " AND ";
      }
      query += `${filter} = ?`;
      queryParams.push(filters[filter]);
    });
  }
  console.log("query", query);
  console.log("queryParams", queryParams);

  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to get wallets : " + error.message));
      }
      if (!results.length) {
        return resolve(null);
      }
      resolve(results);
    });
  });
};

const findMultipleAddressesByIds = async (addressIds) => {
  const query =
    `SELECT id, cointype as coin_type, address, address_name, id_utente as user_id, ` +
    "`index`" +
    `, start_block, created_time, tatumStatus as tatum_status, addressStatus as address_status, wallet_id FROM addresses WHERE id IN (${addressIds.join(
      ", "
    )})`;
  return new Promise((resolve, reject) => {
    connection.query(query, [], (error, results) => {
      if (error) {
        return reject(new Error("Failed to fetch addresses : " + error.message));
      }
      if (!results.length) {
        return resolve(null);
      }
      return resolve(results);
    });
  });
};

const updateAddressName = async (user_id, wallet_id, address_id, address_name) => {
  const query = `UPDATE addresses SET address_name = ? WHERE id_utente = ? AND wallet_id = ? AND id = ?`;
  const matches = [address_name, user_id, wallet_id, address_id];
  return new Promise((resolve, reject) => {
    connection.query(query, matches, (error, result) => {
      if (error) {
        return reject(new Error("Failed to edit address name : " + error.message));
      }
      if (result.affectedRows === 1) {
        connection.query(
          "SELECT id, cointype AS coin_type, address,address_name, id_utente AS user_id, `index`, start_block, tatumStatus AS tatum_status, addressStatus AS address_status, wallet_id  FROM addresses WHERE id = ?",
          [address_id],
          (error, results) => {
            if (error) {
              return reject(new Error("Failed to edit address name : " + error.message));
            }
            return resolve(results[0]);
          }
        );
      } else {
        return reject(new Error("Something went wrong while updating address name"));
      }
    });
  });
};

const onboardUser = async (user_id) => {
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE device SET onboarding_status = 1 WHERE id = ?`, [user_id], (error, results) => {
      if (error) {
        return reject(new Error("Failed to onboard user : " + error.message));
      }
      if (!results.affectedRows) {
        return reject(new Error("Failed to onboard user"));
      }
      resolve(true);
    });
  });
};

const storeRangoBlockChains = async (name, default_decimals, type, chain_id, logo, display_name, short_name, info) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO rango_blockchains(name, default_decimals, type, chain_id, logo, display_name, short_name, info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, default_decimals, type, chain_id, logo, display_name, short_name, JSON.stringify(info)],
      (error, results) => {
        if (error) {
          return reject(new Error("Failed to store rango blockchains : " + error.message));
        }
        return resolve(results.insertId);
      }
    );
  });
};

const fetchRangoBlockchainData = async () => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM rango_blockchains`, [], (error, results) => {
      if (error) {
        return reject(new Error("Error while fetching rango blockchain data : " + error.message));
      }
      return resolve(results);
    });
  });
};

const bookmarkToken = async (token_id, wallet_id, user_id, name, symbol, rank, rev, type, chain, address, asset_type, logo) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO bookmarked_tokens(token_id, wallet_id, user_id, name, symbol, `rank`, rev, `type`, chain, address, asset_type, logo) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [token_id, wallet_id, user_id, name, symbol, rank, rev, type, chain, address, asset_type, logo],
      (error, results) => {
        if (error) {
          return reject(new Error(`Error while bookmark token : ${error.message}`));
        }
        if (results.insertId) {
          connection.query(`SELECT * FROM bookmarked_tokens WHERE id = ?`, results.insertId, (err, result) => {
            if (err) {
              return reject(new Error("Error while fetching bookmarked token : " + error.message));
            }
            return resolve(result[0]);
          });
        }
      }
    );
  });
};

const removeBookmarkedToken = async (id) => {
  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM bookmarked_tokens WHERE id = ?`, [id], (error, results) => {
      if (error) {
        return reject(new Error("Error while removing bookmarked token : " + error.message));
      }
      return resolve(results);
    });
  });
};

const fetchBookmarkedTokens = async (user_id, wallet_id) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM bookmarked_tokens WHERE user_id = ? AND wallet_id = ?`, [user_id, wallet_id], (error, results) => {
      if (error) {
        return reject(new Error("Error while fetching bookmarked tokens : " + error.message));
      }
      return resolve(results);
    });
  });
};

const checkExistingCustomChainUrl = async (user_id, wallet_id, blockchain_name) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM custom_urls WHERE user_id = ? AND wallet_id = ? AND blockchain_name = ?`,
      [user_id, wallet_id, blockchain_name],
      (error, results) => {
        if (error) {
          return reject(new Error("Error while fetching custom url : " + error.message));
        }
        if (results.length) {
          return resolve(results[0]);
        } else {
          return resolve(null);
        }
      }
    );
  });
};

const fetchCustomChainUrlsByWallet = async (user_id, wallet_id) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM custom_urls WHERE user_id = ? AND wallet_id = ?`, [user_id, wallet_id], (err, results) => {
      if (err) {
        return reject(new Error("Error while fetching custom chain urls : ", err));
      }
      return resolve(results);
    });
  });
};

const storeCustomChainUrls = async (user_id, wallet_id, blockchain_name, node_url, explorer_url, crypto_currency_ticker, chain_id) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO custom_urls(user_id, wallet_id, blockchain_name, node_url, explorer_url, crypto_currency_ticker, chain_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, wallet_id, blockchain_name, node_url, explorer_url, crypto_currency_ticker, chain_id],
      (error, results) => {
        if (error) {
          return reject(new Error("Error while storing custom chain urls : " + error.message));
        }
        if (results.insertId) {
          connection.query(`SELECT * FROM custom_urls WHERE id = ?`, [results.insertId], (err, result) => {
            if (err) {
              return reject(new Error("Error while fetching custom chain url : " + error.message));
            }
            return resolve(result[0]);
          });
        } else {
          return resolve(null);
        }
      }
    );
  });
};

const updateCustomChainUrl = async (id, node_url, explorer_url) => {
  return new Promise((resolve, reject) => {
    let values = [];

    let url = `UPDATE custom_urls SET `;
    if (node_url && explorer_url) {
      url += "node_url = ?, explorer_url = ?";
      values.push(node_url, explorer_url);
    } else if (node_url && !explorer_url) {
      url += "node_url = ?";
      values.push(node_url);
    } else if (!node_url && explorer_url) {
      url += "explorer_url = ? ";
      values.push(explorer_url);
    }
    url += `WHERE id = ?`;
    values.push(id);
    connection.query(url, values, (error, results) => {
      if (error) {
        return reject(new Error("Error while updating custom chain url : " + error.message));
      }
      connection.query(`SELECT * FROM custom_urls WHERE id = ?`, [id], (err, result) => {
        if (err) {
          return reject(new Error("Error whlie updating custom chain urls : " + error.message));
        }
        return resolve(result[0]);
      });
    });
  });
};

const deleteCustomChainUrl = async (id) => {
  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM custom_urls WHERE id = ?`, [id], (error, results) => {
      if (error) return reject(new Error("Error while deleting custom chain url : " + error.message));
      return resolve(results);
    });
  });
};

const storeDappsList = async (dapps) => {
  const values = dapps.map((dapp) => [dapp.title, dapp.icon_url, dapp.url, dapp.description, dapp.back_url, dapp.tag_info]);

  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO dapps_list (title, icon_url, url, description, back_url, tag_info) VALUES ?
`,
      [values],
      (error, results) => {
        if (error) {
          return reject(new Error("Error while storing dapps list : " + error.message));
        }
        return resolve(results);
      }
    );
  });
};

const fetchDappsList = async (page, limit, key) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM dapps_list WHERE title LIKE ? LIMIT ? OFFSET ?`, [`%${key}%`, limit, (page - 1) * limit], (err, results) => {
      if (err) {
        return reject(new Error("Error while fetching dapps list : " + err.message));
      }
      const data = { dappsList: results };
      connection.query(`SELECT COUNT(*) as count FROM dapps_list WHERE title LIKE ?`, [`%${key}%`], (error, result) => {
        console.log("result", result);
        const totalCount = result[0].count;
        data.totalPages = Math.ceil(totalCount / limit);
        data.totalCount = totalCount;
        data.page = page;
        data.limit = limit;
        data.hasNextPage = page < data.totalPages;

        return resolve(data);
      });
    });
  });
};

const fetchTransactionNotification = async (user_id, wallet_id, page, limit) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM transaction_notifications WHERE user_id = ? AND wallet_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [user_id, wallet_id, limit, (page - 1) * limit],
      (err, results) => {
        if (err) {
          return reject(new Error("Error while fetching transaction notifications: " + err.message));
        }
        const data = { transactionNotifications: results };
        connection.query(
          `SELECT COUNT(*) as count FROM transaction_notifications WHERE user_id = ? AND wallet_id = ?`,
          [user_id, wallet_id],
          (error, result) => {
            console.log("result", result);
            const totalCount = result[0].count;
            data.totalPages = Math.ceil(totalCount / limit);
            data.totalCount = totalCount;
            data.page = page;
            data.limit = limit;
            data.hasNextPage = page < data.totalPages;

            return resolve(data);
          }
        );
      }
    );
  });
};

const deleteWallets = (wallet_ids = []) => {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(wallet_ids) || wallet_ids.length === 0) {
      return reject(new Error("wallet_ids must be a non-empty array."));
    }

    connection.beginTransaction((err) => {
      if (err) return reject(new Error("Transaction start error: " + err.message));

      const placeholders = wallet_ids.map(() => "?").join(",");

      // Step 1: Delete addresses
      connection.query(`DELETE FROM addresses WHERE wallet_id IN (${placeholders})`, wallet_ids, (err, addressResult) => {
        if (err) {
          return connection.rollback(() => {
            reject(new Error("Error deleting addresses: " + err.message));
          });
        }

        // Step 2: Delete wallets
        connection.query(`DELETE FROM wallet WHERE id IN (${placeholders})`, wallet_ids, (err, walletResult) => {
          if (err) {
            return connection.rollback(() => {
              reject(new Error("Error deleting wallets: " + err.message));
            });
          }

          // Step 3: Commit
          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                reject(new Error("Transaction commit error: " + err.message));
              });
            }

            resolve({
              message: "Wallets and their addresses deleted successfully",
              addressesDeleted: addressResult.affectedRows,
              walletsDeleted: walletResult.affectedRows,
            });
          });
        });
      });
    });
  });
};

module.exports = {
  generateKeystore,
  createUser,
  updateUser,
  restoreUser,
  getUserById,
  getUserByVerificationToken,
  saveTokenDataForUser,
  transactionExists,
  getAddresses,
  selectUserByEmail,
  getAddressByAddress,
  createAddress,
  selectTokenByEmail,
  getMaxIndexAddress,
  getPathByAddress,
  insertAssociatedTokenAccount,
  insertTransaction,
  insertTransactionNew,
  insertTransactionNotification,
  getAddressesByUserIdAndCoinType,
  getTransactions,
  filterTransactions,
  getTransactionsByAddress,
  insertStartingBlock,
  getLastSynchronizedBlock,
  getBlocks,
  changePassword,
  saveMasternode,
  getAddressesByStartBlockAndCointype,
  getUserIdByAddress,
  getTransactionsForAddress,
  deleteUserByEmail,
  deleteUserById,
  activateUser,
  setRecoveryUser,
  toggleUser2FA,
  saveUserTotp,
  deleteUser,
  updateBlocks,
  getTokenData,
  getAddressesByCointype,
  getLatestTransactionsFromDB,
  updateTokenVerifica,
  selectUserByToken,
  isAddressOwnedByUser,
  deleteAddressByUserId,
  verifyDevice,
  insertUserAddress,
  checkUserAddress,
  verifyDeviceDetails,
  fetchAddress,
  fetchAddressById,
  findAddressBySearchKey,
  fetchAddressArray,
  // insertTatumAddress,
  getAddressByUserIdAndAddress,
  getDeviceTokenByFromAddress,
  updateAddressStatus,
  getAddressByUserIdAndAddressAndChain,
  setUnmatchedAddressesToInactive,
  setAllAddressesToInactive,
  createWallet,
  updateWallet,
  updateWalletDuringSync,
  getWalletById,
  getWalletsByDeviceId,
  getWalletsByUserId,
  filterAddresses,
  findMultipleAddressesByIds,
  updateAddressName,
  onboardUser,
  storeRangoBlockChains,
  fetchRangoBlockchainData,
  bookmarkToken,
  removeBookmarkedToken,
  fetchBookmarkedTokens,
  storeCustomChainUrls,
  fetchCustomChainUrlsByWallet,
  checkExistingCustomChainUrl,
  updateCustomChainUrl,
  deleteCustomChainUrl,
  storeDappsList,
  fetchDappsList,
  fetchTransactionNotification,
  deleteWallets,
};
