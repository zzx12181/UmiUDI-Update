/**
 * UDI 现代化追溯全景图谱引擎 (明亮商务科技风 - 动态自适应尺寸与零Emoji)
 */

class TraceGraphEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.nodes = [];
    this.edges = [];
    this.rawGraphData = null;
    this.collapsedNodes = new Set(); // 折叠的节点 ID

    // 画布变换
    this.scale = 1.0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.draggedNode = null;
    this.hoveredNode = null;
    this.selectedNode = null;
    this.lastMousePos = { x: 0, y: 0 };

    // 动画流光粒子
    this.flowOffset = 0;

    this.initEvents();
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      this.fitView();
    });

    // 启动 60fps 渲染循环
    this.startAnimationLoop();
  }

  resize() {
    const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width > 0 ? rect.width : (window.innerWidth || 1000);
    const h = rect.height > 0 ? rect.height : (window.innerHeight || 700);
    
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.width = w;
    this.height = h;
  }

  setData(data) {
    if (!data) return;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error("解析图谱数据异常:", e);
        return;
      }
    }
    this.rawGraphData = data;
    this.collapsedNodes.clear();
    closeDrawer();
    this.resize();
    this.rebuildGraph();
    this.fitView();
    
    // 更新顶部信息
    const statNodes = document.getElementById('stat-nodes');
    const statPackages = document.getElementById('stat-packages');
    const emptyState = document.getElementById('empty-state');
    if (statNodes) statNodes.innerText = this.nodes.length;
    if (statPackages) statPackages.innerText = this.nodes.filter(n => n.type === 'package').length;
    if (emptyState) emptyState.style.display = this.nodes.length === 0 ? 'block' : 'none';
  }

  calculateNodeSize(node) {
    this.ctx.save();
    
    // 1. 测量主标题宽度
    this.ctx.font = `bold ${node.type === 'central' ? '13px' : '12px'} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const titleW = this.ctx.measureText(node.label || node.id).width;

    // 2. 测量徽标 Tag 宽度
    let tagW = 0;
    if (node.tag && node.type !== 'central') {
      this.ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      tagW = this.ctx.measureText(node.tag).width + 16;
    }

    // 3. 测量副标题/单号宽度
    let subtextW = 0;
    if (node.subtext) {
      this.ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      subtextW = this.ctx.measureText(node.subtext).width;
    }

    this.ctx.restore();

    const leftPadding = 20;
    const rightPadding = node.childCount > 0 ? 28 : 16;
    const tagSpacing = tagW > 0 ? 12 : 0;

    const row1W = leftPadding + titleW + tagSpacing + tagW + rightPadding;
    const row2W = leftPadding + subtextW + rightPadding;

    // 动态计算宽度，并留出安全余量避免任何文本溢出
    const width = Math.max(180, Math.ceil(Math.max(row1W, row2W)) + 14);
    const height = node.type === 'central' ? 68 : (node.subtext ? 58 : 46);

    return { width, height, tagW };
  }

  rebuildGraph() {
    if (!this.rawGraphData) return;
    
    const allNodes = this.rawGraphData.nodes || [];
    const allEdges = this.rawGraphData.edges || [];

    // 过滤掉被折叠隐藏的子节点
    const hiddenNodeIds = new Set();
    this.collapsedNodes.forEach(parentId => {
      this.collectDescendants(parentId, allEdges, hiddenNodeIds);
    });

    this.nodes = allNodes.filter(n => !hiddenNodeIds.has(n.id)).map(n => {
      const childCount = allEdges.filter(e => e.source === n.id).length;
      const dims = this.calculateNodeSize({ ...n, childCount });
      return {
        ...n,
        x: n.x || 0,
        y: n.y || 0,
        vx: 0,
        vy: 0,
        width: dims.width,
        height: dims.height,
        tagWidth: dims.tagW,
        childCount: childCount,
        isCollapsed: this.collapsedNodes.has(n.id)
      };
    });

    const nodeMap = new Map(this.nodes.map(n => [n.id, n]));
    this.edges = allEdges.filter(e => nodeMap.has(e.source) && nodeMap.has(e.target)).map(e => ({
      ...e,
      sourceNode: nodeMap.get(e.source),
      targetNode: nodeMap.get(e.target)
    }));

    this.applyLayout();
  }

  collectDescendants(parentId, edges, hiddenSet) {
    if (!hiddenSet) hiddenSet = new Set();
    edges.filter(e => e.source === parentId).forEach(e => {
      if (!hiddenSet.has(e.target)) {
        hiddenSet.add(e.target);
        this.collectDescendants(e.target, edges, hiddenSet);
      }
    });
  }

  applyLayout() {
    if (this.nodes.length === 0) return;

    // 按 Level 分层分组
    const levels = {};
    this.nodes.forEach(n => {
      const lvl = n.level !== undefined ? n.level : 3;
      if (!levels[lvl]) levels[lvl] = [];
      levels[lvl].push(n);
    });

    // 计算各层最大列宽
    const levelWidths = {};
    Object.keys(levels).forEach(lvlStr => {
      const lvl = parseInt(lvlStr);
      const colNodes = levels[lvl];
      const maxW = Math.max(...colNodes.map(n => n.width));
      levelWidths[lvl] = maxW;
    });

    // 计算各列的 X 坐标 (中心层 level=3 居中于 x=0，左右两侧依尺寸动态延展)
    const levelXMap = {};
    levelXMap[3] = 0;

    const hGap = 65; // 列间距

    // 向左延展: 2, 1, 0
    let curLeftEdge = -(levelWidths[3] || 220) / 2;
    [2, 1, 0].forEach(lvl => {
      if (levelWidths[lvl] !== undefined) {
        const w = levelWidths[lvl];
        levelXMap[lvl] = curLeftEdge - hGap - w / 2;
        curLeftEdge = levelXMap[lvl] - w / 2;
      }
    });

    // 向右延展: 4, 5, 6
    let curRightEdge = (levelWidths[3] || 220) / 2;
    [4, 5, 6].forEach(lvl => {
      if (levelWidths[lvl] !== undefined) {
        const w = levelWidths[lvl];
        levelXMap[lvl] = curRightEdge + hGap + w / 2;
        curRightEdge = levelXMap[lvl] + w / 2;
      }
    });

    // 垂直方向按节点高度自适应排版
    Object.keys(levels).forEach(lvlStr => {
      const lvl = parseInt(lvlStr);
      const colNodes = levels[lvl];
      const colX = levelXMap[lvl] !== undefined ? levelXMap[lvl] : (lvl - 3) * 280;

      // 动态计算垂直间距
      const totalColHeight = colNodes.reduce((acc, node) => acc + node.height + 24, -24);
      let currentY = -totalColHeight / 2;

      colNodes.forEach(node => {
        node.x = colX;
        node.y = currentY + node.height / 2;
        currentY += node.height + 24;
      });
    });
  }

  startAnimationLoop() {
    const render = () => {
      this.flowOffset += 0.08;
      if (this.flowOffset > 20) this.flowOffset = 0;

      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(this.width / 2 + this.offsetX, this.height / 2 + this.offsetY);
    const validScale = (!this.scale || isNaN(this.scale) || this.scale <= 0) ? 1.0 : this.scale;
    this.ctx.scale(validScale, validScale);

    // 1. 绘制连线
    this.edges.forEach(edge => {
      this.drawEdge(edge);
    });

    // 2. 绘制节点
    this.nodes.forEach(node => {
      this.drawNode(node);
    });

    this.ctx.restore();
  }

  drawEdge(edge) {
    const s = edge.sourceNode;
    const t = edge.targetNode;
    if (!s || !t) return;

    const isHighlight = (this.hoveredNode && (s === this.hoveredNode || t === this.hoveredNode)) ||
                        (this.selectedNode && (s === this.selectedNode || t === this.selectedNode));

    this.ctx.save();
    this.ctx.beginPath();

    const startX = s.x + (s.x < t.x ? s.width / 2 : -s.width / 2);
    const startY = s.y;
    const endX = t.x + (s.x < t.x ? -t.width / 2 : t.width / 2);
    const endY = t.y;

    const dx = Math.abs(endX - startX) * 0.5;
    const cp1x = startX + (s.x < t.x ? dx : -dx);
    const cp1y = startY;
    const cp2x = endX + (s.x < t.x ? -dx : dx);
    const cp2y = endY;

    this.ctx.moveTo(startX, startY);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);

    if (isHighlight) {
      this.ctx.strokeStyle = '#0284c7';
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = 'rgba(2, 132, 199, 0.4)';
      this.ctx.shadowBlur = 8;
    } else {
      this.ctx.strokeStyle = '#cbd5e1';
      this.ctx.lineWidth = 2;
    }

    this.ctx.setLineDash([6, 4]);
    this.ctx.lineDashOffset = -this.flowOffset * (isHighlight ? 1.5 : 1);
    this.ctx.stroke();

    // 连线文字标签 (纯白气泡底色)
    if (edge.label) {
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      this.ctx.setLineDash([]);
      this.ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      
      const textW = this.ctx.measureText(edge.label).width;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      this.roundRect(this.ctx, midX - textW / 2 - 5, midY - 15, textW + 10, 18, 4);
      this.ctx.fill();
      
      this.ctx.fillStyle = isHighlight ? '#0284c7' : '#64748b';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(edge.label, midX, midY - 6);
    }

    this.ctx.restore();
  }

  drawNode(node) {
    const isHover = this.hoveredNode === node;
    const isSelected = this.selectedNode === node;
    const x = node.x - node.width / 2;
    const y = node.y - node.height / 2;
    const w = node.width;
    const h = node.height;
    const r = 10;

    this.ctx.save();

    // 发光与阴影
    if (isSelected) {
      this.ctx.shadowColor = 'rgba(2, 132, 199, 0.35)';
      this.ctx.shadowBlur = 18;
    } else if (isHover) {
      this.ctx.shadowColor = 'rgba(15, 23, 42, 0.18)';
      this.ctx.shadowBlur = 12;
    } else {
      this.ctx.shadowColor = 'rgba(15, 23, 42, 0.07)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetY = 2;
    }

    // 卡片背景 (纯白 / 核心蓝)
    this.roundRect(this.ctx, x, y, w, h, r);
    if (node.type === 'central') {
      const grad = this.ctx.createLinearGradient(x, y, x + w, y + h);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(1, '#1d4ed8');
      this.ctx.fillStyle = grad;
    } else {
      this.ctx.fillStyle = '#ffffff';
    }
    this.ctx.fill();

    // 边框
    this.ctx.strokeStyle = isSelected ? '#0284c7' : (isHover ? '#38bdf8' : (node.type === 'central' ? '#0284c7' : '#e2e8f0'));
    this.ctx.lineWidth = isSelected ? 2.5 : (isHover ? 2 : 1.2);
    this.ctx.stroke();

    // 节点左侧色条
    this.ctx.fillStyle = node.color || '#0284c7';
    this.ctx.beginPath();
    this.roundRect(this.ctx, x + 4, y + 8, 4, h - 16, 2);
    this.ctx.fill();

    // 主标题文字
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.fillStyle = node.type === 'central' ? '#ffffff' : '#0f172a';
    this.ctx.font = `bold ${node.type === 'central' ? '13px' : '12px'} -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(node.label || node.id, x + 16, y + 11);

    // 副标题/单号
    if (node.subtext) {
      this.ctx.fillStyle = node.type === 'central' ? 'rgba(255, 255, 255, 0.9)' : '#64748b';
      this.ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      this.ctx.fillText(node.subtext, x + 16, y + 33);
    }

    // 状态徽标 (Tag) - 动态计算宽度且不与右侧折叠按钮重叠
    if (node.tag && node.type !== 'central') {
      const tagW = node.tagWidth || 50;
      const tagRightMargin = node.childCount > 0 ? 22 : 10;
      const tagX = x + w - tagW - tagRightMargin;
      const tagY = y + 9;

      this.ctx.fillStyle = node.tagColor || 'rgba(2, 132, 199, 0.12)';
      this.roundRect(this.ctx, tagX, tagY, tagW, 18, 4);
      this.ctx.fill();

      this.ctx.fillStyle = node.color || '#0284c7';
      this.ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(node.tag, tagX + tagW / 2, tagY + 9);
    }

    // 折叠展开按钮 [+] / [-]
    if (node.childCount > 0) {
      const btnX = x + w - 10;
      const btnY = y + h / 2;
      this.ctx.beginPath();
      this.ctx.arc(btnX, btnY, 8, 0, Math.PI * 2);
      this.ctx.fillStyle = node.isCollapsed ? '#d97706' : '#2563eb';
      this.ctx.fill();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(node.isCollapsed ? `+${node.childCount}` : '−', btnX, btnY);
    }

    this.ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', e => {
      const pt = this.screenToWorld(e.clientX, e.clientY);
      const clickedNode = this.getNodeAt(pt.x, pt.y);

      if (clickedNode) {
        // 判断是否点击折叠按钮
        const btnX = clickedNode.x + clickedNode.width / 2 - 10;
        const btnY = clickedNode.y;
        const dist = Math.hypot(pt.x - btnX, pt.y - btnY);

        if (clickedNode.childCount > 0 && dist < 14) {
          if (this.collapsedNodes.has(clickedNode.id)) this.collapsedNodes.delete(clickedNode.id);
          else this.collapsedNodes.add(clickedNode.id);
          this.rebuildGraph();
          return;
        }

        this.draggedNode = clickedNode;
        this.selectNode(clickedNode);
      } else {
        this.isDragging = true;
      }
      this.lastMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', e => {
      const pt = this.screenToWorld(e.clientX, e.clientY);

      if (this.draggedNode) {
        this.draggedNode.x = pt.x;
        this.draggedNode.y = pt.y;
      } else if (this.isDragging) {
        this.offsetX += e.clientX - this.lastMousePos.x;
        this.offsetY += e.clientY - this.lastMousePos.y;
      } else {
        const hovered = this.getNodeAt(pt.x, pt.y);
        if (this.hoveredNode !== hovered) {
          this.hoveredNode = hovered;
          this.canvas.style.cursor = hovered ? 'pointer' : 'grab';
        }
      }
      this.lastMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.draggedNode = null;
    });

    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
      const newScale = Math.max(0.15, Math.min(4.0, this.scale * zoomFactor));

      // 缩放中心跟随鼠标
      const mouseX = e.clientX - this.width / 2 - this.offsetX;
      const mouseY = e.clientY - this.height / 2 - this.offsetY;

      this.offsetX -= mouseX * (newScale / this.scale - 1);
      this.offsetY -= mouseY * (newScale / this.scale - 1);
      this.scale = newScale;
    });
  }

  screenToWorld(sx, sy) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (sx - rect.left - this.width / 2 - this.offsetX) / this.scale;
    const y = (sy - rect.top - this.height / 2 - this.offsetY) / this.scale;
    return { x, y };
  }

  getNodeAt(wx, wy) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      if (wx >= n.x - n.width/2 && wx <= n.x + n.width/2 &&
          wy >= n.y - n.height/2 && wy <= n.y + n.height/2) {
        return n;
      }
    }
    return null;
  }

  selectNode(node) {
    this.selectedNode = node;
    openDrawer(node);

    // 通知 C# WinForms
    if (window.chrome && window.chrome.webview) {
      window.chrome.webview.postMessage({
        type: 'NODE_CLICK',
        nodeId: node.id,
        nodeType: node.type,
        details: node.details || {}
      });
    }
  }

  fitView() {
    this.resize();
    if (!this.nodes || this.nodes.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    this.nodes.forEach(n => {
      minX = Math.min(minX, n.x - n.width/2);
      maxX = Math.max(maxX, n.x + n.width/2);
      minY = Math.min(minY, n.y - n.height/2);
      maxY = Math.max(maxY, n.y + n.height/2);
    });

    const graphW = Math.max(maxX - minX + 160, 200);
    const graphH = Math.max(maxY - minY + 160, 200);
    const rawScale = Math.min((this.width || 1000) / graphW, (this.height || 700) / graphH, 1.2);
    this.scale = (!rawScale || isNaN(rawScale) || rawScale <= 0) ? 1.0 : Math.max(0.15, rawScale);
    this.offsetX = -(minX + maxX) / 2 * this.scale;
    this.offsetY = -(minY + maxY) / 2 * this.scale;
    if (isNaN(this.offsetX)) this.offsetX = 0;
    if (isNaN(this.offsetY)) this.offsetY = 0;
  }
}

