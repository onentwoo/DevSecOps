(function() {

    //var appDetailsModule = angular.module('app-details-module', ['fortify-module']);
    var appDetailsModule = angular.module('fortify-module');

    appDetailsModule.controller('appDetailsController', function($scope, $routeParams, $http) {

        var options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*'
            }
        }

        function init() {

            $scope.appId = $routeParams.appId;
            showAppDetails($scope.appId);
            getAppIssues($scope.appId);
        }

        function showAppDetails(appId) {

            options.url = 'http://127.0.0.1:3000/fortify/app/' + appId;

            $http(options).then(function(response) {

                var data = response.data;
                $scope.selectedApp = data.data;
            });
        }

        $scope.opendDefect = function(name) {
            options.url = '/octane/defect/'+name;

             $http(options).then(function(response) {

                 alert('opened');
             });

            //var localhost = 'http://localhost:8080/shared_spaces/2001/workspaces/1002/#entity-navigation?p=2001/1002&entityType=story&id=1034';
        }

        function getAppIssues(appId) {

            options.url = 'http://127.0.0.1:3000/fortify/app/' + appId + '/issues';

            $http(options).then(function(response) {

                var data = response.data;
                $scope.issues = data.data;
            });
        }

        init();

    });

})();