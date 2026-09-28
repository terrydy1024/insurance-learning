(function () {
  'use strict';

  var rawData = window.COURSE_DATA;
  var data = rawData && Array.isArray(rawData.weeks) ? rawData : { title: '保险产品库', startDate: '', weeks: [] };
  var formatter = window.CourseFormat;
  var enhancements = window.COURSE_ENHANCEMENTS && typeof window.COURSE_ENHANCEMENTS === 'object' ? window.COURSE_ENHANCEMENTS : {};
  var storageKey = 'insurance-product-library-course-v1';
  var state = { currentId: null, records: {}, storageReady: false };
  var lessonContent = document.getElementById('lesson-content');
  var emptyState = document.getElementById('empty-state');
  var courseMap = document.getElementById('course-map');
  var toast = document.getElementById('toast');
  var toastTimer;

  function escapeHtml(value) {
    return formatter && formatter.escapeHtml ? formatter.escapeHtml(value) : String(value == null ? '' : value);
  }

  function safeUrl(../../01_Codex_保险学习项目/01_从零入门/01_四周互动课程/url) {
    var value = String(url || '').trim();
    if (!value) return '#';
    if (/^(https?:|file:)/i.test(value)) return value;
    if (value[0] !== '/' && !/^[a-z][a-z0-9+.-]*:/i.test(value) && value.indexOf('\\') < 0) return value;
    return '#';
  }

  function getDays() {
    return data.weeks.reduce(function (all, week) {
      return all.concat(Array.isArray(week.days) ? week.days : []);
    }, []);
  }

  function getDay(id) {
    return getDays().find(function (day) { return String(day.id) === String(id); }) || null;
  }

  function canUseStorage() {
    try {
      var key = '__insurance_course_test__';
      window.localStorage.setItem(key, '1');
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  function loadState() {
    state.storageReady = canUseStorage();
    if (!state.storageReady) return;
    try {
      var saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
      if (saved && saved.records && typeof saved.records === 'object') state.records = saved.records;
      if (saved && saved.currentId) state.currentId = saved.currentId;
    } catch (error) {
      state.records = {};
    }
  }

  function saveState() {
    if (!state.storageReady) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ currentId: state.currentId, records: state.records }));
    } catch (error) {
      state.storageReady = false;
      setStorageNote();
    }
  }

  function recordFor(id) {
    if (!state.records[id]) state.records[id] = { complete: false, notes: '', quizAttempted: false, quizChoice: null, taskRevealed: false };
    return state.records[id];
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }

  function setStorageNote() {
    var note = document.getElementById('storage-note');
    if (!note) return;
    note.textContent = state.storageReady ? '学习记录会自动保存在本机浏览器。你也可以随时导出 JSON 备份。' : '当前浏览器不允许本地保存。页面仍可使用，请定期导出 JSON 学习记录。';
  }

  function renderProgress() {
    var days = getDays();
    var completed = days.filter(function (day) { return recordFor(day.id).complete; }).length;
    var percentage = days.length ? Math.round(completed / days.length * 100) : 0;
    document.getElementById('progress-text').textContent = completed + ' / ' + days.length + ' 天';
    document.getElementById('progress-bar').style.width = percentage + '%';
    document.title = (data.title || '保险产品库') + ' · ' + percentage + '%';
  }

  function renderMap() {
    courseMap.innerHTML = data.weeks.map(function (week, weekIndex) {
      var days = Array.isArray(week.days) ? week.days : [];
      return '<section class="week-block"><div class="week-title"><span>' + escapeHtml(week.title || ('第 ' + (weekIndex + 1) + ' 周')) + '</span><small>' + days.filter(function (day) { return recordFor(day.id).complete; }).length + '/' + days.length + '</small></div><div class="day-list">' + days.map(function (day, dayIndex) {
        var record = recordFor(day.id);
        var active = String(day.id) === String(state.currentId);
        return '<button class="day-button' + (active ? ' is-active' : '') + (record.complete ? ' is-complete' : '') + '" type="button" data-day-id="' + escapeHtml(day.id) + '" aria-current="' + (active ? 'page' : 'false') + '"><span class="day-number">' + escapeHtml(dayIndex + 1) + '</span><span class="day-copy"><strong>' + escapeHtml(day.title || '未命名课程') + '</strong><small>' + escapeHtml(day.date || '') + '</small></span><span class="check-mark" aria-label="' + (record.complete ? '已完成' : '未完成') + '">' + (record.complete ? '✓' : '') + '</span></button>';
      }).join('') + '</div></section>';
    }).join('');
  }

  function textBlock(value, className) {
    if (!value) return '';
    return formatter && formatter.formatHtml ? formatter.formatHtml(value, className) : '<p' + (className ? ' class="' + className + '"' : '') + '>' + escapeHtml(value).replace(/\n/g, '<br>') + '</p>';
  }

  function enhancementFor(day) {
    return day && enhancements[day.id] ? enhancements[day.id] : null;
  }

  function renderKeyPoint(day) {
    var enhancement = enhancementFor(day);
    if (!enhancement || !enhancement.keyPoint) return '';
    var keyPoint = formatter && formatter.formatInlineHtml ? formatter.formatInlineHtml(enhancement.keyPoint) : escapeHtml(enhancement.keyPoint);
    return '<section class="lesson-card key-point-card" aria-labelledby="key-point-title"><div class="key-point-label">本课记住</div><h3 id="key-point-title">抓住这一句</h3><p class="key-point-text"><strong>' + keyPoint + '</strong></p></section>';
  }

  function renderVisual(day) {
    var enhancement = enhancementFor(day);
    var visual = enhancement && enhancement.visual;
    if (!visual || !Array.isArray(visual.items) || !visual.items.length) return '';
    var type = ['choice', 'decision', 'timeline', 'compare', 'flow'].indexOf(visual.type) >= 0 ? visual.type : 'compare';
    var items = visual.items.map(function (item, index) {
      var branchBadge = type === 'decision' ? '<span class="visual-branch-badge ' + (index === 0 ? 'is-allowed' : 'is-blocked') + '">' + (index === 0 ? '可继续核对' : '不可选择') + '</span>' : '';
      var content = '<div class="visual-item-body">' + branchBadge + '<h4>' + escapeHtml(item.label || '') + '</h4>' + textBlock(item.text || '', 'visual-item-text') + '</div>';
      if (type === 'flow' && index < visual.items.length - 1) content += '<span class="visual-flow-arrow" aria-hidden="true">→</span>';
      return '<li class="visual-item">' + (type === 'timeline' ? '<span class="visual-timeline-dot" aria-hidden="true"></span>' : '') + content + '</li>';
    }).join('');
    var listTag = type === 'timeline' ? 'ol' : 'ul';
    return '<section class="lesson-card visual-card visual-' + type + '" aria-labelledby="visual-title-' + escapeHtml(day.id) + '"><div class="visual-label">图文解释</div><h3 id="visual-title-' + escapeHtml(day.id) + '">' + escapeHtml(visual.title || '本课关系图') + '</h3>' + textBlock(visual.caption || '', 'visual-caption') + '<' + listTag + ' class="visual-items" role="list">' + items + '</' + listTag + '></section>';
  }

  function renderObjectives(day) {
    var objectives = Array.isArray(day.objectives) ? day.objectives : [];
    return '<section class="lesson-card"><h3><span class="section-number">01</span>今天要带走什么</h3><ul class="objective-list">' + objectives.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul></section>';
  }

  function renderSteps(day) {
    var steps = Array.isArray(day.steps) ? day.steps : [];
    return '<section class="lesson-card"><h3><span class="section-number">02</span>跟着案例走一遍</h3><div class="steps">' + steps.map(function (step) {
      return '<div class="step"><div><h4>' + escapeHtml(step.title || '') + '</h4>' + textBlock(step.body) + '</div></div>';
    }).join('') + '</div></section>';
  }

  function renderTrace(day) {
    var trace = Array.isArray(day.trace) ? day.trace : [];
    if (!trace.length) return '';
    return '<section class="lesson-card"><h3><span class="section-number">03</span>数据从哪里来，走到哪里</h3><table class="trace-table"><thead><tr><th>来源</th><th>去向</th><th>为什么要连起来</th></tr></thead><tbody>' + trace.map(function (item) {
      return '<tr><td>' + escapeHtml(item.from || '') + '</td><td><span class="trace-arrow" aria-hidden="true">→</span>' + escapeHtml(item.to || '') + '</td><td>' + escapeHtml(item.why || '') + '</td></tr>';
    }).join('') + '</tbody></table></section>';
  }

  function renderTerms(day) {
    var terms = Array.isArray(day.terms) ? day.terms : [];
    if (!terms.length) return '';
    return '<section class="lesson-card"><h3><span class="section-number">04</span>本节术语</h3><dl class="terms">' + terms.map(function (item) {
      return '<div class="term"><dt>' + escapeHtml(item.term || '') + '</dt><dd>' + escapeHtml(item.meaning || '') + '</dd></div>';
    }).join('') + '</dl></section>';
  }

  function renderQuiz(day, record) {
    var question = day.question || {};
    var choices = Array.isArray(question.choices) ? question.choices : [];
    if (!question.prompt || !choices.length) return '';
    var feedback = record.quizAttempted ? (Number(record.quizChoice) === Number(question.answerIndex) ? '回答正确。' : '这次先记下判断，再回到上面的步骤检查数据来源。') + ' ' + (question.feedback || '') : '';
    return '<section class="lesson-card quiz-card"><h3><span class="section-number">05</span>先回答，再看反馈</h3>' + textBlock(question.prompt, 'quiz-prompt') + '<ol class="choice-list">' + choices.map(function (choice, index) {
      var selected = record.quizAttempted && Number(record.quizChoice) === index;
      var correct = record.quizAttempted && index === Number(question.answerIndex);
      var wrong = selected && !correct;
      return '<li><button class="choice-button' + (selected ? ' is-selected' : '') + (correct ? ' is-correct' : '') + (wrong ? ' is-wrong' : '') + '" type="button" data-quiz-choice="' + index + '"><span class="choice-index">' + String.fromCharCode(65 + index) + '</span><span>' + escapeHtml(choice) + '</span></button></li>';
    }).join('') + '</ol>' + (record.quizAttempted ? '<div class="quiz-feedback' + (Number(record.quizChoice) === Number(question.answerIndex) ? ' is-correct' : '') + '">' + textBlock(feedback) + '</div>' : '<p class="quiz-feedback">选择一个答案后，这里会显示判断和解释。</p>') + '</section>';
  }

  function renderTask(day, record) {
    var task = day.task || {};
    if (!task.prompt) return '';
    return '<section class="lesson-card"><h3><span class="section-number">06</span>自己做一次</h3><div class="task-box">' + textBlock(task.prompt, 'task-prompt') + '<button class="button button-ghost" type="button" data-reveal-task="true">' + (record.taskRevealed ? '收起参考思路' : '查看参考思路') + '</button>' + (record.taskRevealed ? '<div class="task-reference"><strong>参考思路</strong>' + textBlock(task.reference || '') + '</div>' : '') + '</div></section>';
  }

  function renderReview(day) {
    var review = Array.isArray(day.review) ? day.review : [];
    if (!review.length) return '';
    return '<section class="lesson-card"><h3><span class="section-number">07</span>复习提示</h3><ul class="review-list">' + review.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul></section>';
  }

  function renderSources(day) {
    var sources = Array.isArray(day.sources) ? day.sources : [];
    if (!sources.length) return '';
    return '<section class="lesson-card"><h3><span class="section-number">08</span>继续核对</h3><ul class="sources">' + sources.map(function (source) {
      var url = safeUrl(../../01_Codex_保险学习项目/01_从零入门/01_四周互动课程/source.url);
      return '<li><a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(source.label || source.url || '资料') + ' ↗</a></li>';
    }).join('') + '</ul></section>';
  }

  function renderDiagram(day) {
    if (!day.diagram) return '';
    var url = safeUrl(day.diagram.replace(/\.html$/i, '.svg'));
    return '<section class="lesson-card"><h3><span class="section-number">图</span>把关系画出来</h3><div class="diagram-box"><img src="' + escapeHtml(url) + '" alt="' + escapeHtml(day.title + '关系图，箭头含义见上方表格') + '" loading="lazy"><a class="diagram-link" href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">放大查看图解 ↗</a></div></section>';
  }

  function renderNotes(day, record) {
    return '<section class="lesson-card notes-box"><label for="lesson-notes">我的笔记</label><textarea id="lesson-notes" placeholder="写下你对这节课的理解、疑问或面试表达……">' + escapeHtml(record.notes || '') + '</textarea></section>';
  }

  function renderNext(day) {
    var days = getDays();
    var currentIndex = days.findIndex(function (item) { return String(item.id) === String(day.id); });
    var previous = currentIndex > 0 ? days[currentIndex - 1] : null;
    var next = currentIndex >= 0 && currentIndex < days.length - 1 ? days[currentIndex + 1] : null;
    return '<div class="next-lesson"><p>' + (previous ? '上一节：' + escapeHtml(previous.title || '') : '课程开始') + '</p>' + (next ? '<button class="button" type="button" data-next-day="' + escapeHtml(next.id) + '">下一节：' + escapeHtml(next.title || '') + ' →</button>' : '<p>已到最后一节</p>') + '</div>';
  }

  function renderLesson() {
    var day = getDay(state.currentId);
    if (!day) {
      emptyState.hidden = false;
      lessonContent.hidden = true;
      return;
    }
    emptyState.hidden = true;
    lessonContent.hidden = false;
    var record = recordFor(day.id);
    var weekIndex = data.weeks.findIndex(function (week) { return (week.days || []).some(function (item) { return String(item.id) === String(day.id); }); });
    lessonContent.innerHTML = '<div class="lesson-hero"><div><div class="lesson-kicker">第 ' + (weekIndex + 1) + ' 周 · 第 ' + (getDays().findIndex(function (item) { return String(item.id) === String(day.id); }) + 1) + ' 天</div><h2>' + escapeHtml(day.title || '') + '</h2><p class="lesson-date">' + escapeHtml(day.date || '') + (data.startDate ? ' · 课程起始 ' + escapeHtml(data.startDate) : '') + '</p></div><div class="lesson-actions"><button class="button complete-button' + (record.complete ? ' is-complete' : '') + '" type="button" data-toggle-complete="true">' + (record.complete ? '已完成 ✓' : '标记完成') + '</button></div></div><div class="lesson-grid">' + renderObjectives(day) + '<section class="lesson-card scenario-card"><div class="scenario-label">生活场景</div>' + textBlock(day.scenario, 'scenario-text') + '</section>' + renderKeyPoint(day) + renderSteps(day) + renderVisual(day) + renderTrace(day) + renderTerms(day) + renderDiagram(day) + renderQuiz(day, record) + renderTask(day, record) + renderReview(day) + renderSources(day) + renderNotes(day, record) + renderNext(day) + '</div>';
    lessonContent.querySelector('#lesson-notes').addEventListener('input', function (event) {
      record.notes = event.target.value;
      saveState();
    });
  }

  function selectDay(id, shouldFocus) {
    if (!getDay(id)) return;
    state.currentId = id;
    saveState();
    renderMap();
    renderProgress();
    renderLesson();
    try {
      if (window.history && window.history.replaceState) window.history.replaceState(null, '', '#' + encodeURIComponent(id));
    } catch (error) {
      // 某些浏览器对本地文件的地址栏修改有限制，课程导航仍可继续使用。
    }
    if (shouldFocus) document.getElementById('lesson').focus();
  }

  function exportProgress() {
    var payload = { exportedAt: new Date().toISOString(), course: data.title, records: state.records };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(../../01_Codex_保险学习项目/01_从零入门/01_四周互动课程/blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '保险产品库学习记录.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(../../01_Codex_保险学习项目/01_从零入门/01_四周互动课程/url); }, 1000);
    showToast('学习记录已导出');
  }

  courseMap.addEventListener('click', function (event) {
    var button = event.target.closest('[data-day-id]');
    if (button) selectDay(button.getAttribute('data-day-id'), true);
  });

  lessonContent.addEventListener('click', function (event) {
    var day = getDay(state.currentId);
    if (!day) return;
    var record = recordFor(day.id);
    var quizButton = event.target.closest('[data-quiz-choice]');
    if (quizButton) {
      record.quizAttempted = true;
      record.quizChoice = Number(quizButton.getAttribute('data-quiz-choice'));
      saveState();
      renderLesson();
      return;
    }
    if (event.target.closest('[data-reveal-task]')) {
      record.taskRevealed = !record.taskRevealed;
      saveState();
      renderLesson();
      return;
    }
    if (event.target.closest('[data-toggle-complete]')) {
      record.complete = !record.complete;
      saveState();
      renderMap();
      renderProgress();
      renderLesson();
      showToast(record.complete ? '已记录为完成' : '已取消完成标记');
      return;
    }
    var nextButton = event.target.closest('[data-next-day]');
    if (nextButton) selectDay(nextButton.getAttribute('data-next-day'), true);
  });

  document.getElementById('export-progress').addEventListener('click', exportProgress);
  document.getElementById('reset-progress').addEventListener('click', function () {
    if (!window.confirm('确定清空本课程的学习记录吗？')) return;
    state.records = {};
    saveState();
    renderMap();
    renderProgress();
    renderLesson();
    showToast('学习记录已清空');
  });

  loadState();
  document.getElementById('course-title').textContent = data.title || '保险产品库';
  var days = getDays();
  var hashId = decodeURIComponent((window.location.hash || '').slice(1));
  state.currentId = getDay(hashId) ? hashId : (state.currentId && getDay(state.currentId) ? state.currentId : (days[0] && days[0].id));
  setStorageNote();
  renderMap();
  renderProgress();
  renderLesson();
})();
