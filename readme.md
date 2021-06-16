# 简介
### shader是什么？
shader是一个用GLSL编写的小程序，也就是着色器语言，我们可以通过shader来编写顶点着色器和片元着色器，在WEBGL编程一书中 25-26页有详细说明

### shader在Three.js中如何使用？
threejs提供了关于shader的材质 [**RawShaderMaterial**](https://threejs.org/docs/index.html?q=shader#api/zh/materials/RawShaderMaterial) 和 **[**ShaderMaterial**](https://threejs.org/docs/index.html?q=shader#api/zh/materials/ShaderMaterial)**  两种编写shader的材质。
RawShaderMaterial：不内置uniforms和attributes
ShaderMaterial：内置一些需要的参数，后期的使用都为此材质
这里的教程使用的教程为**ShaderMaterial**

### ShaderMaterial
如果使用ShaderMaterial？
首先的了解ShaderMaterial时我们需要的参数。
#### attributes
顶点数据，我们使用的geometry和加载的模型中就已经创建好顶点数据了
这是使用PlaneGeometry生成的一段数据，一般的geometry数据有三个属性

position(vec3) 为模型的点位，没有这个属性，物体就无法显示出来
normal(vec3) 法线数据 用于光照计算 法线贴图等
uv(vec2) 贴图的点位![attributes](https://img-blog.csdnimg.cn/20210616161700266.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI5ODE0NDE3,size_16,color_FFFFFF,t_70)
#### uniforms
通过材质传递给shader的值，可以动态的去修改shader的参数  这些值需要满足在shader中的基础类型（最底下），可以通过传递参数来对物体进行不同的操作。例如修改颜色，透明度，计算的参数等。
在接受当前参数时，一定要确定好当前参数的基本类型。传递的浮点数接受一定是浮点数
#### vertexShader
在顶点着色器中运行的代码， 顶点着色器在片元着色器前运行，可以自行搜索下webgl的渲染流程。

#### fragmentShader 
在片元着色器中运行的代码

### 第一个Demo（修改颜色）
我们输出一个最简单的Demo，修改颜色

```javascript
const geometry = new THREE.PlaneGeometry(100, 100);

const shader = new THREE.ShaderMaterial({
    uniforms: {

    },
    vertexShader: `
        void main() {
        	// 顶点着色器计算后的Position
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        void main() {
        	// 输出到页面中。当前物体的每一个材质为红色，输出的颜色为rgba的归一化，
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }`
});

const plane = new THREE.Mesh(geometry, shader);

scene.add(plane);
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210616163736692.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI5ODE0NDE3,size_16,color_FFFFFF,t_70)

**修改输出**
我们在uniforms传递一个参数，然后通过着色器去接收这个参数。

```javascript
// uniforms
uniforms: {
	uColor: {
		value: new THREE.Color('#FFFF00') // 传递一个黄色
	}
}

// fragmentShader
fragmentShader: `
    uniform vec3 uColor;
    void main() {
        // // 输出到页面中。当前物体的每一个材质为红色，输出的颜色为rgba的归一化，
        gl_FragColor = vec4(uColor, 1.0);
	}`
```
最终我们得到了一个黄色的面
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210616164411103.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI5ODE0NDE3,size_16,color_FFFFFF,t_70)
然后我们可以通过直接修改材质中**uniforms.uColor.value**的参数，就可以直接修改面的颜色

```javascript
// 动态的修改颜色
setInterval(() => {
   const color = `rgb(${radom()}, ${radom()}, ${radom()})`;
    shader.uniforms.uColor.value.setStyle(color);
}, 200)
```

这样我们就编写了一个最简单的可以修改物体颜色的shader材质

### 第二个Demo
通过接受顶点数据，来输出对应的颜色。通过varying变量，可以把顶点的数据着色器传递到片元着色器之中

申明一个三维向量接受position传递给片元，然后我们判断y轴小于0的为uColor的颜色，否则为uColor1的颜色

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210616171240374.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI5ODE0NDE3,size_16,color_FFFFFF,t_70)

```javascript
const geometry = new THREE.PlaneGeometry(100, 100);

const shader = new THREE.ShaderMaterial({
    uniforms: {
        uColor: {
            value: new THREE.Color('#FFFF00'),
        },
        uColor1: {
            value: new THREE.Color('#FFFFFF'),
        }
    },
    vertexShader: `
        varying vec3 vPosition; // + 新增
        void main() {
            // 顶点着色器计算后的Position
            vPosition = position; // + 新增
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uColor1; // + 新增
        varying vec3 vPosition; // + 新增
        void main() { 
            if (vPosition.y < 0.0) { // + 新增
                gl_FragColor = vec4(uColor, 1.0);
            } else { // + 新增
                gl_FragColor = vec4(uColor1, 1.0); // + 新增
            } // + 新增
        }`
});

const plane = new THREE.Mesh(geometry, shader);

scene.add(plane);
```
最后我们得到了一个上下不一样颜色的图形
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210616171528277.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI5ODE0NDE3,size_16,color_FFFFFF,t_70)
也可以在片元着色器中画一个圆

```javascript

const geometry = new THREE.PlaneGeometry(100, 100);

const shader = new THREE.ShaderMaterial({
    uniforms: {
        uColor: {
            value: new THREE.Color('#FFFF00'),
        },
        uColor1: {
            value: new THREE.Color('#FFFFFF'),
        },
        uRadius: {
            value: 0
        }
    },
    vertexShader: `
        varying vec3 vPosition;
        void main() {
            // 顶点着色器计算后的Position
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform float uRadius; // 设置一个半径范围
        uniform vec3 uColor;
        uniform vec3 uColor1;
        varying vec3 vPosition;
        void main() { 
        	// 中心点
            vec3 vCenter = vec3(.0, .0, .0);
			// 计算顶点离中心点的距离
            float len = distance(vCenter, vPosition);
			// 设置在半径范围内的颜色为uColor 反之 为 uColor
            if (len < uRadius) {
                gl_FragColor = vec4(uColor1, 1.0);
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
```
就得到了以下的图形
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210616172320468.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI5ODE0NDE3,size_16,color_FFFFFF,t_70)

#### 把图片纹理传递到当前DEMO中
顶点着色器：varying把图片的uv传递给片元。使用纹理必须有对应的uv


```javascript

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
        varying vec2 vUV; // uv
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
```
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210616173946267.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI5ODE0NDE3,size_16,color_FFFFFF,t_70)

### 总结
在着色器中，操控顶点数据和片元输出的颜色，就能做出更多的效果。
更深入的待续。


---


[代码地址](https://github.com/stonerao/threejs-shader)
觉得可以的话请给一个小星星或者一个赞
QQ群:1082834010

---
### 基本类型:

|类型|说明|
|---|---|
|__void__|空类型,即不返回任何值|
|__bool__|布尔类型 true,false|
|__int__|带符号的整数 signed integer|
|__float__|带符号的浮点数 floating scalar|
|__vec2, vec3, vec4__|n维浮点数向量 n-component floating point vector|
|__bvec2, bvec3, bvec4__|n维布尔向量 Boolean vector|
|__ivec2, ivec3, ivec4__|n维整数向量 signed integer vector|
|__mat2, mat3, mat4__|2x2, 3x3, 4x4 浮点数矩阵 float matrix|
|__sampler2D__|2D纹理 a 2D texture|
|__samplerCube__|盒纹理 cube mapped texture|

