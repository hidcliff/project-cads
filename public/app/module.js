'use strict';

var cadsApp = angular.module('cadsApp', ['ui.router']);

cadsApp.factory('BackendService', ['$http', function(http) {
    
    var credential = { email: "", token: "" };

    return {
        getUserCredential: function() {
            return credential;
        },
        isUserLoggedIn: function() {
            return !(credential.email.length === 0);
        },
        login: function(email, pw, successCallback, errorCallback) {
            http({ method: "POST", url: "/users/login", data: {email: email, password: pw} })
            .then(
                function(response) { // succeeded
                    credential = response.data;
                    http.defaults.headers.common.Authorization = credential.token;
                    successCallback(response);
                },
                function(response) { // failed
                    http.defaults.headers.common.Authorization = "";
                    errorCallback(response);
                });
        },
        callApi: function(configObj, successCallback, errorCallback) {
            
            if (credential.email.length === 0) {
                errorCallback({status:401, statusText: "Unauthorized"});
                return;
            }

            http(configObj)
            .then(
                function(response) {
                    successCallback(response);
                },
                function(response) {
                    if (401 === response.status) { // unauthorized
                        credential = {email: "", token: ""}; // clear credential
                        $http.defaults.headers.common.Authorization = "";
                    }
                    errorCallback(response);
                });
        }
    };
}]);

cadsApp.controller('TestController', ['$scope','BackendService', function ($scope, bs) {
    
    $scope.message = "";

    $scope.login = function(email, password) {
        bs.login(email, password, 
            function(r) { $scope.message = r.statusText; },
            function(r) { $scope.message = r.statusText; });
    };

    $scope.click = function() {
        bs.callApi(
            {method:'GET', url: '/users'}, 
            function(r) { 
                console.log(r.data);
            }, 
            function(r) { 
                $scope.message = r.statusText;
            });
    };
 }]);
