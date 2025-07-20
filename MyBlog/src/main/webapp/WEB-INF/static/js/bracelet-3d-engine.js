/**
 * 3D手串设计器核心引擎
 * 基于Three.js实现3D建模和渲染
 */

class BraceletDesigner {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.bracelet = null;
        this.beads = [];
        this.rope = null;
        this.lights = {};
        
        // 设计参数
        this.config = {
            beadCount: 12,
            beadSize: 1.0,
            beadMaterial: 'wood',
            beadColor: '#8B4513',
            ropeThickness: 0.05,
            ropeMaterial: 'cotton',
            ropeColor: '#654321',
            braceletRadius: 3.5,
            rotationAngle: 0,
            showWireframe: false,
            enableShadows: true,
            autoRotate: false,
            ambientLight: 0.4
        };
        
        // 材质库
        this.materials = {
            wood: { roughness: 0.8, metalness: 0.1, color: '#8B4513' },
            jade: { roughness: 0.2, metalness: 0.0, color: '#228B22' },
            crystal: { roughness: 0.0, metalness: 0.0, color: '#E0E0E0', transparent: true, opacity: 0.8 },
            metal: { roughness: 0.1, metalness: 0.9, color: '#C0C0C0' },
            ceramic: { roughness: 0.3, metalness: 0.0, color: '#F5F5DC' }
        };
        
        this.ropeMaterials = {
            cotton: { roughness: 0.9, metalness: 0.0 },
            silk: { roughness: 0.4, metalness: 0.0 },
            leather: { roughness: 0.7, metalness: 0.0 },
            nylon: { roughness: 0.3, metalness: 0.0 }
        };
        
