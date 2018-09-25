// chrome://flags/#enable-experimental-web-platform-features

(function() {

    var image = document.getElementById('image-shape');
    var canvas = document.getElementById('canvas-shape');

    var ctx = canvas.getContext('2d');
    var scale = 1;

    image.onload = function() {
        ctx.drawImage(image,
            0, 0, image.width, image.height,
            0, 0, canvas.width, canvas.height);

        scale = canvas.width / image.width;

        detect();
    };

    function detect() {
        if (window.FaceDetector == undefined) {
            console.error('Face Detection not supported');
            return;
        }

        var faceDetector = new FaceDetector();
        faceDetector.detect(image)
            .then(faces => {
                // Draw the faces on the <canvas>.
                var ctx = canvas.getContext('2d');
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'red';
                for(let face of faces) {
                    face = face.boundingBox;
                    ctx.rect(Math.floor(face.x * scale),
                        Math.floor(face.y * scale),
                        Math.floor(face.width * scale),
                        Math.floor(face.height * scale));
                    ctx.stroke();
                }
            })
            .catch((e) => {
                console.error("Boo, Face Detection failed: " + e);
            });
    }

})();