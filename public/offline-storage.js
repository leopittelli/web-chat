const offlineStorage = (function() {
    const request = window.indexedDB.open("web-chat", 1);

    let db;

    request.onerror = function(event) {
        chat.notify("Ocurrió un error iniciando el almacenamiento");
    };
    request.onsuccess = function(event) {
        db = request.result;
    };

    request.onupgradeneeded = function(event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains('messages')) {
            db.createObjectStore('messages', {autoIncrement: true});
        }
    };

    const save = function(message) {
        const transaction = db.transaction(["messages"], "readwrite");
        transaction.onerror = function(event) {
            chat.notify("Error guardando el mensaje");
        };

        const objectStore = transaction.objectStore("messages");

        const request = objectStore.add(message);
        request.onsuccess = function(event) {
            chat.notify("Mensaje almacenado correctamente");
        };
    };

    const sendStoredMessages = function() {
        const objectStore = db.transaction("messages", "readwrite").objectStore("messages");

        objectStore.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                console.log(cursor.value)
                chat.send(cursor.value);
                const request = cursor.delete();
                request.onsuccess = function() {
                    cursor.continue();
                };
            }
        };
    };

    return {
        save,
        sendStoredMessages
    }
})();