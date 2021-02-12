const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const texture_loader = new THREE.TextureLoader();
const tex_envelope_front = texture_loader.load('images/envelope-front.png', renderer);
const tex_envelope_back = texture_loader.load('images/envelope-back.png', renderer);
const tex_lid_outside = texture_loader.load('images/lid-outside.png', renderer);
const tex_lid_inside = texture_loader.load('images/lid-inside.png', renderer);
const tex_fuzzball = texture_loader.load('images/fuzzball.png', renderer);
const tex_dollar = texture_loader.load('images/festisite_us_dollar_1.png', renderer);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.25, 250);
camera.position.z = 1.5;

window.addEventListener('resize', function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const mat_null = new THREE.MeshBasicMaterial({ visible: false });
const mat_envelope_side = new THREE.MeshBasicMaterial( { color: 0xe0291a, side: THREE.DoubleSide } );
const mat_envelope_front = new THREE.MeshBasicMaterial( { map: tex_envelope_front } );
const mat_envelope_back = new THREE.MeshBasicMaterial( { map: tex_envelope_back, transparent: true, alphaTest: 0.1 } );
const mat_envelope_paper = new THREE.MeshBasicMaterial( { color: 0xe0291a } );
const mat_lid_outside = new THREE.MeshBasicMaterial( { map: tex_lid_outside, transparent: true, alphaTest: 0.1 });
const mat_lid_inside = new THREE.MeshBasicMaterial( { map: tex_lid_inside, transparent: true, alphaTest: 0.1 });
const mat_fuzzball = new THREE.MeshBasicMaterial( { map: tex_fuzzball } );
const mat_dollar = new THREE.MeshBasicMaterial( { map: tex_dollar } );

const top_side = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.01).translate(0, -0.005, 0).rotateX(Math.PI * 0.5), mat_envelope_side)
    .translateZ(0.005)
    .translateY(0.5);

const lid = new THREE.Group();
lid.add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0).rotateY(Math.PI), mat_lid_outside).translateY(-0.5));
lid.add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), mat_lid_inside).translateY(-0.5));
lid.translateY(0.5);
lid.translateZ(-0.005);

const fuzzball = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.35).rotateY(Math.PI), mat_fuzzball)
    .translateZ(-0.0045)
    .translateY(0.175);

const dollars = [];
for (let i = 0; i < 86; i++) {
    dollars[i] = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.614).rotateY(Math.PI), mat_dollar)
        .translateZ(-0.004 + i * 0.0001);
}

const cube = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.01),
    [mat_envelope_side, mat_envelope_side, mat_null, mat_envelope_side, mat_envelope_front, mat_envelope_back] );
cube.add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1).rotateY(Math.PI), mat_envelope_paper).translateZ(0.005));
cube.add(top_side);
cube.add(lid);
cube.add(fuzzball);
cube.add(dollars[0]);

scene.add( cube );

let phase = 0;
let phase_t0 = 0;
let phase_p = 0.0;

