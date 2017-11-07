(function(){

    var fortifyModule = angular.module('fortify-module', ['ngRoute', 'ngCookies']);

    fortifyModule.config(function($routeProvider) {
        $routeProvider
            .when("/details/:appId", {
                templateUrl : "templates/details.html",
                controller: 'appDetailsController'
            });
			
		$routeProvider.otherwise('index.html');
			
    });

    fortifyModule.controller('fortifyCtrl', function($scope, $http, $location, $window) {

        var options = {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*'
            }
        }

        function init() {

            loadApps();
        }

        function loadApps() {

            options.url = '/fortify/apps';

            $http(options).then(function(response) {

                var data = response.data;
                $scope.apps = data.data;

                var migrationApp;

                angular.forEach($scope.apps, function(app) {
                    if (app.id === 10) {
                        migrationApp = app;
                    }
                });

                $scope.selectApp(migrationApp);
            });
        }

        $scope.selectApp = function(app) {
            $scope.selectedApp = app;

             var path = "#details/" + app.id;
            $window.location.href = path;
            //$location.path(path);
            //$scope.$apply();
            // $location.path(path);
        }



        init();

    });

})();