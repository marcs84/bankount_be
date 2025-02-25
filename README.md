## Per testare l'applicativo

 - Esegui npm install
 - Inizializzare DB su mysql
 - Simulare la registrazione degli utenti decommentando in index.js la parte relativa alla *userRegistration* e commentando quella relativa al *UserLogin*
 - Lanciato i metodi si avranno 5 utenti , ognuno con un Masternode inizializzato con un account per ogni blockchain.
 - Decommenta il codice riferito a *userRegistration* perchè ora vogliamo fare il login e commenta la parte di *UserLogin* appunto passando la giusta email e la giusta password
 - Una volta fatto ciò, il sistema attraverso crittografia AES, permetterà di decrittografare il Masternode salvato nel db in maniera cifrata e di accedere agli address specifici.
 - Per visualizzare i propri address è possibile richiamare la funzione *useProva* dopo aver fatto il login per verificare se è effettivamente un wallet deterministico. Questa funzione ha 3 parametri: Il masternode,un indice (che rappresenta la foglia del key derivation tree della nostra stuttura BIP32: Ad ogni indice corrisponde un nuovo address per quella determinata blockchain, se si incrementa verrà generato un nuovo set di address) e il tipo di network, se testnet, se stagenet o mainent (settato su testnet già)
 - Visualizzare ora che Gli address che useProva fornisce siano conformi a quelli generati per il Login. Se sono uguali, allora lo standard BIP32 è a tutti gli effetti funzionante e deterministico per le blockchain. 

 *N.B* Per Monero si genera un mnemonic a parte in quanto per sua logica by design non permette di usare lo stesso mnemonic dello standard BIP32, quindi attraverso un codice coperto da copyright in monero_core.js è possibile derivare comunque gli address generando in background un'altro mnemonic attraverso la chiave privata del nodo foglio dell'albero riferito alla blockchain Monero.