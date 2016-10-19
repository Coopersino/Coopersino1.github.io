/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(5);


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	(function() {
	  /**
	   * @constructor
	   * @param {string} image
	   */
	  var Resizer = function(image) {
	    // Изображение, с которым будет вестись работа.
	    this._image = new Image();
	    this._image.src = image;

	    // Холст.
	    this._container = document.createElement('canvas');
	    this._ctx = this._container.getContext('2d');

	    // Создаем холст только после загрузки изображения.
	    this._image.onload = function() {
	      // Размер холста равен размеру загруженного изображения. Это нужно
	      // для удобства работы с координатами.
	      this._container.width = this._image.naturalWidth;
	      this._container.height = this._image.naturalHeight;

	      /**
	       * Предлагаемый размер кадра в виде коэффициента относительно меньшей
	       * стороны изображения.
	       * @const
	       * @type {number}
	       */
	      var INITIAL_SIDE_RATIO = 0.75;

	      // Размер меньшей стороны изображения.
	      var side = Math.min(
	          this._container.width * INITIAL_SIDE_RATIO,
	          this._container.height * INITIAL_SIDE_RATIO);

	      // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
	      // от размера меньшей стороны.
	      this._resizeConstraint = new Square(
	          this._container.width / 2 - side / 2,
	          this._container.height / 2 - side / 2,
	          side);

	      // Отрисовка изначального состояния канваса.
	      this.setConstraint();
	    }.bind(this);

	    // Фиксирование контекста обработчиков.
	    this._onDragStart = this._onDragStart.bind(this);
	    this._onDragEnd = this._onDragEnd.bind(this);
	    this._onDrag = this._onDrag.bind(this);
	  };

	  Resizer.prototype = {
	    /**
	     * Родительский элемент канваса.
	     * @type {Element}
	     * @private
	     */
	    _element: null,

	    /**
	     * Положение курсора в момент перетаскивания. От положения курсора
	     * рассчитывается смещение на которое нужно переместить изображение
	     * за каждую итерацию перетаскивания.
	     * @type {Coordinate}
	     * @private
	     */
	    _cursorPosition: null,

	    /**
	     * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
	     * от верхнего левого угла исходного изображения.
	     * @type {Square}
	     * @private
	     */
	    _resizeConstraint: null,

	    /**
	     * Отрисовка канваса.
	     */
	    redraw: function() {
	      // Очистка изображения.
	      this._ctx.clearRect(0, 0, this._container.width, this._container.height);

	      // Параметры линии.
	      // NB! Такие параметры сохраняются на время всего процесса отрисовки
	      // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
	      // чего-либо с другой обводкой.

	      // Толщина линии.
	      this._ctx.lineWidth = 6;
	      // Цвет обводки.
	      this._ctx.strokeStyle = '#ffe753';
	      // Размер штрихов. Первый элемент массива задает длину штриха, второй
	      // расстояние между соседними штрихами.
	      this._ctx.setLineDash([15, 10]);
	      // Смещение первого штриха от начала линии.
	      this._ctx.lineDashOffset = 7;

	      // Сохранение состояния канваса.
	      // Подробней см. строку 132.
	      this._ctx.save();

	      // Установка начальной точки системы координат в центр холста.
	      this._ctx.translate(this._container.width / 2, this._container.height / 2);

	      var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
	      var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
	      // Отрисовка изображения на холсте. Параметры задают изображение, которое
	      // нужно отрисовать и координаты его верхнего левого угла.
	      // Координаты задаются от центра холста.
	      this._ctx.drawImage(this._image, displX, displY);

	      // Отрисовка прямоугольника, обозначающего область изображения после
	      // кадрирования. Координаты задаются от центра.
	      this._ctx.strokeRect(
	          (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
	          (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
	          this._resizeConstraint.side - this._ctx.lineWidth / 2,
	          this._resizeConstraint.side - this._ctx.lineWidth / 2);

	      // Восстановление состояния канваса, которое было до вызова ctx.save
	      // и последующего изменения системы координат. Нужно для того, чтобы
	      // следующий кадр рисовался с привычной системой координат, где точка
	      // 0 0 находится в левом верхнем углу холста, в противном случае
	      // некорректно сработает даже очистка холста или нужно будет использовать
	      // сложные рассчеты для координат прямоугольника, который нужно очистить.
	      this._ctx.restore();

	      var XdotStart = ((this._image.naturalWidth - this._resizeConstraint.side - this._ctx.lineWidth / 2) / 2 - (this._ctx.lineWidth));
	      var YdotStart = ((this._image.naturalHeight - this._resizeConstraint.side) / 2) - (this._ctx.lineWidth);

	      // Добавить вокруг жёлтой рамки, чёрный слой с прозрачностью 80% (начало)
	      this._ctx.beginPath();
	      this._ctx.moveTo(XdotStart, YdotStart);

	      // Нарисовать прямоугольник из верхнего левого угла по часовой стрелке
	      this._ctx.lineTo(XdotStart + this._resizeConstraint.side + this._ctx.lineWidth, YdotStart);
	      this._ctx.lineTo(XdotStart + this._resizeConstraint.side + this._ctx.lineWidth, YdotStart + this._resizeConstraint.side + this._ctx.lineWidth);
	      this._ctx.lineTo(XdotStart, YdotStart + this._resizeConstraint.side + this._ctx.lineWidth);
	      this._ctx.lineTo(XdotStart, YdotStart);

	      this._ctx.closePath();

	      this._ctx.fillStyle = 'rgba(0,0,0,0.8)';

	      this._ctx.rect(0, 0, this._image.naturalWidth, this._image.naturalHeight);
	      this._ctx.fill('evenodd');
	      // Добавить вокруг жёлтой рамки, чёрный слой с прозрачностью 80% (конец)

	      // Выводим белую надпись - ширину и высоту изображения
	      var ImgWith = this._image.naturalWidth;
	      var ImgHeight = this._image.naturalHeight;
	      this._ctx.fillStyle = 'rgb(255,255,255)';
	      this._ctx.fillText(ImgWith + 'x' + ImgHeight, (XdotStart - this._ctx.lineDashOffset) + (this._resizeConstraint.side / 2), YdotStart - this._ctx.lineWidth);
	    },

	    /**
	     * Включение режима перемещения. Запоминается текущее положение курсора,
	     * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
	     * позволяющие перерисовывать изображение по мере перетаскивания.
	     * @param {number} x
	     * @param {number} y
	     * @private
	     */
	    _enterDragMode: function(x, y) {
	      this._cursorPosition = new Coordinate(x, y);
	      document.body.addEventListener('mousemove', this._onDrag);
	      document.body.addEventListener('mouseup', this._onDragEnd);
	    },

	    /**
	     * Выключение режима перемещения.
	     * @private
	     */
	    _exitDragMode: function() {
	      this._cursorPosition = null;
	      document.body.removeEventListener('mousemove', this._onDrag);
	      document.body.removeEventListener('mouseup', this._onDragEnd);
	    },

	    /**
	     * Перемещение изображения относительно кадра.
	     * @param {number} x
	     * @param {number} y
	     * @private
	     */
	    updatePosition: function(x, y) {
	      this.moveConstraint(
	          this._cursorPosition.x - x,
	          this._cursorPosition.y - y);
	      this._cursorPosition = new Coordinate(x, y);
	    },

	    /**
	     * @param {MouseEvent} evt
	     * @private
	     */
	    _onDragStart: function(evt) {
	      this._enterDragMode(evt.clientX, evt.clientY);
	    },

	    /**
	     * Обработчик окончания перетаскивания.
	     * @private
	     */
	    _onDragEnd: function() {
	      this._exitDragMode();
	    },

	    /**
	     * Обработчик события перетаскивания.
	     * @param {MouseEvent} evt
	     * @private
	     */
	    _onDrag: function(evt) {
	      this.updatePosition(evt.clientX, evt.clientY);
	    },

	    /**
	     * Добавление элемента в DOM.
	     * @param {Element} element
	     */
	    setElement: function(element) {
	      if (this._element === element) {
	        return;
	      }

	      this._element = element;
	      this._element.insertBefore(this._container, this._element.firstChild);
	      // Обработчики начала и конца перетаскивания.
	      this._container.addEventListener('mousedown', this._onDragStart);
	    },

	    /**
	     * Возвращает кадрирование элемента.
	     * @return {Square}
	     */
	    getConstraint: function() {
	      return this._resizeConstraint;
	    },

	    /**
	     * Смещает кадрирование на значение указанное в параметрах.
	     * @param {number} deltaX
	     * @param {number} deltaY
	     * @param {number} deltaSide
	     */
	    moveConstraint: function(deltaX, deltaY, deltaSide) {
	      this.setConstraint(
	          this._resizeConstraint.x + (deltaX || 0),
	          this._resizeConstraint.y + (deltaY || 0),
	          this._resizeConstraint.side + (deltaSide || 0));
	    },

	    /**
	     * @param {number} x
	     * @param {number} y
	     * @param {number} side
	     */
	    setConstraint: function(x, y, side) {
	      if (typeof x !== 'undefined') {
	        this._resizeConstraint.x = x;
	      }

	      if (typeof y !== 'undefined') {
	        this._resizeConstraint.y = y;
	      }

	      if (typeof side !== 'undefined') {
	        this._resizeConstraint.side = side;
	      }

	      requestAnimationFrame(function() {
	        this.redraw();
	        window.dispatchEvent(new CustomEvent('resizerchange'));
	      }.bind(this));
	    },

	    /**
	     * Удаление. Убирает контейнер из родительского элемента, убирает
	     * все обработчики событий и убирает ссылки.
	     */
	    remove: function() {
	      this._element.removeChild(this._container);

	      this._container.removeEventListener('mousedown', this._onDragStart);
	      this._container = null;
	    },

	    /**
	     * Экспорт обрезанного изображения как HTMLImageElement и исходником
	     * картинки в src в формате dataURL.
	     * @return {Image}
	     */
	    exportImage: function() {
	      // Создаем Image, с размерами, указанными при кадрировании.
	      var imageToExport = new Image();

	      // Создается новый canvas, по размерам совпадающий с кадрированным
	      // изображением, в него добавляется изображение взятое из канваса
	      // с измененными координатами и сохраняется в dataURL, с помощью метода
	      // toDataURL. Полученный исходный код, записывается в src у ранее
	      // созданного изображения.
	      var temporaryCanvas = document.createElement('canvas');
	      var temporaryCtx = temporaryCanvas.getContext('2d');
	      temporaryCanvas.width = this._resizeConstraint.side;
	      temporaryCanvas.height = this._resizeConstraint.side;
	      temporaryCtx.drawImage(this._image,
	          -this._resizeConstraint.x,
	          -this._resizeConstraint.y);
	      imageToExport.src = temporaryCanvas.toDataURL('image/png');

	      return imageToExport;
	    }
	  };

	  /**
	   * Вспомогательный тип, описывающий квадрат.
	   * @constructor
	   * @param {number} x
	   * @param {number} y
	   * @param {number} side
	   * @private
	   */
	  var Square = function(x, y, side) {
	    this.x = x;
	    this.y = y;
	    this.side = side;
	  };

	  /**
	   * Вспомогательный тип, описывающий координату.
	   * @constructor
	   * @param {number} x
	   * @param {number} y
	   * @private
	   */
	  var Coordinate = function(x, y) {
	    this.x = x;
	    this.y = y;
	  };

	  window.Resizer = Resizer;
	})();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* global Resizer: true */

	/**
	 * @fileoverview
	 * @author Igor Alexeenko (o0)
	 */

	'use strict';

	var browserCookies = __webpack_require__(3);
	var utilities = __webpack_require__(4);

	(function() {
	  /** @enum {string} */
	  var FileType = {
	    'GIF': '',
	    'JPEG': '',
	    'PNG': '',
	    'SVG+XML': ''
	  };

	  /** @enum {number} */
	  var Action = {
	    ERROR: 0,
	    UPLOADING: 1,
	    CUSTOM: 2,
	    SIZE_INVALID: 3
	  };

	  /**
	   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
	   * из ключей FileType.
	   * @type {RegExp}
	   */
	  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

	  /**
	   * @type {Object.<string, string>}
	   */
	  var filterMap;

	  /**
	   * Объект, который занимается кадрированием изображения.
	   * @type {Resizer}
	   */
	  var currentResizer;

	  /**
	   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
	   * изображением.
	   */
	  function cleanupResizer() {
	    if (currentResizer) {
	      currentResizer.remove();
	      currentResizer = null;
	    }
	  }

	  /**
	   * Ставит одну из трех случайных картинок на фон формы загрузки.
	   */
	  function updateBackground() {
	    var images = [
	      'img/logo-background-1.jpg',
	      'img/logo-background-2.jpg',
	      'img/logo-background-3.jpg'
	    ];

	    var backgroundElement = document.querySelector('.upload');
	    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
	    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
	  }
	  /**
	   * Зафиксируем минимальные значения полей в форме на уровне 0 (не дадим задавать отрицательные значения).
	   */
	  utilities.fieldLeft.min = 0;
	  utilities.fieldTop.min = 0;
	  utilities.side.min = 1;

	  /**
	   * Проверяет, валидны ли данные, в форме кадрирования.
	   * @return {boolean}
	   */
	  function resizeFormIsValid() {
	    /**
	     * Сумма значений полей «слева» и «сторона» не должна быть больше ширины исходного изображения.
	     * Сумма значений полей «сверху» и «сторона» не должна быть больше высоты исходного изображения.
	     * Поля «сверху» и «слева» не могут быть отрицательными.
	     */
	    if (utilities.fieldLeft.value >= 0 && utilities.fieldTop.value >= 0) {
	      var sumFieldLeftAndSide = Number(utilities.fieldLeft.value) + Number(utilities.side.value);
	      var sumFieldTopAndSide = Number(utilities.fieldTop.value) + Number(utilities.side.value);

	      var naturalWidth = currentResizer._image.naturalWidth;
	      var naturalHeight = currentResizer._image.naturalHeight;

	      if (sumFieldLeftAndSide <= naturalWidth &&
	        sumFieldTopAndSide <= naturalHeight) {
	        utilities.fwdButton.disabled = false;
	        return true;
	      } else {
	        showMessage(Action.SIZE_INVALID);
	        utilities.fwdButton.disabled = true;
	        return false;
	      }
	    } else {
	      return false;
	    }
	  }

	  /**
	   * Форма загрузки изображения.
	   * @type {HTMLFormElement}
	   */
	  var uploadForm = document.forms['upload-select-image'];

	  /**
	   * Форма кадрирования изображения.
	   * @type {HTMLFormElement}
	   */
	  var resizeForm = document.forms['upload-resize'];

	  /**
	   * Форма добавления фильтра.
	   * @type {HTMLFormElement}
	   */
	  var filterForm = document.forms['upload-filter'];

	  /**
	   * @type {HTMLImageElement}
	   */
	  var filterImage = filterForm.querySelector('.filter-image-preview');

	  /**
	   * @type {HTMLElement}
	   */
	  var uploadMessage = document.querySelector('.upload-message');

	  /**
	   * @param {Action} action
	   * @param {string=} message
	   * @return {Element}
	   */
	  function showMessage(action, message) {
	    var isError = false;

	    switch (action) {
	      case Action.UPLOADING:
	        message = message || 'Кексограмим&hellip;';
	        break;

	      case Action.ERROR:
	        isError = true;
	        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
	        break;

	      case Action.SIZE_INVALID:
	        isError = true;
	        message = message || 'Неверные параметры кадрирования<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
	        break;
	    }

	    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
	    uploadMessage.classList.remove('invisible');
	    uploadMessage.classList.toggle('upload-message-error', isError);
	    return uploadMessage;
	  }

	  function hideMessage() {
	    uploadMessage.classList.add('invisible');
	  }

	  /**
	   * Обработчик изменения изображения в форме загрузки. Если загруженный
	   * файл является изображением, считывается исходник картинки, создается
	   * Resizer с загруженной картинкой, добавляется в форму кадрирования
	   * и показывается форма кадрирования.
	   * @param {Event} evt
	   */
	  uploadForm.addEventListener('change', function(evt) {
	    var element = evt.target;
	    if (element.id === 'upload-file') {
	      // Проверка типа загружаемого файла, тип должен быть изображением
	      // одного из форматов: JPEG, PNG, GIF или SVG.
	      if (fileRegExp.test(element.files[0].type)) {
	        var fileReader = new FileReader();

	        showMessage(Action.UPLOADING);

	        fileReader.onload = function() {
	          cleanupResizer();

	          currentResizer = new Resizer(fileReader.result);
	          currentResizer.setElement(resizeForm);
	          uploadMessage.classList.add('invisible');

	          uploadForm.classList.add('invisible');
	          resizeForm.classList.remove('invisible');

	          hideMessage();
	        };

	        fileReader.readAsDataURL(element.files[0]);
	      } else {
	        // Показ сообщения об ошибке, если загружаемый файл, не является
	        // поддерживаемым изображением.
	        showMessage(Action.ERROR);
	      }
	    }
	  });

	  /**
	   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
	   * и обновляет фон.
	   * @param {Event} evt
	   */
	  resizeForm.addEventListener('reset', function(evt) {
	    evt.preventDefault();

	    cleanupResizer();
	    updateBackground();

	    resizeForm.classList.add('invisible');
	    uploadForm.classList.remove('invisible');
	  });

	  /**
	   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
	   * кропнутое изображение в форму добавления фильтра и показывает ее.
	   * @param {Event} evt
	   */
	  resizeForm.addEventListener('submit', function(evt) {
	    evt.preventDefault();

	    if (resizeFormIsValid()) {
	      filterImage.src = currentResizer.exportImage().src;

	      resizeForm.classList.add('invisible');
	      filterForm.classList.remove('invisible');
	      //вытаскиваем фильтр из куки
	      var filter = browserCookies.get('filter');

	      if (filter) {
	        var actualFilter = document.querySelector('#upload-filter-' + filter);
	        actualFilter.setAttribute('checked', 'checked');
	        filterImage.className = 'filter-image-preview filter-' + filter;
	      }
	    }
	  });

	  /**
	   * Сброс формы фильтра. Показывает форму кадрирования.
	   * @param {Event} evt
	   */
	  filterForm.addEventListener('reset', function(evt) {
	    evt.preventDefault();

	    filterForm.classList.add('invisible');
	    resizeForm.classList.remove('invisible');
	  });

	  /**
	   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
	   * записав сохраненный фильтр в cookie.
	   * @param {Event} evt
	   */

	  filterForm.addEventListener('submit', function(evt) {
	    evt.preventDefault();
	    //Записываем выбранный фильтр в куки
	    var selectedFilter = filterForm['upload-filter'].value;
	    browserCookies.set('filter', selectedFilter, {expires: getDaysForCookies()});

	    function getDaysForCookies() {

	      var dateNow = new Date();
	      var yearNow = dateNow.getFullYear();
	      var dateOfBirth = new Date(yearNow, 2, 11);
	      var daysAfterBirth = new Date();
	      var daysForCookies = new Date();
	      //Проверка натсупил ли уже др в этом году
	      if (dateNow >= dateOfBirth) {
	        daysAfterBirth = dateNow - dateOfBirth;
	      } else {
	        var dateOfBirthPreviousYear = new Date(yearNow - 1, 2, 11);
	        daysAfterBirth = dateNow - dateOfBirthPreviousYear;
	      }
	      //Переводим миллисекунды в кол-во суток и устанавливаем их в качестве даты жизни куки
	      daysForCookies.setDate(dateNow.getDate() + Math.floor(daysAfterBirth / (1000 * 60 * 60 * 24)));
	      return daysForCookies;
	    }

	    cleanupResizer();
	    updateBackground();

	    filterForm.classList.add('invisible');
	    uploadForm.classList.remove('invisible');
	  });

	  resizeForm.addEventListener('input', function() {
	    if (resizeFormIsValid()) {
	      currentResizer.setConstraint(+utilities.fieldLeft.value, +utilities.fieldTop.value, +utilities.side.value);
	    }
	  });

	  window.addEventListener('resizerchange', function() {
	    var borderSize = currentResizer.getConstraint();
	    utilities.fieldLeft.value = borderSize.x;
	    utilities.fieldTop.value = borderSize.y;
	    utilities.side.value = borderSize.side;
	//    resizeFormIsValid();
	  });

	  /**
	   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
	   * выбранному значению в форме.
	   */
	  filterForm.addEventListener('change', function() {
	    if (!filterMap) {
	      // Ленивая инициализация. Объект не создается до тех пор, пока
	      // не понадобится прочитать его в первый раз, а после этого запоминается
	      // навсегда.
	      filterMap = {
	        'none': 'filter-none',
	        'chrome': 'filter-chrome',
	        'sepia': 'filter-sepia'
	      };
	    }

	    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
	      return item.checked;
	    })[0].value;

	    // Класс перезаписывается, а не обновляется через classList потому что нужно
	    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
	    // состояние или просто перезаписывать.
	    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
	  });

	  cleanupResizer();
	  updateBackground();
	})();


