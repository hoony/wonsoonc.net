'use strict';

angular.module('wonsoonApp')
	.controller('MainCtrl', function ($scope, $http, $routeParams, $location, $window) {
		var dateList = ['2014-05-20', '2014-05-21', '2014-05-22', '2014-05-23', '2014-05-24', '2014-05-25', '2014-05-26', '2014-05-27', '2014-05-28', '2014-05-29', '2014-05-30', '2014-05-31', '2014-06-01', '2014-06-02', '2014-06-03', '2014-06-04'];
		var date = '',
				today = new Date(),
				validUrl = false;

		if($routeParams.date != undefined) {
			for(var d in dateList) {
				if(dateList[d] == $routeParams.date) {
					date = dateList[d];
					validUrl = true;
				}
			}
		} else {
			date = today.getFullYear() + '-0' + (today.getMonth() + 1) + '-' + today.getDate();
			validUrl = true;
		}

		if(!validUrl) {
			$location.path('/');
		}
		
		$scope.showToday = (today.getMonth() + 1) + '.' + today.getDate();
		
		$scope.dateImgList = [
			{'src': '../images/date/white/2014-05-21.png', 'id': '2014-05-21', 'href': '/#/date/2014-05-21'},
			{'src': '../images/date/white/2014-05-22.png', 'id': '2014-05-22', 'href': '/#/date/2014-05-22'},
			{'src': '../images/date/white/2014-05-23.png', 'id': '2014-05-23', 'href': '/#/date/2014-05-23'},
			{'src': '../images/date/white/2014-05-24.png', 'id': '2014-05-24', 'href': '/#/date/2014-05-24'},
			{'src': '../images/date/white/2014-05-25.png', 'id': '2014-05-25', 'href': '/#/date/2014-05-25'},
			{'src': '../images/date/white/2014-05-26.png', 'id': '2014-05-26', 'href': '/#/date/2014-05-26'},
			{'src': '../images/date/white/2014-05-27.png', 'id': '2014-05-27', 'href': '/#/date/2014-05-27'},
			{'src': '../images/date/white/2014-05-28.png', 'id': '2014-05-28', 'href': '/#/date/2014-05-28'},
			{'src': '../images/date/white/2014-05-29.png', 'id': '2014-05-29', 'href': '/#/date/2014-05-29'},
			{'src': '../images/date/white/2014-05-30.png', 'id': '2014-05-30', 'href': '/#/date/2014-05-30'},
			{'src': '../images/date/white/2014-05-31.png', 'id': '2014-05-31', 'href': '/#/date/2014-05-31'},
			{'src': '../images/date/white/2014-06-01.png', 'id': '2014-06-01', 'href': '/#/date/2014-06-01'},
			{'src': '../images/date/white/2014-06-02.png', 'id': '2014-06-02', 'href': '/#/date/2014-06-02'},
			{'src': '../images/date/white/2014-06-03.png', 'id': '2014-06-03', 'href': '/#/date/2014-06-03'},
			{'src': '../images/date/white/2014-06-04.png', 'id': '2014-06-04', 'href': '/#/date/2014-06-04'}
		]

		for(var i in $scope.dateImgList) {
			if($scope.dateImgList[i].id == date) {
				$scope.dateImgList[i].src = '../images/date/color/' + date + '.png';
				break;
			}
		}
		
		// api list setting	
		var api = {
			'url': 'http://121.78.54.210:5018/wonsoon',
			'options': {
				'activityInfo': {
					'oneDay': '/activities/date/',
					'all': '/activities'
				},
				'pics': {
					'oneDay': '/pictures/date/',
					'all': '/pictures'
				},
				'route': {
					'oneDay': '/route/date/'
				},
				'location': {
					'current': '/points/current',
					'route': '/route/date/'
				}
			}
		};

		var center,
				oPolyLine,
				startMarker,
				currentMarker,
				pictures_markers = [],
				pictures = [],
				route_positions = [];

		// marker icons
		var oSize = new nhn.api.map.Size(30, 34);
		var oOffset = new nhn.api.map.Size(15, 17);
		var icon = new nhn.api.map.Icon('../../images/marker/marker.png', oSize, oOffset);
		var icon_click = new nhn.api.map.Icon('../../images/marker/marker_click.png', oSize, oOffset);
		var icon_wonsoon = new nhn.api.map.Icon('../../images/marker/icon_wonsoon.png', new nhn.api.map.Size(86, 100));
		var icon_wonsoon_small = new nhn.api.map.Icon('../../images/marker/icon_wonsoon.png', new nhn.api.map.Size(20, 25));
		var icon_start = new nhn.api.map.Icon('../../images/marker/icon_start.png', new nhn.api.map.Size(65, 45));
		
		// get current activities
		$.ajax(api.url + api.options.activityInfo.all, {
			method: 'get',
			async: false,
			crossDomain: true,
			success: function(data) {
				console.log(data.activities);
				$scope.calorie = data.activities.calorie + '';
				if($scope.calorie > 1000) {
					$scope.calorie = $scope.calorie.slice(0, -3) + ',' + $scope.calorie.slice(-3);
				}

				$scope.distance = ((data.activities.distance * 0.001).toFixed(1));
				
				$scope.step = data.activities.step + '';
				if($scope.step > 1000) {
					$scope.step = $scope.step.slice(0, -3) + ',' + $scope.step.slice(-3);
				}

				return;
			},
			error: function(err) {
				console.log(err);
			}
		});

		// get pictures of the date
		$.ajax(api.url + api.options.pics.oneDay + date, {
			method: 'get',
			async: false,
			crossDomain: true,
			success: function(data) {
				for(var i = 0; i < data.pictures.length; i++) {
					if( i != 0 && data.pictures[i].lat == data.pictures[i-1].lat && data.pictures[i].lng == data.pictures[i-1].lng ) {
						data.pictures[i].lng = pictures[i-1].lng +  0.0001;
					}
					var picture = {};
					picture.lat = data.pictures[i].lat;
					picture.lng = data.pictures[i].lng;
					picture.time = data.pictures[i].datetime.slice(11, 19);
					picture.position = new nhn.api.map.LatLng(picture.lat, picture.lng);
					picture.url = 'http://121.78.54.210:5018/wonsoon' + data.pictures[i]['url'];
					pictures.push(picture);
				}
				return;
			},
			error: function(err) {
				console.log(err);
			}
		});

		// get routes of the date
		$.ajax(api.url + api.options.location.route + date, {
			method: 'get',
			async: false,
			crossDomain: true,
			success: function(data) {
				if(data.route &&  data.route.length != 0) {
					for(var i = 0; i < data.route.length; i++) {
						route_positions.push(new nhn.api.map.LatLng(data.route[i].lat, data.route[i].lng));
					}
				}
				return;
			},
			error: function(err) {
				console.log(err);
			}
		});

		center = route_positions[route_positions.length-1];
		var defaultLevel = 11;
		var oMap = new nhn.api.map.Map(document.getElementById('map'), {
			point : center,
			zoom : defaultLevel,
			enableWheelZoom : false,
			enableDragPan : true,
			enableDblClickZoom : false,
			mapMode : 0,
			activateTrafficMap : false,
			activateBicycleMap : false,
			minMaxLevel : [ 1, 14 ],
			size : new nhn.api.map.Size(1250, 670)});
		
		var oSlider = new nhn.api.map.ZoomControl();
		oMap.addControl(oSlider);
		oSlider.setPosition({
			top : 10,
			left : 10
		});
		
		var oMapTypeBtn = new nhn.api.map.MapTypeBtn();
		oMap.addControl(oMapTypeBtn);
		oMapTypeBtn.setPosition({
			bottom: 10,
			right: 80
		});

		var mapInfoWindow = new nhn.api.map.InfoWindow();
		mapInfoWindow.setVisible(false);
		oMap.addOverlay(mapInfoWindow);

		var oLabel = new nhn.api.map.MarkerLabel({
			detectCoveredMarker: false
		});
		oMap.addOverlay(oLabel);

		//mapInfoWindow.attach('changeVisible', function(oCustomEvent) {
		//	if(oCustomEvent.visible) {
		//		oLabel.setVisible(false);
		//	}
		//});

		oMap.attach('mouseenter', function(oCustomEvent) {
			var oTarget = oCustomEvent.target;

			if(oTarget instanceof nhn.api.map.Marker) {
				var oMarker = oTarget;
				if(oMarker.getIcon() != icon_start && oMarker.getIcon() != icon_wonsoon && oMarker.getIcon() != icon_wonsoon_small) {
					oMarker.setIcon(icon_click);
					mapInfoWindow.setVisible(false);
					oLabel.setVisible(true, oMarker);
				} else if (oMarker.getIcon() == icon_wonsoon) {
					oMarker.setIcon(icon_wonsoon_small);
				} else if (oMarker.getIcon() == icon_wonsoon_small) {
					oMarker.setIcon(icon_wonsoon);
				}
			}
		});

		oMap.attach('mouseleave', function(oCustomEvent) {
			var oTarget = oCustomEvent.target;
			if (oTarget instanceof nhn.api.map.Marker) {
				if(oTarget.getIcon() != icon_start && oTarget.getIcon() != icon_wonsoon && oTarget.getIcon() != icon_wonsoon_small) {
					oLabel.setVisible(false);
					oTarget.setIcon(icon);
				} else if (oTarget.getIcon() == icon_wonsoon) {
				//	oTarget.setIcon(icon_wonsoon);
				} else if (oTarget.getIcon() == icon_wonsoon_small) {
				//	oTarget.setIcon(icon_wonsoon);
				}
			}
		});

		// show markers
		for ( var i = 0; i< pictures.length; i++) {
			pictures_markers[i] = new nhn.api.map.Marker(icon, {title: "<p class='pics_time'>현재 시간:    " + pictures[i].time + "</p>" + "<img src='" + pictures[i].url + "' class='pics'/>"});
			pictures_markers[i].setPoint(pictures[i].position);
			oMap.addOverlay(pictures_markers[i]);
		}

		if(route_positions.length != 0) {
			currentMarker = new nhn.api.map.Marker(icon_wonsoon);
			currentMarker.setPoint(route_positions[route_positions.length - 1]);
			oMap.addOverlay(currentMarker);
			startMarker = new nhn.api.map.Marker(icon_start);
			startMarker.setPoint(route_positions[0]);
			oMap.addOverlay(startMarker);

			oPolyLine = new nhn.api.map.Polyline(route_positions, {
				strokeColor: '#f00',
				strokeWidth: 5,
				strokeOpacity: 0.5
			});
			oMap.addOverlay(oPolyLine);
		}
});
