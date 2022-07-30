import * as THREE from 'three';
import { GLTFLoader } from 'gltfloader';
import { DRACOLoader } from 'dracoloader';
import { OrbitControls } from 'orbitcontrols';

var renderer, scene, camera, controls;
init();
animate();


function init() {
    // renderer
    renderer = new THREE.WebGLRenderer( {alpha: true} );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    document.body.appendChild( renderer.domElement );

    // scene
    scene = new THREE.Scene();
    
    // camera
    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 30, 20, 20 );

    // controls
    controls = new OrbitControls( camera, renderer.domElement );
    
    // ambient
    scene.add( new THREE.AmbientLight( 0x222222 ) );

    // light
    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 20, 20, 0 );
    scene.add( light );

    if( browserTests() ){
        loadModel( '../models/monkey_compressed.glb' );
        loadModel( '../models/hod_room_optimized.glb' );
    } else {
        loadModel( '../models/hod_room_hires.glb' );
    }
}


function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


window.addEventListener( "resize", onWindowResize, false );


function loadModel( dracomodel ){
    const loader = new GLTFLoader();

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( '/js/three.js-dev/examples/js/libs/draco/' );
    loader.setDRACOLoader( dracoLoader );
    
    // Load a glTF resource
    loader.load(
        // resource URL
        dracomodel,
        // called when the resource is loaded
        function ( gltf ) {
            scene.add( gltf.scene );
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        }
    );
}


function browserTests() {
    var promiseSupport = false;

    try {
        var promise = new Promise( function (x, y) {} );
        promiseSupport = true;
    } catch (e) {}

    var wasmSupport = (() => {
        try {
            if( typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function") {
                const module = new WebAssembly.Module( Uint8Array.of( 0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00 ));
                
                if( module instanceof WebAssembly.Module ) {
                    return new WebAssembly.Instance( module ) instanceof WebAssembly.Instance;
                }
            }
        } catch (e) {}
        return false;
    })();

    console.log( "promiseSuport: " + promiseSupport );
    console.log( "wasmSupport: " + wasmSupport );

    if( promiseSupport && wasmSupport ){
        return true;
    } else {
        return false;
    }
}