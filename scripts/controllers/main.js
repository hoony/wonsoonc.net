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

		var center,
			currentMarker,
			pictures_markers = [],
			pictures = [],
			route_positions = [];

		// marker icons
		var icon = new daum.maps.MarkerImage('https://farm6.staticflickr.com/5515/14181411316_e679cd61f6_o.png', new daum.maps.Size(31, 34));
		var icon_click = new daum.maps.MarkerImage('https://farm6.staticflickr.com/5568/14017946547_caa4ce9424_o.png', new daum.maps.Size(31, 34));
		var icon_wonsoon = new daum.maps.MarkerImage('https://farm3.staticflickr.com/2920/14239339603_1bb69d6b0e_o.png', new daum.maps.Size(140, 166));
		var icon_start = new daum.maps.MarkerImage('https://farm6.staticflickr.com/5079/14022441047_5bcd85a3b1_o.png', new daum.maps.Size(110, 80));

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
					picture.position = new daum.maps.LatLng(data.pictures[i]['lat'], data.pictures[i]['lng']);
					picture.url = 'http://121.78.54.210:5018/wonsoon' + data.pictures[i]['url'];
					//console.log("picture " + i);
					//console.log('lat: ' + data.pictures[i].lat);
					//console.log('lng: ' + data.pictures[i].lng);
					//console.log('url: ' + data.pictures[i].url);
					//console.log('final url: '+ picture.url);
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
				if(data.route.length != 0) {
					for(var i = 0; i < data.route.length; i++) {
						route_positions.push(new daum.maps.LatLng(data.route[i].lat, data.route[i].lng));
					}
					center = route_positions[route_positions.length -1];
				} else {
					center = new daum.maps.LatLng('37.510965233668685', '127.05065575428307');
				}
				return;
			},
			error: function(err) {
				console.log(err);
			}
		});

		// draw default map
		var map = new daum.maps.Map(document.getElementById('map'), {
			center: center,
			level: 3
		});
		var mapTypeControl = new daum.maps.MapTypeControl();
		map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);
		var mapZoomControl = new daum.maps.ZoomControl();
		map.addControl(mapZoomControl, daum.maps.ControlPosition.RIGHT);

		// draw current location marker
		currentMarker = new daum.maps.Marker({position: route_positions[route_positions.length - 1], image: icon_wonsoon});
		currentMarker.setMap(map);

		// draw start locaiton marker
		var startMarker = new daum.maps.Marker({position: route_positions[0], image: icon_start});
		startMarker.setMap(map);

		// draw route line
		var line = new daum.maps.Polyline();
		line.setPath(route_positions);
		line.setMap(map);
		
		// draw pictures_markers and show infoWindow for each pictures_markers
		for(var i= 0; i < pictures.length; i++) {
			pictures_markers[i] = new daum.maps.Marker({position: pictures[i].position, image: icon});
			pictures_markers[i].info = new daum.maps.InfoWindow({
				content: "<img src='" + pictures[i].url + "' style='width: 250px;' />"
			});
			daum.maps.event.addListener(pictures_markers[i], 'mouseover', function() {
				this.info.open(map, this);
				this.setImage(icon_click);
			});
			daum.maps.event.addListener(pictures_markers[i], 'mouseout', function() {
				this.info.close();
				this.setImage(icon);
			});
			pictures_markers[i].setMap(map);
		}
});
