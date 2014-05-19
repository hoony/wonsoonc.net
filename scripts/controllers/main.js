'use strict';

angular.module('wonsoonApp')
	.controller('MainCtrl', function ($scope, $http, $routeParams, $location, $window) {
		var dateList = ['2014-05-17','2014-05-18', '2014-05-19', '2014-05-20', '2014-05-21', '2014-05-22', '2014-05-23', '2014-05-24', '2014-05-25', '2014-05-26', '2014-05-27', '2014-05-28', '2014-05-29', '2014-05-30', '2014-05-31', '2014-06-01', '2014-06-02', '2014-06-03', '2014-06-04'];
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
			date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			validUrl = true;
		}

		if(!validUrl) {
			$location.path('/');
		}
		
		$scope.showToday = (today.getMonth() + 1) + '.' + today.getDate();

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

		var oPolyLine,
			startMarker,
			currentMarker,
			pictures_markers = [],
			pictures = [],
			route_positions = [];

		// marker icons
		var oSize = new nhn.api.map.Size(30, 34);
		var oOffset = new nhn.api.map.Size(15, 17);
		var icon = new nhn.api.map.Icon('https://farm6.staticflickr.com/5515/14181411316_e679cd61f6_o.png', oSize, oOffset);
		var icon_click = new nhn.api.map.Icon('https://farm6.staticflickr.com/5568/14017946547_caa4ce9424_o.png', oSize, oOffset);
		var icon_wonsoon = new nhn.api.map.Icon('https://farm3.staticflickr.com/2936/14206569692_49cd5a620d_o.png', new nhn.api.map.Size(46, 70));
		var icon_start = new nhn.api.map.Icon('https://farm6.staticflickr.com/5079/14022441047_5bcd85a3b1_o.png', new nhn.api.map.Size(45, 30));
		// get current activities
		$.ajax(api.url + api.options.activityInfo.oneDay + date, {
			method: 'get',
			async: false,
			crossDomain: true,
			success: function(data) {
				$scope.calorie = data.activities.calorie;
				$scope.distance = (0.001 * data.activities.distance);
				$scope.step = data.activities.step;
				$scope.sub_calorie = '7 * 10';
				$scope.sub_distance = 12;
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
					var picture = {};
					picture.position = new nhn.api.map.LatLng(data.pictures[i]['lat'], data.pictures[i]['lng']);
					picture.url = 'http://121.78.54.210:5018/wonsoon' + data.pictures[i]['url'];
					//console.log("picture " + i);
					//console.log('lat: ' + data.pictures[i].lat);
					//console.log('lng: ' + data.pictures[i].lng);
					//console.log('url: ' + data.pictures[i].url);
					//console.log('final url: '+ picture.url);
					console.log("pic: " + i);
					console.log(data.pictures[i].lat);
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
						console.log("lat: " + i + " - " + data.route[i].lat);
						route_positions.push(new nhn.api.map.LatLng(data.route[i].lat, data.route[i].lng));
					}
				}
				return;
			},
			error: function(err) {
				console.log(err);
			}
		});

		var oSeoulCityPoint = route_positions[route_positions.length-1];
		var defaultLevel = 8;
		var oMap = new nhn.api.map.Map(document.getElementById('map'), {
			point : oSeoulCityPoint,
			zoom : defaultLevel,
			enableWheelZoom : true,
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

		var oLabel = new nhn.api.map.MarkerLabel();
		oMap.addOverlay(oLabel);

		mapInfoWindow.attach('changeVisible', function(oCustomEvent) {
			if(oCustomEvent.visible) {
				oLabel.setVisible(false);
			}
		});

		oMap.attach('mouseenter', function(oCustomEvent) {
			var oTarget = oCustomEvent.target;

			if(oTarget instanceof nhn.api.map.Marker) {
				var oMarker = oTarget;
				oLabel.setVisible(true, oMarker);
			}
		});

		oMap.attach('mouseleave', function(oCustomEvent) {
			var oTarget = oCustomEvent.target;
			if (oTarget instanceof nhn.api.map.Marker) {
				oLabel.setVisible(false);
			}
		});

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

		// show markers
		for ( var i = 0; i< pictures.length; i++) {
			pictures_markers[i] = new nhn.api.map.Marker(icon, {title: "<img src='" + pictures[i].url + "' style='width:200px; height:300px;' class='pics'/>"});
			pictures_markers[i].setPoint(pictures[i].position);
			oMap.addOverlay(pictures_markers[i]);
		}
});
