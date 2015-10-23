"use strict";

(function(){
angular
	.module('nextseason', [])
	.service('api', ['$http', function($http){
		var apiUrl = 'http://localhost:8080/api';
		return function(action, params){
			return $http({
				url: apiUrl + '/' + action,
				params: params
			});
		}
	}])
	.controller('upcoming', ['$scope', 'api', function($scope, api){
		$scope.rows = [];
		var start = 0;
		var count = 20;
		var loading = false;
		$scope.loadMore = function(){
			if(loading) return;
			loading = true;
			api('shows/returning', { start: start, count: count })
			.then(function(response){
				start = start + count;
				for(var i in response.data){
					$scope.rows.push(response.data[i]);
				};
				console.log('heyo', response);
				loading = false;
			});
		};
		$scope.loadMore();
	}])
	.directive('infiniteScroll', ['$document', function($document){
    	return function(scope, elm, attr){
        	var raw = elm[0];
        	$document.bind('scroll', function(){
        		var lowestPixelSeen = $('body').scrollTop() + window.innerHeight;
        		var lastElementOffset = $(raw).children().last().offset().top;
            	if(lowestPixelSeen > lastElementOffset){
                	scope.$apply(attr.infiniteScroll);
            	}
        	});
    	};
	}]);
	
})();