(function (angular) {
    var WebApiAuthService = function($http, $q, localStorageService, accessTokenName, url) {
        this.$http = $http;
        this.$q = $q;
        this.localStorageService = localStorageService;
        this._accessTokenKey = accessTokenName;
        this._userNameKey = 'username';
        this._url = url;
    };

    WebApiAuthService.prototype.login = function (username, password) {
        var deferred = this.$q.defer();
        var loginData = 'userName=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password) + '&grant_type=password';
        var options = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
        var self = this;
        this.$http.post(this._url, loginData, options)
            .success(function (response) {
                self.localStorageService.set(self._accessTokenKey, response.access_token);
                self.localStorageService.set(self._userNameKey, response.userName);
                deferred.resolve(response);
            })
            .error(function (data) {
                deferred.reject(data);
            });
        return deferred.promise;
    };

    WebApiAuthService.prototype.logout = function () {
        this.localStorageService.remove(this._accessTokenKey);
        this.localStorageService.remove(this._userNameKey);
    };

    WebApiAuthService.prototype.userName = function () {
        return this.localStorageService.get(this._userNameKey);
    };

    WebApiAuthService.prototype.isAuthenticated = function () {
        return this.localStorageService.keys().indexOf(this._accessTokenKey) !== -1;
    };

    var WebApiAuthProvider = function(localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('eehWebApiAuth');
        this._accessTokenKey = 'access-token';
        this._url = '/Token';
    };

    WebApiAuthProvider.prototype.url = function (value) {
        if (angular.isUndefined(value)) {
            return this._url;
        }
        this._url = value;
        return this;
    };

    WebApiAuthProvider.prototype.$get = ['$http', '$q', 'localStorageService', function ($http, $q, localStorageService) {
        return new WebApiAuthService($http, $q, localStorageService, this._accessTokenKey,  this._url);
    }];

    angular.module('eehWebApiAuth', ['LocalStorageModule']).provider('eehWebApiAuth', WebApiAuthProvider);
}(angular));
