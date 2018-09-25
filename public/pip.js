// chrome://flags/#enable-picture-in-picture
// chrome://flags/#enable-surfaces-for-videos

(function() {

    const video = document.querySelector('#pip-video');
    const button = document.querySelector('#pip-button');

    // button.hidden = !document.pictureInPictureEnabled;

    button.addEventListener('click', function() {
        // If there is no element in Picture In Picture yet, let's request Picture
        // In Picture for the video, otherwise leave it.
        if (!document.pictureInPictureElement) {
            video.requestPictureInPicture()
                .catch(error => {
                    // Video failed to enter Picture In Picture mode.
                    console.log(error)
                });
        } else {
            document.exitPictureInPicture()
                .catch(error => {
                    // Video failed to leave Picture In Picture mode.
                    console.log(error)
                });
        }
    });

    video.addEventListener('enterpictureinpicture', () => {
        button.textContent = 'Exit Picture-in-Picture';
    });
    video.addEventListener('leavepictureinpicture', () => {
        button.textContent = 'Enter Picture-in-Picture';
    });

})();