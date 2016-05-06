/*
 * default methods for demoshop GUI
 * needs jQuery
 *
 * @author JG
 */
$(document).ready(
    function(){    
        //set blur and focus events for the query input
        $(document.forms["search_word_inc"]["query"]).blur(function(){ checkInputText();});
        $(document.forms["search_word_inc"]["query"]).focus(function(){ hideDefaultInputText();})
    }
);

function hideDefaultInputText(){
    var input = document.forms['search_word_inc']["query"];
    
    if($.trim(input.value) == 'enter search query...'){
        input.value = '';
        $(input).removeClass('default');
    }
}

function checkInputText(){
    var input = document.forms['search_word_inc']["query"];
    if($.trim(input.value) == ''){
        
        input.value = 'enter search query...';
        $(input).addClass('default');
    }
}

function imageNotFound(img){
    //if the product picture wasn't found use a default picture
    $(img).show();
    img.src = 'files/images/demoshop/noProductPicture.jpg';
    img.onerror = null;
}

function resizePicture(img, maxWidth, maxHeight){
    //resize a picture so it fits into the div
    if(img.width > maxWidth){ img.width = maxWidth; }
    if(img.height > maxHeight){ img.height = maxHeight; }
}