const captureImage = (function() {
    const video             = document.getElementById('video'),
        canvas              = document.getElementById('canvas'),
        sendImageButton     = document.getElementById('send-image'),
        sendImageModal      = document.getElementById('send-image-modal'),
        takePictureButton   = document.getElementById('take-picture'),
        closeModalButton    = document.querySelector('#send-image-modal .close');
    let ratio, width, height;

    const emptyFilter = data => data;
    let imageFilter = emptyFilter;

    function getMedia() {
        navigator.mediaDevices.getUserMedia({
            video: true
        })
            .then(function(stream) {
                video.srcObject = stream;
                sendImageModal.style.display = 'block';
            })
            .catch(function(error) {
                console.log('error', error);
            });
    }

    function closeModal() {
        const track = video.srcObject.getTracks()[0];
        track.stop();
        sendImageModal.style.display = 'none';
    }

    function takepicture() {
        closeModal();
        canvas.toBlob(function(blob) {
            const form = new FormData();

            form.append('image', blob, 'newPhoto.png');

            fetch('/images', {
                method: 'POST',
                body: form
            })
            .then((response) =>  {
                if (response.status >= 200 && response.status <= 302) {
                    return response
                } else {
                    let error = new Error(response.statusText);
                    error.response = response;
                    throw error
                }
            })
            .then(response => response.json())
            .then((data) => {
                chat.send({ type: "image", url: data.url});
            })
            .catch((error) => {
                chat.notify("Error enviando la imagen");
            })
        })
    }

    function renderSource(source, destination) {
        const context = destination.getContext('2d');
        context.drawImage(source, 0, 0, destination.width, destination.height);

        const imageData = context.getImageData(0, 0, destination.width, destination.height);
        imageData.data.set(imageFilter(imageData));
        context.putImageData(imageData, 0, 0);

        requestAnimationFrame(_ => renderSource(source, destination));
    }

    video.addEventListener('loadedmetadata', function() {
        // Seteamos las dimensiones del canvas respetando el aspect ratio del video
        ratio = video.videoWidth / video.videoHeight;
        width = 640;
        height = parseInt(width / ratio, 10);

        canvas.width = width;
        canvas.height = height;

        requestAnimationFrame(_ => renderSource(video, canvas));
    }, false);

    takePictureButton.addEventListener('click', function(ev){
        takepicture();
        ev.preventDefault();
    }, false);

    sendImageButton.addEventListener('click', function(ev){
        getMedia();
        ev.preventDefault();
    }, false);

    closeModalButton.addEventListener('click', function(ev){
        closeModal();
        ev.preventDefault();
    }, false);

    function setFilter(filter) {
        imageFilter = filter;
    }

    function removeFilter() {
        imageFilter = emptyFilter;
    }

    return {
        setFilter,
        removeFilter
    }
})();