/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.defaults = {};

	exports.set = function(name, value, options) {
	  // Retrieve options and defaults
	  var opts = options || {};
	  var defaults = exports.defaults;

	  // Apply default value for unspecified options
	  var expires  = opts.expires || defaults.expires;
	  var domain   = opts.domain  || defaults.domain;
	  var path     = opts.path     != undefined ? opts.path     : (defaults.path != undefined ? defaults.path : '/');
	  var secure   = opts.secure   != undefined ? opts.secure   : defaults.secure;
	  var httponly = opts.httponly != undefined ? opts.httponly : defaults.httponly;

	  // Determine cookie expiration date
	  // If succesful the result will be a valid Date, otherwise it will be an invalid Date or false(ish)
	  var expDate = expires ? new Date(
	      // in case expires is an integer, it should specify the number of days till the cookie expires
	      typeof expires == 'number' ? new Date().getTime() + (expires * 864e5) :
	      // else expires should be either a Date object or in a format recognized by Date.parse()
	      expires
	  ) : '';

	  // Set cookie
	  document.cookie = name.replace(/[^+#$&^`|]/g, encodeURIComponent)                // Encode cookie name
	  .replace('(', '%28')
	  .replace(')', '%29') +
	  '=' + value.replace(/[^+#$&/:<-\[\]-}]/g, encodeURIComponent) +                  // Encode cookie value (RFC6265)
	  (expDate && expDate.getTime() >= 0 ? ';expires=' + expDate.toUTCString() : '') + // Add expiration date
	  (domain   ? ';domain=' + domain : '') +                                          // Add domain
	  (path     ? ';path='   + path   : '') +                                          // Add path
	  (secure   ? ';secure'           : '') +                                          // Add secure option
	  (httponly ? ';httponly'         : '');                                           // Add httponly option
	};

	exports.get = function(name) {
	  var cookies = document.cookie.split(';');

	  // Iterate all cookies
	  for(var i = 0; i < cookies.length; i++) {
	    var cookie = cookies[i];
	    var cookieLength = cookie.length;

	    // Determine separator index ("name=value")
	    var separatorIndex = cookie.indexOf('=');

	    // IE<11 emits the equal sign when the cookie value is empty
	    separatorIndex = separatorIndex < 0 ? cookieLength : separatorIndex;

	    // Decode the cookie name and remove any leading/trailing spaces, then compare to the requested cookie name
	    if (decodeURIComponent(cookie.substring(0, separatorIndex).replace(/^\s+|\s+$/g, '')) == name) {
	      return decodeURIComponent(cookie.substring(separatorIndex + 1, cookieLength));
	    }
	  }

	  return null;
	};

	exports.erase = function(name, options) {
	  exports.set(name, '', {
	    expires:  -1,
	    domain:   options && options.domain,
	    path:     options && options.path,
	    secure:   0,
	    httponly: 0}
	  );
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	var Filter = {
	  'POPULAR': 'filter-popular',
	  'NEW': 'filter-new',
	  'DISCUSSED': 'filter-discussed'
	};

	module.exports = {
	  filtersBlock: document.querySelector('.filters'),
	  cloneElement: '',
	  PAGE_SIZE: 12,
	  TIMEOUT: 10000, //устанавливаем таймаут 10 секунд
	  PICTURES_LOAD_URL: '//o0.github.io/assets/json/pictures.json',
	  picturesContainer: document.querySelector('.pictures'),
	  currentResizer: '',
	  fieldLeft: document.querySelector('#resize-x'),
	  fieldTop: document.querySelector('#resize-y'),
	  side: document.querySelector('#resize-size'),
	  fwdButton: document.querySelector('#resize-fwd'),
	  Filter: {
	    'POPULAR': 'filter-popular',
	    'NEW': 'filter-new',
	    'DISCUSSED': 'filter-discussed'
	  },
	  DEFAULT_FILTER: Filter.POPULAR
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utilities = __webpack_require__(4);
	var getPictures = __webpack_require__(6);
	var render = __webpack_require__(7);
	var filterModule = __webpack_require__(8);
	var Gallery = __webpack_require__(9);

	var picturesContainer = document.querySelector('.pictures');

	var pictureTemplate = document.querySelector('#picture-template');

	var pictures = [];

	var filteredPictures = [];

	var renderedPictures = [];

	var pageNumber = 0;

	utilities.filtersBlock.classList.add('hidden');

	if ('content' in pictureTemplate) {
	  utilities.cloneElement = pictureTemplate.content.querySelector('.picture');
	} else {
	  utilities.cloneElement = pictureTemplate.querySelector('.picture');
	}

	var isNextPageAvailable = function(picturesArray, page) {
	  return page < Math.floor(pictures.length / utilities.PAGE_SIZE);
	};

	var isPageBottom = function() {
	  var viewport = window.innerHeight + 20;
	  var picturesBottom = picturesContainer.getBoundingClientRect().bottom;
	  return picturesBottom < viewport;
	};

	var isPageNotFull = function() {
	  var picturesBottom = utilities.picturesContainer.getBoundingClientRect().bottom;
	  return picturesBottom < window.innerHeight;
	};

	var renderPictures = function(picturesArray, page, replace) {
	//  pictures = picturesArray;
	  if (replace) {
	    utilities.picturesContainer.innerHTML = '';
	  }
	  var from = page * utilities.PAGE_SIZE;
	  var to = from + utilities.PAGE_SIZE;
	  picturesArray.slice(from, to).forEach(function(picture) {
	    renderedPictures.push(new render.Photo(picture, picturesContainer, picturesArray));
	  });
	  Gallery._onHashChange();
	};

	var setPageFull = function() {
	  while (isPageNotFull() &&
	    isNextPageAvailable(filteredPictures, pageNumber)) {
	    pageNumber++;
	    renderPictures(filteredPictures, pageNumber);
	  }
	};

	var setScrollEnabled = function() {
	  var scrollTimeout;

	  window.addEventListener('scroll', function() {
	    clearTimeout(scrollTimeout);
	    scrollTimeout = setTimeout(function() {
	      if (isPageBottom() &&
	        isNextPageAvailable(filteredPictures, pageNumber)) {
	        pageNumber++;
	        renderPictures(filteredPictures, pageNumber);
	      }
	    }, 100);
	  });
	};

	var setFilterEnabled = function(filter) {
	  filteredPictures = filterModule.getFilteredPictures(pictures, filter);
	  pageNumber = 0;
	  Gallery.setGalleryPics(filteredPictures);
	  renderPictures(filteredPictures, pageNumber, true);
	  setPageFull();
	};

	var setFiltrationEnabled = function() {
	  utilities.filtersBlock.addEventListener('click', function(evt) {
	    if (evt.target.classList.contains('filters-radio')) {
	      setFilterEnabled(evt.target.id);
	      filterModule.setFilterInLocalStorage(evt.target.id);
	    }
	  });
	};

	getPictures.getPictures(function(loadPictures) {
	  pictures = loadPictures;
	  setScrollEnabled();
	  setFiltrationEnabled(true);
	  setFilterEnabled(filterModule.getCurrentFilter());
	  utilities.picturesContainer.classList.remove('pictures-loading');
	  utilities.filtersBlock.classList.remove('hidden');
	});


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utilities = __webpack_require__(4);

	var loadingError = function() {
	  utilities.picturesContainer.classList.add('pictures-failure');
	  utilities.picturesContainer.classList.remove('pictures-loading');
	};

	module.exports = {
	  getPictures: function(callback) {
	    var xhr = new XMLHttpRequest();
	    xhr.onload = function(evt) {
	      utilities.picturesContainer.classList.add('pictures-loading');
	      var loadDate = JSON.parse(evt.target.response);
	      callback(loadDate);
	    };
	    xhr.onerror = loadingError;
	    xhr.timeout = utilities.TIMEOUT;
	    xhr.ontimeout = loadingError;

	    xhr.open('GET', utilities.PICTURES_LOAD_URL);
	    xhr.send();
	  }
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utilities = __webpack_require__(4);
	var filterModule = __webpack_require__(8);

	var getPictureElement = function(data, container) {
	  var element = utilities.cloneElement.cloneNode(true);
	  element.querySelector('.picture-comments').textContent = data.comments;
	  element.querySelector('.picture-likes').textContent = data.likes;

	  var pictureItem = element.querySelector('img');
	  pictureItem.width = 182;
	  pictureItem.height = 182;

	  var imageLoadTimeout;

	  pictureItem.onload = function() {
	    clearTimeout(imageLoadTimeout);
	  };
	  pictureItem.onerror = function() {
	    element.classList.add('picture-load-failure');
	  };

	  pictureItem.src = data.url;
	  imageLoadTimeout = setTimeout(function() {
	    pictureItem.src = '';
	    element.classList.add('picture-load-failure');
	  }, utilities.TIMEOUT);

	  container.appendChild(element);
	  return element;
	};
	var Photo = function(data, container, pictures) {
	  this.data = data;
	  this.element = getPictureElement(data, container);
	  this._onPhotoListClick = function(evt) {
	    evt.preventDefault();
	    if (evt.target.nodeName !== 'IMG') {
	      return false;
	    }
	    var list = filterModule.getFilteredPictures(pictures);
	    var index = 0;
	    for (var i = 0; i < list.length; i++) {
	      if (data.url === list[i].url) {
	        index = i;
	      }
	    }

	    window.location.hash = 'photo/' + list[index].url;
	    return true;
	  };

	  this.remove = function() {
	    this.element.removeEventListener('click', this._onPhotoListClick);
	    this.element.parentNode.removeChild(this.element);
	  };

	  this.element.addEventListener('click', this._onPhotoListClick);
	  container.appendChild(this.element);
	};

	module.exports = {
	  getPictureElement: getPictureElement,
	  Photo: Photo
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var utilities = __webpack_require__(4);
	var filterActual;

	var getFilteredPictures = function(picturesArray, filter) {
	  if (filter) {
	    filterActual = filter;
	  } else {
	    filter = filterActual;
	  }
	  var filteredPictures = picturesArray.slice(0);
	  switch (filter) {
	    case utilities.Filter.POPULAR: //Ничего делать не нужно, т.к. картинки приходят уже отсортированными по этому принципу
	      break;
	    case utilities.Filter.NEW:
	      filteredPictures.filter(function(dateOfPictureCreate) {
	        var actualDate = new Date(dateOfPictureCreate.date);
	        var dateTwoWeeks = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
	        return actualDate > dateTwoWeeks;
	      });
	      filteredPictures.sort(function(prev, next) {
	        var newPicture = new Date(next.date);
	        var oldPicture = new Date(prev.date);
	        return newPicture - oldPicture;
	      });
	      break;
	    case utilities.Filter.DISCUSSED:
	      filteredPictures.sort(function(prev, next) {
	        return next.comments - prev.comments;
	      });
	      break;
	    default:
	      break;
	  }
	  return filteredPictures;
	};

	var setFilterInLocalStorage = function(filter) {
	  localStorage.setItem('filter', filter);
	};

	var getFilterFromLocalStorage = function() {
	  return localStorage.getItem('filter');
	};

	var getCurrentFilter = function() {
	  if(getFilterFromLocalStorage('filter')) {
	    utilities.filtersBlock.querySelector('#' + getFilterFromLocalStorage()).setAttribute('checked', true);
	    return getFilterFromLocalStorage();
	  } else {
	    utilities.filtersBlock.querySelector('#' + utilities.DEFAULT_FILTER).setAttribute('checked', true);
	    return utilities.DEFAULT_FILTER;
	  }
	};

	module.exports = {
	  getFilteredPictures: getFilteredPictures,
	  getCurrentFilter: getCurrentFilter,
	  setFilterInLocalStorage: setFilterInLocalStorage
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';

	var Gallery = function() {
	  this.gallContainer = document.querySelector('.gallery-overlay');
	  this.picItems = [];
	  this.currentPicIndex = 0;
	  this.gallImage = this.gallContainer.querySelector('.gallery-overlay-image');
	  this.gallCommentsCount = this.gallContainer.querySelector('.comments-count');
	  this.gallLikesCount = this.gallContainer.querySelector('.likes-count');
	  this.gallCloseBtn = this.gallContainer.querySelector('.gallery-overlay-close');

	  this._onPhotoClick = this._onPhotoClick.bind(this);
	  this._onCloseClick = this._onCloseClick.bind(this);
	  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
	  this._onContainerClick = this._onContainerClick.bind(this);

	  window.addEventListener('hashchange', this._onHashChange.bind(this));
	};

	// принимаем на вход массив объектов, описывающих фотографии, и сохраняем их
	Gallery.prototype.setGalleryPics = function(picturesArray) {
	  this.picItems = picturesArray;
	  return this.picItems;
	};

	// Показать фото в галерее
	Gallery.prototype.showPicsInGallery = function(hash) {
	  var currentPic;

	  if (hash) {
	    currentPic = this.picItems.find(function(picture) {
	      return hash.indexOf(picture.url) !== -1;
	    });
	  } else {
	    currentPic = this.picItems[this.currentPicIndex];
	  }

	  this.currentPicIndex = this.picItems.indexOf(currentPic);
	  this.gallImage.src = currentPic.url;
	  this.gallCommentsCount.textContent = currentPic.comments;
	  this.gallLikesCount.textContent = currentPic.likes;
	};

	// Показать галерею
	Gallery.prototype.showGallery = function(hash) {
	  this.showPicsInGallery(hash);
	  this.gallImage.addEventListener('click', this._onPhotoClick);
	  this.gallContainer.classList.remove('invisible');
	  this.gallCloseBtn.addEventListener('click', this._onCloseClick);
	  document.addEventListener('keydown', this._onDocumentKeyDown);
	  this.gallContainer.addEventListener('click', this._onContainerClick);
	};

	// Скрываем галерею и удаляем все обработчики событий
	Gallery.prototype.hideGallery = function() {
	  this.gallContainer.classList.add('invisible');
	  this.gallImage.removeEventListener('click', this._onPhotoClick);
	  this.gallCloseBtn.removeEventListener('click', this._onCloseClick);
	  document.removeEventListener('keydown', this._onDocumentKeyDown);
	  this.gallContainer.removeEventListener('click', this._onContainerClick);
	  window.location.hash = '';
	};

	// Обработчик события клика по фотографии _onPhotoClick, который показывает следующую фотографию.
	Gallery.prototype._onPhotoClick = function(evt) {
	  evt.preventDefault();
	  if (this.currentPicIndex <= this.picItems.length) {
	    this.currentPicIndex++;
	    window.location.hash = 'photo/' + this.picItems[this.currentPicIndex].url;
	  } else {
	    this.currentPicIndex = 0;
	  }
	};

	Gallery.prototype._onCloseClick = function(evt) {
	  evt.preventDefault();
	  this.hideGallery();
	};

	// ESC - закрываем галлерею
	Gallery.prototype._onDocumentKeyDown = function(evt) {
	  if (evt.keyCode === 27) {
	    evt.preventDefault();
	    this.hideGallery();
	  }
	};

	// Закрытие галереи по клику на черный оверлей вокруг фотографии
	Gallery.prototype._onContainerClick = function(evt) {
	  if (evt.target.classList.contains('gallery-overlay')) {
	    evt.preventDefault();
	    this.hideGallery();
	  }
	};

	Gallery.prototype._onHashChange = function() {
	  this.actualHash = window.location.hash;
	  this.hashRegExp = new RegExp(/#photo\/(\S+)/);
	  if(this.actualHash.match(this.hashRegExp)) {
	    this.showGallery(this.actualHash);
	  } else {
	    this.hideGallery();
	  }
	};

	module.exports = new Gallery();


/***/ }
/******/ ]);