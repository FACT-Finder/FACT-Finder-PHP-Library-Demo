/*
 * default methods for demoshop GUI
 * needs jQuery
 *
 * @author JG
 */

$(document).ready(
    function(){
        //enable management modus button
        $('img#managementButton').click().toggle(function(){
            activateManagement();
        }, function() {
             deactivateManagement();
        });

        //enable infomodus button if there are functions else hide the button
        if(typeof activateInfomodus == 'function' && typeof deactivateInfomodus == 'function'){
            $('img#infoButton').click().toggle(function(){
                activateInfomodus();
            }, function() {
                 deactivateInfomodus();
            });
        }else{
            $('img#infoButton').hide();
        }


        // let the passive tabs fade by mouseover and out
        $('div.passive > a').mouseover( function() { $(this).parent().fadeTo('normal', 1); } );
        $('div.passive > a').mouseout( function() { $(this).parent().fadeTo('normal', 0.5); } );

        //enable div:hover in IE
        if($.browser.msie){
            $('div.product').mouseover( function() { $(this).addClass("product-hover") } );
            $('div.product').mouseout( function() { $(this).removeClass("product-hover") } );

            $('div.asnImage').mouseover( function() { $(this).addClass("asnImage-hover") } );
            $('div.asnImage').mouseout( function() { $(this).removeClass("asnImage-hover") } );
        }

        //set blur and focus events for the query input
        $(document.forms["search_word_inc"]["query"]).blur( function() { checkInputText(); } );
        $(document.forms["search_word_inc"]["query"]).focus( function() { hideDefaultInputText(); } );


        //fade out the deleted products so user sees which articles are in the trash
        if(typeof fadeDeletedProducts == 'function' && typeof fadeDeletedProducts == 'function'){
            fadeDeletedProducts();
        }
    }
);


function activateManagement(){
    $('img#managementButton').attr('src', 'files/images/demoshop/modus_management_on.png');

    //activate trash if this is possible (=function exists)
    if(typeof activateProductTrash == 'function'){
        activateProductTrash();
    }
    //show xml-button
    $('img#xmlButton').show();

}
function deactivateManagement(){
    $('img#managementButton').attr('src', 'files/images/demoshop/modus_management_off.png');

    if(typeof deactivateProductTrash == 'function'){
        deactivateProductTrash();
    }
    $('img#xmlButton').hide();
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


function hideDefaultInputText(){
    var input = document.forms['search_word_inc']['query'];
    //if the default text is in the field remove it and remove css-class
    if($.trim(input.value) == 'enter search query...'){
        input.value = '';
        $(input).removeClass('default');
    }
}
function checkInputText(){
    var input = document.forms['search_word_inc']['query'];
    if($.trim(input.value) === ''){
        //if there is no query write default text and add css class.
        input.value = 'enter search query...';
        $(input).addClass('default');
    }
}
