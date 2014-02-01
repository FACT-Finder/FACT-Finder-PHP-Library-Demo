$(document).ready(
	function(){
		$('div#infoPlaceHolder').hide();
	}
);

function activateInfomodus(){
	$('img#infoButton').attr('src', 'images/demoshop/modus_info_on.png');
	$('div#infoPlaceHolder').show();
}
function deactivateInfomodus(){
	$('img#infoButton').attr('src', 'images/demoshop/modus_info_off.png');
	$('div#infoPlaceHolder').hide();
}
