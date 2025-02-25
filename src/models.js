const userToJson = (result) => {
    const user = {
        id: result.id,
        email: result.email,
        password: result.password,
        masternode: result.masternode
    };

    return user;
}

const addressToJson = (result) => {
    const address = {
        id: result.id,
        cointype: result.cointype,
        path: result.path,
        address: result.address,
        idUtente: result.id_utente,
        index: result.index
    };

    return address;
}

module.exports = {
    userToJson,
    addressToJson
}
