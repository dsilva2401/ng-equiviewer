(function (ang) {

	var equiDirective = function ($window) {
		return {
			restrict: 'EA',
			scope: {
				zoom: '=?',
				img: '=?',
				alpha: '=?',
				beta: '=?'
			},
			transclude: true,
			template: '<ng-transclude></ng-transclude>',
			link: function (scope, elem, attrs) {
				// ---
				var camera = new THREE.PerspectiveCamera( 70, elem[0].clientWidth/elem[0].clientHeight, 1, 1100 );
				var scene = new THREE.Scene();
				var sphereMesh = new THREE.Mesh()
				var renderer = new THREE.WebGLRenderer();
				var domEvents = new THREEx.DomEvents( camera, renderer.domElement );
				// ---
				scope.equi = {};
				scope.equi.camera = camera;
				scope.equi.scene = scene;
				scope.equi.renderer = renderer;
				scope.equi.sphereMesh = sphereMesh;
				scope.equi.domEvents = domEvents;
				// ---
				camera.target = new THREE.Vector3( 0, 0, 0 );
				// ---
				sphereMesh.geometry = new THREE.SphereGeometry( 500, 60, 40 );
				sphereMesh.material = new THREE.MeshBasicMaterial({
					color: 0x333333
				});
				sphereMesh.scale.x = -1;
				// ---
				var domEvents = new THREEx.DomEvents( camera, renderer.domElement );
				// ---
				scene.add( sphereMesh );
				// ---
				renderer.setSize( elem[0].clientWidth, elem[0].clientHeight );
				renderer.render( scene, camera );
				// ---
				elem[0].appendChild( renderer.domElement );
				// ---
				window.addEventListener('resize', function (ev) {
					var nw = ev.target.innerWidth;
					var nh = ev.target.innerHeight;
					scope.methods.resizeView( nw, nh );
				});
				// ---
				elem.on('mousedown', function (ev) {
					ev.preventDefault();
					scope.methods.startInteraction({
						x: ev.clientX,
						y: ev.clientY
					});
				});
				elem.on('mousemove', function (ev) {
					ev.preventDefault();
					scope.methods.interactingActions({
						x: ev.clientX,
						y: ev.clientY
					});
				});
				elem.on('mouseup', function (ev) {
					ev.preventDefault();
					scope.methods.stopInteraction();
				});
				elem.on('touchstart', function (ev) {
					ev.preventDefault();
					scope.methods.startInteraction({
						x: ev.changedTouches[0].pageX,
						y: ev.changedTouches[0].pageY
					});
				});
				elem.on('touchmove', function (ev) {
					ev.preventDefault();
					scope.methods.interactingActions({
						x: ev.changedTouches[0].pageX,
						y: ev.changedTouches[0].pageY
					});
				});
				elem.on('touchend', function (ev) {
					ev.preventDefault();
					scope.methods.stopInteraction();
				});
			},
			controller: function ($scope) {
				$scope.methods = $scope.methods || {};
				$scope.models = $scope.models || {};
				// Methods
					$scope.methods.resizeView = function (nw, nh) {
						$scope.equi.renderer.setSize( nw, nh );
						$scope.equi.camera.aspect = nw/nh;
						$scope.equi.camera.updateProjectionMatrix();
						$scope.equi.renderer.render( $scope.equi.scene, $scope.equi.camera );
					}
					$scope.methods.updateAlphaBeta = function (alpha, beta) {

					}
					$scope.methods.startInteraction = function (pos) {
						$scope.models.isUserInteracting = true;
						$scope.models.onPointerDownPointerX = pos.x;
						$scope.models.onPointerDownPointerY = pos.y;
						$scope.models.onPointerDownLon = $scope.models.lon;
						$scope.models.onPointerDownLat = $scope.models.lat;
					}
					$scope.methods.interactingActions = function (pos) {
						if ( !$scope.models.isUserInteracting ) return;
						$scope.models.lon = ( $scope.models.onPointerDownPointerX - pos.x ) * 0.1 + $scope.models.onPointerDownLon;
						$scope.models.lon = ( $scope.models.lon + 360 )%360;
						$scope.models.lat = ( pos.y - $scope.models.onPointerDownPointerY ) * 0.1 + $scope.models.onPointerDownLat;
						$scope.methods.render();
						$scope.alpha = $scope.models.lon;
						$scope.beta = $scope.models.lat;
						$scope.$apply();
					}
					$scope.methods.stopInteraction = function () {
						$scope.models.isUserInteracting = false;
						$scope.alpha = $scope.models.lon;
						$scope.beta = $scope.models.lat;
						$scope.methods.render();
					}
					$scope.methods.render = function () {
						var lat = Math.max( - 85, Math.min( 85, $scope.models.lat ) );
						var phi = THREE.Math.degToRad( 90 - $scope.models.lat );
						var theta = THREE.Math.degToRad( $scope.models.lon );
						$scope.equi.camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
						$scope.equi.camera.target.y = 500 * Math.cos( phi );
						$scope.equi.camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );
						$scope.equi.camera.lookAt( $scope.equi.camera.target );
						$scope.equi.renderer.render( $scope.equi.scene, $scope.equi.camera );
					}
					$scope.methods.updateImage = function (imgSrc, callback) {
						if (!imgSrc) return;
						$scope.equi.sphereMesh.material = new THREE.MeshBasicMaterial({
							map: THREE.ImageUtils.loadTexture( imgSrc, null, function () {
								console.log( 'Image udpated to '+imgSrc );
								$scope.equi.renderer.render( $scope.equi.scene, $scope.equi.camera );
								setTimeout(function () {
									$scope.equi.renderer.render( $scope.equi.scene, $scope.equi.camera );
								}, 10);
							})
						});
					}
					$scope.methods.updateZoom = function (newZoom) {
						$scope.equi.camera.projectionMatrix.makePerspective(
							newZoom,
							$scope.equi.camera.aspect,
							$scope.equi.camera.near,
							$scope.equi.camera.far
						);
						$scope.equi.renderer.render( $scope.equi.scene, $scope.equi.camera );
					}
					$scope.methods.setupWatchers = function () {
						$scope.$watch('zoom', function (z) {
							$scope.methods.updateZoom(z);
						});
						$scope.$watch('img', function (img) {
							$scope.methods.updateImage(img);
						});
						$scope.$watch('alpha', function (alpha) {
							$scope.models.lon = parseFloat(alpha);
							$scope.alpha = parseFloat(alpha);
							$scope.methods.render();
						});
						$scope.$watch('beta', function (beta) {
							$scope.models.lat = parseFloat(beta);
							$scope.beta = parseFloat(beta);
							$scope.methods.render();
						});
					}

				// Attrs
					$scope.models.isUserInteracting = false;
					$scope.models.lat = 0;
					$scope.models.lon = 270;
					$scope.zoom = 70;
					$scope.alpha = $scope.models.lon;
					$scope.beta = $scope.models.lat;
				
				// Init
					$scope.methods.setupWatchers();
			},
		}
	}

	var markerDirective = function () {
		return {
			restrict: 'EA',
			scope: {
				alpha: '=',
				beta: '=',
				distance: '=?',
				ngClick: '&'
			},
			link: function (scope, elem, attrs) {
				// ---
				var mesh = new THREE.Mesh();
				// ---
				scope.marker = {};
				scope.marker.mesh = mesh;
				// ---
				mesh.geometry = new THREE.SphereGeometry( 0.4, 50, 50 );
				// mesh.geometry = new THREE.BoxGeometry( 1, 1, 1 );
				mesh.material = new THREE.MeshBasicMaterial({
					color: 0x00CCCC,
					transparent: true
				});
				elem.on('$destroy', function () {
					scope.parent.equi.scene.remove( scope.marker.mesh );
					scope.parent.equi.domEvents.removeEventListener(scope.marker.mesh, 'mousedown');
				});
			},
			controller: function ($scope, $interval, $timeout) {
				$scope.methods = $scope.methods || {};
				$scope.models = $scope.models || {};
				
				// Methods
					$scope.methods.verifyParams = function () {
						if (typeof $scope.alpha == 'undefined') console.error('eq-marker error: \'alpha\' parameter undefined ');
						if (typeof $scope.beta == 'undefined') console.error('eq-marker error: \'beta\' parameter undefined ');
					}
					$scope.methods.setPosition = function () {
						var r = $scope.distance;
						var phi = THREE.Math.degToRad( 90 - $scope.beta );
						var theta = THREE.Math.degToRad( $scope.alpha );
						$scope.marker.mesh.position.x = r * Math.sin( phi ) * Math.cos( theta );
						$scope.marker.mesh.position.y = r * Math.cos( phi );
						$scope.marker.mesh.position.z = r * Math.sin( phi ) * Math.sin( theta );

						$scope.marker.mesh.rotation.y = theta+Math.PI/2;

						// console.log( $scope.parent );
						if (!$scope.parent.equi) $scope.parent = $scope.parent.$parent;
						$scope.parent.equi.renderer.render( $scope.parent.equi.scene, $scope.parent.equi.camera );
					}
					$scope.methods.init = function () {
						$scope.parent.equi.scene.add( $scope.marker.mesh );
						$scope.parent.equi.domEvents.addEventListener($scope.marker.mesh, 'mousedown', function(ev){
							$scope.ngClick();
						}, false);
						$scope.methods.setPosition();
					}
					$scope.methods.startInit = function () {
						var interval = $interval(function () {
							if ($scope.parent.equi) {
								$interval.cancel( interval );
								$scope.methods.init();
							}
						},1);
					}
					$scope.methods.setupWatchers = function () {
						$scope.$watch('alpha', function () {
							$scope.methods.setPosition();
						});
						$scope.$watch('beta', function () {
							$scope.methods.setPosition();
						});
						$scope.$watch('distance', function () {
							$scope.methods.setPosition();
						});
					}

				// Attrs
					$scope.parent = $scope.$parent.$parent;
					$scope.distance = 10;

				// Init
					$scope.methods.verifyParams();	
					$scope.methods.startInit();
					$scope.methods.setupWatchers();
			}
		}
	}

	var module = ang.module('eqViewer', []);
	module.directive( 'eqViewer' , equiDirective);
	module.directive( 'eqMarker' , markerDirective);

})(angular);