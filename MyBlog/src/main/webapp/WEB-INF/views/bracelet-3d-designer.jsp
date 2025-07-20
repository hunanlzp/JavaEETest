<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D手串设计器</title>
    <link rel="stylesheet" href="<c:url value='/static/css/bracelet-3d.css'/>">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
    <div id="app">
        <!-- 顶部工具栏 -->
        <div class="toolbar">
            <h1>3D手串设计器</h1>
            <div class="controls">
                <button id="resetView" class="btn">重置视角</button>
                <button id="exportModel" class="btn">导出模型</button>
                <button id="saveDesign" class="btn btn-primary">保存设计</button>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
            <!-- 左侧控制面板 -->
            <div class="control-panel">
                <div class="panel-section">
                    <h3>珠子设置</h3>
                    <div class="control-group">
                        <label>珠子数量:</label>
                        <input type="range" id="beadCount" min="8" max="24" value="12" step="1">
                        <span id="beadCountValue">12</span>
                    </div>
                    <div class="control-group">
                        <label>珠子大小:</label>
                        <input type="range" id="beadSize" min="0.5" max="2.0" value="1.0" step="0.1">
                        <span id="beadSizeValue">1.0</span>
                    </div>
                    <div class="control-group">
                        <label>珠子材质:</label>
                        <select id="beadMaterial">
                            <option value="wood">木质</option>
                            <option value="jade">玉石</option>
                            <option value="crystal">水晶</option>
                            <option value="metal">金属</option>
                            <option value="ceramic">陶瓷</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>珠子颜色:</label>
                        <input type="color" id="beadColor" value="#8B4513">
                    </div>
                </div>

                <div class="panel-section">
                    <h3>绳子设置</h3>
                    <div class="control-group">
                        <label>绳子粗细:</label>
                        <input type="range" id="ropeThickness" min="0.02" max="0.1" value="0.05" step="0.01">
                        <span id="ropeThicknessValue">0.05</span>
                    </div>
                    <div class="control-group">
                        <label>绳子材质:</label>
                        <select id="ropeMaterial">
                            <option value="cotton">棉绳</option>
                            <option value="silk">丝绳</option>
                            <option value="leather">皮绳</option>
                            <option value="nylon">尼龙绳</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>绳子颜色:</label>
                        <input type="color" id="ropeColor" value="#654321">
                    </div>
                </div>

                <div class="panel-section">
                    <h3>手串设置</h3>
                    <div class="control-group">
                        <label>手串半径:</label>
                        <input type="range" id="braceletRadius" min="2.5" max="4.5" value="3.5" step="0.1">
                        <span id="braceletRadiusValue">3.5</span>
                    </div>
                    <div class="control-group">
                        <label>旋转角度:</label>
                        <input type="range" id="rotationAngle" min="0" max="360" value="0" step="1">
                        <span id="rotationAngleValue">0°</span>
                    </div>
                </div>

                <div class="panel-section">
                    <h3>预设样式</h3>
                    <div class="preset-buttons">
                        <button class="preset-btn" data-preset="classic">经典款</button>
                        <button class="preset-btn" data-preset="modern">现代款</button>
                        <button class="preset-btn" data-preset="luxury">豪华款</button>
                        <button class="preset-btn" data-preset="simple">简约款</button>
                    </div>
                </div>
            </div>

            <!-- 3D视图区域 -->
            <div class="viewport-container">
                <div id="viewport" class="viewport">
                    <!-- Three.js 渲染区域 -->
                </div>
                <div class="viewport-info">
                    <p>使用鼠标拖拽旋转视角，滚轮缩放</p>
                    <p>当前珠子数量: <span id="currentBeadCount">12</span></p>
                </div>
            </div>

            <!-- 右侧信息面板 -->
            <div class="info-panel">
                <div class="panel-section">
                    <h3>设计信息</h3>
                    <div class="info-item">
                        <label>设计名称:</label>
                        <input type="text" id="designName" placeholder="我的手串设计" value="经典手串">
                    </div>
                    <div class="info-item">
                        <label>创建时间:</label>
                        <span id="createTime"></span>
                    </div>
                    <div class="info-item">
                        <label>材料成本:</label>
                        <span id="materialCost">¥0.00</span>
                    </div>
                </div>

                <div class="panel-section">
                    <h3>渲染设置</h3>
                    <div class="control-group">
                        <label>
                            <input type="checkbox" id="showWireframe"> 显示线框
                        </label>
                    </div>
                    <div class="control-group">
                        <label>
                            <input type="checkbox" id="enableShadows" checked> 启用阴影
                        </label>
                    </div>
                    <div class="control-group">
                        <label>
                            <input type="checkbox" id="autoRotate"> 自动旋转
                        </label>
                    </div>
                    <div class="control-group">
                        <label>环境光强度:</label>
                        <input type="range" id="ambientLight" min="0.1" max="1.0" value="0.4" step="0.1">
                        <span id="ambientLightValue">0.4</span>
                    </div>
                </div>

                <div class="panel-section">
                    <h3>操作历史</h3>
                    <div id="historyList" class="history-list">
                        <div class="history-item">初始化设计</div>
                    </div>
                    <button id="undoAction" class="btn btn-small">撤销</button>
                    <button id="redoAction" class="btn btn-small">重做</button>
                </div>
            </div>
        </div>

        <!-- 底部状态栏 -->
        <div class="status-bar">
            <span id="statusText">就绪</span>
            <span id="performanceInfo">FPS: 60</span>
        </div>
    </div>

    <!-- 加载提示 -->
    <div id="loadingOverlay" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>正在加载3D模型...</p>
    </div>

    <!-- 导出模态框 -->
    <div id="exportModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>导出3D模型</h2>
            <div class="export-options">
                <label>
                    <input type="radio" name="exportFormat" value="obj" checked> OBJ格式
                </label>
                <label>
                    <input type="radio" name="exportFormat" value="stl"> STL格式
                </label>
                <label>
                    <input type="radio" name="exportFormat" value="gltf"> GLTF格式
                </label>
            </div>
            <button id="confirmExport" class="btn btn-primary">确认导出</button>
        </div>
    </div>

    <script src="<c:url value='/static/js/bracelet-3d-engine.js'/>"></script>
    <script src="<c:url value='/static/js/bracelet-3d-ui.js'/>"></script>
    <script>
        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            // 设置创建时间
            document.getElementById('createTime').textContent = new Date().toLocaleString();
            
            // 初始化3D引擎
            BraceletDesigner.init();
            
            // 隐藏加载提示
            setTimeout(() => {
                document.getElementById('loadingOverlay').style.display = 'none';
            }, 1000);
        });
    </script>
</body>
</html>
