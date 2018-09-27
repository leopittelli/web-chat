(function() {

    const video          = document.querySelector('#video'),
        canvas         = document.querySelector('#canvas'),
        getmediabutton = document.querySelector('#getmediabutton'),
        startbutton    = document.querySelector('#startbutton');
    let ratio, width, height;

    function getMedia() {
        navigator.mediaDevices.getUserMedia({
            video: true
        })
            .then(function(stream) {
                video.srcObject = stream;
                startbutton.removeAttribute('disabled');
            })
            .catch(function(error) {
                console.log('error', error);
            });
    }

    function takepicture() {
        canvas.getContext('2d').drawImage(video, 0, 0, width, height);
        canvas.toBlob(function(blob) {
            const form = new FormData();

            var numBytes = width * height * 4;
            var ptr= Module.getMemory(numBytes);
            var heapBytes= new Uint8Array(Module.HEAPU8.buffer, ptr, numBytes);

            var ptrOut= Module.getMemory(numBytes);
            var heapBytesOut= new Uint8Array(Module.HEAPU8.buffer, ptrOut, numBytes);

            // copy data into heapBytes
            heapBytes.set(new Uint8Array(blob.data));

            Module._outline_c(heapBytes.byteOffset, heapBytesOut, width, height);
            form.append('image', new Blob(heapBytesOut), 'newPhoto.png');

            Module.memory(heapBytes.byteOffset);
            Module._free(heapBytesOut.byteOffset);

            fetch('/images', {
                method: 'POST',
                body: form
            })
            .then((response) =>  {
                if (response.status >= 200 && response.status <= 302) {
                    return response
                } else {
                    var error = new Error(response.statusText)
                    error.response = response
                    throw error
                }
            })
            .then(response => response.json())
            .then((data) => {
                console.log('request succeeded with JSON response', data)
                connection.send(JSON.stringify({ type: "image", url: data.url}));
            })
            .catch((error) => {
                console.log('ERROR', error)
            })
        })
    }

    video.addEventListener('loadedmetadata', function() {
        // Calculate the ratio of the video's width to height
        ratio = video.videoWidth / video.videoHeight;
        // Define the required width as the actual video's width
        width = video.videoWidth - 1000;
        // Calculate the height based on the video's width and the ratio
        height = parseInt(width / ratio, 10);
        // Set the canvas width and height to the values just calculated
        canvas.width = width;
        canvas.height = height;
    }, false);

    getmediabutton.addEventListener('click', function(ev){
        getMedia();
        ev.preventDefault();
    }, false);

    startbutton.addEventListener('click', function(ev){
        takepicture();
        ev.preventDefault();
    }, false);

})();