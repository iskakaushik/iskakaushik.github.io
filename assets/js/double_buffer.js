var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var my_canvas = document.getElementById("double_buffer_canvas");
var renderer = new THREE.WebGLRenderer({ canvas: my_canvas, antialias: true});


var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );

var light = new THREE.PointLight( 0xffffff, 10, 100 );
light.position.set( 50, 50, 50 );
scene.add( light );

// spotlight, and spotLight helper
var spotLight = new THREE.SpotLight(),
spotLightHelper = new THREE.SpotLightHelper(spotLight);
spotLight.add(spotLightHelper);
scene.add(spotLight);

// set position of spotLight,
// and helper bust be updated when doing that
spotLight.position.set(100, 200, -100);
spotLightHelper.update();


// spotlight, and spotLight helper
var spotLight2 = new THREE.SpotLight(),
spotLightHelper2 = new THREE.SpotLightHelper(spotLight2);
spotLight2.add(spotLightHelper2);
scene.add(spotLight2);

// set position of spotLight,
// and helper bust be updated when doing that
spotLight2.position.set(-100, 200, -100);
spotLightHelper2.update();


var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;


function animate() {
  requestAnimationFrame( animate );


  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render( scene, camera );
}

animate();
