// 主应用控制器
class App {
    constructor() {
        this.currentView = 'requirements';
        this.init();
    }

    init() {
        this.bindEvents();
        this.setBuildTime();
        this.loadRequirements();
        
        // 确保初始化时只显示默认视图
        this.ensureOnlyDefaultViewVisible();
    }

    bindEvents() {
        // 导航按钮事件
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // 新建需求按钮
        document.getElementById('new-requirement-btn').addEventListener('click', () => {
            this.showNewRequirementModal();
        });

        // 添加专家按钮
        document.getElementById('add-expert-btn').addEventListener('click', () => {
            this.showAddExpertModal();
        });

        // 模态框关闭事件
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.hideModal(closeBtn.closest('.modal-overlay'));
            });
        });

        // 点击模态框背景关闭
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideModal(overlay);
                }
            });
        });

        // 监听主进程消息
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.on('new-requirement', () => {
                this.showNewRequirementModal();
            });
        }
    }

    switchView(viewName) {
        console.log('切换到视图:', viewName); // 添加调试日志
        
        // 更新导航按钮状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // 隐藏所有视图
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.remove('active');
        });

        // 显示目标视图
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }

        this.currentView = viewName;

        // 加载对应视图的数据
        switch (viewName) {
            case 'requirements':
                this.loadRequirements();
                break;
            case 'experts':
                this.loadExperts();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // 新增：调试输入框状态的方法
    debugInputState(modal) {
        console.log('=== 调试输入框状态 ===');
        const inputs = modal.querySelectorAll('input, textarea, select');
        inputs.forEach((input, index) => {
            console.log(`输入框 ${index + 1}:`, {
                id: input.id,
                name: input.name,
                type: input.type,
                value: input.value,
                disabled: input.disabled,
                readOnly: input.readOnly,
                classes: input.className,
                style: {
                    pointerEvents: input.style.pointerEvents,
                    userSelect: input.style.userSelect,
                    opacity: input.style.opacity,
                    cursor: input.style.cursor
                },
                attributes: {
                    readonly: input.hasAttribute('readonly'),
                    tabindex: input.hasAttribute('tabindex')
                }
            });
        });
        console.log('=== 调试结束 ===');
    }

    // 新增：强制启用输入框的方法
    forceEnableInputs(modal) {
        const inputs = modal.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // 强制启用所有属性
            input.disabled = false;
            input.readOnly = false;
            input.removeAttribute('disabled');
            input.removeAttribute('readonly');
            input.removeAttribute('tabindex');
            
            // 强制设置样式
            input.style.setProperty('pointer-events', 'auto', 'important');
            input.style.setProperty('user-select', 'auto', 'important');
            input.style.setProperty('opacity', '1', 'important');
            input.style.setProperty('cursor', 'text', 'important');
            input.style.setProperty('background-color', 'white', 'important');
            input.style.setProperty('color', 'black', 'important');
            
            // 移除所有可能阻止输入的类
            input.classList.remove('disabled', 'readonly', 'no-input', 'input-readonly', 'input-ready');
            
            // 确保输入框可以接收事件
            input.addEventListener('mousedown', function(e) {
                e.stopPropagation();
                this.focus();
            }, { passive: false });
            
            input.addEventListener('click', function(e) {
                e.stopPropagation();
                this.focus();
            }, { passive: false });
            
            input.addEventListener('keydown', function(e) {
                e.stopPropagation();
            }, { passive: false });
            
            input.addEventListener('input', function(e) {
                e.stopPropagation();
            }, { passive: false });
        });
        
        // 移除模态框上可能阻止输入的事件监听器
        const overlays = modal.querySelectorAll('.modal-overlay');
        overlays.forEach(overlay => {
            overlay.style.pointerEvents = 'none';
            const modalContent = overlay.querySelector('.modal');
            if (modalContent) {
                modalContent.style.pointerEvents = 'auto';
            }
        });
    }

    // 新增：清理所有阻止输入的类和属性
    cleanInputBlockers(modal) {
        const inputs = modal.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            // 移除所有可能阻止输入的类
            const classesToRemove = [
                'disabled', 'readonly', 'no-input', 'input-readonly', 
                'input-ready', 'enabled', 'blocked', 'locked'
            ];
            classesToRemove.forEach(className => {
                input.classList.remove(className);
            });
            
            // 移除所有可能阻止输入的属性
            const attributesToRemove = [
                'disabled', 'readonly', 'tabindex', 'aria-disabled'
            ];
            attributesToRemove.forEach(attr => {
                input.removeAttribute(attr);
            });
            
            // 重置所有可能阻止输入的样式
            const stylesToReset = {
                'pointer-events': 'auto',
                'user-select': 'auto',
                'opacity': '1',
                'cursor': 'text',
                'background-color': 'white',
                'color': 'black'
            };
            
            Object.entries(stylesToReset).forEach(([property, value]) => {
                input.style.setProperty(property, value, 'important');
            });
            
            // 确保输入框完全可用
            input.disabled = false;
            input.readOnly = false;
        });
        
        console.log('已清理所有输入框的阻止类:', modal.id);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            
            // 调试：显示模态框前的状态
            console.log(`显示模态框: ${modalId}`);
            this.debugInputState(modal);
            
            // 清理所有阻止输入的类和属性
            this.cleanInputBlockers(modal);
            
            // 强制启用所有输入框
            this.forceEnableInputs(modal);
            
            // 确保所有输入框可用
            setTimeout(() => {
                const inputs = modal.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    // 重置所有可能阻止输入的属性
                    input.disabled = false;
                    input.readOnly = false;
                    input.classList.remove('disabled');
                    input.removeAttribute('readonly');
                    input.removeAttribute('tabindex');
                    
                    // 重置样式
                    input.style.pointerEvents = 'auto';
                    input.style.userSelect = 'auto';
                    input.style.opacity = '1';
                    input.style.backgroundColor = '';
                    input.style.color = '';
                    input.style.cursor = 'text';
                    
                    // 确保输入框可以接收焦点和输入
                    input.addEventListener('focus', function() {
                        this.style.outline = '2px solid #007bff';
                    });
                    
                    input.addEventListener('blur', function() {
                        this.style.outline = '';
                    });
                    
                    // 测试输入框是否可用
                    input.addEventListener('click', function() {
                        this.focus();
                    }, { once: true });
                });
                
                // 特别处理第一个输入框，确保它可以立即使用
                const firstInput = modal.querySelector('input, textarea, select');
                if (firstInput) {
                    firstInput.focus();
                    firstInput.blur();
                }
                
                // 再次清理和强制启用输入框
                this.cleanInputBlockers(modal);
                this.forceEnableInputs(modal);
                
                // 调试：显示模态框后的状态
                console.log(`模态框 ${modalId} 显示完成`);
                this.debugInputState(modal);
            }, 100);
        }
    }

    hideModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
            // 重置表单状态
            this.resetFormState(modal);
        }
    }

    // 新增：重置表单状态的方法
    resetFormState(modal) {
        // 清理所有阻止输入的类和属性
        this.cleanInputBlockers(modal);
        
        // 如果是需求表单，不要在这里重置，因为已经有专门的方法处理
        if (modal.id === 'requirement-modal') {
            return;
        }
        
        // 重置所有输入框
        const inputs = modal.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.value = '';
            input.disabled = false;
            input.classList.remove('disabled');
            // 移除可能阻止输入的属性
            input.removeAttribute('readonly');
            input.removeAttribute('tabindex');
            // 确保输入框可以接收焦点
            input.style.pointerEvents = 'auto';
            input.style.userSelect = 'auto';
        });

        // 移除所有 disabled 属性
        const disabledElements = modal.querySelectorAll('[disabled]');
        disabledElements.forEach(element => {
            element.disabled = false;
        });

        // 重置表单
        const forms = modal.querySelectorAll('form');
        forms.forEach(form => {
            form.reset();
        });

        // 清理动态添加的专业配置（只针对非需求表单）
        const specialtyConfigs = modal.querySelector('#specialty-configs');
        if (specialtyConfigs && modal.id !== 'requirement-modal') {
            specialtyConfigs.innerHTML = `
                <div class="specialty-config">
                    <select class="specialty-name" required>
                        <option value="">请选择专业</option>
                    </select>
                    <input type="number" placeholder="专家数量" class="specialty-count" min="1" required>
                    <button type="button" class="btn btn-danger remove-specialty">删除</button>
                </div>
            `;
        }

        // 强制重新启用所有输入框
        setTimeout(() => {
            const allInputs = modal.querySelectorAll('input, textarea, select');
            allInputs.forEach(input => {
                // 确保输入框完全可用
                input.disabled = false;
                input.readOnly = false;
                input.style.pointerEvents = 'auto';
                input.style.userSelect = 'auto';
                input.style.opacity = '1';
                
                // 移除任何可能阻止输入的样式
                input.style.backgroundColor = '';
                input.style.color = '';
                
                // 测试输入框是否可用
                input.addEventListener('click', function() {
                    this.focus();
                }, { once: true });
            });
            
            // 最后再次清理
            this.cleanInputBlockers(modal);
        }, 50);
    }

    // 新增：重置需求表单到初始状态
    resetRequirementFormToInitial() {
        console.log('重置需求表单到初始状态...');
        
        const form = document.getElementById('requirement-form');
        if (form) {
            // 重置表单
            form.reset();
            
            // 清空所有输入框的值
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('error', 'success');
            });
            
            // 重置专业配置到初始状态（只保留一个空的专业配置）
            const specialtyConfigs = document.getElementById('specialty-configs');
            if (specialtyConfigs) {
                specialtyConfigs.innerHTML = `
                    <div class="specialty-config">
                        <select class="specialty-name" required>
                            <option value="">请选择专业</option>
                        </select>
                        <input type="number" placeholder="专家数量" class="specialty-count" min="1" required>
                        <button type="button" class="btn btn-danger remove-specialty">删除</button>
                    </div>
                `;
            }
            
            // 清理所有可能阻止输入的类和属性
            this.cleanInputBlockers(document.getElementById('requirement-modal'));
            
            console.log('需求表单已重置到初始状态');
        }
    }

    showNewRequirementModal() {
        this.showModal('requirement-modal');
        
        // 重置表单到初始状态
        this.resetRequirementFormToInitial();
        
        // 初始化表单事件
        this.initRequirementForm();
    }

    showAddExpertModal() {
        // 显示添加专家模态框
        this.showModal('modal-overlay');
        document.getElementById('modal-title').textContent = '添加专家';
        document.getElementById('modal-body').innerHTML = this.getAddExpertForm();
        this.initExpertForm();
        this.loadSpecialties();
    }

    getAddExpertForm() {
        return `
            <form id="expert-form">
                <div class="form-group">
                    <label for="expert-name">专家姓名</label>
                    <input type="text" id="expert-name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="expert-specialty">专业领域</label>
                    <select id="expert-specialty" name="specialty" required>
                        <option value="">请选择专业领域</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="expert-contact">联系方式</label>
                    <input type="text" id="expert-contact" name="contact" placeholder="邮箱或电话">
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">添加专家</button>
                    <button type="button" class="btn btn-secondary" onclick="app.hideModal(document.getElementById('modal-overlay'))">取消</button>
                </div>
            </form>
        `;
    }

    initRequirementForm() {
        const form = document.getElementById('requirement-form');
        const addSpecialtyBtn = document.getElementById('add-specialty-btn');
        const specialtyConfigs = document.getElementById('specialty-configs');

        // 移除现有的事件监听器，防止重复绑定
        if (addSpecialtyBtn._clickHandler) {
            addSpecialtyBtn.removeEventListener('click', addSpecialtyBtn._clickHandler);
        }
        if (specialtyConfigs._clickHandler) {
            specialtyConfigs.removeEventListener('click', specialtyConfigs._clickHandler);
        }
        if (form._submitHandler) {
            form.removeEventListener('submit', form._submitHandler);
        }

        // 添加专业配置
        addSpecialtyBtn._clickHandler = () => {
            console.log('=== 添加专业配置 ===');
            
            // 保存所有现有专业配置的当前选择
            const existingSelections = [];
            document.querySelectorAll('.specialty-config').forEach(config => {
                const select = config.querySelector('.specialty-name');
                const count = config.querySelector('.specialty-count');
                if (select && count) {
                    existingSelections.push({
                        specialty: select.value,
                        count: count.value
                    });
                }
            });
            
            console.log('保存的现有选择:', existingSelections);
            
            const specialtyConfig = document.createElement('div');
            specialtyConfig.className = 'specialty-config';
            specialtyConfig.innerHTML = `
                <select class="specialty-name" required>
                    <option value="">请选择专业</option>
                </select>
                <input type="number" placeholder="专家数量" class="specialty-count" min="1" required>
                <button type="button" class="btn btn-danger remove-specialty">删除</button>
            `;
            specialtyConfigs.appendChild(specialtyConfig);
            
            // 为新添加的专业配置加载专业选项
            this.populateRequirementSpecialtySelect(specialtyConfig.querySelector('.specialty-name'));
            
            // 恢复所有现有专业配置的选择
            setTimeout(() => {
                console.log('恢复选择前的状态:', existingSelections);
                existingSelections.forEach((selection, index) => {
                    const configs = document.querySelectorAll('.specialty-config');
                    if (configs[index]) {
                        const select = configs[index].querySelector('.specialty-name');
                        const count = configs[index].querySelector('.specialty-count');
                        if (select && count) {
                            select.value = selection.specialty;
                            count.value = selection.count;
                            console.log(`恢复第 ${index + 1} 个配置:`, selection);
                        }
                    }
                });
                console.log('=== 添加专业配置完成 ===');
            }, 50);
        };
        addSpecialtyBtn.addEventListener('click', addSpecialtyBtn._clickHandler);

        // 删除专业配置
        specialtyConfigs._clickHandler = (e) => {
            if (e.target.classList.contains('remove-specialty')) {
                const configToRemove = e.target.closest('.specialty-config');
                // 如果只剩下一个专业配置，不允许删除
                if (specialtyConfigs.children.length > 1) {
                    configToRemove.remove();
                } else {
                    // 如果只剩一个，重置为空状态
                    configToRemove.querySelector('.specialty-name').value = '';
                    configToRemove.querySelector('.specialty-count').value = '';
                }
            }
        };
        specialtyConfigs.addEventListener('click', specialtyConfigs._clickHandler);

        // 表单提交
        form._submitHandler = async (e) => {
            e.preventDefault();
            await this.submitRequirementForm();
        };
        form.addEventListener('submit', form._submitHandler);

        // 取消按钮
        const cancelBtn = document.getElementById('cancel-requirement');
        if (cancelBtn._clickHandler) {
            cancelBtn.removeEventListener('click', cancelBtn._clickHandler);
        }
        cancelBtn._clickHandler = () => {
            this.hideModal(document.getElementById('requirement-modal'));
        };
        cancelBtn.addEventListener('click', cancelBtn._clickHandler);

        // 为第一个专业配置加载专业选项
        this.loadSpecialtiesForRequirement();
        
        console.log('需求表单初始化完成');
    }

    async loadSpecialtiesForRequirement() {
        try {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                const specialties = await ipcRenderer.invoke('get-specialties');
                this.populateRequirementSpecialtySelects(specialties);
            }
        } catch (error) {
            console.error('加载专业列表失败:', error);
        }
    }

    populateRequirementSpecialtySelects(specialties) {
        // 保存所有现有专业配置的当前选择
        const existingSelections = [];
        document.querySelectorAll('.specialty-config').forEach(config => {
            const select = config.querySelector('.specialty-name');
            const count = config.querySelector('.specialty-count');
            if (select && count) {
                existingSelections.push({
                    specialty: select.value,
                    count: count.value
                });
            }
        });
        
        // 为所有现有的专业配置下拉框填充选项
        document.querySelectorAll('.specialty-name').forEach(select => {
            this.populateRequirementSpecialtySelect(select, specialties);
        });
        
        // 恢复所有现有专业配置的选择
        setTimeout(() => {
            existingSelections.forEach((selection, index) => {
                const configs = document.querySelectorAll('.specialty-config');
                if (configs[index]) {
                    const select = configs[index].querySelector('.specialty-name');
                    const count = configs[index].querySelector('.specialty-count');
                    if (select && count) {
                        select.value = selection.specialty;
                        count.value = selection.count;
                    }
                }
            });
        }, 50);
    }

    populateRequirementSpecialtySelect(select, specialties = null) {
        if (!specialties) {
            // 如果没有传入专业列表，从数据库获取
            this.loadSpecialtiesForRequirement();
            return;
        }

        // 保存当前选中的值
        const currentValue = select.value;

        // 清空现有选项（保留第一个提示选项）
        select.innerHTML = '<option value="">请选择专业</option>';
        
        // 添加专业选项
        specialties.forEach(specialty => {
            const option = document.createElement('option');
            option.value = specialty;
            option.textContent = specialty;
            select.appendChild(option);
        });
        
        // 恢复之前选中的值（如果仍然存在）
        if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
            select.value = currentValue;
        }
    }

    initExpertForm() {
        const form = document.getElementById('expert-form');
        if (form) {
            // 移除现有的事件监听器，防止重复绑定
            if (form._submitHandler) {
                form.removeEventListener('submit', form._submitHandler);
            }

            form._submitHandler = async (e) => {
                e.preventDefault();
                await this.submitExpertForm();
            };
            form.addEventListener('submit', form._submitHandler);
        }
    }

    async submitRequirementForm() {
        const form = document.getElementById('requirement-form');
        const formData = new FormData(form);
        
        const requirement = {
            title: formData.get('title'),
            description: formData.get('description'),
            specialtyConfigs: []
        };

        // 收集专业配置
        document.querySelectorAll('.specialty-config').forEach(config => {
            const name = config.querySelector('.specialty-name').value;
            const count = config.querySelector('.specialty-count').value;
            if (name && count) {
                requirement.specialtyConfigs.push({ specialty: name, count: parseInt(count) });
            }
        });

        try {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                const result = await ipcRenderer.invoke('create-requirement', requirement);
                
                if (result) {
                    this.hideModal(document.getElementById('requirement-modal'));
                    this.loadRequirements();
                    this.showNotification('需求创建成功！', 'success');
                    
                    // 表单提交成功后，重置表单到初始状态
                    setTimeout(() => {
                        this.resetRequirementFormToInitial();
                    }, 100);
                }
            }
        } catch (error) {
            console.error('创建需求失败:', error);
            this.showNotification('创建需求失败，请重试', 'error');
        }
    }

    async submitExpertForm() {
        const form = document.getElementById('expert-form');
        const formData = new FormData(form);
        
        const expert = {
            name: formData.get('name'),
            specialty: formData.get('specialty'), // 改为单选
            contact: formData.get('contact')
        };

        try {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                const result = await ipcRenderer.invoke('add-expert', expert);
                
                if (result) {
                    this.hideModal(document.getElementById('modal-overlay'));
                    this.loadExperts();
                    this.showNotification('专家添加成功！', 'success');
                    
                    // 清空表单
                    form.reset();
                }
            }
        } catch (error) {
            console.error('添加专家失败:', error);
            this.showNotification('添加专家失败，请重试', 'error');
        }
    }

    async loadRequirements() {
        try {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                const requirements = await ipcRenderer.invoke('get-requirements');
                this.renderRequirements(requirements);
            }
        } catch (error) {
            console.error('加载需求失败:', error);
        }
    }

    async loadExperts() {
        try {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                const experts = await ipcRenderer.invoke('get-all-experts');
                this.renderExperts(experts);
            }
        } catch (error) {
            console.error('加载专家列表失败:', error);
        }
    }

    loadSettings() {
        // 加载设置
        document.getElementById('build-time').textContent = new Date().toLocaleString();
    }

    renderRequirements(requirements) {
        const container = document.getElementById('requirements-list');
        
        if (requirements.length === 0) {
            container.innerHTML = `
                <div class="card text-center">
                    <p>暂无专家抽取需求</p>
                    <button class="btn btn-primary mt-2" onclick="app.showNewRequirementModal()">创建第一个需求</button>
                </div>
            `;
            return;
        }

        container.innerHTML = requirements.map(req => `
            <div class="card" data-id="${req.id}">
                <div class="card-header">
                    <div class="card-title">${req.title}</div>
                    <span class="card-status status-${req.status}">${this.getStatusText(req.status)}</span>
                </div>
                <div class="card-meta">
                    <div>创建时间: ${new Date(req.created_at).toLocaleString()}</div>
                    ${req.description ? `<div>描述: ${req.description}</div>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="app.viewRequirement('${req.id}')">查看详情</button>
                    <button class="btn btn-secondary" onclick="app.editRequirement('${req.id}')">编辑</button>
                    <button class="btn btn-danger" onclick="app.deleteRequirement('${req.id}')">删除</button>
                </div>
            </div>
        `).join('');
    }

    renderExperts(experts) {
        const container = document.getElementById('experts-list');
        
        if (experts.length === 0) {
            container.innerHTML = `
                <div class="card text-center">
                    <p>暂无专家数据</p>
                    <button class="btn btn-primary mt-2" onclick="app.showAddExpertModal()">添加第一个专家</button>
                </div>
            `;
            return;
        }

        container.innerHTML = experts.map(expert => `
            <div class="card" data-id="${expert.id}">
                <div class="card-header">
                    <div class="card-title">${expert.name}</div>
                    <span class="card-status status-${expert.status}">${this.getExpertStatusText(expert.status)}</span>
                </div>
                <div class="card-meta">
                    <div><strong>专业领域:</strong> ${expert.specialty}</div>
                    <div><strong>联系方式:</strong> ${expert.contact || '无'}</div>
                    <div><strong>添加时间:</strong> ${new Date(expert.created_at).toLocaleString()}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary" onclick="app.editExpert('${expert.id}')">编辑</button>
                    <button class="btn btn-danger" onclick="app.deleteExpert('${expert.id}')">删除</button>
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'draft': '草稿',
            'active': '进行中',
            'completed': '已完成'
        };
        return statusMap[status] || status;
    }

    getExpertStatusText(status) {
        const statusMap = {
            'available': '可用',
            'busy': '忙碌',
            'unavailable': '不可用'
        };
        return statusMap[status] || status;
    }

    async viewRequirement(id) {
        try {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                const detail = await ipcRenderer.invoke('get-requirement-detail', id);
                this.showRequirementDetail(detail);
            }
        } catch (error) {
            console.error('获取需求详情失败:', error);
        }
    }

    showRequirementDetail(detail) {
        document.getElementById('detail-modal-title').textContent = detail.title;
        
        const content = document.getElementById('requirement-detail-content');
        content.innerHTML = `
            <div class="requirement-detail">
                <div class="detail-section">
                    <h4>基本信息</h4>
                    <p><strong>标题:</strong> ${detail.title}</p>
                    <p><strong>描述:</strong> ${detail.description || '无'}</p>
                    <p><strong>状态:</strong> <span class="card-status status-${detail.status}">${this.getStatusText(detail.status)}</span></p>
                    <p><strong>创建时间:</strong> ${new Date(detail.created_at).toLocaleString()}</p>
                </div>
                
                <div class="detail-section">
                    <h4>专业配置</h4>
                    ${detail.specialtyConfigs && detail.specialtyConfigs.length > 0 ? `
                        <div class="specialty-config-list">
                            ${detail.specialtyConfigs.map(config => `
                                <div class="specialty-config-item">
                                    <div class="specialty-name">${config.specialty}</div>
                                    <div class="specialty-count">${config.count}</div>
                                    <div class="specialty-status" id="status-${config.specialty.replace(/\s+/g, '-')}">
                                        <small>状态加载中...</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="completion-summary" id="completion-summary">
                            <small>完成状态加载中...</small>
                        </div>
                    ` : '<p>暂未配置专业</p>'}
                </div>
                
                <div class="detail-section">
                    <h4>专家抽取</h4>
                    ${detail.selections && detail.selections.length > 0 ? `
                        <div class="expert-list">
                            ${detail.selections.map(selection => `
                                <div class="expert-item">
                                    <div class="expert-info">
                                        <div class="expert-name">${selection.name}</div>
                                        <div class="expert-specialties">${selection.specialty}</div>
                                        <div class="expert-contact">${selection.contact}</div>
                                    </div>
                                    <div class="expert-status">
                                        <span class="card-status status-${selection.status}">${this.getSelectionStatusText(selection.status)}</span>
                                        ${selection.status === 'pending' ? `
                                            <div class="mt-2">
                                                <button class="btn btn-success btn-sm" onclick="app.updateExpertStatus('${detail.id}', '${selection.expert_id}', 'confirmed')">确认</button>
                                                <button class="btn btn-danger btn-sm" onclick="app.updateExpertStatus('${detail.id}', '${selection.expert_id}', 'rejected')">拒绝</button>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>暂未抽取专家</p>'}
                    
                    <div class="mt-2">
                        ${detail.status === 'draft' ? `
                            <button class="btn btn-primary" onclick="app.startExpertSelection('${detail.id}')">开始抽取专家</button>
                        ` : detail.status === 'active' ? `
                            <button class="btn btn-secondary" onclick="app.reselectExperts('${detail.id}')">重新抽取专家</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('detail-modal');
        
        // 加载专业统计信息
        if (detail.specialtyConfigs && detail.specialtyConfigs.length > 0) {
            this.loadSpecialtyStatus(detail.id, detail.specialtyConfigs);
        }
    }

    async startExpertSelection(requirementId) {
        try {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                const result = await ipcRenderer.invoke('start-expert-selection', requirementId);
                
                if (result) {
                    this.showNotification('专家抽取完成！', 'success');
                    // 刷新需求详情
                    this.viewRequirement(requirementId);
                }
            }
        } catch (error) {
            console.error('抽取专家失败:', error);
            this.showNotification('抽取专家失败，请重试', 'error');
        }
    }

    async editRequirement(id) {
        // 编辑需求功能
        console.log('编辑需求:', id);
    }

    async deleteRequirement(id) {
        const confirmed = await this.showCustomConfirm(
            '确定要删除这个需求吗？', 
            '删除确认', 
            'warning'
        );
        
        if (confirmed) {
            try {
                if (window.require) {
                    const { ipcRenderer } = window.require('electron');
                    await ipcRenderer.invoke('delete-requirement', id);
                    this.loadRequirements();
                    this.showNotification('需求删除成功！', 'success');
                }
            } catch (error) {
                console.error('删除需求失败:', error);
                this.showNotification('删除需求失败，请重试', 'error');
            }
        }
    }

    async editExpert(id) {
        // 编辑专家功能
        console.log('编辑专家:', id);
        // TODO: 实现编辑专家功能
    }

    async deleteExpert(id) {
        const confirmed = await this.showCustomConfirm(
            '确定要删除这个专家吗？', 
            '删除确认', 
            'warning'
        );
        
        if (confirmed) {
            try {
                if (window.require) {
                    const { ipcRenderer } = window.require('electron');
                    await ipcRenderer.invoke('delete-expert', id);
                    this.loadExperts();
                    this.showNotification('专家删除成功！', 'success');
                }
            } catch (error) {
                console.error('删除专家失败:', error);
                this.showNotification('删除专家失败，请重试', 'error');
            }
        }
    }

    // 新增：自定义弹窗方法
    showCustomAlert(message, title = '提示', type = 'info') {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-alert');
            const titleEl = document.getElementById('custom-alert-title');
            const messageEl = document.getElementById('custom-alert-message');
            const okBtn = document.getElementById('custom-alert-ok');
            
            // 设置内容和样式
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            // 根据类型设置样式
            const modalContent = modal.querySelector('.custom-modal');
            modalContent.className = `custom-modal ${type}-modal`;
            
            // 显示弹窗
            modal.classList.remove('hidden');
            
            // 绑定确定按钮事件
            const handleOk = () => {
                modal.classList.add('hidden');
                okBtn.removeEventListener('click', handleOk);
                resolve(true);
            };
            
            okBtn.addEventListener('click', handleOk);
            
            // 按ESC键关闭
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    handleOk();
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
            
            // 点击背景关闭
            const handleBackground = (e) => {
                if (e.target === modal) {
                    handleOk();
                    modal.removeEventListener('click', handleBackground);
                }
            };
            modal.addEventListener('click', handleBackground);
        });
    }

    showCustomConfirm(message, title = '确认', type = 'warning') {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-confirm');
            const titleEl = document.getElementById('custom-confirm-title');
            const messageEl = document.getElementById('custom-confirm-message');
            const yesBtn = document.getElementById('custom-confirm-yes');
            const noBtn = document.getElementById('custom-confirm-no');
            
            // 设置内容和样式
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            // 根据类型设置样式
            const modalContent = modal.querySelector('.custom-modal');
            modalContent.className = `custom-modal ${type}-modal`;
            
            // 显示弹窗
            modal.classList.remove('hidden');
            
            // 绑定按钮事件
            const handleYes = () => {
                modal.classList.add('hidden');
                yesBtn.removeEventListener('click', handleYes);
                noBtn.removeEventListener('click', handleNo);
                document.removeEventListener('keydown', handleEsc);
                modal.removeEventListener('click', handleBackground);
                resolve(true);
            };
            
            const handleNo = () => {
                modal.classList.add('hidden');
                yesBtn.removeEventListener('click', handleYes);
                noBtn.removeEventListener('click', handleNo);
                document.removeEventListener('keydown', handleEsc);
                modal.removeEventListener('click', handleBackground);
                resolve(false);
            };
            
            yesBtn.addEventListener('click', handleYes);
            noBtn.addEventListener('click', handleNo);
            
            // 按ESC键取消
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    handleNo();
                }
            };
            document.addEventListener('keydown', handleEsc);
            
            // 点击背景取消
            const handleBackground = (e) => {
                if (e.target === modal) {
                    handleNo();
                }
            };
            modal.addEventListener('click', handleBackground);
        });
    }

    showNotification(message, type = 'info') {
        // 使用自定义弹窗显示通知
        const titleMap = {
            'info': '提示',
            'success': '成功',
            'error': '错误',
            'warning': '警告'
        };
        
        const title = titleMap[type] || '提示';
        this.showCustomAlert(message, title, type);
    }

    setBuildTime() {
        document.getElementById('build-time').textContent = new Date().toLocaleString();
    }

    getSelectionStatusText(status) {
        const statusMap = {
            'pending': '待确认',
            'confirmed': '已确认',
            'rejected': '已拒绝'
        };
        return statusMap[status] || status;
    }

    async updateExpertStatus(requirementId, expertId, status) {
        try {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                await ipcRenderer.invoke('update-expert-status', requirementId, expertId, status);
                this.showNotification('专家状态更新成功！', 'success');
                // 刷新需求详情
                this.viewRequirement(requirementId);
            }
        } catch (error) {
            console.error('更新专家状态失败:', error);
            this.showNotification('更新专家状态失败，请重试', 'error');
        }
    }

    async reselectExperts(requirementId) {
        const confirmed = await this.showCustomConfirm(
            '确定要重新抽取专家吗？这将清除所有待确认和已拒绝的专家。', 
            '重新抽取确认', 
            'warning'
        );
        
        if (confirmed) {
            try {
                if (window.require) {
                    const { ipcRenderer } = window.require('electron');
                    const result = await ipcRenderer.invoke('reselect-experts', requirementId);
                    
                    if (result) {
                        this.showNotification('专家重新抽取完成！', 'success');
                        // 刷新需求详情
                        this.viewRequirement(requirementId);
                    }
                }
            } catch (error) {
                console.error('重新抽取专家失败:', error);
                this.showNotification('重新抽取专家失败，请重试', 'error');
            }
        }
    }

    async loadSpecialties() {
        try {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                const specialties = await ipcRenderer.invoke('get-specialties');
                this.populateSpecialtiesSelect(specialties);
            }
        } catch (error) {
            console.error('加载专业列表失败:', error);
        }
    }

    populateSpecialtiesSelect(specialties) {
        const select = document.getElementById('expert-specialty');
        if (select) {
            // 清空现有选项（保留第一个提示选项）
            select.innerHTML = '<option value="">请选择专业领域</option>';
            
            // 添加专业选项
            specialties.forEach(specialty => {
                const option = document.createElement('option');
                option.value = specialty;
                option.textContent = specialty;
                select.appendChild(option);
            });
        }
    }

    ensureOnlyDefaultViewVisible() {
        // 隐藏所有视图
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.remove('active');
        });
        
        // 只显示默认视图（需求管理）
        const defaultView = document.getElementById('requirements-view');
        if (defaultView) {
            defaultView.classList.add('active');
        }
        
        // 确保默认导航按钮激活
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === 'requirements');
        });
    }

    async loadSpecialtyStatus(requirementId, specialtyConfigs) {
        try {
            if (window.require) {
                const { ipcRenderer } = window.require('electron');
                const completionStatus = await ipcRenderer.invoke('get-requirement-completion-status', requirementId);
                this.updateSpecialtyStatus(completionStatus);
            }
        } catch (error) {
            console.error('加载专业状态失败:', error);
        }
    }

    updateSpecialtyStatus(completionStatus) {
        // 更新每个专业的状态
        completionStatus.specialties.forEach(specialty => {
            const statusElement = document.getElementById(`status-${specialty.specialty.replace(/\s+/g, '-')}`);
            if (statusElement) {
                const statusClass = specialty.isCompleted ? 'text-success' : 'text-warning';
                const statusText = specialty.isCompleted ? '已完成' : '专家不足';
                
                statusElement.innerHTML = `
                    <small class="${statusClass}">
                        ${specialty.confirmed}/${specialty.required} - ${statusText}
                    </small>
                `;
            }
        });

        // 更新总体完成状态
        const summaryElement = document.getElementById('completion-summary');
        if (summaryElement) {
            const overallStatusClass = completionStatus.isCompleted ? 'text-success' : 'text-warning';
            const overallStatusText = completionStatus.isCompleted ? '需求已完成' : '需求进行中';
            
            summaryElement.innerHTML = `
                <div class="${overallStatusClass}">
                    <strong>${overallStatusText}</strong><br>
                    <small>
                        总体进度: ${completionStatus.totalConfirmed}/${completionStatus.totalRequired} 位专家已确认
                    </small>
                </div>
            `;
        }
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
}); 