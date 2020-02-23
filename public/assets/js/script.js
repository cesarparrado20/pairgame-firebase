document.getElementById("btn-download").addEventListener("click", () => {
    if( /Android/i.test(navigator.userAgent) ) {
        location.href="https://play.google.com/store/apps/details?id=com.facebook.katana";
    }else if( /iPhone/i.test(navigator.userAgent) ) {
        location.href="https://apps.apple.com/co/app/facebook/id284882215";
    }else{
        Swal.fire({
            title: 'Sorry!',
            text: 'We are not yet available for your device, we hope to be soon.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
});