const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fetch = require("node-fetch");
const sysLogger = require("./sysLogger");

const TOKEN_METADATA_BATCH_SIZE = 500;
const TOKEN_IMAGE_TIMEOUT_MS = 5000;

const passkeyMatches = (stored, provided) => {
  if (typeof stored !== "string" || typeof provided !== "string") return false;

  const a = Buffer.from(stored, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
};

const logDbError = (action, error, meta = {}) => {
  try {
    sysLogger.logToDb(
      "DB_QUERY_ERROR",
      action,
      {
        error: error && error.message ? error.message : String(error),
        ...meta,
      },
      "ERROR"
    );
  } catch (e) {}
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

const filterTransactions = (data) => {
  const { limit, offset, wallet_id, start_date, end_date, search, chain, network_type, device_id } = data;

  try {
    // Una transazione appartiene al dispositivo se uno dei due indirizzi
    // coinvolti e' fra i suoi: il legame passa dagli indirizzi, non dalla
    // colonna wallet_id della transazione, cosi' due dispositivi che
    // condividono la stessa seed vedono lo stesso movimento senza doverlo
    // duplicare.
    let body = `
            FROM
                transactions t
            WHERE EXISTS (
                SELECT 1
                FROM addresses a
                JOIN wallet w ON w.id = a.wallet_id
                WHERE a.id_utente = ?
                  AND w.is_active = 1
                  AND (a.address = t.from_address OR a.address = t.destination_address)
                  {{WALLET_SCOPE}}
            )
            `;

    // Initialize the parameters array with the `device_id` first
    let params = [device_id];

    // Dynamically add conditions for each filter if provided
    if (wallet_id) {
      body = body.replace("{{WALLET_SCOPE}}", "AND a.wallet_id = ?");
      params.push(wallet_id);
    } else {
      body = body.replace("{{WALLET_SCOPE}}", "");
    }

    if (start_date && end_date) {
      body += " AND t.data_insert BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    if (search) {
      body += " AND (t.from_address LIKE CONCAT('%', ?, '%') OR t.destination_address LIKE CONCAT('%', ?, '%'))";
      params.push(search, search);
    }

    if (chain && chain != "ALL") {
      body += " AND t.chain = ?";
      params.push(chain);
    }

    if (network_type) {
      body += " AND t.network_type = ?";
      params.push(network_type);
    }

    // Il totale va calcolato prima di impaginare, altrimenti riporta la
    // dimensione della pagina e chi consuma l'API non sa quante pagine restano.
    const countQuery = `SELECT COUNT(*) AS total ${body}`;
    const countParams = [...params];

    let query = `SELECT t.* ${body} ORDER BY t.id DESC `;

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
      connection.query(query, params, async (error, transactions) => {
        if (error) {
          logDbError("dao.filterTransactions.mainQuery", error, { query, params });
          reject("Error querying the transactions: " + error.message);
          return;
        }
        
        //for wallet address in each transaction check if from address belongs to it or destination address, and accordingly assign the transaction_type
        const walletAddresses = await new Promise((resolve, reject) => {
          const walletQuery = `SELECT * FROM addresses WHERE wallet_id = ?`;
          connection.query(walletQuery, [wallet_id], (error, results) => {
            if (error) {
              logDbError("dao.filterTransactions.walletAddresses", error, {
                query: walletQuery,
                params: [wallet_id],
              });
              reject("Error querying wallet addresses: " + error.message);
              return;
            }
            resolve(results);
          });
        });

        const totalCount = await new Promise((resolveCount, rejectCount) => {
          connection.query(countQuery, countParams, (countError, countRows) => {
            if (countError) {
              logDbError("dao.filterTransactions.countQuery", countError, {
                query: countQuery,
                params: countParams,
              });
              rejectCount("Error counting the transactions: " + countError.message);
              return;
            }
            resolveCount(countRows && countRows.length ? countRows[0].total : 0);
          });
        });

        const walletAddressesMap = walletAddresses.map((addressObj) => addressObj.address);
        transactions = transactions.map((tx) => {
          if (walletAddressesMap.includes(tx.from_address)) {
            tx.transaction_type = "outgoing";
          } else if (walletAddressesMap.includes(tx.destination_address)) {
            tx.transaction_type = "incoming";
          }
          return tx;
        });
        resolve({ transactions, totalCount });
      });
    });
  } catch (error) {
    throw error;
  }
};

