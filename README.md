# angular-burt-analytics
This is a simple angular module which lets you integrate burt analytics tracker in your AngularJS application.

##How to use angular-burt-analytics in your angular app
In Html:
```html
<script src="client/bower_components/angular-burt-analytics/js/angular-burt-analytics.js"></script>
```
In you angular app config
```javascript
//In start of app, Module(ngBurtAnalytics) injection 
angular.module('kokaihop', [
     //... other modules
     'ngBurtAnalytics',
    'ngHelpers'
])
//Provider injection to setup your BurtAnalytics
.config(function ( BurtAnalyticsProvider) {
//setUp will goes here
BurtAnalyticsProvider.setTrackingKey(['xxxx', 'xxx.se']);//TODO: set Burt Analytics key, name values ['xxxx', 'xxx.se']
BurtAnalyticsProvider.setBurtUrl('http://m.burt.io/k/xxxx-se.js');//TODO: set Burt Analytics url value 'http://m.burt.io/k/xxxx-se.js'
BurtAnalyticsProvider.setDomainName('xxx.se');//TODO: set Burt Analytics domain name value 'xxxx.se'
BurtAnalyticsProvider.setCloudKey('xxxx');//TODO: set Burt Analytics setCloudKey value 'xxxx'
});
//Track you event via BurtAnalytics service
//In route change
.run(function ($rootScope, $location, BurtAnalytics) {
$rootScope.$on('$stateChangeSuccess',
function (event, toState, toParams, fromState, fromParams) {
BurtAnalytics.trackPage('name', 'scope', 'value'); //simple one
burtAnalytic(toState.name, toParams, $location.$$url);// more complex one
})
function burtAnalytic(state, stateParams, url) {
    var params = [];
    params[0] = state;
    switch (state) {
        case "main.recipe.show":
            params[1] = 'recipe';
            params[2] = stateParams.friendlyUrl;
            break;
        default :
            params[1] = 'Home'
            params[2] = url;
            break
    }
    BurtAnalytics.trackPage.apply(null, params)
}
})
//In your controller
.controller(function (BurtAnalytics) {
BurtAnalytics.trackPage('name', 'scope', 'value'); //simple one
// we provide offline support to trackPage api. Means if it take too long time to add script.
//We store data on queue whenever api will up. We will send data to burt server.  
var apiPromise = BurtAnalytics.getApi();
    apiPromise.then(function(api) {
        //do something here
        //raw burt api
        api.annotate('burt.author', 'author', 'Joe');
        //More: http://docs.burt.io/client/tracking/
    }, function(reason) {
      alert('Failed: ' + reason);
    });
})
```
