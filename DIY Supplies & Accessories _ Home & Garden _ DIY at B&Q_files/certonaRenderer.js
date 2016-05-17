var scrollerType = '';
var randomEANs="";

/*
 * Product carousel renderer lazy
 */
function productCarouselRendererLazy(slot_element, recs, displayData) {
    var self = this;
    var EANs = "";
    for (var i = 0; i < recs.length; i++) {
        if (recs.length != i) {
            EANs = EANs + recs[i].ID + ',';
        } else {
            EANs = EANs + recs[i].ID;
        }
    }
    scrollerType = 'vertical';
    var elemString = '<section class="recommendation-block"> <h2 class="block-title2">'
            + self.headerText;
    elemString += '</h2> <div class="carousel carousel-product lazy-carousel" data-limit="'
            + recs.length
            + '" data-pull="/common/recommendation/renderer/recommendationProductInfo.jsp" data-eans=""><div class="carousel-inner"> <ul>';
    elemString += displayData + '</ul> </div> </div> </section>';
    var fragment = $(elemString);
    $(slot_element).append(fragment);
    $(slot_element).find('.carousel').attr('data-eans', EANs);
    $(document).trigger('loaded.customRenderer.carousel');
}

/*
 * Product recommendation getter
 */
var productBuilder = function(slot_name, rec_data) {
    var productId = '';
    for (var i = 0; i < rec_data.length; i++) {
        productId = productId + rec_data[i].ID + '=:';
    }
    return $
            .get('/common/recommendation/renderer/recommendationProductInfo.jsp'
                    + '?productId='
                    + productId
                    + '&scrollerType='
                    + scrollerType);
};

/*
 * This function is the callback function that Certona invokes with the Recommendation data
 */

function certonaRecommendations(data) {
    var rec_data = data.resonance.schemes[0].items;
    if (rec_data.length > 0) {
        scrollerType = 'horizontal';
        productBuilder("", rec_data).done(function(data) {
            if (data) {
                productCarouselRendererLazy($('#' + slotId), rec_data, data);
            }
        });
    }
}

function getRandomEans() {
    var Json;
    var type = 'GET';
    if($('.lt-ie10').length){
        var type = 'POST';
    }
    $.ajax({
        url:'//lnxs0086:8000/darwinMock/RandomEans',
        type:type,
        dataType:'text',
        async: false,
        success: function(data){
            randomEANs= data;
        }
    })
};

/*
 * This Script is to Mock Certona call in our Local Dev VMs. This will not be invoked in Production
 * as the mockRecommendations will be false
 */

$(window)
        .load(
                function loadRecommendations() {
                    if (typeof mockRecommendations != 'undefined' && mockRecommendations) {
                        getRandomEans(); //Remove this for local VMs
                        scrollerType = 'vertical';
                        var mockProducts = '"items":[{"ID":"04073451"},{"ID":"5014869104217"},{"ID":"5014869104101"},{"ID":"5014869104170"},{"ID":"4003530007066"},{"ID":"5011944011163"}]';
                        if(randomEANs.length > 0){
                            mockProducts = '"items":'+randomEANs.replace(/productId/g,"ID");

                        }

                        var mockJsonData = '{"resonance":{"schemes":[{"scheme":"product1_rr","explanation":"YouMayAlsoLike","display":"yes",'
                            +mockProducts+'}]}}';
                        mockJsonData=JSON.parse(mockJsonData);
                        certonaRecommendations(mockJsonData);
                    }
                });
