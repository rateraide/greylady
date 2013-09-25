const {Cc,Ci,Cr} = require('chrome');
const TOPIC_MODIFY_REQUEST = 'http-on-modify-request';
var _httpRequestObserver;

exports.main = function(options,callbacks) {
	_httpRequestObserver =
    {
        init:function() {
			var ioService = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
			this.referrerURI = ioService.newURI('http://www.twitter.com/nytimes',null,null);
            var observerSvc = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
            observerSvc.addObserver(this,TOPIC_MODIFY_REQUEST,false);
        },
        observe:function(subject,topic,data) 
        {
            if (TOPIC_MODIFY_REQUEST == topic) {
                subject.QueryInterface(Ci.nsIHttpChannel);
                if (-1 != subject.URI.spec.indexOf('.nytimes.com/')) {
                	try {
						subject.referrer = this.referrerURI;
					} catch (err) { console.log('Exception in observer: '+err.message); }
                }
            }
        },
    };
    function showWelcomePopup() {
    	var text = 'Thank you for installing Grey Lady! The NYT paywall is being actively '+
    			   'disabled. Close and reopen any existing NYT tabs to take effect.';
		require('popup').notify({
			text:text,
			mainAction:{
				label:'OK',
				accessKey:'O',
				callback:function() {},
			},
			secondaryActions:[{
				label:'Donate',
				accessKey:'D',
				callback:function() { 
					var url = 'http://www.rateraide.com/donate';
					var win = require('sdk/window/utils').getMostRecentBrowserWindow();
					win.gBrowser.loadOneTab(url,{inBackground:false,relatedToCurrent:true});			
				},
			}],
		});
    };
    _httpRequestObserver.init();
    if ('install' == options.loadReason)
    	showWelcomePopup();
};

exports.onUnload = function() {
	var observerSvc = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
	observerSvc.removeObserver(_httpRequestObserver,TOPIC_MODIFY_REQUEST);
};