function animate(ms)
{
    if (phase === 0) {
        cube.position.x = 0.0;
        cube.position.y = 7.0;
        cube.position.z = -9.0;
        cube.rotation.x = Math.PI;
        cube.rotation.y = 0.0;

        top_side.rotation.x = 0.0;

        lid.position.x = 0.0;
        lid.position.y = 0.5;
        lid.position.z = -0.005;
        lid.rotation.x = 0.001;

        fuzzball.position.x = 0.0;
        fuzzball.position.y = 0.175;
        fuzzball.position.z = -0.0045;

        phase = 1;
        phase_t0 = ms;
    }

    if (phase === 1) {
        phase_p = 1.0 - Math.min((ms - phase_t0) / 4000, 1.0);

        const q = (phase_p * phase_p * 12 + phase_p) / 4;

        const angle = q * (Math.PI * 0.5);

        cube.position.y =  15.0 - 16 * Math.cos(angle);
        cube.position.z = -1.0 - 16 * Math.sin(angle);
        cube.rotation.x = Math.PI * 0.5 + angle;

        if (phase_p <= 0.0) {
            phase = 2;
            phase_t0 += 4000;
        }
    }

    if (phase === 2) {
        phase_p = 1.0 - Math.min((ms - phase_t0) / 1000, 1.0);

        const angle = phase_p * (Math.PI * 0.5);

        cube.position.y = -Math.sin(angle);
        cube.position.z = -1.0 + Math.cos(angle);
        cube.rotation.x = angle;

        if (phase_p <= 0.0) {
            phase = 3;
            phase_p = -1.0;
        }
    }

    if (phase === 3) {
        if (phase_p < 0.0) {
            phase_p = 0.0;

            const button = document.getElementById("flip");
            button.style.visibility = "visible";
            button.style.opacity = "1.0";
            button.onclick = function() {
                button.onclick = undefined;
                button.style.opacity = "0.0";
                button.style.visibility = "hidden";

                phase_p = 1.0;
            }
        }
        else if (phase_p >= 1.0) {
            phase = 4;
            phase_t0 = ms;
        }
    }

    if (phase === 4) {
        phase_p = Math.min((ms - phase_t0) / 1000, 1.0);

        cube.rotation.y = Math.PI * phase_p;

        if (phase_p >= 1.0) {
            phase = 5;
            phase_p = -1.0;
        }
    }

    if (phase === 5) {
        if (phase_p < 0.0) {
            phase_p = 0.0;

            const button = document.getElementById("open");
            button.style.visibility = "visible";
            button.style.opacity = "1.0";
            button.onclick = function() {
                button.onclick = undefined;
                button.style.opacity = "0.0";
                button.style.visibility = "hidden";

                phase_p = 1.0;
            }
        }
        else if (phase_p >= 1.0) {
            phase = 6;
            phase_t0 = ms;
        }
    }

    if (phase === 6) {
        phase_p = Math.min((ms - phase_t0) / 1000, 1.0);

        lid.rotation.x = (Math.PI * 0.5 - 0.001) * phase_p + 0.001;

        if (phase_p >= 1.0) {
            phase = 7;
            phase_t0 += 1000;
        }
    }

    if (phase === 7) {
        phase_p = Math.min((ms - phase_t0) / 1000, 1.0);

        const angle = Math.PI * 0.5 * phase_p;
        lid.position.y = 0.5   + 0.01 * Math.sin(angle)
        lid.position.z = 0.005 - 0.01 * Math.cos(angle)
        lid.rotation.x = Math.PI * 0.5 + angle;
        top_side.rotation.x = angle;

        if (phase_p >= 1.0) {
            phase = 8;
            phase_p = -1.0;
        }
    }

    if (phase === 8) {
        if (phase_p < 0.0) {
            phase_p = 0.0;

            const button = document.getElementById("gift");
            button.style.visibility = "visible";
            button.style.opacity = "1.0";
            button.onclick = function() {
                button.onclick = undefined;
                button.style.opacity = "0.0";
                button.style.visibility = "hidden";

                phase_p = 1.0;
            }
        }
        else if (phase_p >= 1.0) {
            phase = 9;
            phase_t0 = ms;
        }

    }

    if (phase === 9) {
        phase_p = Math.min((ms - phase_t0) / 1000, 1.0);

        fuzzball.position.y = phase_p * 0.6 + 0.175;

        if (phase_p >= 1.0) {
            phase = 10;
            phase_t0 += 1000;
        }
    }

    if (phase === 10) {
        phase_p = 1.0 - Math.min((ms - phase_t0) / 1000, 1.0);

        fuzzball.position.y = phase_p * 0.775;
        fuzzball.position.z = phase_p * 0.9 - 0.9045;

        if (phase_p <= 0.0) {
            phase = 11;
            phase_p = -1.0;
        }
    }

    if (phase === 11) {
        if (phase_p < 0.0) {
            phase_p = 0.0;

            const button = document.getElementById("lixi");
            button.style.visibility = "visible";
            button.style.opacity = "1.0";
            button.onclick = function() {
                button.onclick = undefined;
                button.style.opacity = "0.0";
                button.style.visibility = "hidden";

                phase_p = 1.0;
            }
        }
        else if (phase_p >= 1.0) {
            phase = 12;
            phase_t0 = ms;
        }
    }

    if (phase === 12) {
        phase_p = Math.min((ms - phase_t0) / 1000, 1.0);

        fuzzball.position.x = phase_p * -5.0;

        if (phase_p >= 1.0) {
            cube.remove(fuzzball);

            for (let i = 1; i < 86; i++) {
                cube.add(dollars[i]);
            }

            phase = 13
            phase_t0 += 1000;
        }
    }

    if (phase >= 13 && phase <= 99) {
        phase_p = Math.min((ms - phase_t0) / 500, 1.0);
        const phase_q = phase_p + 1.0;

        const i = phase - 13;
        const j = phase - 14;

        if (i < 86) {
            dollars[i].position.y = phase_p * phase_p * 0.9;
        }

        if (j >= 0) {
            dollars[j].position.y = phase_q * phase_q * 0.9;
        }

        if (phase_p >= 1.0) {
            phase += 1;
            phase_t0 += 500;
        }
    }

    renderer.render( scene, camera );

    requestAnimationFrame( animate );
}

requestAnimationFrame( animate );
