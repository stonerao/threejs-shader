import * as THREE from 'three'

const radom = () => {
    return parseInt(Math.random() * 255)
}

export default function (scene) {

    const geometry = new THREE.PlaneGeometry(100, 100);
    
    const shader = new THREE.ShaderMaterial({
        uniforms: {
            uColor: {
                value: new THREE.Color('#FFFF00')
            }
        },
        vertexShader: `
        void main() {
            // 顶点着色器计算后的Position
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
        fragmentShader: `
        uniform vec3 uColor;
        void main() {
            // // 输出到页面中。当前物体的每一个材质为红色，输出的颜色为rgba的归一化，
            gl_FragColor = vec4(uColor, 1.0);
        }`
    });

    const plane = new THREE.Mesh(geometry, shader);

    scene.add(plane);

    setInterval(() => {
        const color = `rgb(${radom()}, ${radom()}, ${radom()})`;
        shader.uniforms.uColor.value.setStyle(color);
    }, 200)
}