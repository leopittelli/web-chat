// chrome://flags/#enable-picture-in-picture
// chrome://flags/#enable-surfaces-for-videos

// http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
const pip = (function() {

    // button.hidden = !document.pictureInPictureEnabled;
    let activeVideo;

    function toggle(id){
        const video = document.querySelector(`#${id}`);

        if (activeVideo === video) {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture()
                    .catch(error => {
                        // Video failed to enter Picture In Picture mode.
                        console.log(error)
                    });
            }
            activeVideo = false;
        } else {
            activeVideo = video;
            activeVideo.requestPictureInPicture()
                .catch(error => {
                    // Video failed to enter Picture In Picture mode.
                    console.log(error)
                });
        }
    }

    return {
        toggle
    }
})();