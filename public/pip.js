// chrome://flags/#enable-picture-in-picture
// chrome://flags/#enable-surfaces-for-videos

// http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
const pip = (function() {

    let activeVideo;

    function toggle(id){
        if (!document.pictureInPictureEnabled) {
            chat.send({type: "text", text: "Este navegador no soporta web picture in picture", author: "admin"})
        }

        const video = document.getElementById(id);

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