        // 性能监控
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastTime: performance.now()
        };
        
        // 历史记录
        this.history = [];
        this.historyIndex = -1;
    }
    
    /**
     * 初始化3D场景
     */
    init() {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initControls();
        this.initLights();
        this.createBracelet();
        this.bindEvents();
        this.animate();
        
        this.updateStatus('3D场景初始化完成');
        this.addToHistory('初始化3D场景');
    }
    
    /**
     * 初始化场景
     */
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f2f5);
        
        // 添加雾效
        this.scene.fog = new THREE.Fog(0xf0f2f5, 10, 50);
    }
    
    /**
     * 初始化相机
     */
    initCamera() {
        const container = document.getElementById('viewport');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(8, 5, 8);
        this.camera.lookAt(0, 0, 0);
    }
    
    /**
     * 初始化渲染器
     */
    initRenderer() {
        const container = document.getElementById('viewport');
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        container.appendChild(this.renderer.domElement);
    }
    
    /**
     * 初始化控制器
     */
    initControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2 + 0.3;
        
        this.controls.addEventListener('change', () => {
            this.updateStatus('视角已更新');
        });
    }
    
    /**
     * 初始化光照
     */
    initLights() {
        // 环境光
        this.lights.ambient = new THREE.AmbientLight(0xffffff, this.config.ambientLight);
        this.scene.add(this.lights.ambient);
        
        // 主光源
        this.lights.directional = new THREE.DirectionalLight(0xffffff, 0.8);
        this.lights.directional.position.set(10, 10, 5);
        this.lights.directional.castShadow = true;
        this.lights.directional.shadow.mapSize.width = 2048;
        this.lights.directional.shadow.mapSize.height = 2048;
        this.lights.directional.shadow.camera.near = 0.5;
        this.lights.directional.shadow.camera.far = 50;
        this.lights.directional.shadow.camera.left = -10;
        this.lights.directional.shadow.camera.right = 10;
        this.lights.directional.shadow.camera.top = 10;
        this.lights.directional.shadow.camera.bottom = -10;
        this.scene.add(this.lights.directional);
        
        // 补光
        this.lights.fill = new THREE.DirectionalLight(0xffffff, 0.3);
        this.lights.fill.position.set(-5, 5, -5);
        this.scene.add(this.lights.fill);
        
        // 点光源（增加层次感）
        this.lights.point = new THREE.PointLight(0xffffff, 0.5, 30);
        this.lights.point.position.set(0, 8, 0);
        this.scene.add(this.lights.point);
    }
    
    /**
     * 创建手串
     */
    createBracelet() {
        this.clearBracelet();
        
        // 创建手串组
        this.bracelet = new THREE.Group();
        this.scene.add(this.bracelet);
        
        this.createBeads();
        this.createRope();
        
        this.updateStatus(`手串创建完成 - ${this.config.beadCount}颗珠子`);
        this.addToHistory(`创建手串 (${this.config.beadCount}颗珠子)`);
    }
    
    /**
     * 创建珠子
     */
    createBeads() {
        this.beads = [];
        const angleStep = (Math.PI * 2) / this.config.beadCount;
        
        for (let i = 0; i < this.config.beadCount; i++) {
            const angle = i * angleStep + (this.config.rotationAngle * Math.PI / 180);
            
            // 珠子几何体
            const geometry = new THREE.SphereGeometry(this.config.beadSize * 0.4, 32, 16);
            
            // 珠子材质
            const material = this.createBeadMaterial();
            
            // 创建珠子
            const bead = new THREE.Mesh(geometry, material);
            
            // 计算位置
            const x = Math.cos(angle) * this.config.braceletRadius;
            const z = Math.sin(angle) * this.config.braceletRadius;
            const y = Math.sin(angle * 3) * 0.1; // 添加轻微的波动
            
            bead.position.set(x, y, z);
            bead.castShadow = true;
            bead.receiveShadow = true;
            
            // 添加到场景和数组
            this.bracelet.add(bead);
            this.beads.push(bead);
        }
    }
    
    /**
     * 创建绳子
     */
    createRope() {
        const points = [];
        const angleStep = (Math.PI * 2) / (this.config.beadCount * 4); // 更密集的点
        
        // 生成绳子路径点
        for (let i = 0; i <= this.config.beadCount * 4; i++) {
            const angle = i * angleStep + (this.config.rotationAngle * Math.PI / 180);
            const x = Math.cos(angle) * this.config.braceletRadius;
            const z = Math.sin(angle) * this.config.braceletRadius;
            const y = Math.sin(angle * 3) * 0.1;
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        // 创建曲线
        const curve = new THREE.CatmullRomCurve3(points, true);
        
        // 创建管道几何体
        const geometry = new THREE.TubeGeometry(curve, 64, this.config.ropeThickness, 8, true);
        
        // 创建绳子材质
        const material = this.createRopeMaterial();
        
        // 创建绳子
        this.rope = new THREE.Mesh(geometry, material);
        this.rope.castShadow = true;
        this.rope.receiveShadow = true;
        
        this.bracelet.add(this.rope);
    }
    
    /**
     * 创建珠子材质
     */
    createBeadMaterial() {
        const matConfig = this.materials[this.config.beadMaterial];
        const color = new THREE.Color(this.config.beadColor);
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: matConfig.roughness,
            metalness: matConfig.metalness,
            wireframe: this.config.showWireframe
        });
        
        if (matConfig.transparent) {
            material.transparent = true;
            material.opacity = matConfig.opacity;
        }
        
        return material;
    }
    
    /**
     * 创建绳子材质
     */
    createRopeMaterial() {
        const matConfig = this.ropeMaterials[this.config.ropeMaterial];
        const color = new THREE.Color(this.config.ropeColor);
        
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: matConfig.roughness,
            metalness: matConfig.metalness,
            wireframe: this.config.showWireframe
        });
    }
    
    /**
     * 清除当前手串
     */
    clearBracelet() {
        if (this.bracelet) {
            this.scene.remove(this.bracelet);
            this.bracelet = null;
        }
        this.beads = [];
        this.rope = null;
    }
    
    /**
     * 更新配置
     */
    updateConfig(key, value) {
        const oldValue = this.config[key];
        this.config[key] = value;
        
        // 根据不同的配置项进行相应的更新
        switch (key) {
            case 'beadCount':
            case 'beadSize':
            case 'braceletRadius':
            case 'rotationAngle':
                this.createBracelet();
                break;
            case 'beadMaterial':
            case 'beadColor':
                this.updateBeadMaterials();
                break;
            case 'ropeThickness':
            case 'ropeMaterial':
            case 'ropeColor':
                this.updateRope();
                break;
            case 'showWireframe':
                this.updateWireframe();
                break;
            case 'enableShadows':
                this.updateShadows();
                break;
            case 'ambientLight':
                this.updateLighting();
                break;
        }
        
        this.addToHistory(`更新${key}: ${oldValue} → ${value}`);
    }
    
    /**
     * 更新珠子材质
     */
    updateBeadMaterials() {
        this.beads.forEach(bead => {
            bead.material = this.createBeadMaterial();
        });
        this.updateStatus('珠子材质已更新');
    }
    
    /**
     * 更新绳子
     */
    updateRope() {
        if (this.rope) {
            this.bracelet.remove(this.rope);
        }
        this.createRope();
        this.updateStatus('绳子已更新');
    }
    
    /**
     * 更新线框显示
     */
    updateWireframe() {
        this.beads.forEach(bead => {
            bead.material.wireframe = this.config.showWireframe;
        });
        if (this.rope) {
            this.rope.material.wireframe = this.config.showWireframe;
        }
    }
    
    /**
     * 更新阴影
     */
    updateShadows() {
        this.renderer.shadowMap.enabled = this.config.enableShadows;
        this.lights.directional.castShadow = this.config.enableShadows;
    }
    
    /**
     * 更新光照
     */
    updateLighting() {
        this.lights.ambient.intensity = this.config.ambientLight;
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 窗口大小调整
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 自动旋转
        setInterval(() => {
            if (this.config.autoRotate && this.bracelet) {
                this.bracelet.rotation.y += 0.01;
            }
        }, 16);
    }
    
    /**
     * 窗口大小调整处理
     */
    onWindowResize() {
        const container = document.getElementById('viewport');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    /**
     * 动画循环
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 更新控制器
        this.controls.update();
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
        
        // 更新性能统计
        this.updateStats();
    }
    
    /**
     * 更新性能统计
     */
    updateStats() {
        this.stats.frameCount++;
        const now = performance.now();
        
        if (now - this.stats.lastTime >= 1000) {
            this.stats.fps = this.stats.frameCount;
            this.stats.frameCount = 0;
            this.stats.lastTime = now;
            
            // 更新UI显示
            const perfInfo = document.getElementById('performanceInfo');
            if (perfInfo) {
                perfInfo.textContent = `FPS: ${this.stats.fps}`;
            }
        }
    }
    
    /**
     * 更新状态信息
     */
    updateStatus(message) {
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = message;
        }
        console.log(`[BraceletDesigner] ${message}`);
    }
    
    /**
     * 添加到历史记录
     */
    addToHistory(action) {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push({
            action: action,
            timestamp: new Date().toLocaleTimeString(),
            config: { ...this.config }
        });
        this.historyIndex = this.history.length - 1;
        
        // 更新UI
        this.updateHistoryUI();
    }
    
    /**
     * 更新历史记录UI
     */
    updateHistoryUI() {
        const historyList = document.getElementById('historyList');
        if (historyList) {
            historyList.innerHTML = '';
            this.history.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'history-item';
                if (index === this.historyIndex) {
                    div.style.background = '#e3f2fd';
                }
                div.textContent = `${item.timestamp} - ${item.action}`;
                historyList.appendChild(div);
            });
            historyList.scrollTop = historyList.scrollHeight;
        }
    }
    
    /**
     * 撤销操作
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const historyItem = this.history[this.historyIndex];
            this.config = { ...historyItem.config };
            this.createBracelet();
            this.updateAllUI();
            this.updateStatus('已撤销操作');
            this.updateHistoryUI();
        }
    }
    
    /**
     * 重做操作
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const historyItem = this.history[this.historyIndex];
            this.config = { ...historyItem.config };
            this.createBracelet();
            this.updateAllUI();
            this.updateStatus('已重做操作');
            this.updateHistoryUI();
        }
    }
    
    /**
     * 更新所有UI控件
     */
    updateAllUI() {
        // 这个方法将在UI文件中实现
        if (window.BraceletUI) {
            window.BraceletUI.updateFromConfig(this.config);
        }
    }
    
    /**
     * 重置视角
     */
    resetView() {
        this.camera.position.set(8, 5, 8);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
        this.updateStatus('视角已重置');
    }
    
    /**
     * 导出模型
     */
    exportModel(format = 'obj') {
        // 这里可以集成各种导出器
        this.updateStatus(`正在导出${format.toUpperCase()}格式...`);
        
        // 模拟导出过程
        setTimeout(() => {
            this.updateStatus(`${format.toUpperCase()}模型导出完成`);
            this.addToHistory(`导出${format.toUpperCase()}模型`);
        }, 1000);
    }
    
    /**
     * 保存设计
     */
    saveDesign() {
        const designData = {
            name: document.getElementById('designName')?.value || '未命名设计',
            config: this.config,
            timestamp: new Date().toISOString()
        };
        
        // 这里可以发送到服务器保存
        console.log('保存设计数据:', designData);
        this.updateStatus('设计已保存');
        this.addToHistory('保存设计');
        
        return designData;
    }
    
    /**
     * 应用预设
     */
    applyPreset(presetName) {
        const presets = {
            classic: {
                beadCount: 12,
                beadSize: 1.0,
                beadMaterial: 'wood',
                beadColor: '#8B4513',
                ropeColor: '#654321',
                braceletRadius: 3.5
            },
            modern: {
                beadCount: 16,
                beadSize: 0.8,
                beadMaterial: 'metal',
                beadColor: '#C0C0C0',
                ropeColor: '#000000',
                braceletRadius: 3.8
            },
            luxury: {
                beadCount: 10,
                beadSize: 1.2,
                beadMaterial: 'jade',
                beadColor: '#228B22',
                ropeColor: '#FFD700',
                braceletRadius: 4.0
            },
            simple: {
                beadCount: 8,
                beadSize: 1.1,
                beadMaterial: 'ceramic',
                beadColor: '#F5F5DC',
                ropeColor: '#8B4513',
                braceletRadius: 3.2
            }
        };
        
        const preset = presets[presetName];
        if (preset) {
            Object.assign(this.config, preset);
            this.createBracelet();
            this.updateAllUI();
            this.updateStatus(`已应用${presetName}预设`);
            this.addToHistory(`应用${presetName}预设`);
        }
    }
}

// 全局实例
window.BraceletDesigner = new BraceletDesigner();
