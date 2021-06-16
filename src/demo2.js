import * as THREE from 'three'

const radom = () => {
    return parseInt(Math.random() * 255)
}


export default function (scene) {

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/textures/texture.jpg')

    const geometry = new THREE.PlaneGeometry(100, 100);

    const shader = new THREE.ShaderMaterial({
        uniforms: {
            uColor: {
                value: new THREE.Color('#FFFF00'),
            },
            uRadius: {
                value: 0
            },
            uTexture: {
                value: texture
            }
        },
        vertexShader: `
        varying vec3 vPosition;

        varying vec2 vUV; // 
        void main() {
            // 顶点着色器计算后的Position
            vPosition = position;
            // 把uv数据传递给片元
            vUV = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
        fragmentShader: `
        uniform float uRadius; // 设置一个半径范围
        uniform vec3 uColor; // 颜色1
        varying vec3 vPosition; // 顶点数据
        varying vec2 vUV; // 
        uniform sampler2D uTexture; // 材质
        void main() { 
            // 材质和uv计算为当前位置颜色
            vec4 mapColor = texture2D(uTexture, vUV);

            vec3 vCenter = vec3(.0, .0, .0);

            float len = distance(vCenter, vPosition);

            if (len < uRadius) {
                gl_FragColor = mapColor;
            } else {
                gl_FragColor = vec4(uColor, 1.0);
            }
            
        }`
    });

    const plane = new THREE.Mesh(geometry, shader);

    scene.add(plane);

    let radius = 1;
    setInterval(() => {
        const color = `rgb(${radom()}, ${radom()}, ${radom()})`;
        shader.uniforms.uColor.value.setStyle(color);

        shader.uniforms.uRadius.value = radius % 50;

        radius++;
    }, 50) 

}