// 抽屉详情面板控制 (纯中文商务现代设计)
function openDrawer(node) {
  const drawer = document.getElementById('drawer-panel');
  document.getElementById('drawer-title').innerText = node.label || '节点详情';
  
  const typeMap = {
    'sale': '销售订单',
    'production': '生产工单',
    'inspection': '检验记录',
    'central': '目标条码',
    'package': '包装层级',
    'warehouse': '仓储出入'
  };
  const typeZh = typeMap[node.type] || '业务节点';
  document.getElementById('drawer-subtitle').innerText = `节点类型: ${typeZh} | 节点编号: ${node.id}`;

  const contentBox = document.getElementById('drawer-content');
  contentBox.innerHTML = '';

  const details = node.details || {};
  const card = document.createElement('div');
  card.className = 'info-card';
  card.innerHTML = `<div class="info-card-title">基本追溯属性</div>`;

  const list = document.createElement('div');
  list.className = 'info-list';

  Object.entries(details).forEach(([key, val]) => {
    const item = document.createElement('div');
    item.className = 'info-row';
    item.innerHTML = `
      <div class="info-label">${key}</div>
      <div class="info-value" title="${val}">${val || '--'}</div>
    `;
    list.appendChild(item);
  });

  card.appendChild(list);
  contentBox.appendChild(card);

  drawer.classList.add('open');
}

function closeDrawer() {
  document.getElementById('drawer-panel').classList.remove('open');
}

// 供 C# WinForms 调用的挂载函数
let graphEngine = null;
window.renderTraceGraph = function(data) {
  try {
    if (!graphEngine) {
      graphEngine = new TraceGraphEngine('graph-canvas');
    }
    graphEngine.setData(data);
  } catch (err) {
    console.error("renderTraceGraph 执行异常:", err);
  }
};
