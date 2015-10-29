/**
 * @author: Deepak Vishwakarma
 * @version: 0.0.2
 * @copyright: deepak.m.shrma@gmail.com
 */


(function (window, document, angular, undefined) {
    'use strict';
    angular.module('ngBurtAnalytics', [])
        .provider('BurtAnalytics', function () {
            var account,
                domainName,
                cloudKey,
                burtUrl,
                created,
                logEnabled,
                delayScriptTag,
                startUnitTracking,
                __api;
            var Errors = {
                _missingParams: function () {
                    console.error('Either "key" or "name" is missing');
                },
                _missingDomainName: function () {
                    console.error('Forget to set domain Name, Use BurtAnalyticsProvider.setDomainName');
                },
                _missingBurtScript: function () {
                    console.error('Forget to set burt script url, Use BurtAnalyticsProvider.setBurtUrl');
                },
                _missingTrackingKey: function () {
                    console.error('Forget to set TrackingKey, Use BurtAnalyticsProvider.setTrackingKey');
                },
                _missingBurtApi: function (param) {
                    console.error('There is some error with BurtApi:: ' + param);
                }
            }
            /**
             *
             * @param tracker
             * @returns {*}
             */
            this.setTrackingKey = function (tracker) {
                if (angular.isUndefined(tracker) || tracker === false) {
                    account = undefined;
                } else if (angular.isArray(tracker)) {
                    if (tracker.length < 2) {
                        Errors._missingParams();
                    }
                    else {
                        account = {
                            key: tracker[0],
                            name: tracker[1]
                        };
                    }
                } else if (angular.isObject(tracker)) {
                    if (Object.keys(tracker).length < 2 || !tracker.key || !tracker.name) {
                        Errors._missingParams();
                    }
                    else {
                        account = {
                            key: tracker.key,
                            name: tracker.name
                        };
                    }
                } else {
                    if (arguments.length < 2) {
                        Errors._missingParams();
                    }
                    else {
                        account = {
                            key: arguments[0],
                            name: arguments[1]
                        };
                    }
                }
                return this;
            };
            /**
             *
             * @param domain
             * @returns {*}
             */
            this.setDomainName = function (domain) {
                domainName = domain;
                return this;
            };
            /**
             *
             * @param key
             * @returns {*}
             */
            this.setCloudKey = function (key) {
                cloudKey = key;
                return this;
            };
            /**
             *
             * @param url
             * @returns {*}
             */
            this.setBurtUrl = function (url) {
                burtUrl = url;
                return this;
            };
            /**
             *
             * @param status
             * @returns {*}
             */
            this.delayScript = function (status) {
                delayScriptTag = status;
                return this;
            };
            /**
             *
             * @param status
             * @returns {*}
             */
            this.startUnitTracking = function (status) {
                startUnitTracking = status;
                return this;
            };


            /**
             *
             * @type {*[]}
             */
            this.$get = ['$document', '$location', '$log', '$rootScope', '$window', '$q', function ($document, $location, $log, $window, $q) {
                var that = this,
                    eventsName = ['_trackPage'];
                var $deferredApi = $q.defer();
                that.log = function () {
                    $log.info.apply(null, arguments);
                }
                that.offlineQueue = []; //[{name, values}]
                that.clearOffLineQ = function () {
                    if (that.offlineQueue.length > 0) {
                        var event = that.offlineQueue.shift();
                        if (event && eventsName.indexOf(event.name) !== -1) {
                            that[event.name](event.values);
                        }
                    }
                }
                /**
                 *
                 * @returns {*}
                 */
                this._getApi = function () {
                    return $deferredApi.promise;
                };
                /**
                 *
                 * @returns {*}
                 * @private
                 */
                this._createScriptTag = function () {
                    if (created === true) {
                        that._log('warn', 'burt.js script tag already created');
                        return;
                    }
                    var scriptSource;
                    if (burtUrl) {
                        scriptSource = burtUrl;
                    }
                    else {
                        return Errors._missingDomainName()
                    }
                    // If not in test mode inject the Google Analytics tag
                    var initApiInterval;
                    (function () {
                        var document = $document[0];
                        var ba = document.createElement('script');
                        ba.type = 'text/javascript';
                        ba.async = true;
                        ba.src = scriptSource;
                        var s = document.getElementsByTagName('script')[0];
                        s.parentNode.insertBefore(ba, s);
                    })();
                    $document.ready(function () {
                        initApiInterval = setInterval(function () {
                            if ($window.burtApi) {
                                _initApi();
                                clearInterval(initApiInterval);
                                that.log('info', "Burt script is ready to use");
                            }
                        }, 200)
                    })
                    function _initApi() {
                        $window.burtApi.startTracking(function (api) {
                            if (account && domainName) {
                                api.setTrackingKey(account.key, account.name);
                                if (domainName && api.setDomain) {
                                    api.setDomain(domainName);
                                }
                                else {
                                    that.log('warn', "missing domain name or api.setDomain")
                                }
                                if (cloudKey && api.addCloudKey) {
                                    api.addCloudKey(cloudKey);
                                }
                                else {
                                    that.log('warn', "missing cloudKey or api.addCloudKey")
                                }
                                if (startUnitTracking) {
                                    api.startUnitTracking();
                                }
                                __api = api;
                                that.offlineQueue.length && that.clearOffLineQ();
                                $deferredApi.resolve(__api);
                            }
                            else {
                                Errors._missingTrackingKey();
                            }
                        });
                    }

                    created = true;
                    return true;
                };
                /**
                 *
                 * @param scope
                 * @param name
                 * @param values
                 * @param undefined
                 * @private
                 */
                this._trackPage = function (scope, name, values, undefined) {
                    if (__api) {
                        __api.annotate(scope, name, values);
                    }
                    else {
                        that.offlineQueue.push({name: '_trackPage', values: arguments});
                    }
                };
                // creates the Google Analytics tracker
                if (!delayScriptTag) {
                    this._createScriptTag();
                }
                return {
                    log: that.log,
                    __api: __api, //TODO: remove it
                    configuration: {
                        account: account,
                        domainName: domainName
                    },
                    createScriptTag: function () {
                        return that._createScriptTag();
                    },
                    getApi: function () {
                        return that._getApi();
                    },
                    trackPage: function (scope, name, value) {
                        that._trackPage.apply(that, arguments);
                    }
                };
            }];
        });
})(window, document, window.angular);
