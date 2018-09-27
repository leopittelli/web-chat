function filter(imageData) {
    const bufferPointerIn = 1024,
        {data, width, height} = imageData,
        bufferIn = new Uint8Array(width * height * 4),
        bufferPointerOut = 2048 + width * height * 4,
        bufferOut = new Uint8Array(width * height * 4);

    bufferIn.set(data);
    Module._outline_c(bufferPointerIn, bufferPointerOut, width, height);
    data.set(bufferOut);
    return data;
}

function renderSource(source, destination) {
    const context = destination.getContext('2d');
    context.drawImage(source, 0, 0, destination.width, destination.height);

    const imageData = context.getImageData(0, 0, destination.width, destination.height);
    imageData.data.set(filter(imageData));
    context.putImageData(imageData, 0, 0);

    requestAnimationFrame(_ => renderSource(source, destination));
}

function main() {
    const video = document.querySelector('#video-wasm')

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

    const image = document.querySelector('#canvas-wasm');
    requestAnimationFrame(_ => renderSource(video, image));
}
