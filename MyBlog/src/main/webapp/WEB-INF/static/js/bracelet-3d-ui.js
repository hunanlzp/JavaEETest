/**
 * 3D手串设计器UI交互控制
 * 处理用户界面交互和数据绑定
 */

class BraceletUI {
    constructor() {
        this.designer = null;
        this.elements = {};
        this.isUpdating = false;
    }
    
    /**
     * 初始化UI
     */
    init(designer) {
        this.designer = designer;
        this.cacheElements();
        this.bindEvents();
        this.updateCostCalculation();
        this.updateStatus('UI初始化完成');
    }
    
    /**
     * 缓存DOM元素
     */
    cacheElements() {
        // 控制元素
        this.elements = {
            beadCount: document.getElementById('beadCount'),
            beadCountValue: document.getElementById('beadCountValue'),
            beadSize: document.getElementById('beadSize'),
            beadSizeValue: document.getElementById('beadSizeValue'),
            beadMaterial: document.getElementById('beadMaterial'),
            beadColor: document.getElementById('beadColor'),
            
            ropeThickness: document.getElementById('ropeThickness'),
            ropeThicknessValue: document.getElementById('ropeThicknessValue'),
            ropeMaterial: document.getElementById('ropeMaterial'),
            ropeColor: document.getElementById('ropeColor'),
            
            braceletRadius: document.getElementById('braceletRadius'),
            braceletRadiusValue: document.getElementById('braceletRadiusValue'),
            rotationAngle: document.getElementById('rotationAngle'),
            rotationAngleValue: document.getElementById('rotationAngleValue'),
            
            showWireframe: document.getElementById('showWireframe'),
            enableShadows: document.getElementById('enableShadows'),
            autoRotate: document.getElementById('autoRotate'),
            ambientLight: document.getElementById('ambientLight'),
            ambientLightValue: document.getElementById('ambientLightValue'),
            
            designName: document.getElementById('designName'),
            materialCost: document.getElementById('materialCost'),
            currentBeadCount: document.getElementById('currentBeadCount'),
            
            // 按钮
            resetView: document.getElementById('resetView'),
            exportModel: document.getElementById('exportModel'),
            saveDesign: document.getElementById('saveDesign'),
            undoAction: document.getElementById('undoAction'),
            redoAction: document.getElementById('redoAction'),
            
            // 预设按钮
            presetButtons: document.querySelectorAll('.preset-btn'),
            
            // 模态框
            exportModal: document.getElementById('exportModal'),
            confirmExport: document.getElementById('confirmExport'),
            closeModal: document.querySelector('.close')
        };
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 珠子控制
        this.bindRangeInput('beadCount', 'beadCountValue', (value) => {
            this.designer.updateConfig('beadCount', parseInt(value));
            this.updateCurrentBeadCount(value);
            this.updateCostCalculation();
        });
        
        this.bindRangeInput('beadSize', 'beadSizeValue', (value) => {
            this.designer.updateConfig('beadSize', parseFloat(value));
            this.updateCostCalculation();
        });
        
        this.elements.beadMaterial?.addEventListener('change', (e) => {
            this.designer.updateConfig('beadMaterial', e.target.value);
            this.updateCostCalculation();
        });
        
        this.elements.beadColor?.addEventListener('change', (e) => {
            this.designer.updateConfig('beadColor', e.target.value);
        });
        
        // 绳子控制
        this.bindRangeInput('ropeThickness', 'ropeThicknessValue', (value) => {
            this.designer.updateConfig('ropeThickness', parseFloat(value));
            this.updateCostCalculation();
        });
        
        this.elements.ropeMaterial?.addEventListener('change', (e) => {
            this.designer.updateConfig('ropeMaterial', e.target.value);
            this.updateCostCalculation();
        });
        
        this.elements.ropeColor?.addEventListener('change', (e) => {
            this.designer.updateConfig('ropeColor', e.target.value);
        });
        
        // 手串控制
        this.bindRangeInput('braceletRadius', 'braceletRadiusValue', (value) => {
            this.designer.updateConfig('braceletRadius', parseFloat(value));
        });
        
        this.bindRangeInput('rotationAngle', 'rotationAngleValue', (value) => {
            this.designer.updateConfig('rotationAngle', parseFloat(value));
            this.elements.rotationAngleValue.textContent = value + '°';
        });
        
        // 渲染控制
        this.elements.showWireframe?.addEventListener('change', (e) => {
            this.designer.updateConfig('showWireframe', e.target.checked);
        });
        
        this.elements.enableShadows?.addEventListener('change', (e) => {
            this.designer.updateConfig('enableShadows', e.target.checked);
        });
        
        this.elements.autoRotate?.addEventListener('change', (e) => {
            this.designer.updateConfig('autoRotate', e.target.checked);
        });
        
        this.bindRangeInput('ambientLight', 'ambientLightValue', (value) => {
            this.designer.updateConfig('ambientLight', parseFloat(value));
        });
        
        // 按钮事件
        this.elements.resetView?.addEventListener('click', () => {
            this.designer.resetView();
        });
        
        this.elements.exportModel?.addEventListener('click', () => {
            this.showExportModal();
        });
        
        this.elements.saveDesign?.addEventListener('click', () => {
            this.saveDesign();
        });
        
        this.elements.undoAction?.addEventListener('click', () => {
            this.designer.undo();
        });
        
        this.elements.redoAction?.addEventListener('click', () => {
            this.designer.redo();
        });
        
        // 预设按钮
        this.elements.presetButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyPreset(preset);
                this.setActivePreset(e.target);
            });
        });
        
        // 模态框事件
        this.elements.closeModal?.addEventListener('click', () => {
            this.hideExportModal();
        });
        
        this.elements.confirmExport?.addEventListener('click', () => {
            this.confirmExport();
        });
        
        // 点击模态框外部关闭
        this.elements.exportModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.exportModal) {
                this.hideExportModal();
            }
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.designer.redo();
                        } else {
                            this.designer.undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveDesign();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.showExportModal();
                        break;
                }
            }
        });
    }
    
    /**
     * 绑定范围输入控件
     */
    bindRangeInput(inputId, valueId, callback) {
        const input = this.elements[inputId];
        const valueSpan = this.elements[valueId];
        
        if (input && valueSpan) {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                valueSpan.textContent = value;
                if (callback && !this.isUpdating) {
                    callback(value);
                }
            });
        }
    }
    
    /**
     * 从配置更新UI
     */
    updateFromConfig(config) {
        this.isUpdating = true;
        
        // 更新所有控件值
        Object.keys(config).forEach(key => {
            const element = this.elements[key];
            if (element) {
                if (element.type === 'range') {
                    element.value = config[key];
                    const valueElement = this.elements[key + 'Value'];
                    if (valueElement) {
                        let displayValue = config[key];
                        if (key === 'rotationAngle') {
                            displayValue += '°';
                        }
                        valueElement.textContent = displayValue;
                    }
                } else if (element.type === 'checkbox') {
                    element.checked = config[key];
                } else if (element.type === 'color' || element.tagName === 'SELECT') {
                    element.value = config[key];
                }
            }
        });
        
        this.updateCurrentBeadCount(config.beadCount);
        this.updateCostCalculation();
        
        this.isUpdating = false;
    }
    
    /**
     * 更新当前珠子数量显示
     */
    updateCurrentBeadCount(count) {
        if (this.elements.currentBeadCount) {
            this.elements.currentBeadCount.textContent = count;
        }
    }
    
    /**
     * 更新成本计算
     */
    updateCostCalculation() {
        if (!this.designer || !this.elements.materialCost) return;
        
        const config = this.designer.config;
        
        // 材料价格表（示例价格）
        const prices = {
            beadMaterials: {
                wood: 2.0,
                jade: 15.0,
                crystal: 8.0,
                metal: 12.0,
                ceramic: 5.0
            },
            ropeMaterials: {
                cotton: 1.0,
                silk: 3.0,
                leather: 2.5,
                nylon: 1.5
            }
        };
        
        // 计算珠子成本
        const beadPrice = prices.beadMaterials[config.beadMaterial] || 0;
        const beadCost = beadPrice * config.beadCount * (config.beadSize * config.beadSize);
        
        // 计算绳子成本
        const ropePrice = prices.ropeMaterials[config.ropeMaterial] || 0;
        const ropeLength = 2 * Math.PI * config.braceletRadius;
        const ropeCost = ropePrice * ropeLength * config.ropeThickness * 100;
        
        // 总成本
        const totalCost = beadCost + ropeCost;
        
        this.elements.materialCost.textContent = `¥${totalCost.toFixed(2)}`;
    }
    
    /**
     * 应用预设
     */
    applyPreset(presetName) {
        this.designer.applyPreset(presetName);
    }
    
    /**
     * 设置活动预设按钮
     */
    setActivePreset(activeButton) {
        this.elements.presetButtons?.forEach(btn => {
            btn.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
    
    /**
     * 显示导出模态框
     */
    showExportModal() {
        if (this.elements.exportModal) {
            this.elements.exportModal.style.display = 'block';
        }
    }
    
    /**
     * 隐藏导出模态框
     */
    hideExportModal() {
        if (this.elements.exportModal) {
            this.elements.exportModal.style.display = 'none';
        }
    }
    
    /**
     * 确认导出
     */
    confirmExport() {
        const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'obj';
        this.designer.exportModel(format);
        this.hideExportModal();
    }
    
    /**
     * 保存设计
     */
    saveDesign() {
        const designData = this.designer.saveDesign();
        
        // 可以在这里添加保存到服务器的逻辑
        this.showNotification('设计已保存', 'success');
    }
    
    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    /**
     * 更新状态
     */
    updateStatus(message) {
        console.log(`[BraceletUI] ${message}`);
    }
}

// 创建全局UI实例
window.BraceletUI = new BraceletUI();

// 当设计器初始化完成后，初始化UI
document.addEventListener('DOMContentLoaded', function() {
    // 等待设计器初始化
    const initUI = () => {
        if (window.BraceletDesigner && window.BraceletDesigner.scene) {
            window.BraceletUI.init(window.BraceletDesigner);
        } else {
            setTimeout(initUI, 100);
        }
    };
    
    setTimeout(initUI, 500);
});