const getAddressByAddress = (cointype, address) => {
  return new Promise((resolve, reject) => {
    // Lo stesso indirizzo puo' comparire per piu' dispositivi che condividono
    // la seed: l'ordinamento rende stabile quale riga fornisce i metadati,
    // che con la lettura basata sugli indirizzi non determinano piu' chi vede
    // la transazione.
    const query = `SELECT * FROM addresses WHERE cointype = ? AND address LIKE ? ORDER BY id ASC`;
    connection.query(query, [cointype, `%${address}%`], (error, results) => {
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

const getAllMatchingAddresses = (address, chain) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT addresses.*, device.selected_language, device.device_token FROM addresses JOIN device ON addresses.id_utente = device.id WHERE address LIKE ? AND addresses.cointype = ? AND device.is_active=?`;
    connection.query(query, [`%${address}%`, chain, 1], (error, results) => {
      if (error) {
        reject("Error querying the address: " + error.message);
        return;
      }
      resolve(results);
    });
  });
};

const buildTransactionResponse = (row) => ({
  id: row.id,
  chain: row.chain,
  token: row.token,
  logo: row.logo,
  from_address: row.from_address,
  destination_address: row.destination_address,
  tx: row.tx,
  amount: row.amount,
  data_insert: row.data_insert,
  block_number: row.block_number,
  network_type: row.network_type,
  tx_status: row.tx_status,
});

const insertTransactionNew = ({
  isHistoryReceivedFromWebhook,
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
  logo = null,
  token = null,
  usd_price = null,
}) => {
  return new Promise((resolve, reject) => {
    // Un movimento e' identificato dalla transazione e dai due indirizzi, non
    // dal wallet che lo osserva: dispositivi diversi che condividono un
    // indirizzo aggiornano la stessa riga invece di crearne una propria.
    const query = `SELECT * FROM transactions WHERE tx = ? AND from_address = ? AND destination_address = ? AND network_type = ?`;
    const selectParams = [tx, from_address, destination_address, network_type];
    connection.query(query, selectParams, (err, results) => {
      if (err) {
        logDbError("dao.insertTransactionNew.selectExisting", err, {
          query: query,
          params: selectParams,
        });
        return reject(new Error("Error while inserting transaction data : " + err.message));
      }

      if (results.length) {
        const existingId = results[0].id;
        // Le due sorgenti conoscono porzioni diverse del movimento: l'app lo
        // annuncia appena trasmesso, il webhook lo osserva incluso in un blocco.
        // Ogni colonna conserva il valore gia' presente quando chi scrive non ha
        // il dato, cosi' l'ordine di arrivo non cambia il risultato. Solo il
        // webhook puo' promuovere lo stato a confermato.
        const query = `UPDATE transactions SET chain = COALESCE(?, chain), chain_id = COALESCE(?, chain_id), block_number = COALESCE(?, block_number), gas = COALESCE(?, gas), gas_price = COALESCE(?, gas_price), type = COALESCE(?, type), block_hash = COALESCE(?, block_hash), input = COALESCE(?, input), amount = COALESCE(?, amount), tx_status = COALESCE(?, tx_status), token = COALESCE(?, token), logo = COALESCE(?, logo), usd_price = COALESCE(?, usd_price) WHERE id = ?`;
        const values = [
          chain ?? null,
          chain_id ?? null,
          block_number ?? null,
          gas ?? null,
          gas_price ?? null,
          type ?? null,
          block_hash ?? null,
          input ?? null,
          amount ?? null,
          isHistoryReceivedFromWebhook ? "success" : null,
          token ?? null,
          logo ?? null,
          usd_price ?? null,
          existingId,
        ];

        connection.query(
          query,
          values,
          (error) => {
            if (error) {
              logDbError("dao.insertTransactionNew.updateExisting", error, { query: query, values });
              return reject(new Error("Error while inserting transaction data : " + error.message));
            }

            const selectQuery = `SELECT * FROM transactions WHERE id = ?`;
            connection.query(selectQuery, [existingId], (error, rows) => {
              if (error || rows.length === 0) {
                const errToUse = error || new Error("No rows");
                logDbError("dao.insertTransactionNew.fetchUpdated", errToUse, {
                  query: selectQuery,
                  params: [existingId],
                });
                return reject(new Error("Error while fetching updated transaction data : " + errToUse.message));
              }

              return resolve(buildTransactionResponse(rows[0]));
            });
          }
        );
      } else {
        const query = `INSERT INTO transactions(chain, chain_id, network_type, block_number, gas, gas_price, type, block_hash, input, from_address, destination_address, tx, amount, data_insert, tx_status, token, logo, usd_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
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
          isHistoryReceivedFromWebhook ? "success" : "pending", // tx_status will be 'success' if the transaction is received from webhook, otherwise 'pending',
          token,
          logo,
          usd_price,
        ];
        connection.query(
          query,
          values,
          (error, result) => {
            if (error) {
              logDbError("dao.insertTransactionNew.insertNew", error, { query: query, values });
              return reject(new Error("Error while inserting transaction : " + error.message));
            }

            const insertedId = result.insertId;
            const selectQuery = `SELECT * FROM transactions WHERE id = ?`;
            connection.query(selectQuery, [insertedId], (error, rows) => {
              if (error || rows.length === 0) {
                const errToUse = error || new Error("No rows");
                logDbError("dao.insertTransactionNew.fetchInserted", errToUse, {
                  query: selectQuery,
                  params: [insertedId],
                });
                return reject(new Error("Error while fetching inserted data : " + errToUse.message));
              }

              return resolve(buildTransactionResponse(rows[0]));
            });
          }
        );
      }
    });
  });
};

