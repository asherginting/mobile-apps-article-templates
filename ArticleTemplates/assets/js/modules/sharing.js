define([
    'bean',
    'bonzo',
    'qwery',
    'modules/$'
], function (
    bean,
    bonzo,
    qwery,
    $
) {

    var modules = {
        nativeSharing: function(_window, service, url, title){
            var action;
            switch(service){
                case 'facebook': action = 'x-gu://facebookshare/'; break;
                case 'twitter': action = 'x-gu://twittershare/'; break;
            } 
            if(action && url){
                action = action + "?url=" + encodeURIComponent(url);
                if(title){
                    action = action + "&title=" + encodeURIComponent(title);
                }
                _window.location.href = action;
            }
        }
    };

    function bootstrap(_window){
        if($('body').hasClass('ios')){
            _window.nativeSharing = modules.nativeSharing.bind(modules, _window);
        }
    }

    return {
        init: bootstrap,
        // testing purpouses
        modules: modules
    };
});
