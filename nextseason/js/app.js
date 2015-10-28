"use strict";

(function(){
angular
	.module('nextseason', [])
	.service('api', ['$http', function($http){
		var apiUrl = 'http://localhost/api'; // TODO: fix
		return function(action, params){
			return $http({
				url: apiUrl + '/' + action,
				params: params
			});
		}
	}])
	.controller('upcoming', ['$scope', 'api', function($scope, api){
		var GET_COUNT = 100;
		$scope.rows = {
			all: [],
			popular: []
		};
		$scope.view = 'popular';
		$scope.gotAll = {
			all: false,
			popular: false
		};
		$scope.loading = {
			all: false,
			popular: false
		};
		$scope.loadMore = function(){
			var view = $scope.view;
			if($scope.gotAll[view]) return;
			if($scope.loading[view]) return;
			$scope.loading[view] = true;
			var url = 'shows/returning/'+view;
			var start = $scope.rows[view].length;
			api(url, { start: start, count: GET_COUNT })
			.then(function(response){
				for(var i in response.data){
					var row = response.data[i];
					row.thumb_url = null;
					if(row.tmdb_poster_path){
						row.thumb_url = '//image.tmdb.org/t/p/w185' + row.tmdb_poster_path; 
					}else{
						row.thumb_url = 'theme/img/missing-poster.jpg';
					}
					row.tmdb_link = null;
					if(row.tmdb_id){
						row.tmdb_link = 'https://www.themoviedb.org/tv/' + row.tmdb_id; 
					}
					$scope.rows[view].push(row);
				};
				if(response.data.length == 0){
					// we're at the end
					$scope.gotAll[view] = true;
				}
				$scope.loading[view] = false;
			});
		};
		$scope.$watch('view', function(){
			$scope.loadMore();
		});
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
	}])
	.directive('imageBackgroundColor', function(){
		var lighten = function(rgb, amt){
			var r = [rgb[0], rgb[1], rgb[2]];
			for(var i = 0; i < 3; i++){
				r[i] = r[i] + amt;
				if(r[i] > 255) r[i] = 255; 
				if(r[i] < 0) r[i] = 0;
			}
			return r;
		};
		var withinRange = function(rgb, min, max){
			var r = [rgb[0], rgb[1], rgb[2]];
			for(var i = 0; i < 3; i++){
				if(r[i] > max) r[i] = max; 
				if(r[i] < min) r[i] = min;
			}
			return r;
		};
		return {
			link: function(scope, element, attrs){
				var imgEl = element.find('img').first()[0];
				if(!imgEl){
					console.log('no img element found');
					return;
				}
				if(!window.colorThief) window.colorThief = new ColorThief();
				imgEl.crossOrigin = 'Anonymous';
				imgEl.onload = function(){
					try{
						var rgb = window.colorThief.getColor(imgEl);
						var rgb1 = withinRange(lighten(rgb, 50), 200, 250);
						// var rgb2 = withinRange(lighten(rgb, -50), 100, 200);
						var rgb2 = [255, 255, 255];
						var gradStr = 'linear-gradient(-15deg, rgb('+rgb1+'), rgb('+rgb2+'))';
						console.log(gradStr);
						element.css('background', gradStr);
					}catch(e){
						console.log(e);
					}
				};
			}
		}
	});
	
})();