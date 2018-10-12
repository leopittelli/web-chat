// chrome://flags/#enable-experimental-web-platform-features

const shape = (function() {
    const canvas = document.getElementById('canvas-shape');

    function detect(id) {
        if (!window.FaceDetector) {
            chat.notify("Este navegador no soporta web face detection");
            return;
        }

        const image = document.getElementById(id);

        const faceDetector = new FaceDetector();
        faceDetector.detect(image)
            .then(faces => {
                canvas.height = image.naturalHeight;
                canvas.width = image.naturalWidth;

                const ctx = canvas.getContext('2d');

                ctx.drawImage(image,
                    0, 0, canvas.width, canvas.height,
                    0, 0, canvas.width, canvas.height);

                ctx.lineWidth = 2;
                ctx.strokeStyle = 'red';
                for(let face of faces) {
                    face = face.boundingBox;
                    ctx.rect(face.x, face.y, face.width, face.height);
                    ctx.stroke();
                }

                image.src = canvas.toDataURL();
            })
            .catch((e) => {
                chat.notify("Error detectando las caras");
            });
    }

    return {
        detect
    }

})();