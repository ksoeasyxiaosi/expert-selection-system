const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const Database = require('./database/database');

// 设置环境变量
process.env.NODE_ENV = app.isPackaged ? 'production' : 'development';

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    title: '专家抽取系统'
  });

  mainWindow.loadFile('index.html');

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '新建需求',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-requirement');
          }
        },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(async () => {
  // 初始化数据库
  db = new Database();
  await db.init();
  
  createWindow();
  createMenu();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 通信处理
ipcMain.handle('get-requirements', async () => {
  return await db.getRequirements();
});

ipcMain.handle('create-requirement', async (event, requirement) => {
  return await db.createRequirement(requirement);
});

ipcMain.handle('update-requirement', async (event, requirement) => {
  return await db.updateRequirement(requirement);
});

ipcMain.handle('delete-requirement', async (event, id) => {
  return await db.deleteRequirement(id);
});

ipcMain.handle('get-experts', async (event, specialties) => {
  return await db.getExpertsBySpecialties(specialties);
});

ipcMain.handle('select-experts', async (event, requirementId, expertIds) => {
  return await db.selectExperts(requirementId, expertIds);
});

ipcMain.handle('update-expert-status', async (event, requirementId, expertId, status) => {
  return await db.updateExpertStatus(requirementId, expertId, status);
});

ipcMain.handle('get-requirement-detail', async (event, id) => {
  return await db.getRequirementDetail(id);
});

// 新增专家管理相关的IPC处理
ipcMain.handle('get-all-experts', async () => {
  return await db.getAllExperts();
});

ipcMain.handle('add-expert', async (event, expert) => {
  return await db.addExpert(expert);
});

ipcMain.handle('update-expert', async (event, expert) => {
  return await db.updateExpert(expert);
});

ipcMain.handle('delete-expert', async (event, id) => {
  return await db.deleteExpert(id);
});

ipcMain.handle('get-specialties', async () => {
  return await db.getSpecialties();
});

ipcMain.handle('start-expert-selection', async (event, requirementId) => {
  // 获取需求的专业配置
  const requirement = await db.getRequirementDetail(requirementId);
  if (!requirement || !requirement.specialtyConfigs) {
    throw new Error('需求或专业配置不存在');
  }
  
  // 开始专家抽取
  return await db.selectExpertsRandomly(requirementId, requirement.specialtyConfigs);
});

ipcMain.handle('reselect-experts', async (event, requirementId) => {
  // 获取需求的专业配置
  const requirement = await db.getRequirementDetail(requirementId);
  if (!requirement || !requirement.specialtyConfigs) {
    throw new Error('需求或专业配置不存在');
  }
  
  // 重新抽取专家
  return await db.reselectExperts(requirementId, requirement.specialtyConfigs);
});

ipcMain.handle('get-requirement-completion-status', async (event, requirementId) => {
  return await db.getRequirementCompletionStatus(requirementId);
}); 