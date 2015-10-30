"use strict";

(function(){
angular
	.module('nextseason', [])
	.service('api', ['$http', function($http){
		var apiUrl = CUSTOM_API_URL ? CUSTOM_API_URL : '//nextseason-api.bigoaf.co.nz';
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
			popular: [],
			faves: []
		};
		$scope.view = 'popular';
		$scope.gotAll = {
			all: false,
			popular: false,
			faves: false
		};
		$scope.loading = {
			all: false,
			popular: false,
			faves: false
		};
		$scope.faveIdsLoaded = {};
		$scope.faveIdToLoad = null;
		$scope.loadMore = function(){
			var view = $scope.view;
			if($scope.gotAll[view]) return;
			if($scope.loading[view]) return;
			$scope.loading[view] = true;
			var url;
			var params;
			if(view == 'faves'){
				if(!$scope.faveIdToLoad || $scope.faveIdsLoaded[$scope.faveIdToLoad]){
					// already loaded this one
					$scope.loading[view] = false;
					return;
				}
				url = 'show';
				params = { 
					id: $scope.faveIdToLoad
				};
			}else{
				url = 'shows/returning/'+view;
				var start = $scope.rows[view].length;
				params = { 
					start: start, 
					count: GET_COUNT 
				};
			}
			api(url, params)
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
					if(view == 'faves'){
						// faves, special case
						console.log('todo: show some kinda message');
					}else{
						// we're at the end
						$scope.gotAll[view] = true;
					}
				}else{
					if(view == 'faves'){
						// faves
						$scope.faveIdsLoaded[params.id] = true;	
					}
				}
				$scope.loading[view] = false;
			});
		};
		$scope.$watch('view', function(){
			$scope.loadMore();
		});
		$scope.loadMore();
	}])
	.directive('autocompleteShows', ['api', function(api){
		return function(scope, elm, attr){
        	elm.autocomplete({
        		source: function(request, response){
        			api('shows/autocomplete', { q: request.term })
        			.then(function(apiResponse){
        				var r = [];
        				for(var i in apiResponse.data){
        					r.push({ value: apiResponse.data[i].id, label: apiResponse.data[i].name });
        				}
        				response(r);
        			});
        		},
				select: function(event, ui){
					scope.$apply(function(){
						scope.view = 'faves';
						scope.faveIdToLoad = ui.item.value;
						scope.loadMore();
					});
					return false;
				}
        	});
		}
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
		return {
			link: function(scope, element, attrs){
				var imgEl = element.find('img').first()[0];
				if(!imgEl){
					return;
				}
				if(!window.colorThief) window.colorThief = new ColorThief();
				imgEl.crossOrigin = 'Anonymous';
				imgEl.onload = function(){
					try{
						var rgb = window.colorThief.getColor(imgEl);
						var rgbObj = { r: rgb[0], g: rgb[1], b: rgb[2] };
						var color1 = tinycolor(rgbObj).lighten();
						var color2 = tinycolor(rgbObj).desaturate();
						if(color1.isDark()){
							color1.lighten(70);
							color2.lighten(60);	
						} 
						var gradStr = 'linear-gradient(-15deg, '+color1+', '+color2+')';
						element.css('background', gradStr);
					}catch(e){
						console.log(e);
					}
				};
			}
		}
	});
	
})();