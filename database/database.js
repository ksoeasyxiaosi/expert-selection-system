const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    // 根据运行环境确定数据库路径
    if (process.env.NODE_ENV === 'development') {
      // 开发环境
      this.dbPath = path.join(__dirname, '..', 'data', 'experts.db');
    } else {
      // 生产环境（打包后）
      this.dbPath = path.join(process.resourcesPath, 'database', 'data', 'experts.db');
    }
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      // 确保数据目录存在
      const fs = require('fs');
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        this.createTables().then(resolve).catch(reject);
      });
    });
  }

  async createTables() {
    const tables = [
      // 专家抽取需求表
      `CREATE TABLE IF NOT EXISTS requirements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // 专业配置表
      `CREATE TABLE IF NOT EXISTS specialty_configs (
        id TEXT PRIMARY KEY,
        requirement_id TEXT NOT NULL,
        specialty TEXT NOT NULL,
        count INTEGER NOT NULL,
        FOREIGN KEY (requirement_id) REFERENCES requirements (id) ON DELETE CASCADE
      )`,

      // 专家表 - 修改为只能拥有一个领域
      `CREATE TABLE IF NOT EXISTS experts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        contact TEXT,
        status TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // 抽取记录表
      `CREATE TABLE IF NOT EXISTS selections (
        id TEXT PRIMARY KEY,
        requirement_id TEXT NOT NULL,
        expert_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requirement_id) REFERENCES requirements (id) ON DELETE CASCADE,
        FOREIGN KEY (expert_id) REFERENCES experts (id) ON DELETE CASCADE
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    // 插入一些示例专家数据
    await this.insertSampleExperts();
  }

  async insertSampleExperts() {
    const experts = [
      {
        id: uuidv4(),
        name: '张教授',
        specialty: '机电',
        contact: 'zhang.prof@university.edu.cn'
      },
      {
        id: uuidv4(),
        name: '李博士',
        specialty: '机电',
        contact: 'li.ai@research.org'
      },
      {
        id: uuidv4(),
        name: '王研究员',
        specialty: '信息',
        contact: 'wang.data@institute.com'
      },
      {
        id: uuidv4(),
        name: '陈专家',
        specialty: '信息',
        contact: 'chen.software@tech.com'
      },
      {
        id: uuidv4(),
        name: '刘学者',
        specialty: '材料',
        contact: 'liu.ml@academy.edu'
      },
      {
        id: uuidv4(),
        name: '赵顾问',
        specialty: '材料',
        contact: 'zhao.security@consulting.com'
      },
      {
        id: uuidv4(),
        name: '孙工程师',
        specialty: '能源',
        contact: 'sun.cloud@engineering.com'
      },
      {
        id: uuidv4(),
        name: '周分析师',
        specialty: '能源',
        contact: 'zhou.bigdata@analytics.com'
      },
      {
        id: uuidv4(),
        name: '吴架构师',
        specialty: '石化',
        contact: 'wu.architect@design.com'
      },
      {
        id: uuidv4(),
        name: '郑研究员',
        specialty: '石化',
        contact: 'zheng.algorithm@research.edu'
      }
    ];

    for (const expert of experts) {
      await this.run(
        'INSERT OR IGNORE INTO experts (id, name, specialty, contact) VALUES (?, ?, ?, ?)',
        [expert.id, expert.name, expert.specialty, expert.contact]
      );
    }
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 获取所有需求
  async getRequirements() {
    return await this.all('SELECT * FROM requirements ORDER BY created_at DESC');
  }

  // 创建需求
  async createRequirement(requirement) {
    const id = uuidv4();
    const { title, description, specialtyConfigs } = requirement;
    
    // 开始事务
    await this.run('BEGIN TRANSACTION');
    
    try {
      // 插入需求
      await this.run(
        'INSERT INTO requirements (id, title, description) VALUES (?, ?, ?)',
        [id, title, description]
      );

      // 插入专业配置
      if (specialtyConfigs && specialtyConfigs.length > 0) {
        for (const config of specialtyConfigs) {
          const configId = uuidv4();
          await this.run(
            'INSERT INTO specialty_configs (id, requirement_id, specialty, count) VALUES (?, ?, ?, ?)',
            [configId, id, config.specialty, config.count]
          );
        }
      }

      await this.run('COMMIT');
      return { id, title, description };
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  // 更新需求
  async updateRequirement(requirement) {
    const { id, title, description, status } = requirement;
    
    await this.run(
      'UPDATE requirements SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, status, id]
    );

    return { id, title, description, status };
  }

  // 删除需求
  async deleteRequirement(id) {
    await this.run('DELETE FROM requirements WHERE id = ?', [id]);
    return { success: true };
  }

  // 获取需求详情
  async getRequirementDetail(id) {
    const requirement = await this.get('SELECT * FROM requirements WHERE id = ?', [id]);
    if (!requirement) return null;

    const specialtyConfigs = await this.all(
      'SELECT * FROM specialty_configs WHERE requirement_id = ?',
      [id]
    );

    const selections = await this.all(
      'SELECT s.*, e.name, e.specialty, e.contact FROM selections s JOIN experts e ON s.expert_id = e.id WHERE s.requirement_id = ?',
      [id]
    );

    return {
      ...requirement,
      specialtyConfigs,
      selections
    };
  }

  // 根据专业获取专家
  async getExpertsBySpecialties(specialties) {
    if (!specialties || specialties.length === 0) {
      return [];
    }

    const query = `
      SELECT * FROM experts 
      WHERE status = 'available' 
      AND specialty IN (${specialties.map(() => '?').join(',')})
      ORDER BY RANDOM()
    `;
    
    const params = specialties;
    return await this.all(query, params);
  }

  // 随机抽取专家
  async selectExpertsRandomly(requirementId, specialtyConfigs) {
    const selections = [];
    
    for (const config of specialtyConfigs) {
      const { specialty, count } = config;
      
      // 获取该专业已确认的专家数量
      const confirmedCount = await this.getConfirmedExpertsCount(requirementId, specialty);
      
      // 如果已确认的专家数量已经满足需求，跳过该专业
      if (confirmedCount >= count) {
        console.log(`专业 ${specialty} 已满足需求，跳过抽取`);
        continue;
      }
      
      // 计算还需要抽取的专家数量
      const neededCount = count - confirmedCount;
      
      // 获取该专业的可用专家（排除已被拒绝和已抽取的专家）
      const experts = await this.getAvailableExpertsForSpecialty(requirementId, specialty);
      
      // 随机抽取需要的专家数量
      const selectedExperts = this.shuffleArray(experts).slice(0, neededCount);
      
      for (const expert of selectedExperts) {
        const selectionId = uuidv4();
        await this.run(
          'INSERT INTO selections (id, requirement_id, expert_id) VALUES (?, ?, ?)',
          [selectionId, requirementId, expert.id]
        );
        selections.push({ 
          id: selectionId, 
          requirement_id: requirementId, 
          expert_id: expert.id,
          expert: expert
        });
      }
    }

    // 更新需求状态为进行中
    await this.run(
      'UPDATE requirements SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['active', requirementId]
    );

    return selections;
  }

  // 获取指定专业的可用专家（排除已被拒绝和已抽取的专家）
  async getAvailableExpertsForSpecialty(requirementId, specialty) {
    const query = `
      SELECT e.* FROM experts e
      WHERE e.status = 'available' 
      AND e.specialty = ?
      AND e.id NOT IN (
        SELECT s.expert_id 
        FROM selections s 
        WHERE s.requirement_id = ? AND s.status = 'rejected'
      )
      AND e.id NOT IN (
        SELECT s.expert_id 
        FROM selections s 
        WHERE s.requirement_id = ? AND s.status IN ('pending', 'confirmed')
      )
      ORDER BY RANDOM()
    `;
    
    return await this.all(query, [specialty, requirementId, requirementId]);
  }

  // 获取指定专业已确认的专家数量
  async getConfirmedExpertsCount(requirementId, specialty) {
    const result = await this.get(`
      SELECT COUNT(*) as count
      FROM selections s
      JOIN experts e ON s.expert_id = e.id
      WHERE s.requirement_id = ? 
      AND s.status = 'confirmed'
      AND e.specialty = ?
    `, [requirementId, specialty]);
    
    return result ? result.count : 0;
  }

  // 获取指定专业的抽取统计
  async getSpecialtySelectionStats(requirementId, specialty) {
    const stats = await this.all(`
      SELECT 
        s.status,
        COUNT(*) as count
      FROM selections s
      JOIN experts e ON s.expert_id = e.id
      WHERE s.requirement_id = ? 
      AND e.specialty = ?
      GROUP BY s.status
    `, [requirementId, specialty]);

    const result = {
      pending: 0,
      confirmed: 0,
      rejected: 0,
      total: 0
    };

    stats.forEach(stat => {
      result[stat.status] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  // 重新抽取专家（排除已拒绝的专家）
  async reselectExperts(requirementId, specialtyConfigs) {
    // 先删除所有待确认和已拒绝的抽取记录
    await this.run(
      'DELETE FROM selections WHERE requirement_id = ? AND status IN (?, ?)',
      [requirementId, 'pending', 'rejected']
    );

    // 重新抽取
    return await this.selectExpertsRandomly(requirementId, specialtyConfigs);
  }

  // 更新专家状态
  async updateExpertStatus(requirementId, expertId, status) {
    await this.run(
      'UPDATE selections SET status = ? WHERE requirement_id = ? AND expert_id = ?',
      [status, requirementId, expertId]
    );

    // 检查是否所有专业都已满足需求
    const isAllSpecialtiesCompleted = await this.checkAllSpecialtiesCompleted(requirementId);
    
    if (isAllSpecialtiesCompleted) {
      // 所有专业都已满足需求，更新需求状态为已完成
      await this.run(
        'UPDATE requirements SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['completed', requirementId]
      );
    }

    return { success: true };
  }

  // 检查所有专业是否都已满足需求
  async checkAllSpecialtiesCompleted(requirementId) {
    // 获取需求的专业配置
    const specialtyConfigs = await this.all(
      'SELECT specialty, count FROM specialty_configs WHERE requirement_id = ?',
      [requirementId]
    );

    if (specialtyConfigs.length === 0) {
      return false; // 没有专业配置，不能完成
    }

    // 检查每个专业是否都已满足需求
    for (const config of specialtyConfigs) {
      const { specialty, count } = config;
      
      // 获取该专业已确认的专家数量
      const confirmedCount = await this.getConfirmedExpertsCount(requirementId, specialty);
      
      // 如果任何一个专业未满足需求，返回false
      if (confirmedCount < count) {
        return false;
      }
    }

    // 所有专业都已满足需求
    return true;
  }

  // 获取需求的完成状态详情
  async getRequirementCompletionStatus(requirementId) {
    // 获取需求的专业配置
    const specialtyConfigs = await this.all(
      'SELECT specialty, count FROM specialty_configs WHERE requirement_id = ?',
      [requirementId]
    );

    const completionStatus = {
      isCompleted: false,
      specialties: [],
      totalRequired: 0,
      totalConfirmed: 0
    };

    if (specialtyConfigs.length === 0) {
      return completionStatus;
    }

    let totalRequired = 0;
    let totalConfirmed = 0;

    // 检查每个专业的完成状态
    for (const config of specialtyConfigs) {
      const { specialty, count } = config;
      const confirmedCount = await this.getConfirmedExpertsCount(requirementId, specialty);
      
      totalRequired += count;
      totalConfirmed += confirmedCount;

      completionStatus.specialties.push({
        specialty,
        required: count,
        confirmed: confirmedCount,
        isCompleted: confirmedCount >= count
      });
    }

    completionStatus.totalRequired = totalRequired;
    completionStatus.totalConfirmed = totalConfirmed;
    completionStatus.isCompleted = totalConfirmed >= totalRequired;

    return completionStatus;
  }

  // 获取待确认的专家
  async getPendingExperts(requirementId) {
    return await this.all(
      'SELECT s.*, e.name, e.specialty, e.contact FROM selections s JOIN experts e ON s.expert_id = e.id WHERE s.requirement_id = ? AND s.status = ?',
      [requirementId, 'pending']
    );
  }

  // 获取已确认的专家
  async getConfirmedExperts(requirementId) {
    return await this.all(
      'SELECT s.*, e.name, e.specialty, e.contact FROM selections s JOIN experts e ON s.expert_id = e.id WHERE s.requirement_id = ? AND s.status = ?',
      [requirementId, 'confirmed']
    );
  }

  // 获取拒绝的专家
  async getRejectedExperts(requirementId) {
    return await this.all(
      'SELECT s.*, e.name, e.specialty, e.contact FROM selections s JOIN experts e ON s.expert_id = e.id WHERE s.requirement_id = ? AND s.status = ?',
      [requirementId, 'rejected']
    );
  }

  // 获取所有专家
  async getAllExperts() {
    return await this.all('SELECT * FROM experts ORDER BY name');
  }

  // 获取预定义的专业列表
  async getSpecialties() {
    return [
      '机电',
      '信息',
      '材料',
      '能源',
      '石化',
      '轻纺'
    ];
  }

  // 添加专家
  async addExpert(expert) {
    const id = uuidv4();
    const { name, specialty, contact } = expert;
    
    await this.run(
      'INSERT INTO experts (id, name, specialty, contact) VALUES (?, ?, ?, ?)',
      [id, name, specialty, contact]
    );

    return { id, name, specialty, contact };
  }

  // 更新专家信息
  async updateExpert(expert) {
    const { id, name, specialty, contact, status } = expert;
    
    await this.run(
      'UPDATE experts SET name = ?, specialty = ?, contact = ?, status = ? WHERE id = ?',
      [name, specialty, contact, status, id]
    );

    return { id, name, specialty, contact, status };
  }

  // 删除专家
  async deleteExpert(id) {
    await this.run('DELETE FROM experts WHERE id = ?', [id]);
    return { success: true };
  }

  // 获取抽取统计信息
  async getSelectionStats(requirementId) {
    const stats = await this.all(`
      SELECT 
        s.status,
        COUNT(*) as count
      FROM selections s
      WHERE s.requirement_id = ?
      GROUP BY s.status
    `, [requirementId]);

    const result = {
      pending: 0,
      confirmed: 0,
      rejected: 0,
      total: 0
    };

    stats.forEach(stat => {
      result[stat.status] = stat.count;
      result.total += stat.count;
    });

    return result;
  }

  // 工具方法：数组随机排序
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database; 