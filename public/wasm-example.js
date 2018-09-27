function filter(imageData) {
    const bufferPointerIn = 1024,
        {data, width, height} = imageData,
        bufferIn = new Uint8Array(width * height * 4),
        bufferPointerOut = 2048 + width * height * 4,
        bufferOut = new Uint8Array(width * height * 4);

    console.log(imageData)
    //bufferIn.set(data);
    Module._outline_c(bufferPointerIn, bufferPointerOut, width, height);
    data.set(bufferOut);
    return data;
}

const video = document.querySelector('#video-wasm')
function renderSource(source, destination) {
    source.getContext('2d').drawImage(video, 0, 0, 640, 480);
    source.toBlob(function(blob) {
        destination.getContext('2d').putImageData(filter(blob), 0, 0);
    })
    requestAnimationFrame(_ => renderSource(source, destination));
}

function main() {

    navigator.mediaDevices.getUserMedia({
        video: true
    })
        .then(function(stream) {
            video.srcObject = stream;
        })
        .catch(function(error) {
            console.log('error', error);
        });

    const image = document.querySelector('#canvas-wasm-2');
    const canvas1 = document.querySelector('#canvas-wasm');
    requestAnimationFrame(_ => renderSource(canvas1, image));
}