const insertTransactionNotification = (user_id, wallet_id, notification_title, notification_body, chain) => {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO transaction_notifications(user_id, wallet_id, notification_title, notification_body, chain) VALUES (?, ?, ?, ?, ?)`;
    const values = [user_id, wallet_id, notification_title, notification_body, chain];
    connection.query(
      query,
      values,
      (error, results) => {
        if (error) {
          logDbError("dao.insertTransactionNotification", error, { query: query, params: values });
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
        logDbError("dao.getAddressesByUserIdAndCoinType", error, { query: queryAddresses, params: [id_utente, cointype] });
        reject("Failed to get addresses.");
      } else {
        resolve(results);
      }
    });
  });
};

// const getMasternode = () => {
//   const queryInsertMasternode = "UPDATE utenti SET masternode = ? WHERE id = ?";

//   return new Promise((resolve, reject) => {
//     connection.query(queryInsertMasternode, [masternode, id_utente], (error, results) => {
//       if (error) {
//         reject("Failed to update masternode.");
//       } else {
//         resolve(results);
//       }
//     });
//   });
// };

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

const verifyDevice = (identifier, passkey, device_token, selected_language) => {
  return new Promise((resolve, reject) => {
    connection.getConnection((err, conn) => {
      if (err) return reject(new Error("Failed to acquire DB connection: " + err.message));

      conn.beginTransaction((err) => {
        if (err) {
          conn.destroy();
          return reject(new Error("Transaction start error: " + err.message));
        }

        const checkQuery = `SELECT * FROM device WHERE identifier = ? AND is_active=1`;

        conn.query(checkQuery, [identifier], (error, results) => {
          if (error) {
            return conn.rollback(() => {
              conn.destroy(); // 🔥 key fix
              reject(new Error("Failed to retrieve device: " + error.message));
            });
          }

          if (results.length) {
            if (!passkeyMatches(results[0].passkey, passkey)) {
              return conn.rollback(() => {
                conn.release();
                const authError = new Error("Invalid credentials");
                authError.code = "ER_INVALID_CREDENTIALS";
                reject(authError);
              });
            } else {
              conn.query(
                `UPDATE device SET device_token = ?, selected_language = ?
                 WHERE id = ? AND is_active = 1`,
                [device_token, selected_language, results[0].id],
                (updateError) => {
                  if (updateError) {
                    return conn.rollback(() => {
                      conn.destroy();
                      reject(new Error("Failed to update device token: " + updateError.message));
                    });
                  }

                  conn.commit((err) => {
                    if (err) {
                      return conn.rollback(() => {
                        conn.destroy();
                        reject(new Error("Transaction commit error: " + err.message));
                      });
                    }

                    conn.release();
                    resolve(results[0].id);
                  });
                }
              );
            }
          } else {
            conn.query(
              `INSERT INTO device (identifier, passkey, device_token)
               VALUES (?, ?, ?)`,
              [identifier, passkey, device_token],
              (insertError, result) => {
                if (insertError) {
                  conn.destroy();
                  const err = new Error("Failed to register device");
                  err.code = "ER_DUP_ENTRY";
                  return reject(err);
                }

                conn.commit((err) => {
                  if (err) {
                    return conn.rollback(() => {
                      conn.destroy();
                      reject(err);
                    });
                  }

                  conn.release();
                  resolve(result.insertId);
                });
              }
            );
          }
        });
      });
    });
  });
};

const insertUserAddress = async (userData) => {
  const results = await Promise.all(
    userData.map((item) => {
      return new Promise((resolve, reject) => {
        const selectQuery = `SELECT * FROM addresses WHERE id_utente = ? AND address = ? AND cointype = ?`;
        const matches = [item.user_id, item.address, item.coin_type];
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
  return results;
};

const verifyDeviceDetails = (identifier) => {
  const query = `SELECT * FROM device WHERE identifier = ? AND is_active=1`;
  const queryParams = [identifier];
  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
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
        SELECT DISTINCT d.device_token 
        FROM addresses a
        JOIN wallet w ON w.user_id = a.id_utente
        JOIN device d ON d.id = w.device_id
        WHERE a.address = ? 
        AND d.device_token IS NOT NULL 
        AND d.is_active = 1
        AND w.is_active = 1`;

  const queryParams = [address];

  return new Promise((resolve, reject) => {
    connection.query(query, queryParams, (error, results) => {
      if (error) {
        return reject(new Error("Failed to retrieve device token: " + error.message));
      }
      if (results.length === 0) {
        return resolve([]);
      }
      // Restituisce array di device token per gestire dispositivi multipli
      return resolve(results.map((row) => row.device_token));
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
  const query = `SELECT wallet.* FROM wallet JOIN device ON wallet.device_id = device.id WHERE wallet.id = ? AND device.is_active=1 ORDER BY wallet.created_at DESC`;
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
  const query = `SELECT wallet.* FROM wallet JOIN device ON wallet.device_id = device.id WHERE device_id = ? AND device.is_active=1 ORDER BY wallet.created_at DESC`;
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
  const query = `SELECT wallet.* FROM wallet JOIN device ON wallet.device_id = device.id WHERE user_id = ? AND device.is_active=1 ORDER BY wallet.created_at DESC`;
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
    const sql = `
      INSERT INTO bookmarked_tokens(token_id, wallet_id, user_id, name, symbol, \`rank\`, rev, \`type\`, chain, address, asset_type, logo)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (
        SELECT 1
        FROM bookmarked_tokens
        WHERE token_id = ? AND wallet_id = ? AND user_id = ? AND asset_type = ?
      )
    `;
    const params = [
      token_id,
      wallet_id,
      user_id,
      name,
      symbol,
      rank,
      rev,
      type,
      chain,
      address,
      asset_type,
      logo,
      token_id,
      wallet_id,
      user_id,
      asset_type,
    ];

    connection.query(sql, params, (error, results) => {
      if (error) {
        return reject(new Error(`Error while bookmark token : ${error.message}`));
      }

      if (results && results.insertId) {
        // Inserito ora: restituisci il record appena creato
        connection.query(`SELECT * FROM bookmarked_tokens WHERE id = ?`, [results.insertId], (err, result) => {
          if (err) {
            return reject(new Error(`Error while fetching bookmarked token : ${err.message}`));
          }
          return resolve(result[0]);
        });
      } else {
        // Esiste già: restituisci il record esistente
        connection.query(
          `SELECT * FROM bookmarked_tokens WHERE token_id = ? AND wallet_id = ? AND user_id = ? AND asset_type = ? LIMIT 1`,
          [token_id, wallet_id, user_id, asset_type],
          (err, result) => {
            if (err) {
              return reject(new Error(`Error while fetching bookmarked token : ${err.message}`));
            }
            return resolve(result[0]);
          }
        );
      }
    });
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

const fetchDappsList = async (page, limit, key) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM dapps_list WHERE title LIKE ? LIMIT ? OFFSET ?`, [`%${key}%`, limit, (page - 1) * limit], (err, results) => {
      if (err) {
        return reject(new Error("Error while fetching dapps list : " + err.message));
      }
      const data = { dappsList: results };
      connection.query(`SELECT COUNT(*) as count FROM dapps_list WHERE title LIKE ?`, [`%${key}%`], (error, result) => {
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

    connection.getConnection((err, conn) => {
      if (err) return reject(err);

      conn.beginTransaction((err) => {
        if (err) {
          conn.destroy();
          return reject(err);
        }

        const placeholders = wallet_ids.map(() => "?").join(",");

        conn.query(`DELETE FROM addresses WHERE wallet_id IN (${placeholders})`, wallet_ids, (err) => {
          if (err) {
            return conn.rollback(() => {
              conn.destroy();
              reject(err);
            });
          }

          conn.query(`DELETE FROM wallets WHERE id IN (${placeholders})`, wallet_ids, (err, result) => {
            if (err) {
              return conn.rollback(() => {
                conn.destroy();
                reject(err);
              });
            }

            conn.commit((err) => {
              if (err) {
                return conn.rollback(() => {
                  conn.destroy();
                  reject(err);
                });
              }

              conn.release();
              resolve(result);
            });
          });
        });
      });
    });
  });
};

const updateDeviceLanguage = (deviceId, selected_language) => {
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE device SET selected_language = ? WHERE id = ?`, [selected_language, deviceId], (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

const udpateDeviceToken = (deviceId, device_token) => {
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE device SET device_token = ? WHERE id = ?`, [device_token, deviceId], (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

const removeInvalidDeviceToken = (userId) => {
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE device SET device_token = NULL WHERE id = ?`, [userId], (err, results) => {
      if (err) {
        return reject(err);
      }

      return resolve(results);
    });
  });
};

const removeDeviceTokenByToken = (deviceToken) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE device SET device_token = NULL WHERE device_token = ?`;
    connection.query(query, [deviceToken], (err, results) => {
      if (err) {
        logDbError("dao.removeDeviceTokenByToken", err, { query, params: [deviceToken] });
        return reject(err);
      }

      return resolve(results);
    });
  });
};

const cacheTokenImages = async (tokens) => {
  const folderPath = path.join(process.cwd(), "public", "token");
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const unreachableHosts = new Set();
  let stored = 0;
  let failed = 0;

  for (const t of tokens) {
    const imgUrl = t.image ?? t.logo;
    if (!imgUrl) continue;

    try {
      const parsedUrl = new URL(imgUrl);
      if (unreachableHosts.has(parsedUrl.host)) {
        failed++;
        continue;
      }

      let ext = path.extname(parsedUrl.pathname).toLowerCase();
      if (!ext) ext = ".png";

      const fileIdentifier = t.address ? t.address.toLowerCase() : `native-${t.chainId}`;
      const filePath = path.join(folderPath, `${fileIdentifier}${ext}`);
      if (fs.existsSync(filePath)) continue;

      const response = await fetch(imgUrl, { signal: AbortSignal.timeout(TOKEN_IMAGE_TIMEOUT_MS) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      fs.writeFileSync(filePath, Buffer.from(await response.arrayBuffer()));
      stored++;
    } catch (e) {
      failed++;
      try {
        unreachableHosts.add(new URL(imgUrl).host);
      } catch (parseErr) {}
    }
  }

  sysLogger.logToDb(
    "SYSTEM_EVENT",
    "dao.cacheTokenImages.completed",
    { stored, failed, unreachableHosts: unreachableHosts.size },
    failed > 0 ? "WARN" : "INFO"
  );
};

const syncTokenMetaDataInDB = (tokens) => {
  function has4ByteUnicode(str) {
    return /[\u{10000}-\u{10FFFF}]/u.test(str || "");
  }
  function strip4ByteChars(str) {
    if (!str) return str;
    return str.replace(/[\u{10000}-\u{10FFFF}]/gu, "");
  }

  return new Promise(async (resolve, reject) => {
    if (!tokens || tokens.length === 0) {
      return resolve("No tokens to sync");
    }

    let rows = [];

    // -----------------------------------
    // 1️⃣ FIRST — Prepare rows
    // -----------------------------------
    for (const t of tokens) {
      try {
        if (has4ByteUnicode(t.name) || has4ByteUnicode(t.symbol)) {
          t.symbol = strip4ByteChars(t.symbol);
          t.name = strip4ByteChars(t.name);
        }

        rows.push([
          t.blockchain || null,
          t.symbol || null,
          t.name || null,
          t.isPopular ? 1 : 0,
          t.chainId || null,
          t.address || null,
          t.decimals ?? null,
          t.image || t.logo || null,
          t.blockchainImage || null,
          t.usdPrice ?? null,
          JSON.stringify(t.supportedSwappers || []),
        ]);
      } catch (errLoop) {
        sysLogger.logToDb(
          "SYSTEM_ERROR",
          "dao.syncTokenMetaDataInDB.tokenLoopError",
          {
            tokenAddress: t && t.address ? t.address : null,
            chainId: t && t.chainId ? t.chainId : null,
            error: errLoop && errLoop.message ? errLoop.message : String(errLoop),
          },
          "ERROR"
        );
      }
    }

    if (rows.length === 0) return resolve("No valid tokens to insert");

    const run = (sql, params) =>
      new Promise((res, rej) => connection.query(sql, params, (err, result) => (err ? rej(err) : res(result))));

    // -----------------------------------
    // 2️⃣ SECOND — Fill a staging table in batches
    // -----------------------------------
    try {
      await run(`DROP TABLE IF EXISTS token_metadata_staging`);
      await run(`CREATE TABLE token_metadata_staging LIKE token_metadata`);

      for (let i = 0; i < rows.length; i += TOKEN_METADATA_BATCH_SIZE) {
        await run(
          `INSERT INTO token_metadata_staging
          (blockchain, symbol, name, isPopular, chainId, address, decimals, image, blockchainImage, usdPrice, supportedSwappers)
          VALUES ?`,
          [rows.slice(i, i + TOKEN_METADATA_BATCH_SIZE)]
        );
      }

      // -----------------------------------
      // 3️⃣ THIRD — Swap it in atomically
      // -----------------------------------
      await run(`DROP TABLE IF EXISTS token_metadata_previous`);
      await run(
        `RENAME TABLE token_metadata TO token_metadata_previous, token_metadata_staging TO token_metadata`
      );
      await run(`DROP TABLE token_metadata_previous`);

      // -----------------------------------
      // 4️⃣ FOURTH — Cache the token images, best effort
      // -----------------------------------
      await cacheTokenImages(tokens);

      resolve({ affectedRows: rows.length });
    } catch (err) {
      try {
        await run(`DROP TABLE IF EXISTS token_metadata_staging`);
      } catch (cleanupErr) {
        sysLogger.logToDb(
          "SYSTEM_ERROR",
          "dao.syncTokenMetaDataInDB.stagingCleanupFailed",
          { error: cleanupErr && cleanupErr.message ? cleanupErr.message : String(cleanupErr) },
          "ERROR"
        );
      }
      reject(new Error("Error inserting token metadata: " + err.message));
    }
  });
};

const fetchTokenMetadata = ({ chains, search, limit, offset }) => {
  return new Promise((resolve, reject) => {
    const params = [];
    let where = "WHERE blockchain IN (?)";
    params.push(chains);

    if (search && search.trim() !== "") {
      where += `
        AND symbol LIKE ?
      `;
      params.push(`%${search}%`);
    }

    const sql = `
      SELECT 
        id,
        blockchain,
        symbol,
        name,
        isPopular,
        chainId,
        address,
        decimals,
        image,
        blockchainImage,
        usdPrice,
        supportedSwappers
      FROM token_metadata
      ${where}
      ORDER BY isPopular DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    const countSql = `SELECT COUNT(*) AS total FROM token_metadata ${where}`;

    connection.query(countSql, params.slice(0, params.length - 2), (err, countRows) => {
      if (err) return reject(err);

      const total = countRows[0]?.total || 0;

      connection.query(sql, params, (err, rows) => {
        if (err) return reject(err);

        // Parse swappers JSON
        rows.forEach((r) => {
          if (r.supportedSwappers) {
            try {
              r.supportedSwappers = JSON.parse(r.supportedSwappers);
            } catch {
              r.supportedSwappers = [];
            }
          }
        });

        resolve({ data: rows, total });
      });
    });
  });
};

module.exports = {

  getUserByVerificationToken,

  getAddressByAddress,
  getAllMatchingAddresses,

  insertTransactionNew,
  insertTransactionNotification,
  getAddressesByUserIdAndCoinType,

  filterTransactions,

  activateUser,

  isAddressOwnedByUser,

  verifyDevice,
  insertUserAddress,

  verifyDeviceDetails,

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

  fetchRangoBlockchainData,
  bookmarkToken,
  removeBookmarkedToken,
  fetchBookmarkedTokens,
  storeCustomChainUrls,
  fetchCustomChainUrlsByWallet,
  checkExistingCustomChainUrl,
  updateCustomChainUrl,
  deleteCustomChainUrl,

  fetchDappsList,
  fetchTransactionNotification,
  deleteWallets,

  updateDeviceLanguage,
  udpateDeviceToken,
  removeInvalidDeviceToken,
  removeDeviceTokenByToken,
  syncTokenMetaDataInDB,
  fetchTokenMetadata,
};
