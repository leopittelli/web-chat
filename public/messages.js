
var messages = (function(connection) {

    if (!('indexedDB' in window)) {
        console.log('This browser doesn\'t support IndexedDB');
        return;
    }

    var request = window.indexedDB.open("web-chat", 1);

    var db;
    request.onerror = function(event) {
        alert("Why didn't you allow my web app to use IndexedDB?!");
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

    const add = function() {
        var transaction = db.transaction(["messages"], "readwrite");
        transaction.oncomplete = function(event) {
            alert("All done!");
        };

        transaction.onerror = function(event) {
            // Don't forget to handle errors!
        };

        var objectStore = transaction.objectStore("messages");

        var request = objectStore.add({type: "text", text: "TESTING"});
        request.onsuccess = function(event) {
            console.log(event)
        };
    };

    const send = function() {
        var objectStore = db.transaction("messages", "readwrite").objectStore("messages");

        objectStore.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                connection.send(JSON.stringify(cursor.value));
                var request = cursor.delete();
                request.onsuccess = function() {
                    cursor.continue();
                };
            }
            else {
                alert("No more entries!");
            }
        };
    };

    return {
        add,
        send
    }
})(connection);