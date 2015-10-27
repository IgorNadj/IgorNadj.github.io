"use strict";

(function(){
angular
	.module('nextseason', [])
	.service('api', ['$http', function($http){
		var apiUrl = 'http://localhost/api';
		return function(action, params){
			return $http({
				url: apiUrl + '/' + action,
				params: params
			});
		}
	}])
	.controller('upcoming', ['$scope', 'api', function($scope, api){
		$scope.rows = {
			all: [],
			popular: []
		};
		$scope.getRows = function(){
			if($scope.showPopular) return $scope.rows.popular;
			return $scope.rows.all;
		}
		$scope.showPopular = true;
		var GET_COUNT = 100;
		var gotAll = {
			all: false,
			popular: false
		};
		var loading = false;
		$scope.loadMore = function(){
			var which = $scope.showPopular ? 'popular' : 'all';
			if(gotAll[which]) return;
			if(loading) return;
			loading = true;
			var url = 'shows/returning/'+which;
			var start = $scope.rows[which].length;
			api(url, { start: start, count: GET_COUNT })
			.then(function(response){
				for(var i in response.data){
					var row = response.data[i];
					row.thumb_url = null;
					if(row.tmdb_poster_path){
						row.thumb_url = 'https://image.tmdb.org/t/p/w185' + row.tmdb_poster_path;
					}
					row.tmdb_link = null;
					if(row.tmdb_id){
						row.tmdb_link = 'https://www.themoviedb.org/tv/' + row.tmdb_id;
					}
					$scope.rows[which].push(row);
				};
				if(response.data.length == 0){
					// we're at the end
					gotAll[which] = true;
				}
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