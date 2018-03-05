window.onload = function () {
    
    document.getElementById('inputSpan').addEventListener('click', () => {
	var image = document.createElement("img");
	image.setAttribute('src', '/public/images/lg.ajax-spinner-preloader.gif');
	document.getElementById('loadingGif').appendChild(image);
    });

};
